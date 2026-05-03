from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import models, schemas
from ..database import get_db

router = APIRouter(
    prefix="/orders",
    tags=["orders"]
)


# ---------------------------------------------------------------------------
# CREATE — Add a new order
# ---------------------------------------------------------------------------
@router.post("/", response_model=schemas.Order)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    """Add a new order. Validates that the menu item exists."""
    # Check if the referenced menu item exists
    db_item = db.query(models.MenuItem).filter(models.MenuItem.id == order.item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Menu item not found")

    db_order = models.Order(item_id=order.item_id, quantity=order.quantity)
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order


# ---------------------------------------------------------------------------
# READ ALL — List all orders
# ---------------------------------------------------------------------------
@router.get("/", response_model=List[schemas.Order])
def read_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get a list of all orders."""
    orders = db.query(models.Order).offset(skip).limit(limit).all()
    return orders


# ---------------------------------------------------------------------------
# READ ONE — Get a single order by ID
# ---------------------------------------------------------------------------
@router.get("/{order_id}", response_model=schemas.Order)
def read_order(order_id: int, db: Session = Depends(get_db)):
    """Get a single order by its ID."""
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    return db_order


# ---------------------------------------------------------------------------
# UPDATE — Update an existing order
# ---------------------------------------------------------------------------
@router.put("/{order_id}", response_model=schemas.Order)
def update_order(order_id: int, order: schemas.OrderUpdate, db: Session = Depends(get_db)):
    """Update an existing order. Only provided fields will be changed."""
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")

    # If item_id is being updated, verify the new item exists
    update_data = order.model_dump(exclude_unset=True)
    if "item_id" in update_data:
        db_item = db.query(models.MenuItem).filter(models.MenuItem.id == update_data["item_id"]).first()
        if not db_item:
            raise HTTPException(status_code=404, detail="Menu item not found")

    for key, value in update_data.items():
        setattr(db_order, key, value)

    db.commit()
    db.refresh(db_order)
    return db_order


# ---------------------------------------------------------------------------
# DELETE — Remove an order
# ---------------------------------------------------------------------------
@router.delete("/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db)):
    """Delete an order by its ID."""
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")

    db.delete(db_order)
    db.commit()
    return {"message": f"Order #{db_order.id} deleted successfully"}

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import models, schemas
from ..database import get_db

router = APIRouter(
    prefix="/menu",
    tags=["menu"]
)


# ---------------------------------------------------------------------------
# CREATE — Add a new menu item
# ---------------------------------------------------------------------------
@router.post("/", response_model=schemas.MenuItem)
def create_menu_item(item: schemas.MenuItemCreate, db: Session = Depends(get_db)):
    """Add a new menu item to the database."""
    db_item = models.MenuItem(name=item.name, price=item.price, cost=item.cost)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


# ---------------------------------------------------------------------------
# READ ALL — List all menu items
# ---------------------------------------------------------------------------
@router.get("/", response_model=List[schemas.MenuItem])
def read_menu_items(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get a list of all menu items."""
    items = db.query(models.MenuItem).offset(skip).limit(limit).all()
    return items


# ---------------------------------------------------------------------------
# READ ONE — Get a single menu item by ID
# ---------------------------------------------------------------------------
@router.get("/{item_id}", response_model=schemas.MenuItem)
def read_menu_item(item_id: int, db: Session = Depends(get_db)):
    """Get a single menu item by its ID."""
    db_item = db.query(models.MenuItem).filter(models.MenuItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return db_item


# ---------------------------------------------------------------------------
# UPDATE — Update an existing menu item
# ---------------------------------------------------------------------------
@router.put("/{item_id}", response_model=schemas.MenuItem)
def update_menu_item(item_id: int, item: schemas.MenuItemUpdate, db: Session = Depends(get_db)):
    """Update an existing menu item. Only provided fields will be changed."""
    db_item = db.query(models.MenuItem).filter(models.MenuItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Menu item not found")

    # Only update fields that were actually provided
    update_data = item.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)

    db.commit()
    db.refresh(db_item)
    return db_item


from sqlalchemy.exc import IntegrityError

# ---------------------------------------------------------------------------
# DELETE — Remove a menu item
# ---------------------------------------------------------------------------
@router.delete("/{item_id}")
def delete_menu_item(item_id: int, db: Session = Depends(get_db)):
    """Delete a menu item by its ID."""
    db_item = db.query(models.MenuItem).filter(models.MenuItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Menu item not found")

    try:
        db.delete(db_item)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400, 
            detail="Cannot delete this menu item because it has existing orders. Please delete the orders first."
        )
        
    return {"message": f"Menu item '{db_item.name}' deleted successfully"}

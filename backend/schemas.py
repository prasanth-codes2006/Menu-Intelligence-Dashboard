from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# ---------------------------------------------------------------------------
# Menu Item Schemas
# ---------------------------------------------------------------------------

class MenuItemBase(BaseModel):
    """Base fields shared by all menu item schemas."""
    name: str
    price: float = Field(gt=0, description="Price must be greater than zero")
    cost: float = Field(gt=0, description="Cost must be greater than zero")


class MenuItemCreate(MenuItemBase):
    """Schema for creating a new menu item (POST)."""
    pass


class MenuItemUpdate(BaseModel):
    """Schema for updating a menu item (PUT). All fields optional."""
    name: Optional[str] = None
    price: Optional[float] = Field(default=None, gt=0, description="Price must be greater than zero")
    cost: Optional[float] = Field(default=None, gt=0, description="Cost must be greater than zero")


class MenuItem(MenuItemBase):
    """Schema for returning a menu item (response model)."""
    id: int

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Order Schemas
# ---------------------------------------------------------------------------

class OrderBase(BaseModel):
    """Base fields shared by all order schemas."""
    item_id: int
    quantity: int = Field(gt=0, description="Quantity must be greater than zero")


class OrderCreate(OrderBase):
    """Schema for creating a new order (POST)."""
    pass


class OrderUpdate(BaseModel):
    """Schema for updating an order (PUT). All fields optional."""
    item_id: Optional[int] = None
    quantity: Optional[int] = Field(default=None, gt=0, description="Quantity must be greater than zero")


class Order(OrderBase):
    """Schema for returning an order (response model)."""
    id: int
    date: datetime

    class Config:
        from_attributes = True

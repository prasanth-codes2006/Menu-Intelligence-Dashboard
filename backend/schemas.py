from pydantic import BaseModel, Field
from datetime import datetime

class MenuItemBase(BaseModel):
    name: str
    price: float = Field(gt=0, description="Price must be greater than zero")
    cost: float = Field(gt=0, description="Cost must be greater than zero")

class MenuItemCreate(MenuItemBase):
    pass

class MenuItem(MenuItemBase):
    id: int

    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    item_id: int
    quantity: int = Field(gt=0, description="Quantity must be greater than zero")

class OrderCreate(OrderBase):
    pass

class Order(OrderBase):
    id: int
    date: datetime

    class Config:
        from_attributes = True

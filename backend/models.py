from sqlalchemy import Column, ForeignKey, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
import datetime

from .database import Base


class MenuItem(Base):
    """Represents a menu item in the restaurant."""
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True, nullable=False)
    price = Column(Float, nullable=False)
    cost = Column(Float, nullable=False)

    # Relationship: one menu item can have many orders
    orders = relationship("Order", back_populates="item")


class Order(Base):
    """Represents an order placed for a menu item."""
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("menu_items.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    date = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationship: each order links to one menu item
    item = relationship("MenuItem", back_populates="orders")

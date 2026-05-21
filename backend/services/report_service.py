"""
Report Service — Business logic for generating reports and CSV exports.

Provides:
  - Monthly sales reports (grouped by month)
  - Revenue reports (grouped by item)
  - CSV export data formatting
"""

import csv
import io
from datetime import date, datetime
from typing import Optional, List, Dict, Any

from sqlalchemy import func, extract
from sqlalchemy.orm import Session

from .. import models


# ---------------------------------------------------------------------------
# 1. Monthly Sales Report
# ---------------------------------------------------------------------------

def get_monthly_sales(db: Session, year: Optional[int] = None) -> List[Dict[str, Any]]:
    """
    Return sales data grouped by month.

    Each row includes: year, month, total_orders, total_revenue, items_sold.
    If *year* is not specified, returns data for all years.
    """
    query = db.query(
        extract("year", models.Order.date).label("year"),
        extract("month", models.Order.date).label("month"),
        func.count(models.Order.id).label("order_count"),
        func.sum(models.Order.quantity).label("items_sold"),
        func.sum(models.Order.quantity * models.MenuItem.price).label("revenue"),
    ).join(models.MenuItem, models.Order.item_id == models.MenuItem.id)

    if year:
        query = query.filter(extract("year", models.Order.date) == year)

    results = (
        query.group_by(
            extract("year", models.Order.date),
            extract("month", models.Order.date),
        )
        .order_by(
            extract("year", models.Order.date),
            extract("month", models.Order.date),
        )
        .all()
    )

    month_names = [
        "", "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ]

    report = []
    for row in results:
        m = int(row.month)
        report.append({
            "year": int(row.year),
            "month": m,
            "month_name": month_names[m] if 1 <= m <= 12 else str(m),
            "order_count": int(row.order_count),
            "items_sold": int(row.items_sold),
            "revenue": round(float(row.revenue), 2),
        })

    return report


# ---------------------------------------------------------------------------
# 2. Revenue Report (per item)
# ---------------------------------------------------------------------------

def get_revenue_report(db: Session, start_date: Optional[date] = None,
                       end_date: Optional[date] = None) -> List[Dict[str, Any]]:
    """
    Return revenue breakdown per menu item.

    Each row includes: item_name, quantity_sold, unit_price, total_revenue, margin.
    """
    query = db.query(
        models.MenuItem.id,
        models.MenuItem.name,
        models.MenuItem.price,
        models.MenuItem.cost,
        func.coalesce(func.sum(models.Order.quantity), 0).label("quantity_sold"),
        func.coalesce(
            func.sum(models.Order.quantity * models.MenuItem.price), 0
        ).label("total_revenue"),
        func.coalesce(
            func.sum(models.Order.quantity * (models.MenuItem.price - models.MenuItem.cost)), 0
        ).label("total_profit"),
    ).outerjoin(models.Order, models.MenuItem.id == models.Order.item_id)

    if start_date:
        start_dt = datetime.combine(start_date, datetime.min.time())
        query = query.filter(models.Order.date >= start_dt)
    if end_date:
        end_dt = datetime.combine(end_date, datetime.max.time())
        query = query.filter(models.Order.date <= end_dt)

    results = (
        query.group_by(
            models.MenuItem.id, models.MenuItem.name,
            models.MenuItem.price, models.MenuItem.cost,
        )
        .order_by(func.sum(models.Order.quantity * models.MenuItem.price).desc().nullslast())
        .all()
    )

    report = []
    for row in results:
        qty = int(row.quantity_sold)
        rev = round(float(row.total_revenue), 2)
        profit = round(float(row.total_profit), 2)
        margin_pct = round((profit / rev) * 100, 2) if rev > 0 else 0

        report.append({
            "item_id": row.id,
            "item_name": row.name,
            "unit_price": round(float(row.price), 2),
            "unit_cost": round(float(row.cost), 2),
            "quantity_sold": qty,
            "total_revenue": rev,
            "total_profit": profit,
            "margin_percentage": margin_pct,
        })

    return report


# ---------------------------------------------------------------------------
# 3. CSV Export
# ---------------------------------------------------------------------------

def generate_csv(db: Session, report_type: str = "revenue",
                 start_date: Optional[date] = None,
                 end_date: Optional[date] = None) -> str:
    """
    Generate a CSV string for the requested report type.

    Supported types: "revenue", "monthly", "bestsellers", "menu".
    Returns a CSV-formatted string ready to be served as a download.
    """
    output = io.StringIO()

    if report_type == "revenue":
        data = get_revenue_report(db, start_date, end_date)
        if not data:
            return ""
        writer = csv.DictWriter(output, fieldnames=data[0].keys())
        writer.writeheader()
        writer.writerows(data)

    elif report_type == "monthly":
        data = get_monthly_sales(db)
        if not data:
            return ""
        writer = csv.DictWriter(output, fieldnames=data[0].keys())
        writer.writeheader()
        writer.writerows(data)

    elif report_type == "bestsellers":
        from .analytics_service import get_bestsellers
        data = get_bestsellers(db, start_date, end_date, limit=100)
        if not data:
            return ""
        writer = csv.DictWriter(output, fieldnames=data[0].keys())
        writer.writeheader()
        writer.writerows(data)

    elif report_type == "menu":
        items = db.query(models.MenuItem).all()
        if not items:
            return ""
        fieldnames = ["id", "name", "price", "cost", "margin", "margin_percentage"]
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()
        for item in items:
            margin = item.price - item.cost
            margin_pct = round((margin / item.price) * 100, 2) if item.price > 0 else 0
            writer.writerow({
                "id": item.id,
                "name": item.name,
                "price": round(float(item.price), 2),
                "cost": round(float(item.cost), 2),
                "margin": round(float(margin), 2),
                "margin_percentage": margin_pct,
            })

    else:
        return ""

    return output.getvalue()

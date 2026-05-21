"""
Analytics Service — Business logic for computing menu analytics.

Contains functions that query the database and return computed insights:
  - Bestsellers (highest-selling items by quantity)
  - Low-margin items (items with profit margin below a threshold)
  - Low-performance items (items with very few sales)
  - Dashboard summary (KPI overview)
  - Smart recommendations

All date-filtering logic is centralised here so that the route handlers
stay thin and focused on HTTP concerns.
"""

from datetime import date, datetime
from typing import Optional, List, Dict, Any

from sqlalchemy import func
from sqlalchemy.orm import Session

from .. import models


# ---------------------------------------------------------------------------
# Helper: Build a base query that optionally filters orders by date range
# ---------------------------------------------------------------------------

def _filtered_orders_query(db: Session, start_date: Optional[date] = None,
                           end_date: Optional[date] = None,
                           item_id: Optional[int] = None):
    """
    Returns a query on the Order model with optional date/item filters applied.
    """
    query = db.query(models.Order)

    if start_date:
        # Convert date to datetime at start of day
        start_dt = datetime.combine(start_date, datetime.min.time())
        query = query.filter(models.Order.date >= start_dt)

    if end_date:
        # Convert date to datetime at end of day
        end_dt = datetime.combine(end_date, datetime.max.time())
        query = query.filter(models.Order.date <= end_dt)

    if item_id:
        query = query.filter(models.Order.item_id == item_id)

    return query


# ---------------------------------------------------------------------------
# 1. Bestsellers
# ---------------------------------------------------------------------------

def get_bestsellers(db: Session, start_date: Optional[date] = None,
                    end_date: Optional[date] = None,
                    item_id: Optional[int] = None,
                    limit: int = 10) -> List[Dict[str, Any]]:
    """
    Return items sorted by total quantity sold (descending).

    Each result includes:
      - item name, quantity sold, total revenue, and a sales trend label.
    """
    # Base query: sum quantity and revenue per menu item
    query = db.query(
        models.MenuItem.id,
        models.MenuItem.name,
        models.MenuItem.price,
        func.coalesce(func.sum(models.Order.quantity), 0).label("quantity_sold"),
        func.coalesce(
            func.sum(models.Order.quantity * models.MenuItem.price), 0
        ).label("total_revenue"),
    ).outerjoin(models.Order, models.MenuItem.id == models.Order.item_id)

    # Apply date filters on the order side
    if start_date:
        start_dt = datetime.combine(start_date, datetime.min.time())
        query = query.filter(models.Order.date >= start_dt)
    if end_date:
        end_dt = datetime.combine(end_date, datetime.max.time())
        query = query.filter(models.Order.date <= end_dt)
    if item_id:
        query = query.filter(models.MenuItem.id == item_id)

    results = (
        query.group_by(models.MenuItem.id, models.MenuItem.name, models.MenuItem.price)
        .order_by(func.sum(models.Order.quantity).desc().nullslast())
        .limit(limit)
        .all()
    )

    bestsellers = []
    for row in results:
        qty = int(row.quantity_sold)
        # Simple trend classification based on quantity thresholds
        if qty >= 20:
            trend = "🔥 Hot Seller"
        elif qty >= 10:
            trend = "📈 Rising"
        elif qty >= 5:
            trend = "➡️ Steady"
        elif qty > 0:
            trend = "📉 Slow"
        else:
            trend = "⚠️ No Sales"

        bestsellers.append({
            "item_id": row.id,
            "item_name": row.name,
            "quantity_sold": qty,
            "total_revenue": round(float(row.total_revenue), 2),
            "sales_trend": trend,
        })

    return bestsellers


# ---------------------------------------------------------------------------
# 2. Low-Margin Items
# ---------------------------------------------------------------------------

def get_low_margin_items(db: Session, threshold: float = 30.0) -> List[Dict[str, Any]]:
    """
    Return items whose profit margin percentage falls below the given threshold.

    margin_pct = ((price - cost) / price) * 100

    Each result includes a recommendation for improving profitability.
    """
    items = db.query(models.MenuItem).all()

    low_margin = []
    for item in items:
        if item.price > 0:
            margin = item.price - item.cost
            margin_pct = (margin / item.price) * 100
        else:
            margin = 0
            margin_pct = 0

        if margin_pct < threshold:
            # Generate smart recommendation based on margin level
            if margin_pct < 10:
                recommendation = "⚠️ Critical — Consider increasing price or reducing cost immediately"
            elif margin_pct < 20:
                recommendation = "📊 Low margin — Consider increasing price by 10-15%"
            else:
                recommendation = "💡 Below target — Consider a small price increase or cost optimisation"

            low_margin.append({
                "item_id": item.id,
                "item_name": item.name,
                "price": round(float(item.price), 2),
                "cost": round(float(item.cost), 2),
                "profit_margin": round(margin, 2),
                "margin_percentage": round(margin_pct, 2),
                "recommendation": recommendation,
            })

    # Sort by margin percentage ascending (worst first)
    low_margin.sort(key=lambda x: x["margin_percentage"])
    return low_margin


# ---------------------------------------------------------------------------
# 3. Low-Performance Items
# ---------------------------------------------------------------------------

def get_low_performance_items(db: Session, start_date: Optional[date] = None,
                              end_date: Optional[date] = None,
                              sales_threshold: int = 5) -> List[Dict[str, Any]]:
    """
    Return items that have been ordered fewer times than *sales_threshold*.

    Each result includes a recommendation to boost sales.
    """
    query = db.query(
        models.MenuItem.id,
        models.MenuItem.name,
        func.coalesce(func.sum(models.Order.quantity), 0).label("total_sales"),
    ).outerjoin(models.Order, models.MenuItem.id == models.Order.item_id)

    if start_date:
        start_dt = datetime.combine(start_date, datetime.min.time())
        query = query.filter(models.Order.date >= start_dt)
    if end_date:
        end_dt = datetime.combine(end_date, datetime.max.time())
        query = query.filter(models.Order.date <= end_dt)

    results = (
        query.group_by(models.MenuItem.id, models.MenuItem.name)
        .having(func.coalesce(func.sum(models.Order.quantity), 0) < sales_threshold)
        .order_by(func.sum(models.Order.quantity).asc().nullsfirst())
        .all()
    )

    low_perf = []
    for row in results:
        total = int(row.total_sales)
        if total == 0:
            rec = "🚫 No orders yet — Consider promotion, combo offer, or removal from menu"
        elif total < 3:
            rec = "📉 Very low sales — Consider a limited-time discount or combo deal"
        else:
            rec = "💡 Below average — Consider a promotion or repositioning on the menu"

        low_perf.append({
            "item_id": row.id,
            "item_name": row.name,
            "total_sales": total,
            "recommendation": rec,
        })

    return low_perf


# ---------------------------------------------------------------------------
# 4. Dashboard Summary
# ---------------------------------------------------------------------------

def get_summary(db: Session) -> Dict[str, Any]:
    """
    Return high-level KPI metrics for the dashboard:
      - Total orders, total revenue, total menu items
      - Best-selling item name
      - Count of low-performing items
    """
    total_orders = db.query(func.coalesce(func.sum(models.Order.quantity), 0)).scalar()
    total_orders = int(total_orders)

    total_revenue = db.query(
        func.coalesce(
            func.sum(models.Order.quantity * models.MenuItem.price), 0
        )
    ).join(models.MenuItem, models.Order.item_id == models.MenuItem.id).scalar()
    total_revenue = round(float(total_revenue), 2) if total_revenue else 0

    total_menu_items = db.query(func.count(models.MenuItem.id)).scalar()

    # Best-selling item
    best = (
        db.query(
            models.MenuItem.name,
            func.sum(models.Order.quantity).label("qty"),
        )
        .join(models.Order, models.MenuItem.id == models.Order.item_id)
        .group_by(models.MenuItem.name)
        .order_by(func.sum(models.Order.quantity).desc())
        .first()
    )
    best_selling_item = best.name if best else "N/A"

    # Low-performing count (items with less than 5 total sales)
    low_perf_count = len(get_low_performance_items(db, sales_threshold=5))

    # Average order value
    order_count = db.query(func.count(models.Order.id)).scalar()
    avg_order_value = round(total_revenue / order_count, 2) if order_count else 0

    return {
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "total_menu_items": total_menu_items,
        "best_selling_item": best_selling_item,
        "low_performing_count": low_perf_count,
        "avg_order_value": avg_order_value,
        "total_order_count": order_count or 0,
    }


# ---------------------------------------------------------------------------
# 5. Smart Recommendations (aggregated)
# ---------------------------------------------------------------------------

def get_smart_recommendations(db: Session) -> List[Dict[str, Any]]:
    """
    Analyse all menu items and provide smart recommendations.

    Rules:
      - Low margin  → "Consider increasing price"
      - Low sales   → "Consider promotion or combo offer"
      - High sales  → "Top performer"
      - Fast-moving  → "Maintain stock availability"
    """
    items = db.query(models.MenuItem).all()

    # Get sales data for each item
    sales_data = {}
    sales_query = (
        db.query(
            models.Order.item_id,
            func.sum(models.Order.quantity).label("total_qty"),
        )
        .group_by(models.Order.item_id)
        .all()
    )
    for row in sales_query:
        sales_data[row.item_id] = int(row.total_qty)

    recommendations = []
    for item in items:
        total_qty = sales_data.get(item.id, 0)
        margin_pct = ((item.price - item.cost) / item.price * 100) if item.price > 0 else 0

        tags = []
        recs = []

        # High sales — Top performer
        if total_qty >= 15:
            tags.append("🏆 Top Performer")
            recs.append("Maintain quality and stock availability")
        # Fast-moving
        if total_qty >= 10:
            tags.append("🚀 Fast Moving")
            recs.append("Ensure consistent stock levels")
        # Low sales
        if total_qty < 5:
            tags.append("📉 Low Sales")
            recs.append("Consider promotion or combo offer")
        # No sales
        if total_qty == 0:
            tags.append("🚫 No Sales")
            recs.append("Evaluate menu placement or consider removal")
        # Low margin
        if margin_pct < 30:
            tags.append("💸 Low Margin")
            recs.append("Consider increasing price or reducing cost")
        # High margin
        if margin_pct >= 50:
            tags.append("💰 High Margin")
            recs.append("Great profitability — promote this item more")

        recommendations.append({
            "item_id": item.id,
            "item_name": item.name,
            "price": round(float(item.price), 2),
            "cost": round(float(item.cost), 2),
            "margin_percentage": round(margin_pct, 2),
            "total_sales": total_qty,
            "tags": tags,
            "recommendations": recs,
        })

    return recommendations

"""
Analytics Routes — Endpoints for menu analytics and smart recommendations.

Endpoints:
  GET /analytics/bestsellers      — Top-selling items with trend indicators
  GET /analytics/low-margin       — Items with low profit margins
  GET /analytics/low-performance  — Under-performing items
  GET /analytics/summary          — Dashboard KPI summary
  GET /analytics/recommendations  — Smart recommendations for all items

All endpoints support optional date-range filtering via query parameters.
"""

from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..services import analytics_service

router = APIRouter(
    prefix="/analytics",
    tags=["analytics"],
)


# ---------------------------------------------------------------------------
# Helper: Validate date range
# ---------------------------------------------------------------------------

def _validate_dates(start_date: Optional[date], end_date: Optional[date]):
    """Raise HTTPException if the date range is invalid."""
    if start_date and end_date and start_date > end_date:
        raise HTTPException(
            status_code=400,
            detail="start_date must be before or equal to end_date",
        )


# ---------------------------------------------------------------------------
# A. Bestsellers
# ---------------------------------------------------------------------------

@router.get("/bestsellers")
def bestsellers(
    start_date: Optional[date] = Query(None, description="Filter orders from this date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="Filter orders up to this date (YYYY-MM-DD)"),
    item_id: Optional[int] = Query(None, description="Filter by a specific menu item ID"),
    limit: int = Query(10, ge=1, le=100, description="Maximum number of results"),
    db: Session = Depends(get_db),
):
    """Return the highest-selling menu items sorted by quantity sold."""
    _validate_dates(start_date, end_date)
    try:
        data = analytics_service.get_bestsellers(db, start_date, end_date, item_id, limit)
        return {"status": "success", "count": len(data), "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# ---------------------------------------------------------------------------
# B. Low-Margin Items
# ---------------------------------------------------------------------------

@router.get("/low-margin")
def low_margin(
    threshold: float = Query(30.0, ge=0, le=100, description="Margin percentage threshold"),
    db: Session = Depends(get_db),
):
    """Return menu items whose profit margin is below the given threshold."""
    try:
        data = analytics_service.get_low_margin_items(db, threshold)
        return {"status": "success", "count": len(data), "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# ---------------------------------------------------------------------------
# C. Low-Performance Items
# ---------------------------------------------------------------------------

@router.get("/low-performance")
def low_performance(
    start_date: Optional[date] = Query(None, description="Filter orders from this date"),
    end_date: Optional[date] = Query(None, description="Filter orders up to this date"),
    sales_threshold: int = Query(5, ge=1, description="Items with fewer sales than this are low-performing"),
    db: Session = Depends(get_db),
):
    """Return under-performing menu items based on low sales count."""
    _validate_dates(start_date, end_date)
    try:
        data = analytics_service.get_low_performance_items(db, start_date, end_date, sales_threshold)
        return {"status": "success", "count": len(data), "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# ---------------------------------------------------------------------------
# D. Dashboard Summary
# ---------------------------------------------------------------------------

@router.get("/summary")
def summary(db: Session = Depends(get_db)):
    """Return high-level KPI metrics for the dashboard."""
    try:
        data = analytics_service.get_summary(db)
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# ---------------------------------------------------------------------------
# E. Smart Recommendations
# ---------------------------------------------------------------------------

@router.get("/recommendations")
def recommendations(db: Session = Depends(get_db)):
    """Return smart recommendations for every menu item."""
    try:
        data = analytics_service.get_smart_recommendations(db)
        return {"status": "success", "count": len(data), "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

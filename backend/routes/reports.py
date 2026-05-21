"""
Reports Routes — Endpoints for report generation and CSV export.

Endpoints:
  GET /reports/monthly-sales  — Monthly sales summary
  GET /reports/revenue        — Revenue breakdown by item
  GET /reports/export-csv     — Download a CSV export of any report type
"""

from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

import io

from ..database import get_db
from ..services import report_service

router = APIRouter(
    prefix="/reports",
    tags=["reports"],
)


# ---------------------------------------------------------------------------
# 1. Monthly Sales Report
# ---------------------------------------------------------------------------

@router.get("/monthly-sales")
def monthly_sales(
    year: Optional[int] = Query(None, description="Filter by year (e.g. 2026)"),
    db: Session = Depends(get_db),
):
    """Return sales data aggregated by month."""
    try:
        data = report_service.get_monthly_sales(db, year)
        return {"status": "success", "count": len(data), "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# ---------------------------------------------------------------------------
# 2. Revenue Report
# ---------------------------------------------------------------------------

@router.get("/revenue")
def revenue_report(
    start_date: Optional[date] = Query(None, description="Filter from date"),
    end_date: Optional[date] = Query(None, description="Filter to date"),
    db: Session = Depends(get_db),
):
    """Return revenue breakdown per menu item."""
    if start_date and end_date and start_date > end_date:
        raise HTTPException(status_code=400, detail="start_date must be before end_date")
    try:
        data = report_service.get_revenue_report(db, start_date, end_date)
        return {"status": "success", "count": len(data), "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# ---------------------------------------------------------------------------
# 3. CSV Export
# ---------------------------------------------------------------------------

@router.get("/export-csv")
def export_csv(
    report_type: str = Query("revenue", description="Type of report: revenue, monthly, bestsellers, menu"),
    start_date: Optional[date] = Query(None, description="Filter from date"),
    end_date: Optional[date] = Query(None, description="Filter to date"),
    db: Session = Depends(get_db),
):
    """Download a CSV file for the requested report type."""
    valid_types = ["revenue", "monthly", "bestsellers", "menu"]
    if report_type not in valid_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid report_type. Must be one of: {', '.join(valid_types)}",
        )

    if start_date and end_date and start_date > end_date:
        raise HTTPException(status_code=400, detail="start_date must be before end_date")

    try:
        csv_content = report_service.generate_csv(db, report_type, start_date, end_date)
        if not csv_content:
            raise HTTPException(status_code=404, detail="No data available for the requested report")

        # Stream the CSV as a downloadable file
        return StreamingResponse(
            io.StringIO(csv_content),
            media_type="text/csv",
            headers={
                "Content-Disposition": f'attachment; filename="{report_type}_report.csv"'
            },
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating report: {str(e)}")

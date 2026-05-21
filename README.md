# 🍽️ Menu Intelligence Dashboard

A modern, full-stack **restaurant analytics dashboard** built with **React**, **FastAPI**, and **Supabase PostgreSQL**. It provides intelligent menu insights, smart recommendations, detailed reports, and CSV exports — designed to be demo-ready for academic evaluation.

---

## 📋 Project Overview

The Menu Intelligence Dashboard helps restaurant managers make data-driven decisions by analysing menu performance, identifying low-margin items, tracking bestsellers, and providing actionable recommendations.

### Key Features

| Feature | Description |
|---|---|
| **Dashboard** | KPI cards, revenue charts, sales trends, pie charts |
| **Analytics** | Bestsellers, low-margin items, low-performance detection |
| **Smart Recommendations** | AI-driven suggestions per menu item |
| **Reports** | Monthly sales, revenue breakdown, CSV exports |
| **Menu Management** | Full CRUD — add, edit, delete, search items |
| **Role System** | Admin (full access) / Viewer (read-only) |
| **Dark Mode** | Toggle between light and dark themes |
| **Responsive** | Works on desktop, tablet, and mobile |

---

## 🏗️ Architecture

```
Frontend (React + Vite)  →  FastAPI Backend  →  Supabase PostgreSQL
```

- **React** handles UI rendering and user interaction
- **FastAPI** handles all business logic, analytics, and database operations
- **Supabase PostgreSQL** stores menu items and orders
- Frontend communicates **only** with FastAPI (never directly with database)

---

## 📁 Folder Structure

```
project/
├── backend/
│   ├── .env                    # Database connection string
│   ├── main.py                 # FastAPI app entry point
│   ├── database.py             # SQLAlchemy engine & session
│   ├── models.py               # Database models (MenuItem, Order)
│   ├── schemas.py              # Pydantic validation schemas
│   ├── seed_data.py            # Demo data generator
│   ├── requirements.txt        # Python dependencies
│   ├── routes/
│   │   ├── menu.py             # Menu CRUD endpoints
│   │   ├── orders.py           # Order CRUD endpoints
│   │   ├── analytics.py        # Analytics endpoints
│   │   └── reports.py          # Reports & CSV export endpoints
│   └── services/
│       ├── analytics_service.py # Analytics business logic
│       └── report_service.py    # Report generation logic
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx            # React entry point
│       ├── App.jsx             # Root component with routing
│       ├── index.css           # Complete design system
│       ├── services/
│       │   └── api.js          # Centralised API calls
│       ├── components/
│       │   ├── Sidebar.jsx     # Navigation sidebar
│       │   ├── Topbar.jsx      # Top navigation bar
│       │   ├── KPICard.jsx     # KPI metric card
│       │   ├── LoadingSpinner.jsx
│       │   ├── EmptyState.jsx
│       │   └── DateFilter.jsx  # Date range filter
│       └── pages/
│           ├── DashboardPage.jsx  # Dashboard with charts
│           ├── AnalyticsPage.jsx  # Analytics tables
│           ├── ReportsPage.jsx    # Reports & exports
│           └── MenuPage.jsx       # Menu CRUD management
├── schema.sql                  # Database schema + demo data
└── README.md
```

---

## 🔌 API Documentation

### Menu Endpoints (`/menu`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/menu/` | List all menu items |
| GET | `/menu/{id}` | Get single item |
| POST | `/menu/` | Add new item |
| PUT | `/menu/{id}` | Update item |
| DELETE | `/menu/{id}` | Delete item |

### Order Endpoints (`/orders`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/orders/` | List all orders |
| GET | `/orders/{id}` | Get single order |
| POST | `/orders/` | Create new order |
| PUT | `/orders/{id}` | Update order |
| DELETE | `/orders/{id}` | Delete order |

### Analytics Endpoints (`/analytics`)
| Method | Endpoint | Query Params | Description |
|--------|----------|-------------|-------------|
| GET | `/analytics/bestsellers` | `start_date`, `end_date`, `item_id`, `limit` | Top-selling items |
| GET | `/analytics/low-margin` | `threshold` | Items below margin threshold |
| GET | `/analytics/low-performance` | `start_date`, `end_date`, `sales_threshold` | Under-performing items |
| GET | `/analytics/summary` | — | Dashboard KPI metrics |
| GET | `/analytics/recommendations` | — | Smart recommendations |

### Report Endpoints (`/reports`)
| Method | Endpoint | Query Params | Description |
|--------|----------|-------------|-------------|
| GET | `/reports/monthly-sales` | `year` | Monthly sales summary |
| GET | `/reports/revenue` | `start_date`, `end_date` | Revenue per item |
| GET | `/reports/export-csv` | `report_type`, `start_date`, `end_date` | CSV download |

---

## 🚀 Setup Instructions

### Prerequisites
- Python 3.9+
- Node.js 18+
- A Supabase project (or any PostgreSQL database)

### 1. Clone & Setup Database

```bash
# If using Supabase: paste schema.sql into SQL Editor and run it
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Configure database URL in .env
# DATABASE_URL=postgresql://your_connection_string

# Seed demo data (optional — if not using schema.sql inserts)
python -m backend.seed_data

# Start the server
uvicorn backend.main:app --reload
```

Backend runs at: `http://localhost:8000`  
API docs at: `http://localhost:8000/docs`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 🧠 Smart Recommendation Rules

| Condition | Tag | Recommendation |
|-----------|-----|----------------|
| Sales ≥ 15 | 🏆 Top Performer | Maintain quality and stock |
| Sales ≥ 10 | 🚀 Fast Moving | Ensure consistent stock |
| Sales < 5 | 📉 Low Sales | Consider promotion or combo |
| Sales = 0 | 🚫 No Sales | Evaluate placement or remove |
| Margin < 30% | 💸 Low Margin | Increase price or reduce cost |
| Margin ≥ 50% | 💰 High Margin | Promote this item more |

---

## 👤 Role System

| Role | Permissions |
|------|------------|
| **Admin** | View dashboard, analytics, reports + Add/Edit/Delete items and orders |
| **Viewer** | View dashboard, analytics, reports (read-only) |

Toggle between roles using the button in the top navigation bar. Role is persisted in localStorage.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Recharts, React Router, React Hot Toast |
| Backend | FastAPI, SQLAlchemy, Pydantic |
| Database | Supabase PostgreSQL |
| Styling | Vanilla CSS (custom design system) |

---

## 📝 License

This project is for academic/educational purposes.

# Menu Intelligence Dashboard (Week 1)

A restaurant analytics project built with a clean **React → FastAPI → Supabase** architecture.

## Architecture Flow

```
┌──────────────┐       fetch()        ┌──────────────────┐     SQLAlchemy      ┌─────────────────────┐
│              │  ──────────────────►  │                  │  ────────────────►  │                     │
│  React UI    │   HTTP requests      │  FastAPI Backend  │   PostgreSQL conn   │  Supabase Database  │
│  (Vite)      │  ◄──────────────────  │  (Python)        │  ◄────────────────  │  (PostgreSQL)       │
│              │     JSON responses   │                  │     query results   │                     │
└──────────────┘                      └──────────────────┘                     └─────────────────────┘
 localhost:5173                        localhost:8000                           cloud (supabase.co)
```

**Important:** The frontend does NOT talk to Supabase directly. All database interaction happens only through FastAPI.

## Project Structure

```
project/
├── backend/                    # FastAPI backend
│   ├── .env                    # DATABASE_URL (Supabase connection string)
│   ├── __init__.py
│   ├── database.py             # SQLAlchemy engine + session setup
│   ├── main.py                 # FastAPI app, CORS, route registration
│   ├── models.py               # SQLAlchemy ORM models (MenuItem, Order)
│   ├── schemas.py              # Pydantic validation schemas
│   ├── requirements.txt        # Python dependencies
│   └── routes/
│       ├── __init__.py
│       ├── menu.py             # POST /menu, GET /menu
│       └── orders.py           # POST /orders, GET /orders
├── frontend/                   # React (Vite) frontend
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx             # Main UI (uses fetch() to call FastAPI)
│       ├── index.css           # Styling
│       └── main.jsx            # React entry point
├── schema.sql                  # PostgreSQL table definitions + sample data
├── .gitignore
└── README.md
```

## Prerequisites

- **Python 3.8+**
- **Node.js 18+**
- A **Supabase** account (free tier works fine)

---

## Setup Instructions (Step by Step)

### Step 1: Set Up Supabase Database

1. Go to [https://supabase.com](https://supabase.com) and sign in.
2. Open your project (or create a new one).
3. In the left sidebar, click **SQL Editor**.
4. Click **New Query**.
5. Copy the entire contents of `schema.sql` from this project and paste it in.
6. Click **Run** — this creates the `menu_items` and `orders` tables with sample data.

### Step 2: Get Your Database Connection String

1. In Supabase, go to **Project Settings** (gear icon in sidebar).
2. Click **Database** in the left menu.
3. Scroll down to **Connection string** and select the **URI** tab.
4. Copy the connection string. It looks like:
   ```
   postgresql://postgres.xddofivbotnazilfcqkh:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
   ```
5. Open `backend/.env` and paste your connection string:
   ```
   DATABASE_URL=postgresql://postgres.xddofivbotnazilfcqkh:YOUR_ACTUAL_PASSWORD@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
   ```

### Step 3: Start the Backend (FastAPI)

```bash
cd backend
python -m venv venv
backend\venv\Scripts\activate         # Windows
# source venv/bin/activate     # Mac/Linux

pip install -r requirements.txt
python -m uvicorn backend.main:app --reload
```

The API will be live at **http://localhost:8000**
Swagger docs at **http://localhost:8000/docs**

### Step 4: Start the Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

The UI will be live at **http://localhost:5173**

---

## API Endpoints

| Method | Endpoint   | Description         | Request Body                                       |
|--------|------------|---------------------|---------------------------------------------------|
| GET    | /menu/     | List all menu items | —                                                 |
| POST   | /menu/     | Add a menu item     | `{"name": "Burger", "price": 12.99, "cost": 5.50}` |
| GET    | /orders/   | List all orders     | —                                                 |
| POST   | /orders/   | Add an order        | `{"item_id": 1, "quantity": 3}`                    |

### Example: Add a Menu Item

**Request:**
```bash
curl -X POST http://localhost:8000/menu/ \
  -H "Content-Type: application/json" \
  -d '{"name": "Fish Tacos", "price": 11.99, "cost": 4.50}'
```

**Response:**
```json
{
  "name": "Fish Tacos",
  "price": 11.99,
  "cost": 4.50,
  "id": 6
}
```

### Example: Add an Order

**Request:**
```bash
curl -X POST http://localhost:8000/orders/ \
  -H "Content-Type: application/json" \
  -d '{"item_id": 1, "quantity": 5}'
```

**Response:**
```json
{
  "item_id": 1,
  "quantity": 5,
  "id": 8,
  "date": "2026-05-03T10:00:00.000000"
}
```

## Validation Rules

| Field    | Rule                        | Enforced By        |
|----------|-----------------------------|--------------------|
| price    | Must be > 0                 | Pydantic + Postgres |
| cost     | Must be > 0                 | Pydantic + Postgres |
| quantity | Must be > 0                 | Pydantic + Postgres |
| item_id  | Must reference existing item | FastAPI route check |

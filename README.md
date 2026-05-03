# Menu Intelligence Dashboard (Week 1)

This is the Week 1 implementation of the Menu Intelligence Dashboard, now **powered by Supabase** (PostgreSQL).

## Project Structure

```
project/
├── backend/               # FastAPI backend (connects to Supabase PostgreSQL)
│   ├── .env               # DATABASE_URL (Supabase connection string)
│   ├── database.py        # SQLAlchemy engine setup
│   ├── main.py            # FastAPI app entry point
│   ├── models.py          # SQLAlchemy ORM models
│   ├── schemas.py         # Pydantic validation schemas
│   ├── requirements.txt   # Python dependencies
│   └── routes/
│       ├── menu.py        # /menu endpoints
│       └── orders.py      # /orders endpoints
├── frontend/              # React (Vite) frontend
│   ├── .env               # Supabase URL & publishable key
│   ├── src/
│   │   ├── App.jsx        # Main dashboard UI
│   │   ├── index.css      # Styling
│   │   ├── main.jsx       # React entry point
│   │   └── utils/
│   │       └── supabase.js  # Supabase JS client
│   ├── package.json
│   └── vite.config.js
├── schema.sql             # PostgreSQL table definitions (run in Supabase SQL Editor)
└── README.md
```

## Prerequisites

- Python 3.8+
- Node.js 18+
- A [Supabase](https://supabase.com) project (already created)

---

## Setup Instructions

### 1. Create Tables in Supabase

1. Open your **Supabase Dashboard** → **SQL Editor**.
2. Paste the contents of `schema.sql` and click **Run**.
3. This creates the `menu_items` and `orders` tables with sample data.

### 2. Backend Setup

1. Open a terminal and navigate to the `backend` folder.
2. Edit the `.env` file and replace `YOUR_DB_PASSWORD` with your Supabase database password:
   ```
   DATABASE_URL=postgresql://postgres.xddofivbotnazilfcqkh:YOUR_ACTUAL_PASSWORD@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
   ```
   > Find this connection string in: **Supabase Dashboard → Settings → Database → Connection string (URI)**

3. Create and activate a virtual environment (recommended):
   ```bash
   python -m venv venv
   venv\Scripts\activate        # Windows
   # source venv/bin/activate   # Mac/Linux
   ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Run the FastAPI server:
   ```bash
   uvicorn backend.main:app --reload
   ```
   - API: `http://localhost:8000`
   - Swagger Docs: `http://localhost:8000/docs`

### 3. Frontend Setup

1. Open a **new terminal** and navigate to the `frontend` folder.
2. The `.env` file is already configured with your Supabase URL and key.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```
   - UI: `http://localhost:5173`

---

## How It Works

| Layer    | Talks to            | How                                |
|----------|---------------------|------------------------------------|
| Frontend | Supabase directly   | `@supabase/supabase-js` client     |
| Backend  | Supabase PostgreSQL | SQLAlchemy + `psycopg2-binary`     |

The **frontend** uses the Supabase JS client to read/write data directly.  
The **backend** connects to the same Supabase PostgreSQL database via SQLAlchemy, providing validated REST API endpoints.

---

## Sample API Requests (via Swagger or cURL)

### Add a Menu Item
**POST** `http://localhost:8000/menu/`
```json
{
  "name": "Fish Tacos",
  "price": 11.99,
  "cost": 4.50
}
```

### Add an Order
**POST** `http://localhost:8000/orders/`
```json
{
  "item_id": 1,
  "quantity": 3
}
```

### List Menu Items
**GET** `http://localhost:8000/menu/`

### List Orders
**GET** `http://localhost:8000/orders/`

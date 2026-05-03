# Menu Intelligence Dashboard (Week 1)

This is the Week 1 implementation of the Menu Intelligence Dashboard, focusing on basic CRUD operations for Menu Items and Orders.

## Project Structure
- `backend/`: FastAPI backend with SQLite (compatible with PostgreSQL).
- `frontend/`: React frontend (Vite) with a single-page dashboard.
- `schema.sql`: SQL definitions for the database tables.

## Prerequisites
- Python 3.8+
- Node.js 18+

## Setup Instructions

### 1. Backend Setup
1. Open a terminal and navigate to the `backend` folder.
2. (Optional but recommended) Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```
   The backend will start at `http://localhost:8000`. The API documentation (Swagger) is available at `http://localhost:8000/docs`.

### 2. Frontend Setup
1. Open a new terminal and navigate to the `frontend` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   The frontend will start at `http://localhost:5173`. Open this URL in your browser.

## Testing with Sample Data

You can use the Swagger UI (`http://localhost:8000/docs`) to test endpoints.

### 1. Add a Menu Item
**POST** `/menu/`
```json
{
  "name": "Classic Burger",
  "price": 12.99,
  "cost": 5.50
}
```

### 2. Add an Order
**POST** `/orders/`
```json
{
  "item_id": 1,
  "quantity": 2
}
```

### 3. List Menu Items
**GET** `/menu/`

### 4. List Orders
**GET** `/orders/`

## Constraints Addressed for Week 1
- **Basic CRUD**: Only adding and listing items and orders are supported.
- **Validation**: Added validation via Pydantic schemas (price > 0, cost > 0, quantity > 0).
- **Simple UI**: No extra features, simple functional React dashboard.

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import date, datetime
import yfinance as yf
import numpy as np
import pandas as pd
import os
import joblib
import random
import sqlite3
from sklearn.preprocessing import MinMaxScaler
from ta.momentum import RSIIndicator
from ta.trend import MACD
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import LSTM, Dense

app = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# SQLite DB Setup
DB_NAME = "stonks.db"
db_path = DB_NAME
conn = sqlite3.connect(db_path)
c = conn.cursor()
c.execute('''
CREATE TABLE IF NOT EXISTS recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stock_code TEXT,
    advice_type TEXT,
    target_price REAL,
    potential_return REAL,
    advice_date TEXT,
    close_price REAL,
    prev_target REAL,
    prev_advice_date TEXT,
    institution TEXT,
    sector TEXT
)
''')
c.execute('''
CREATE TABLE IF NOT EXISTS stock_comparisons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stock_code TEXT,
    current_price REAL,
    highest_prediction REAL,
    lowest_prediction REAL,
    average_prediction REAL
)
''')
c.execute('''
CREATE TABLE IF NOT EXISTS featured_stocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stock_code TEXT,
    stock_name TEXT,
    institution_count INTEGER,
    close_price REAL,
    avg_target_price REAL,
    avg_potential_return REAL,
    highest_target_price REAL,
    highest_potential_return REAL
)
''')
conn.commit()

class StockFilterRequest(BaseModel):
    symbol: str
    start_date: date
    end_date: date
    days_forward: Optional[int] = 7

class PredictionResponse(BaseModel):
    symbol: str
    predicted_prices: List[float]

institutions = ["Apple", "Amazon", "Tesla", "Google", "Nvidia", "Intel"]
symbols_info = {
    "Apple": "AAPL",
    "Amazon": "AMZN",
    "Tesla": "TSLA",
    "Google": "GOOGL",
    "Nvidia": "NVDA",
    "Intel": "INTC"
}

symbol_to_sector = {
    "AAPL": "Technology",
    "AMZN": "E-Commerce",
    "TSLA": "Automotive",
    "GOOGL": "Technology",
    "NVDA": "Semiconductors",
    "INTC": "Semiconductors"
}

model_dir = "models"
os.makedirs(model_dir, exist_ok=True)

advice_options = ["AI", "Endeks Üstü Get.", "Tut", "Sat", "Al"]

@app.get("/institutions")
def get_institutions():
    return institutions

@app.get("/recommendations")
def get_recommendations(period: Optional[str] = Query("all")):
    with sqlite3.connect(DB_NAME) as conn:
        c = conn.cursor()
        c.execute("SELECT * FROM recommendations")
        rows = c.fetchall()
        columns = [desc[0] for desc in c.description]
        return [dict(zip(columns, row)) for row in rows]

@app.get("/stocks/list")
def list_stocks():
    return list(symbols_info.values())

@app.get("/stocks/data")
def get_stock_data(symbol: str, start: str, end: str):
    try:
        df = yf.download(symbol, start=start, end=end)
        df.reset_index(inplace=True)
        return df.to_dict(orient="records")
    except Exception as e:
        return {"error": str(e)}

@app.post("/stocks/predict", response_model=PredictionResponse)
def predict_stock(request: StockFilterRequest):
    try:
        history = yf.download(request.symbol, start=request.start_date, end=request.end_date)
        if history.empty or len(history) < 100:
            return {"symbol": request.symbol, "predicted_prices": []}

        df = history[['Open', 'High', 'Low', 'Close', 'Volume']].copy()
        close_series = pd.Series(df['Close'].values.ravel())
        df['RSI'] = RSIIndicator(close=close_series).rsi().values
        df['MACD'] = MACD(close=close_series).macd().values
        df = df.dropna()

        if len(df) < 100:
            return {"symbol": request.symbol, "predicted_prices": []}

        features = df[['Close', 'Volume', 'RSI', 'MACD']]
        scaler_path = os.path.join(model_dir, f"{request.symbol}_scaler.save")
        model_path = os.path.join(model_dir, f"{request.symbol}_lstm.h5")

        scaler = joblib.load(scaler_path)
        model = load_model(model_path)

        scaled_data = scaler.transform(features)
        last_60 = scaled_data[-60:].reshape(1, 60, scaled_data.shape[1])

        forecast_prices = []
        for _ in range(request.days_forward):
            predicted_scaled = model.predict(last_60, verbose=0)
            target_price_scaled = predicted_scaled[0][0]
            inverse_input = np.array([[target_price_scaled] + [0]*(scaled_data.shape[1]-1)])
            predicted_price = scaler.inverse_transform(inverse_input)[0][0]
            forecast_prices.append(round(float(predicted_price), 2))

            next_input = np.append(last_60[0][1:], [[predicted_scaled[0][0], 0, 0, 0]], axis=0)
            last_60 = next_input.reshape(1, 60, scaled_data.shape[1])

        with sqlite3.connect(DB_NAME) as conn:
            c = conn.cursor()
            current_price = float(df['Close'].iloc[-1])
            highest = max(forecast_prices)
            lowest = min(forecast_prices)
            avg = round(sum(forecast_prices) / len(forecast_prices), 2)

            advice_date = datetime.today().date().isoformat()
            institution_name = next((name for name, sym in symbols_info.items() if sym == request.symbol), request.symbol)
            sector = symbol_to_sector.get(request.symbol, "Other")

            c.execute("""
                INSERT INTO stock_comparisons (stock_code, current_price, highest_prediction, lowest_prediction, average_prediction)
                VALUES (?, ?, ?, ?, ?)
            """, (request.symbol, current_price, highest, lowest, avg))

            c.execute("""
                INSERT OR REPLACE INTO featured_stocks (
                    id, stock_code, stock_name, institution_count, close_price,
                    avg_target_price, avg_potential_return, highest_target_price, highest_potential_return
                ) VALUES (
                    (SELECT id FROM featured_stocks WHERE stock_code = ?), ?, ?, ?, ?, ?, ?, ?, ?
                )
            """, (
                request.symbol,
                request.symbol,
                institution_name,
                1,
                current_price,
                avg,
                round(((avg - current_price) / current_price) * 100, 2),
                highest,
                round(((highest - current_price) / current_price) * 100, 2)
            ))

            c.execute("""
                INSERT INTO recommendations (
                    stock_code, advice_type, target_price, potential_return, advice_date,
                    close_price, prev_target, prev_advice_date, institution, sector
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                request.symbol,
                random.choice(advice_options),
                avg,
                round(((avg - current_price) / current_price) * 100, 2),
                advice_date,
                current_price,
                round(current_price * random.uniform(1.1, 1.4), 2),
                "2024-01-01",
                institution_name,
                sector
            ))

            conn.commit()

        return {"symbol": request.symbol, "predicted_prices": forecast_prices}
    except Exception as e:
        return {"symbol": request.symbol, "predicted_prices": [], "error": str(e)}

@app.get("/radar")
def get_radar_data(
    sector: Optional[str] = Query(None),
    advice_type: Optional[str] = Query(None),
    institution: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    stock_code: Optional[str] = Query(None)
):
    query = "SELECT * FROM recommendations WHERE 1=1"
    params = []

    if start_date and end_date:
        query += " AND advice_date BETWEEN ? AND ?"
        params.extend([start_date, end_date])

    if advice_type:
        query += " AND advice_type = ?"
        params.append(advice_type)

    if institution:
        query += " AND institution = ?"
        params.append(institution)

    if sector:
        query += " AND sector = ?"
        params.append(sector)

    if stock_code:
        query += " AND stock_code = ?"
        params.append(stock_code)

    query += " ORDER BY advice_date DESC"

    with sqlite3.connect(DB_NAME) as conn:
        c = conn.cursor()
        c.execute(query, params)
        rows = c.fetchall()
        columns = [desc[0] for desc in c.description]
        return [dict(zip(columns, row)) for row in rows]

@app.get("/compare")
def compare_stocks(stock1: str, stock2: str):
    with sqlite3.connect(DB_NAME) as conn:
        c = conn.cursor()
        c.execute("""
            SELECT * FROM stock_comparisons WHERE id IN (
                SELECT MAX(id) FROM stock_comparisons WHERE stock_code IN (?, ?) GROUP BY stock_code
            )
        """, (stock1, stock2))
        rows = c.fetchall()
        columns = [desc[0] for desc in c.description]
        return [dict(zip(columns, row)) for row in rows]

@app.get("/featured")
def get_featured_stocks():
    with sqlite3.connect(DB_NAME) as conn:
        c = conn.cursor()
        c.execute("SELECT * FROM featured_stocks ORDER BY avg_potential_return DESC")
        rows = c.fetchall()
        columns = [desc[0] for desc in c.description]
        return [dict(zip(columns, row)) for row in rows]

# Automatically populate recommendations for all stocks on startup
@app.on_event("startup")
def generate_initial_recommendations():
    today = datetime.today().date().isoformat()
    with sqlite3.connect(DB_NAME) as conn:
        c = conn.cursor()
        c.execute("SELECT COUNT(*) FROM recommendations WHERE advice_date = ?", (today,))
        already_generated = c.fetchone()[0] > 0

    if already_generated:
        return

    for symbol in symbols_info.values():
        dummy_request = StockFilterRequest(
            symbol=symbol,
            start_date=datetime.today().date().replace(year=datetime.today().year - 1),
            end_date=datetime.today().date(),
            days_forward=7
        )
        predict_stock(dummy_request)
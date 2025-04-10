from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import date
import yfinance as yf
import numpy as np
import pandas as pd
import os
import joblib
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

model_dir = "models"
os.makedirs(model_dir, exist_ok=True)

recommendations = []
for name, symbol in symbols_info.items():
    try:
        history = yf.download(symbol, period="1y")
        if len(history) < 100:
            continue

        df = history[['Open', 'High', 'Low', 'Close', 'Volume']].copy()
        close_series = pd.Series(df['Close'].values.ravel())
        df['RSI'] = RSIIndicator(close=close_series).rsi().values
        df['MACD'] = MACD(close=close_series).macd().values
        df = df.dropna()

        if len(df) < 100:
            print(f"Not enough data after indicators for {symbol}. Rows: {len(df)}")
            continue

        features = df[['Close', 'Volume', 'RSI', 'MACD']]
        scaler = MinMaxScaler()
        scaled_data = scaler.fit_transform(features)

        X, y = [], []
        for i in range(60, len(scaled_data)):
            X.append(scaled_data[i-60:i])
            y.append(scaled_data[i, 0])

        X, y = np.array(X), np.array(y)

        model_path = os.path.join(model_dir, f"{symbol}_lstm.h5")
        scaler_path = os.path.join(model_dir, f"{symbol}_scaler.save")

        if not os.path.exists(model_path):
            model = Sequential()
            model.add(LSTM(units=50, return_sequences=True, input_shape=(X.shape[1], X.shape[2])))
            model.add(LSTM(units=50))
            model.add(Dense(1))
            model.compile(optimizer='adam', loss='mean_squared_error')
            model.fit(X, y, epochs=10, batch_size=32, verbose=0)
            model.save(model_path)
            joblib.dump(scaler, scaler_path)
        else:
            model = load_model(model_path)
            scaler = joblib.load(scaler_path)

        last_60 = scaled_data[-60:].reshape(1, 60, scaled_data.shape[1])
        predicted_scaled = model.predict(last_60, verbose=0)
        target_price_scaled = predicted_scaled[0][0]
        inverse_input = np.array([[target_price_scaled] + [0]*(scaled_data.shape[1]-1)])
        target_price = scaler.inverse_transform(inverse_input)[0][0]

        last_price = df['Close'].iloc[-1]
        potential_return = round(((target_price - last_price) / last_price) * 100, 2)

        recommendations.append({
            "symbol": symbol,
            "company": yf.Ticker(symbol).info.get("longName", name),
            "institution": name,
            "last_price": round(last_price, 2),
            "target_price": round(float(target_price), 2),
            "potential_return": potential_return,
            "date": str(date.today())
        })
    except Exception as e:
        import traceback
        print(f"Error processing {symbol}: {e}")
        traceback.print_exc()

@app.get("/institutions")
def get_institutions():
    return institutions

@app.get("/recommendations")
def get_recommendations(period: Optional[str] = Query("all")):
    return recommendations

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

        return {"symbol": request.symbol, "predicted_prices": forecast_prices}
    except Exception as e:
        return {"symbol": request.symbol, "predicted_prices": [], "error": str(e)}
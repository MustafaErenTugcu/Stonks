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
from fastapi import HTTPException
import time
import requests
from curl_cffi import  requests
from fastapi import Query

app = FastAPI()

session = requests.Session(impersonate="safari") # Using curl_cffi for better compatibility with yfinance



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
# Kullanıcı tablosunu oluştur
c.execute('''
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT,
    email TEXT UNIQUE,
    username TEXT UNIQUE,
    password TEXT
)
''')
class RegisterRequest(BaseModel):
    full_name: str
    email: str
    username: str
    password: str

class LoginRequest(BaseModel):
    username: str
    password: str



class StockFilterRequest(BaseModel):
    symbol: str
    start_date: date
    end_date: date
    days_forward: Optional[int] = 7

class PredictionResponse(BaseModel):
    symbol: str
    predicted_prices: List[float]

institutions = ["Apple", "Amazon", "Tesla", "Google", "Nvidia", "Intel", "Meta", "Microsoft", "Netflix", "Samsung", "Sony", "Alibaba", "Baidu", "Tencent", "Adobe", "Salesforce", "Oracle", "IBM",
                 "Zoom", "Spotify", "Twitter", "Snap", "Pinterest", "LinkedIn", "Reddit", "TikTok", "ByteDance", "Airbnb", "Uber", "Lyft", "DoorDash", "Robinhood", "Coinbase",
                 "Square", "PayPal", "Stripe", "Shopify", "eBay", "Walmart", "Target", "Costco", "Home Depot", "Lowe's", "Best Buy", "CVS Health", "Walgreens Boots Alliance",
                 "Pfizer", "Johnson & Johnson", "Merck", "Moderna", "AstraZeneca", "Roche", "Novartis", "GlaxoSmithKline", "Sanofi", "Bristol-Myers Squibb", "AbbVie",
                 "ExxonMobil", "Chevron", "BP", "Shell", "TotalEnergies", "ConocoPhillips", "Eni", "Equinor", "Repsol", "Petrobras", "Gazprom", "Rosneft",
                 "Volkswagen", "BMW", "Daimler", "Ford", "General Motors", "Honda", "Toyota", "Hyundai", "Kia", "Nissan", "Mazda", "Subaru",
                 "LG Electronics", "Panasonic", "Toshiba", "Hitachi", "Fujitsu", "NEC", "Sharp", "Canon", "Nikon", "Olympus", "Ricoh",
                 "Siemens", "Bosch", "Philips", "Schneider Electric", "ABB", "Honeywell", "General Electric", "Emerson Electric", "Rockwell Automation",
                 "3M", "DuPont", "BASF", "Dow Chemical", "ExxonMobil Chemical", "LyondellBasell", "SABIC", "Formosa Plastics", "LG Chem",
                 "SK Innovation", "Mitsubishi Chemical", "Asahi Kasei", "Sumitomo Chemical", "Toray Industries", "Nippon Steel", "JFE Holdings",
                 "ArcelorMittal", "Nucor", "United States Steel", "Steel Dynamics", "Cleveland-Cliffs", "AK Steel", "Tata Steel", "Thyssenkrupp",
                 "Rio Tinto", "BHP", "Vale", "Anglo American", "Glencore", "Freeport-McMoRan", "Newmont Corporation", "Barrick Gold",
                 "Southern Copper", "First Quantum Minerals", "Teck Resources", "Antofagasta", "China Molybdenum", "China Northern Rare Earth Group"]

symbols_info = {
    "Apple": "AAPL",
    "Amazon": "AMZN",
    "Tesla": "TSLA",
    "Google": "GOOGL",
    "Nvidia": "NVDA",
    "Intel": "INTC",
    "Meta": "META",
    "Microsoft": "MSFT",
    "Netflix": "NFLX",
    "Samsung": "005930.KS",  # Samsung Electronics
    "Sony": "6758.T",  # Sony Group Corporation
    "Alibaba": "BABA",
    "Baidu": "BIDU",
    "Tencent": "0700.HK",  # Tencent Holdings
    "Adobe": "ADBE",
    "Salesforce": "CRM",
    "Oracle": "ORCL",
    "IBM": "IBM",
    "Zoom": "ZM",
    "Spotify": "SPOT",
    "Twitter": "TWTR",  # Twitter, Inc. (Note: Twitter has been rebranded to X)
    "Snap": "SNAP",
    "Pinterest": "PINS",
    "LinkedIn": "MSFT",  # LinkedIn is owned by Microsoft
    "Reddit": "REDDIT",  # Reddit is not publicly traded, placeholder
    "TikTok": "BYTEDANCE",  # TikTok is owned by ByteDance, which is not publicly traded
    "ByteDance": "BYTEDANCE",  # ByteDance is not publicly traded, placeholder
    "Airbnb": "ABNB",
    "Uber": "UBER",
    "Lyft": "LYFT",
    "DoorDash": "DASH",
    "Robinhood": "HOOD",
    "Coinbase": "COIN",
    "Square": "SQ",  # Now known as Block, Inc.
    "PayPal": "PYPL",
    "Stripe": "STRIPE",  # Stripe is not publicly traded, placeholder
    "Shopify": "SHOP",
    "eBay": "EBAY",
    "Walmart": "WMT",
    "Target": "TGT",
    "Costco": "COST",
    "Home Depot": "HD",
    "Lowe's": "LOW",
    "Best Buy": "BBY",
    "CVS Health": "CVS",
    "Walgreens Boots Alliance": "WBA",
    "Pfizer": "PFE",
    "Johnson & Johnson": "JNJ",
    "Merck": "MRK",
    "Moderna": "MRNA",
    "AstraZeneca": "AZN",  # AstraZeneca PLC
    "Roche": "ROG.SW",  # Roche Holding AG
    "Novartis": "NVS",
    "GlaxoSmithKline": "GSK",  # GlaxoSmithKline PLC
    "Sanofi": "SAN.PA",  # Sanofi S.A.
    "Bristol-Myers Squibb": "BMY",
    "AbbVie": "ABBV",
    "ExxonMobil": "XOM",
    "Chevron": "CVX",
    "BP": "BP",  # BP PLC
    "Shell": "SHEL",  # Shell plc
    "TotalEnergies": "TOT",  # TotalEnergies SE
    "ConocoPhillips": "COP",
    "Eni": "E",  # Eni S.p.A.
    "Equinor": "EQNR",  # Equinor ASA
    "Repsol": "REP.MC",  # Repsol S.A.
    "Petrobras": "PBR",  # Petróleo Brasileiro S.A.
    "Gazprom": "GAZP.ME",  # Gazprom PAO
    "Rosneft": "ROSN.ME",  # Rosneft Oil Company
    "Volkswagen": "VOW3.DE",  # Volkswagen AG
    "BMW": "BMW.DE",  # Bayerische Motoren Werke AG
    "Daimler": "DAI.DE",  # Daimler AG
    "Ford": "F",
    "General Motors": "GM",
    "Honda": "HMC",  # Honda Motor Co., Ltd.
    "Toyota": "TM",  # Toyota Motor Corporation
    "Hyundai": "005380.KS",  # Hyundai Motor Company
    "Kia": "000270.KS",  # Kia Corporation
    "Nissan": "NSANY",  # Nissan Motor Co., Ltd.
    "Mazda": "MZDAY",  # Mazda Motor Corporation
    "Subaru": "FUJHY",  # Subaru Corporation
    "LG Electronics": "066570.KS",  # LG Electronics Inc.
    "Panasonic": "6752.T",  # Panasonic Holdings Corporation
    "Toshiba": "6502.T",  # Toshiba Corporation
    "Hitachi": "6501.T",  # Hitachi, Ltd.
    "Fujitsu": "6702.T",  # Fujitsu Limited
    "NEC": "6701.T",  # NEC Corporation
    "Sharp": "6753.T",  # Sharp Corporation
    "Canon": "CAJ",  # Canon Inc.
    "Nikon": "NINOY",  # Nikon Corporation
    "Olympus": "OCPNY",  # Olympus Corporation
    "Ricoh": "RICOY",  # Ricoh Company, Ltd.
    "Siemens": "SIE.DE",  # Siemens AG
    "Bosch": "BOSCHLTD.NS",  # Bosch Limited (India)
    "Philips": "PHIA.AS",  # Koninklijke Philips N.V.
    "Schneider Electric": "SU.PA",  # Schneider Electric SE
    "ABB": "ABB",  # ABB Ltd
    "Honeywell": "HON",  # Honeywell International Inc.
    "General Electric": "GE",  # General Electric Company
    "Emerson Electric": "EMR",  # Emerson Electric Co.
    "Rockwell Automation": "ROK",  # Rockwell Automation, Inc.
    "3M": "MMM",  # 3M Company
    "DuPont": "DD",  # DuPont de Nemours, Inc.
    "BASF": "BAS.DE",  # BASF SE
    "Dow Chemical": "DOW",  # Dow Inc.
    "ExxonMobil Chemical": "XOM",  # ExxonMobil's chemical division is part of ExxonMobil
    "LyondellBasell": "LYB",  # LyondellBasell Industries N.V.
    "SABIC": "2010.SR",  # Saudi Basic Industries Corporation
    "Formosa Plastics": "1301.TW",  # Formosa Plastics Corporation
    "LG Chem": "051910.KS",  # LG Chem, Ltd.
    "SK Innovation": "096770.KS",  # SK Innovation Co., Ltd.
    "Mitsubishi Chemical": "4188.T",  # Mitsubishi Chemical Group Corporation
    "Asahi Kasei": "3407.T",  # Asahi Kasei Corporation
    "Sumitomo Chemical": "4005.T",  # Sumitomo Chemical Co., Ltd.
    "Toray Industries": "3402.T",  # Toray Industries, Inc.
    "Nippon Steel": "5401.T",  # Nippon Steel Corporation
    "JFE Holdings": "5411.T",  # JFE Holdings, Inc.
    "ArcelorMittal": "MT",  # ArcelorMittal S.A.
    "Nucor": "NUE",  # Nucor Corporation
    "United States Steel": "X",  # United States Steel Corporation
    "Steel Dynamics": "STLD",  # Steel Dynamics, Inc.
    "Cleveland-Cliffs": "CLF",  # Cleveland-Cliffs Inc.
    "AK Steel": "AKS",  # AK Steel Holding Corporation (now part of Cleveland-Cliffs)
    "Tata Steel": "TATASTEEL.NS",  # Tata Steel Limited
    "Thyssenkrupp": "TKAG.DE",  # Thyssenkrupp AG
    "Rio Tinto": "RIO",  # Rio Tinto Group
    "BHP": "BHP",  # BHP Group Limited
    "Vale": "VALE",  # Vale S.A.
    "Anglo American": "AAL.L",  # Anglo American plc
    "Glencore": "GLEN.L",  # Glencore plc
    "Freeport-McMoRan": "FCX",  # Freeport-McMoRan Inc.
    "Newmont Corporation": "NEM",  # Newmont Corporation
    "Barrick Gold": "GOLD",  # Barrick Gold Corporation
    "Southern Copper": "SCCO",  # Southern Copper Corporation
    "First Quantum Minerals": "FM.TO",  # First Quantum Minerals Ltd.
    "Teck Resources": "TECK",  # Teck Resources Limited
    "Antofagasta": "ANTO.L",  # Antofagasta plc
    "China Molybdenum": "3993.HK",  # China Molybdenum Co., Ltd.
    "China Northern Rare Earth Group": "600111.SS",  # China Northern Rare Earth Group High-Tech Co., Ltd.
}


symbol_to_sector = {
    "AAPL": "Technology",
    "AMZN": "E-Commerce",
    "TSLA": "Automotive",
    "GOOGL": "Technology",
    "NVDA": "Semiconductors",
    "INTC": "Semiconductors",
    "NFLX": "Entertainment",
    "META": "Social Media",
    "MSFT": "Technology",
    "005930.KS": "Electronics",  # Samsung Electronics
    "6758.T": "Electronics",  # Sony Group Corporation
    "BABA": "E-Commerce",
    "BIDU": "Technology",
    "0700.HK": "Technology",  # Tencent Holdings
    "ADBE": "Software",
    "CRM": "Software",
    "ORCL": "Software",
    "IBM": "Technology",
    "ZM": "Communication Services",
    "SPOT": "Entertainment",
    "TWTR": "Social Media",  # Twitter, Inc. (Note: Twitter has been rebranded to X)
    "SNAP": "Social Media",
    "PINS": "Social Media",
    "ABNB": "Travel",
    "UBER": "Transportation",
    "LYFT": "Transportation",
    "DASH": "Food Delivery",
    "HOOD": "Finance",
    "COIN": "Cryptocurrency",
    "SQ": "Finance",  # Now known as Block, Inc.
    "PYPL": "Finance",
    "SHOP": "E-Commerce",
    "EBAY": "E-Commerce",
    "WMT": "Retail",
    "TGT": "Retail",
    "COST": "Retail",
    "HD": "Retail",
    "LOW": "Retail",
    "BBY": "Retail",
    "CVS": "Healthcare",
    "WBA": "Healthcare",
    "PFE": "Pharmaceuticals",
    "JNJ": "Pharmaceuticals",
    "MRK": "Pharmaceuticals",
    "MRNA": "Biotechnology",
    "AZN": "Pharmaceuticals",  # AstraZeneca PLC
    "ROG.SW": "Pharmaceuticals",  # Roche Holding AG
    "NVS": "Pharmaceuticals",
    "GSK": "Pharmaceuticals",  # GlaxoSmithKline PLC
    "SAN.PA": "Pharmaceuticals",  # Sanofi S.A.
    "BMY": "Pharmaceuticals",
    "ABBV": "Pharmaceuticals",
    "XOM": "Energy",
    "CVX": "Energy",
    "BP": "Energy",  # BP PLC
    "SHEL": "Energy",  # Shell plc
    "TOT": "Energy",  # TotalEnergies SE
    "COP": "Energy",  # ConocoPhillips
    "E": "Energy",  # Eni S.p.A.
    "EQNR": "Energy",  # Equinor ASA
    "REP.MC": "Energy",  # Repsol S.A.
    "PBR": "Energy",  # Petróleo Brasileiro S.A.
    "GAZP.ME": "Energy",  # Gazprom PAO
    "ROSN.ME": "Energy",  # Rosneft Oil Company
    "VOW3.DE": "Automotive",  # Volkswagen AG
    "BMW.DE": "Automotive",  # Bayerische Motoren Werke AG
    "DAI.DE": "Automotive",  # Daimler AG
    "F": "Automotive",
    "GM": "Automotive",
    "HMC": "Automotive",  # Honda Motor Co., Ltd.
    "TM": "Automotive",  # Toyota Motor Corporation
    "005380.KS": "Automotive",  # Hyundai Motor Company
    "000270.KS": "Automotive",  # Kia Corporation
    "NSANY": "Automotive",  # Nissan Motor Co., Ltd.
    "MZDAY": "Automotive",  # Mazda Motor Corporation
    "FUJHY": "Automotive",  # Subaru Corporation
    "066570.KS": "Electronics",  # LG Electronics Inc.
    "6752.T": "Electronics",  # Panasonic Holdings Corporation
    "6502.T": "Electronics",  # Toshiba Corporation
    "6501.T": "Electronics",  # Hitachi, Ltd.
    "6702.T": "Electronics",  # Fujitsu Limited
    "6701.T": "Electronics",  # NEC Corporation
    "6753.T": "Electronics",  # Sharp Corporation
    "CAJ": "Electronics",  # Canon Inc.
    "NINOY": "Electronics",  # Nikon Corporation
    "OCPNY": "Electronics",  # Olympus Corporation
    "RICOY": "Electronics",  # Ricoh Company, Ltd.
    "SIE.DE": "Electronics",  # Siemens AG
    "BOSCHLTD.NS": "Electronics",  # Bosch Limited (India)
    "PHIA.AS": "Electronics",  # Koninklijke Philips N.V.
    "SU.PA": "Electronics",  # Schneider Electric SE
    "ABB": "Electronics",  # ABB Ltd
    "HON": "Electronics",  # Honeywell International Inc.
    "GE": "Electronics",  # General Electric Company
    "EMR": "Electronics",  # Emerson Electric Co.
    "ROK": "Electronics",  # Rockwell Automation, Inc.
    "MMM": "Electronics",  # 3M Company
    "DD": "Chemicals",  # DuPont de Nemours, Inc.
    "BAS.DE": "Chemicals",  # BASF SE
    "DOW": "Chemicals",  # Dow Inc.
    "LYB": "Chemicals",  # LyondellBasell Industries N.V.
    "2010.SR": "Chemicals",  # Saudi Basic Industries Corporation
    "1301.TW": "Chemicals",  # Formosa Plastics Corporation
    "051910.KS": "Chemicals",  # LG Chem, Ltd.
    "096770.KS": "Chemicals",  # SK Innovation Co., Ltd.
    "4188.T": "Chemicals",  # Mitsubishi Chemical Group Corporation
    "3407.T": "Chemicals",  # Asahi Kasei Corporation
    "4005.T": "Chemicals",  # Sumitomo Chemical Co., Ltd.
    
    "3402.T": "Chemicals",  # Toray Industries, Inc.
    "5401.T": "Metals",  # Nippon Steel Corporation
    "5411.T": "Metals",  # JFE Holdings, Inc.
    "MT": "Metals",  # ArcelorMittal S.A.
    "NUE": "Metals",  # Nucor Corporation
    "X": "Metals",  # United States Steel Corporation
    "STLD": "Metals",  # Steel Dynamics, Inc.
    "CLF": "Metals",  # Cleveland-Cliffs Inc.
    "AKS": "Metals",  # AK Steel Holding Corporation (now part of Cleveland-Cliffs)
    "TATASTEEL.NS": "Metals",  # Tata Steel Limited
    "TKAG.DE": "Metals",  # Thyssenkrupp AG
    "RIO": "Metals",  # Rio Tinto Group
    "BHP": "Metals",  # BHP Group Limited
    "VALE": "Metals",  # Vale S.A.
    "AAL.L": "Metals",  # Anglo American plc
    "GLEN.L": "Metals",  # Glencore plc
    "FCX": "Metals",  # Freeport-McMoRan Inc.
    "NEM": "Metals",  # Newmont Corporation
    "GOLD": "Metals",  # Barrick Gold Corporation
    "SCCO": "Metals",  # Southern Copper Corporation
    "FM.TO": "Metals",  # First Quantum Minerals Ltd.
    "TECK": "Metals",  # Teck Resources Limited
    "ANTO.L": "Metals",  # Antofagasta plc
    "3993.HK": "Metals",  # China Molybdenum Co., Ltd.
    "600111.SS": "Metals",  # China Northern Rare Earth Group High-Tech Co., Ltd.

}
# AddStockRequest: yeni hisse ekleme için istek modeli
class AddStockRequest(BaseModel):
    name: str       
    symbol: str     
    sector: str     

model_dir = "models"
os.makedirs(model_dir, exist_ok=True)

advice_options = ["Endeks Üstü Get.", "Tut", "Sat", "Al"]

@app.post("/register")
def register_user(user: RegisterRequest):
    try:
        with sqlite3.connect(DB_NAME) as conn:
            c = conn.cursor()
            c.execute("SELECT * FROM users WHERE username = ?", (user.username,))
            if c.fetchone():
                raise HTTPException(status_code=400, detail="Kullanıcı adı zaten kayıtlı.")

            c.execute(
                "INSERT INTO users (full_name, email, username, password) VALUES (?, ?, ?, ?)",
                (user.full_name, user.email, user.username, user.password)
            )
            conn.commit()
        return {"message": "Kayıt başarıyla oluşturuldu"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@app.post("/login")
def login(user: LoginRequest):
    print(f"Giriş denemesi: {user.username} {user.password}")
    try:
        with sqlite3.connect("stonks.db") as conn:
            c = conn.cursor()
            c.execute("SELECT * FROM users WHERE username=? AND password=?", (user.username, user.password))
            result = c.fetchone()
            print("Sonuç:", result)
            if result is None:
                print("Giriş hatası oluşturuluyor...")
                raise HTTPException(status_code=401, detail="Kullanıcı adı veya şifre hatalı.")
            return {"message": "Giriş başarılı", "username": user.username}
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        print("Beklenmeyen hata:", str(e))
        raise HTTPException(status_code=500, detail=str(e))


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
        try:
            print(f"{symbol} için model kontrol ediliyor...")
            scaler_path = os.path.join(model_dir, f"{symbol}_scaler.save")
            model_path = os.path.join(model_dir, f"{symbol}_lstm.h5")
            if not os.path.exists(scaler_path) or not os.path.exists(model_path):
                print(f"{symbol} için model veya scaler yok, eğitim başlatılıyor.")
                train_model_for_symbol(symbol)
            else:
                print(f"{symbol} için model ve scaler zaten mevcut.")

            dummy_request = StockFilterRequest(
                symbol=symbol,
                start_date=datetime.today().date().replace(year=datetime.today().year - 1),
                end_date=datetime.today().date(),
                days_forward=7
            )
            generate_prediction_and_save(dummy_request)
            time.sleep(2)  # API limitine takılmamak için
        except Exception as e:
            print(f"{symbol} startup işleminde hata: {e}")

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

@app.post("/stocks/predict", response_model=PredictionResponse)
def predict_stock(request: StockFilterRequest):
    try:
        history = yf.download(request.symbol, start=request.start_date, end=request.end_date, session=session)
        if history.empty or len(history) < 100:
            return {"symbol": request.symbol, "predicted_prices": []}

        df = history[['Open', 'High', 'Low', 'Close', 'Volume']].copy()
        close_series = pd.Series(df['Close'].values.ravel())
        df['RSI'] = RSIIndicator(close=close_series).rsi().values
        df['MACD'] = MACD(close=close_series).macd().values
        df = df.dropna()
        
        print(f"{request.symbol} için veri uzunluğu (history): {len(history)}, işlenmiş veri uzunluğu (df): {len(df)}")

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
            target_price_scaled = float(target_price_scaled)  # Ensure it's a float
            inverse_input = np.array([[target_price_scaled] + [0.0]*(scaled_data.shape[1]-1)])
            predicted_price = scaler.inverse_transform(inverse_input)[0][0]
            forecast_prices.append(round(float(predicted_price), 2))

            next_input = np.append(last_60[0][1:], [[predicted_scaled[0][0], 0, 0, 0]], axis=0)
            last_60 = next_input.reshape(1, 60, scaled_data.shape[1])
        print(f"{request.symbol} için tahmin edilen fiyatlar: {forecast_prices}")

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
                SELECT target_price, advice_date FROM recommendations
                WHERE stock_code = ? AND advice_date < ?
                ORDER BY advice_date DESC
                LIMIT 1
            """, (request.symbol, advice_date))
            prev = c.fetchone()

            if prev:
                prev_target, prev_advice_date = prev
            else:
                prev_target, prev_advice_date = (round(current_price * random.uniform(1.1, 1.4), 2), "2024-01-01")

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
                prev_target,
                prev_advice_date,
                institution_name,
                sector
            ))

            conn.commit()

        return {"symbol": request.symbol, "predicted_prices": forecast_prices}
    except Exception as e:
        return {"symbol": request.symbol, "predicted_prices": [], "error": str(e)}
    
def generate_prediction_and_save(request: StockFilterRequest):
    result = predict_stock(request)
    if "error" in result:
        print(f"Hata oluştu: {request.symbol} -> {result['error']}")
    else:
        print(f"{request.symbol} tahmini başarıyla işlendi ve kaydedildi.")



def train_model_for_symbol(symbol: str):
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
        target_price = float(scaler.inverse_transform(inverse_input)[0][0])

        last_price = float(df['Close'].iloc[-1].item())
        potential_return = round(((target_price - last_price) / last_price) * 100, 2)

        if potential_return > 50:
            advice = "Al"
        elif potential_return > 20:
            advice = "Endeks Üstü Get."
        elif potential_return > 5:
            advice = "Tut"
        else:
            advice = "Sat"

        c.execute('SELECT advice_date FROM recommendations WHERE stock_code=? ORDER BY advice_date DESC LIMIT 1', (symbol,))
        prev_advice_row = c.fetchone()
        prev_advice_date = prev_advice_row[0] if prev_advice_row else "2024-01-01"

        c.execute('SELECT * FROM recommendations WHERE stock_code=? AND advice_date=?', (symbol, str(date.today())))
        exists = c.fetchone()
        if not exists:
            c.execute('''INSERT INTO recommendations (stock_code, advice_type, target_price, potential_return, advice_date, close_price, prev_target, prev_advice_date, institution) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
                (symbol, advice, round(float(target_price), 2), potential_return, str(date.today()), round(last_price, 2),
                 round(float(df['Close'].iloc[-30].item()), 2) if len(df) >= 30 else round(float(df['Close'].iloc[0].item()), 2),
                 prev_advice_date, name))
            conn.commit()

    except Exception as e:
        import traceback
        print(f"Error processing {symbol}: {e}")
        traceback.print_exc()


# Yeni hisse ekleme endpoint'i
from fastapi import HTTPException

@app.post("/stocks/add")
def add_stock(request: AddStockRequest):
    if request.name in symbols_info:
        raise HTTPException(status_code=400, detail="Bu hisse zaten mevcut.")

    symbols_info[request.name] = request.symbol
    symbol_to_sector[request.symbol] = request.sector
    institutions.append(request.name)

    print(f"{request.symbol} yeni hisse olarak eklendi. Eğitim kontrolü başlatılıyor...")
    try:
        train_model_for_symbol(request.symbol)
    except Exception as e:
        print(f"{request.symbol} için eğitim sırasında hata: {e}")
        raise HTTPException(status_code=500, detail=f"Model eğitilemedi: {e}")

    return {"message": f"{request.name} başarıyla eklendi ve model eğitimi tamamlandı."}

@app.get("/stocks/data")
def get_stock_data(
    symbol: str,
    range_: str = Query("7d", alias="range")
):
    try:
        interval = "1d" if range_ in ["6mo", "1y"] else "1h"
        df = yf.download(tickers=symbol, period=range_, interval=interval, auto_adjust=False)

        if df.empty:
            print(f"⚠️ {symbol} için veri bulunamadı.")
            return []

        df.reset_index(inplace=True)

        # ✅ MultiIndex düzeltmesi
        if isinstance(df.columns, pd.MultiIndex):
            df.columns = df.columns.get_level_values(0)

        if 'Date' not in df.columns:
            df['Date'] = df.index.astype(str)
        else:
            df['Date'] = df['Date'].astype(str)

        df = df[['Date', 'Open', 'High', 'Low', 'Close', 'Volume']]

        print(f"📊 {symbol} verisi:\n", df.head(2).to_dict(orient="records"))

        return df.to_dict(orient="records")

    except Exception as e:
        print(f"🔥 Veri çekme hatası ({symbol}): {e}")
        return {"error": f"{type(e).__name__}: {str(e)}"}
    

@app.get("/stocks/info")
def get_stock_info(symbol: str):
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        return {
            "open": info.get("open"),
            "close": info.get("previousClose"),
            "volume": info.get("volume"),
            "marketCap": info.get("marketCap"),
            "peRatio": info.get("trailingPE"),
            "weekRange": info.get("fiftyTwoWeekRange"),
            "beta": info.get("beta"),
            "target": info.get("targetMeanPrice")
        }
    except Exception as e:
        print(f"Stock info hatası: {e}")
        return {"error": str(e)}
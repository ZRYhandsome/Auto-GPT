import yfinance as yf
import pandas as pd

def main() -> None:
    data = yf.download("AAPL", period="30d", interval="1d", progress=False)
    latest_close = data["Close"].iloc[-1]
    print(f"Latest close price: {latest_close}")

if __name__ == "__main__":
    main()

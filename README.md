## 📈 Stock Market Tracker

**A beginner-friendly React web app** that lets users visualize real-time stock prices with beautiful charts. Built using Firebase for authentication, Chart.js for visuals, and Alpha Vantage for market data.

---

### 🚀 Features

* 🔐 Secure login/logout using Firebase Authentication
* 🔍 Search stock by symbol (e.g., `AAPL`, `TSLA`)
* 📊 Real-time line chart for daily closing prices
* 🎨 Material UI-based responsive design
* ⚠️ Error handling for API failures & invalid symbols

---

### 🛠️ Tech Stack

* **Frontend**: React.js, Chart.js, Material UI
* **Authentication**: Firebase
* **API**: Alpha Vantage ([https://www.alphavantage.co/](https://www.alphavantage.co/))

---

### 📁 Folder Structure

```
src/
├── components/
│   ├── Auth/
│   ├── StockChart.js
│   └── Dashboard.js
├── services/
│   └── alphaVantage.js
├── firebase.js
├── App.js
```

---

### 🔧 Getting Started

#### 1. Clone the repository

```bash
git clone https://github.com/vamshi2504/stock-market-tracker.git
cd stock-market-tracker
```

#### 2. Install dependencies

```bash
npm install
```

#### 4. Run the app

```bash
npm run dev
```

---

### 📚 Future Improvements

* [ ] Firebase Firestore Watchlist
* [ ] Support for intraday stock data
* [ ] Compare multiple stocks on one chart
* [ ] Dark mode toggle

---

### 🧠 Learnings

This project helped me understand:

* Working with third-party APIs (Alpha Vantage)
* Using React Hooks and state management
* Implementing authentication using Firebase
* Data visualization with Chart.js

---

### 🤝 Contributing

Pull requests are welcome! For major changes, open an issue first to discuss what you’d like to change.

---

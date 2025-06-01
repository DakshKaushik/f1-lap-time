# 🏁 F1 Lap Time Analyzer

Compare lap-by-lap performance between Formula 1 drivers using real F1 data!

This project consists of a **FastAPI backend** (Python, FastF1) and a **React frontend** for a beautiful, interactive comparison of F1 driver lap times.

---

## Features
- Select year, race, and two drivers to compare
- Visualize lap times for both drivers on a modern, dark-themed chart
- Uses real F1 data via [FastF1](https://theoehrly.github.io/Fast-F1/)
- Clean, responsive UI with modern fonts and styling

---

## Project Structure

```
f1-laptime/
├── backend/         # FastAPI + FastF1 server
│   ├── main.py
│   └── requirements.txt
├── frontend/        # React app
│   └── src/
│       └── App.js
└── README.md
```

---

## Getting Started

### 1. Clone the repository
```sh
git clone git@github.com:DakshKaushik/f1-lap-time.git
cd f1-lap-time
```

### 2. Backend Setup (Python, FastAPI)

```sh
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```
- The backend will run at `http://localhost:8000`

### 3. Frontend Setup (React)

```sh
cd ../frontend
npm install
npm start
```
- The frontend will run at `http://localhost:3000`

---

## Usage
1. Open [http://localhost:3000](http://localhost:3000) in your browser.
2. Select a year, race, and two drivers.
3. Click **Analyze** to view lap-by-lap lap times for both drivers.

---

## Credits
- [FastF1](https://theoehrly.github.io/Fast-F1/) for F1 data
- [React](https://react.dev/) and [Recharts](https://recharts.org/) for the frontend

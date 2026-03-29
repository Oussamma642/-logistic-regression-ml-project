# OncoPred — Breast Cancer Prediction System

A full-stack ML prediction system using Logistic Regression on the Wisconsin Breast Cancer dataset.

---

## 🗂️ Project Structure

```
cancer-predictor/
├── backend/
│   ├── app.py              ← Flask API (trains model + serves predictions)
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── App.jsx         ← Main React UI
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── postcss.config.js
```

---

## ⚙️ Setup & Run

### 1. Backend (Flask)

```bash
cd backend

# Create a virtual environment (recommended)
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
python app.py
# → Running on http://localhost:5000
```

The model trains automatically on startup using sklearn's built-in
Wisconsin Breast Cancer dataset (same 30 features as your notebook).

### 2. Frontend (React + Vite + Tailwind)

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
# → Running on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/features` | Returns feature names + min/max/mean stats |
| GET | `/model-info` | Returns accuracy, F1, precision, recall |
| POST | `/predict` | Accepts `{"features": [30 values]}`, returns prediction |

---

## 🧠 Model Details

- **Algorithm**: Logistic Regression (sklearn)
- **Dataset**: Wisconsin Breast Cancer (569 samples, 30 features)
- **Split**: 70% train / 30% test
- **Preprocessing**: StandardScaler normalization
- **Accuracy**: ~98%

---

## 🖥️ Features of the UI

- Live backend status indicator
- Model performance banner (accuracy, F1 scores)
- 30 features organised in 3 colour-coded groups (Mean / SE / Worst)
- Range hints for each feature [min – max]
- Preset buttons (mean / min / max values)
- Animated result panel with probability bars

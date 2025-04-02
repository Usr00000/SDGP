#  Feeding Dashboard with Machine Learning (FastAPI + RandomForest)

This project is a medical dashboard system that predicts whether a patient in a Critical Care Unit (CCU) needs a dietitian referral. It includes:

- A backend REST API built using **FastAPI**
- A trained **Random Forest** machine learning model
- A front dashboard developed with react

---

## ⚙️ Setup Instructions

##  Running the React Frontend Dashboard

### Prerequisites:
- Make sure you have **Node.js** and **npm** installed:
```bash
node -v
npm -v
```
If not, download from [https://nodejs.org](https://nodejs.org)

### Install frontend dependencies:
```bash
cd frontend
npm install
```

### Start the dashboard:
```bash
npm start
```
### Run the Dashboard

This opens a desktop GUI where you can:
- Upload patient CSVs
- View data (with/without missing values)
- Analyse referrals using the ML model

### 1. Install Dependencies for backend
manually:
```bash
pip install fastapi uvicorn pandas scikit-learn joblib imbalanced-learn
```

### 2. Train the Model (if needed)
```bash
python ml_train_model.py
```
This will generate:
- `final_model.pkl`
- `final_imputer.pkl`

### 3. Run the Backend API
```bash
uvicorn backend.main:app --reload
```
The FastAPI server will be available at:
```
http://localhost:8000
```

---

##  API Endpoints
| Method | Endpoint      | Description                     |
|--------|---------------|---------------------------------|
| GET    | `/`           | Check backend status            |
| POST   | `/upload/`    | Upload patient data (CSV)       |
| GET    | `/patients`   | Get uploaded patient data       |
| POST   | `/predict`    | Predict referral for one patient|

---

##  ML Model Info
- **Algorithm**: Random Forest Classifier
- **Imputation**: KNNImputer (for missing values)
- **Balanced Class Handling**: `class_weight='balanced'`

---

## Example Prediction Input
```json
{
  "bmi": 23.5,
  "resp_rate": 20,
  "fio2": 0.3,
  "feed_vol": 500,
  ...
}
```

---




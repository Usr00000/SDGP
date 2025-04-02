from fastapi.middleware.cors import CORSMiddleware 
from fastapi import FastAPI, UploadFile, File, HTTPException
import pandas as pd
import io
import sys
import os

# Add backend folder to the system path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from ml_model_loader import predict

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variable to store patient data
patient_data = None

@app.get("/")
def home():
    return {"message": "Feeding Dashboard Backend is working"}

@app.post("/upload/")
async def upload_csv(file: UploadFile = File(...)):
    global patient_data
    try:
        contents = await file.read()
        try:
            df = pd.read_csv(io.StringIO(contents.decode("utf-8")))
        except UnicodeDecodeError:
            df = pd.read_csv(io.StringIO(contents.decode("latin-1")))

        df = df.fillna(0)
        patient_data = df

        return {
            "message": "File uploaded successfully",
            "columns": df.columns.tolist(),
            "data_preview": df.head(5).to_dict(orient="records")
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/patients")
def get_patients():
    global patient_data
    if patient_data is None:
        raise HTTPException(status_code=404, detail="No data uploaded yet.")
    return patient_data.to_dict(orient="records")

# ML Prediction endpoint (with debug logging)
@app.post("/predict")
async def predict_endpoint(patient: dict):
    try:
        print("Incoming patient data:", patient)
        result = predict(patient)
        print("Prediction result:", result)
        return {"prediction": result}
    except Exception as e:
        print("Prediction error:", str(e))
        raise HTTPException(status_code=500, detail=str(e))

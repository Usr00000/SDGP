import joblib
import pandas as pd

# Load trained model and imputer (no scaler used)
model = joblib.load("final_model.pkl")
imputer = joblib.load("final_imputer.pkl")

# The exact features used during training
expected_features = [
    'end_tidal_co2', 'feed_vol', 'feed_vol_adm', 'fio2', 'fio2_ratio',
    'insp_time', 'oxygen_flow_rate', 'peep', 'pip', 'resp_rate',
    'sip', 'tidal_vol', 'tidal_vol_actual', 'tidal_vol_kg',
    'tidal_vol_spon', 'bmi'
]

def predict(data_dict):
    try:
        # Convert incoming data to a DataFrame
        df = pd.DataFrame([data_dict])

        # Ensure all expected features exist in the data
        for feature in expected_features:
            if feature not in df.columns:
                df[feature] = 0  # Fill missing columns with 0

        # Reorder the columns to match training order
        df = df[expected_features]

        # Apply imputer (handle missing values)
        df_imputed = imputer.transform(df)

        # Make prediction
        prediction = model.predict(df_imputed)
        return int(prediction[0])

    except Exception as e:
        return {"error": str(e)}

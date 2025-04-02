import pandas as pd 
from sklearn.impute import KNNImputer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import joblib

# Load CSV
df = pd.read_csv("backend/Feeding Dashboard data.csv")

# Convert referral to binary integer
df["referral"] = df["referral"].astype(int)

# Define features
features = [
    'end_tidal_co2', 'feed_vol', 'feed_vol_adm', 'fio2', 'fio2_ratio',
    'insp_time', 'oxygen_flow_rate', 'peep', 'pip', 'resp_rate',
    'sip', 'tidal_vol', 'tidal_vol_actual', 'tidal_vol_kg',
    'tidal_vol_spon', 'bmi'
]

X = df[features]
y = df["referral"]

# Step 1: Impute missing values
imputer = KNNImputer(n_neighbors=5)
X_imputed = imputer.fit_transform(X)

# Step 2: Split the data
X_train, X_test, y_train, y_test = train_test_split(X_imputed, y, test_size=0.2, random_state=42)

# Step 3: Train Random Forest model
rf_model = RandomForestClassifier(random_state=42, class_weight='balanced')
rf_model.fit(X_train, y_train)

# Step 4: Save model and imputer
joblib.dump(rf_model, "final_model.pkl")
joblib.dump(imputer, "final_imputer.pkl")

print("Random Forest model and imputer saved successfully.")
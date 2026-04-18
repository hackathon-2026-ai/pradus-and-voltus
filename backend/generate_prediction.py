import joblib
import os
from dotenv import load_dotenv
from sklearn.preprocessing import MinMaxScaler

load_dotenv()
scaler_path = "models/MinMaxScaler_Final.pkl"
model_path = "models/XGBReggressor_n1000_maxdepth_10.joblib"

if os.path.exists(scaler_path):
    print("Scaler Exist!")
    scaler = joblib.load(scaler_path)
else:
    print("Scaler Not Found!")

model = joblib.load(model_path)


def generate_prediction(data):
    indices = data[data['is_day'] == 0].index
    power = float(os.getenv("POWER"))
    X = scaler.transform(data)
    prediction = model.predict(X)
    prediction = prediction*power
    prediction[indices] *= 0
    return prediction

from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.datasets import load_breast_cancer
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import numpy as np

app = Flask(__name__)
CORS(app)

# ─────────────────────────────────────────────
# Train model on startup using sklearn's built-in
# Wisconsin Breast Cancer dataset (same 30 features)
# ─────────────────────────────────────────────
print("🔬 Loading breast cancer dataset...")
data = load_breast_cancer()
X, y = data.data, data.target
feature_names = data.feature_names.tolist()

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.30, random_state=42
)

model = LogisticRegression(max_iter=10000)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
report = classification_report(y_test, y_pred, output_dict=True)
accuracy = report["accuracy"]
print(f"✅ Model trained — Accuracy: {accuracy:.2%}")


# ─────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────
@app.route("/features", methods=["GET"])
def get_features():
    """Return feature names and their typical value ranges."""
    stats = {}
    for i, name in enumerate(feature_names):
        col = X[:, i]
        stats[name] = {
            "min": float(round(col.min(), 4)),
            "max": float(round(col.max(), 4)),
            "mean": float(round(col.mean(), 4)),
            "std": float(round(col.std(), 4)),
        }
    return jsonify({"features": feature_names, "stats": stats})


@app.route("/predict", methods=["POST"])
def predict():
    """Receive 30 feature values and return a prediction."""
    body = request.get_json()
    if not body or "features" not in body:
        return jsonify({"error": "Missing 'features' key in request body"}), 400

    values = body["features"]
    if len(values) != 30:
        return jsonify({"error": f"Expected 30 features, got {len(values)}"}), 400

    try:
        arr = np.array(values, dtype=float).reshape(1, -1)
        arr_scaled = scaler.transform(arr)
        prediction = int(model.predict(arr_scaled)[0])
        proba = model.predict_proba(arr_scaled)[0]

        return jsonify({
            "prediction": prediction,
            "label": "Malignant 🔴" if prediction == 1 else "Benign 🟢",
            "confidence": float(round(max(proba) * 100, 2)),
            "probability_benign": float(round(proba[1] * 100, 2)),
            "probability_malignant": float(round(proba[0] * 100, 2)),
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/model-info", methods=["GET"])
def model_info():
    return jsonify({
        "accuracy": float(round(accuracy * 100, 2)),
        "precision_benign": float(round(report["1"]["precision"] * 100, 2)),
        "recall_benign": float(round(report["1"]["recall"] * 100, 2)),
        "f1_benign": float(round(report["1"]["f1-score"] * 100, 2)),
        "precision_malignant": float(round(report["0"]["precision"] * 100, 2)),
        "recall_malignant": float(round(report["0"]["recall"] * 100, 2)),
        "f1_malignant": float(round(report["0"]["f1-score"] * 100, 2)),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
    })


if __name__ == "__main__":
    app.run(debug=True, port=5000)

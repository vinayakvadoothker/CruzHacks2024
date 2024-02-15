import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from flask import Flask, jsonify
from flask_cors import CORS  # Import CORS from flask_cors

app = Flask(__name__)
CORS(app)  # Enable CORS for your app

# Initialize Firebase
cred = credentials.Certificate('./rentora-dbfa3-firebase-adminsdk-4rpix-4bb6bae0fe.json')
firebase_admin.initialize_app(cred)

db = firestore.client()

def fetch_user_details():
    responses_ref = db.collection('SurveyResponses')
    responses = responses_ref.stream()

    user_details = []
    for response in responses:
        data = response.to_dict()
        user_details.append({
            'id': response.id,
            'firstName': data.get('firstName', 'No first name'),
            'lastName': data.get('lastName', 'No last name'),
            'email': data.get('email', 'No email'),
            'schoolName': data.get('schoolName', 'No school name'),
            'addToRoommateSearch': data.get('addToRoommateSearch', 'Not specified')
        })

    return user_details

@app.route('/fetch_user_details', methods=['GET'])
def fetch_user_details_route():
    user_details = fetch_user_details()
    return jsonify(user_details)

if __name__ == "__main__":
    # Run Flask app on port 3000
    app.run(host='0.0.0.0', port=3002, debug=True)

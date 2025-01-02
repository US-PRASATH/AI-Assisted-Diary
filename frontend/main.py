from flask import Flask, request, jsonify
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from flask_cors import CORS
import google.generativeai as genai
import pyrebase

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

genai.configure(api_key="AIzaSyBR9qyJ6S7RBBQfGhmZM39sE19Z4Xa6J9A")
model = genai.GenerativeModel("gemini-1.5-flash")


# Use a service account.
cred = credentials.Certificate('C:/Users/uspra/OneDrive/Desktop/Projects/AI-Assisted-Diary/backend/journalapp/ai-assisted-diary-443711-6bddeded7d32.json')
firebase_admin.initialize_app(cred)

db = firestore.client()

firebase_config = {
  "apiKey": "AIzaSyBUpjGz9dss8ZnZnTfzUpza1ZIvUOsr3nE",
  "authDomain": "ai-assisted-diary.firebaseapp.com",
  "projectId": "ai-assisted-diary",
  "storageBucket": "ai-assisted-diary.firebasestorage.app",
  "messagingSenderId": "445293697000",
  "appId": "1:445293697000:web:70d8bbcff9c8791f11b65d",
  "measurementId": "G-FF5YXP95XP",
  "databaseURL": "https://ai-assisted-diary.firebaseio.com"
}

firebase = pyrebase.initialize_app(firebase_config)
auth = firebase.auth()

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()  # Get the JSON data from the request
    email = data.get("email")
    password = data.get("password")
    try:
        user = auth.sign_in_with_email_and_password(email, password)
        # session["user"] = email
        id_token = user["idToken"]
        return jsonify({
            "message": "Login Successful",
            "id_token": id_token
        }), 200
        # return jsonify({"message": "Login Successful"}), 200

    except:
        return jsonify({"error": "Login Failed"}), 401
    
    

@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()  # Get the JSON data from the request
    email = data.get("email")
    password = data.get("password")
    try:
        user = auth.create_user_with_email_and_password(email, password)
        # session["user"] = email
        id_token = user["idToken"]
        
        # Get the user's unique ID (uid) using Pyrebase's get_account_info
        user_info = auth.get_account_info(id_token)
        user_id = user_info["users"][0]["localId"]
        
        # Reference the Firestore document for this user
        user_ref = db.collection("users").document(user_id)
        if not user_ref.get().exists:
            # Create a new user record if it doesn't exist
            user_ref.set({
                "email": email,
                "created_at": firestore.SERVER_TIMESTAMP
            })
        return jsonify({"message": "Registration Successful"}), 200

    except Exception as e:
        return jsonify({"error": f"Registration Failed: {str(e)}"}), 401
    
def authorized_user(request):
    auth_header = request.headers.get('Authorization')
    # print(auth_header)
    if auth_header:
        token = auth_header.split("Bearer ")[-1] 
        # print(token)# Extract token from Authorization header
        uid = get_uid_from_token(token)
        # print(uid)
        # print(uid)
        if not uid:
            return None
        return uid
    return None

def get_uid_from_token(token):
    try:
        # print(token)
        decoded_token = auth.get_account_info(token)
        print("Decoded Token:", decoded_token)
        user_id = decoded_token["users"][0]["localId"]
        return user_id
    except Exception as e:
        return None

# Route to add a journal entry
@app.route("/journal/journalentry", methods=["POST"])
def set_journal_entry():
    user_id = authorized_user(request)
    # print(user_id)
    
    # Extract the journal entry data from the request
    data = request.get_json()

    if not data or not data.get("title") or not data.get("content"):
        return jsonify({"error": "Missing title or content"}), 400

    title = data["title"]
    content = data["content"]
    timestamp = data.get("timestamp", "2024-12-19T10:00:00")  # Default timestamp
    if user_id:
    # Define the document reference for the user's journal entry (auto-generate ID)
        doc_ref = db.collection("users").document(user_id).collection("journals").document()
        grat_ref = db.collection("users").document(user_id).collection("gratitude_lines").document("gratitude_lines")
        grat_count_ref = db.collection("users").document(user_id).collection("gratitude_count").document("gratitude_count")
        grat_log_ref = db.collection("users").document(user_id).collection("gratitude_count_log")
    else:
        return jsonify({"error": "Failed to add journal entry, Empty user_id value"}), 500
    # Add the journal entry to Firestore
    try:
        doc_ref.set({
            "title": title,
            "content": content,
            "timestamp": timestamp
        })
        print("Journal entry added successfully.")
    except Exception as e:
        print(f"Error adding journal entry: {e}")
        return jsonify({"error": "Failed to add journal entry"}), 500
    
    gratitude_lines = grateful_lines(content)
    #gratitude_lines = gratitude_lines.split("\n")
    # for i in gratitude_lines:
    # grat_ref.set({
    #     "content":gratitude_lines
    # })
    # if grat_count_ref:
    #     count = grat_count_ref.get().to_dict()["count"] + 1
    #     grat_count_ref.set({
    #         "count":count
    #     })
    # else:
    #     grat_count_ref.set({
    #         "count":1
    #     })
    
    gratitude_list = gratitude_lines.split("\n") if gratitude_lines != "No" else []
    
    # # Save gratitude lines to Firestore
    
    # grat_ref.set({
    #     "content": gratitude_list
    # })

    existing_gratitude_lines = grat_ref.get().to_dict().get("content", []) if grat_ref.get().exists else []

    # Append new gratitude lines (avoid duplicates)
    updated_gratitude_lines = existing_gratitude_lines + [line for line in gratitude_list if line and line not in existing_gratitude_lines]

    # Save the updated gratitude lines to Firestore
    grat_ref.set({
        "content": updated_gratitude_lines
    })
    # Update gratitude count in Firestore
    if grat_count_ref.get().exists:
        # Increment the count by the number of new gratitude expressions
        existing_count = grat_count_ref.get().to_dict().get("count", 0)
        new_count = existing_count + len(gratitude_list) - 1
        grat_count_ref.set({
            "count": new_count
        })
        log_entry = {
        "timestamp": firestore.SERVER_TIMESTAMP,
        "count": new_count
        }
    else:
        # Initialize count if the document doesn't exist
        grat_count_ref.set({
            "count": len(gratitude_list) - 1
        })
        log_entry = {
        "timestamp": firestore.SERVER_TIMESTAMP,
        "count": len(gratitude_list) - 1
        }   
        
    
    grat_log_ref.add(log_entry)

    # Return a success response
    return jsonify({"message": "Journal entry added successfully"}), 201

@app.route("/journal/journalentry", methods=["GET"])
def get_all_journal_entries():
    user_id = authorized_user(request)
    doc_ref = db.collection("users").document(user_id).collection("journals")
    journals = doc_ref.stream()
    
    entries = []
    for journal in journals:
        entry = journal.to_dict()
        entry["journal_id"] = journal.id
        entries.append(entry)
    
    return jsonify(entries), 200


@app.route("/journal/journalentry/<journal_id>", methods=["GET"])
def get_journal_entry(journal_id):
    user_id = authorized_user(request)
    doc_ref = db.collection("users").document(user_id).collection("journals").document(journal_id)
    entry = doc_ref.get()
    if not entry.exists:
        return jsonify({"error": "Journal entry not found"}), 404

    return jsonify(entry.to_dict()), 200


# UPDATE: Edit a specific journal entry
@app.route("/journal/journalentry/<journal_id>", methods=["PUT"])
def update_journal_entry(journal_id):
    user_id = authorized_user(request)
    # Extract the journal entry data from the request
    data = request.get_json()

    if not data or not data.get("title") or not data.get("content"):
        return jsonify({"error": "Missing title or content"}), 400

    title = data["title"]
    content = data["content"]
    timestamp = data.get("timestamp")  # Default timestamp

    # Define the document reference for the user's specific journal entry
    doc_ref = db.collection("users").document(user_id).collection("journals").document(journal_id)

    # Update the journal entry in Firestore
    doc_ref.update({
        "title": title,
        "content": content,
        "timestamp": timestamp
    })

    return jsonify({"message": "Journal entry updated successfully"}), 200

# DELETE: Delete a specific journal entry
@app.route("/journal/journalentry/<journal_id>", methods=["DELETE"])
def delete_journal_entry(journal_id):
    user_id = authorized_user(request)
    # Define the document reference for the user's specific journal entry
    doc_ref = db.collection("users").document(user_id).collection("journals").document(journal_id)

    # Delete the journal entry from Firestore
    doc_ref.delete()

    return jsonify({"message": "Journal entry deleted successfully"}), 200

@app.route("/gratitude_count", methods=["GET"])
def get_gratitude_count():
    user_id = authorized_user(request)
    grat_count_ref = db.collection("users").document(user_id).collection("gratitude_count").document("gratitude_count")
    entry = grat_count_ref.get()
    if not entry.exists:
        return jsonify({"count": 0}), 200
    return jsonify(entry.to_dict()), 200

@app.route("/gratitude_growth", methods=["GET"])
def get_gratitude_growth():
    user_id = authorized_user(request)
    gratitude_growth_ref = db.collection("users").document(user_id).collection("gratitude_count_log")
    gratitude_growth_data = gratitude_growth_ref.stream()

    growth_data = []
    for record in gratitude_growth_data:
        data = record.to_dict()
        growth_data.append({
            "timestamp": data.get("timestamp"),
            "count": data.get("count")
        })

    # Sort data by timestamp
    growth_data = sorted(growth_data, key=lambda x: x["timestamp"])

    return jsonify(growth_data), 200

@app.route("/random_gratitude_line", methods=["GET"])
def get_random_gratitude_line():
    user_id = authorized_user(request)
    grat_ref = db.collection("users").document(user_id).collection("gratitude_lines").document("gratitude_lines")
    existing_gratitude_lines = grat_ref.get().to_dict().get("content", []) if grat_ref.get().exists else []
    prompt = f"""
    You are an assistant tasked with finding the most motivating and gratitude-filled line from a given list of gratitude expressions. Your goal is to select one line randomly from the list that embodies positivity and appreciation. If the chosen line is challenging to represent as a quote, you may rephrase it to ensure it is inspiring and impactful. The output should be a single, standalone sentence suitable for motivating people while journaling.
    Input List:
    {existing_gratitude_lines}

    Output Example:
    "Every small act of kindness I receive reminds me how beautiful life truly is."

    If the list is empty or does not contain suitable lines, respond with:
    "No motivational lines available."

    """
    response = model.generate_content(prompt)
    return jsonify(response.text), 200

def grateful_lines(journal_entry):
    prompt = f"""
    Analyze the provided text and identify all concise expressions that convey positivity, gratitude, or motivation. The expressions can include:

    Gratitude Statements: Sentences that explicitly express thankfulness or appreciation.
    Positive Affirmations: Sentences that reflect self-growth, determination, hope, or optimism (e.g., "I believe in myself," "I will overcome challenges," "I am excited for the future").
    Uplifting Messages: Sentences that convey any positive emotion or encourage a positive outlook on life.
    The statements must meet the following additional criteria:

    Each statement should be concise, with a maximum length of one line (approximately 100 characters).
    Each statement must be standalone and complete, providing a clear, uplifting sentiment without requiring additional context.
    Return the results as a list of the extracted lines. If no suitable expressions meet these criteria, respond with "No."

    Text:
    {journal_entry}

    Example Output:

    For the input:
    "Today was challenging, but I am grateful for my family's support. I believe I am becoming a stronger person every day. The little victories remind me that progress is worth celebrating. Life has its ups and downs, but I am confident in brighter days ahead. I'm so thankful for the chance to try again tomorrow."

    The output would be:

    "I am grateful for my family's support."
    "I believe I am becoming a stronger person every day."
    "The little victories remind me that progress is worth celebrating."
    "Life has its ups and downs, but I am confident in brighter days ahead."
    "I'm so thankful for the chance to try again tomorrow."
    If the text contains no expressions meeting these criteria, the response would be:
    "No."
    """
    response = model.generate_content(prompt)
    return response.text


if __name__=="__main__":
    app.run(debug=True)
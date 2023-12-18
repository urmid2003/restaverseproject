from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import mysql.connector

app = Flask(__name__)
CORS(app)

# Configure your MySQL connection
db_config = {
    'host': '127.0.0.1',
    'user': 'root',
    'password': 'root',
    'database': 'restaversee',
}

# External API URL
external_api_url = "https://getreplies.onrender.com/getreplies"

try:
    # Establish the MySQL connection
    db_connection = mysql.connector.connect(**db_config)
    cursor = db_connection.cursor()
    print("Connected to MySQL database")

    # Function to create the 'replies' table if it doesn't exist
    def create_table():
        create_table_query = """
        CREATE TABLE IF NOT EXISTS replies (
            commentId INT AUTO_INCREMENT PRIMARY KEY,
            namec VARCHAR(255) NOT NULL,
            comment VARCHAR(255) NOT NULL,
            emailid VARCHAR(255) NOT NULL,
            replyText VARCHAR(255) NOT NULL
        )
        """
        cursor.execute(create_table_query)
        db_connection.commit()
        print("Table 'replies' created or already exists")

    # Create the 'replies' table
    create_table()

except Exception as e:
    print(f"Error connecting to MySQL database: {e}")

# In-memory list to store the replies (optional, depending on your use case)
stored_replies = []

@app.route("/getreplies", methods=['POST'])
def reply_store():
    data = request.get_json()
    
    reply_data = {
        'commentId': data.get('commentId'),
        'namec': data.get('namec'),
        'comment': data.get('comment'),
        'emailid': data.get('emailid'),
        'replyText': data.get('replyText'),
    }

    # Try to store data in MySQL database
    try:
        insert_query = "INSERT INTO replies (commentId, namec, comment, emailid, replyText) VALUES (%s, %s, %s, %s, %s)"
        values = (reply_data['commentId'], reply_data['namec'], reply_data['comment'], reply_data['emailid'], reply_data['replyText'])
        cursor.execute(insert_query, values)
        db_connection.commit()
        print("Data successfully stored in MySQL database")
    except Exception as e:
        print(f"Error storing data in MySQL database: {e}")

    # Optionally, store data in memory (for quick retrieval)
    stored_replies.append(reply_data)

    return jsonify({'message': 'Reply stored successfully'})

@app.route("/getreplies", methods=['GET'])
def get_replies():
    # Try to retrieve data from the external API
    try:
        response = requests.get(external_api_url)
        response.raise_for_status()  # Raise an exception for HTTP errors

        # Parse the JSON response from the external API
        external_replies = response.json()

        # Optionally, store data in memory (for quick retrieval)
        stored_replies.extend(external_replies)

        return jsonify({'replies': external_replies})
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data from external API: {e}")

        # Retrieve data from MySQL database as a fallback
        select_query = "SELECT * FROM replies"
        cursor.execute(select_query)
        result = cursor.fetchall()

        # Convert the result to a list of dictionaries
        replies = [{'commentId': row[0], 'namec': row[1], 'comment': row[2], 'emailid': row[3], 'replyText': row[4]} for row in result]

        return jsonify({'replies': replies})

if __name__ == '__main__':
    app.run(debug=True)


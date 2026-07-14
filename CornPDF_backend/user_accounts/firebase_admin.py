import os
import json
import firebase_admin
from firebase_admin import credentials
from dotenv import load_dotenv

load_dotenv()

firebase_config = json.loads(os.getenv("FIREBASE_CREDENTIALS"))

firebase_config["private_key"] = firebase_config["private_key"].replace("\\n", "\n")

cred = credentials.Certificate(firebase_config)
firebase_admin.initialize_app(cred)
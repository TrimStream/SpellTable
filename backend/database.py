from pymongo import AsyncMongoClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")

client = AsyncMongoClient(MONGODB_URL)
db = client.trainingark
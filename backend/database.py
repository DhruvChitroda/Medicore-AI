from motor.motor_asyncio import AsyncIOMotorClient
import os

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGODB_URL)
database = client.medical_analytics
patients_collection = database.get_collection("patients")
reports_collection = database.get_collection("reports")

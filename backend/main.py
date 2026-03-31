from typing import List, Optional
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from bson import ObjectId
import random
import os
import json
from dotenv import load_dotenv

load_dotenv()

from database import patients_collection, reports_collection
import schemas

app = FastAPI(title="AI-Driven Healthcare & Medical Analytics API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/patients/", response_model=schemas.Patient)
async def create_patient(patient: schemas.PatientCreate):
    existing = await patients_collection.find_one({
        "name": patient.name,
        "age": patient.age,
        "gender": patient.gender,
        "blood_group": patient.blood_group
    })
    if existing:
        raise HTTPException(status_code=409, detail="This patient data has already been saved.")
        
    new_patient = await patients_collection.insert_one(patient.model_dump())
    created_patient = await patients_collection.find_one({"_id": new_patient.inserted_id})
    return created_patient

@app.get("/patients/", response_model=List[schemas.Patient])
async def read_patients():
    patients = await patients_collection.find().to_list(100)
    return patients

@app.get("/patients/{patient_id}", response_model=schemas.Patient)
async def read_patient(patient_id: str):
    if not ObjectId.is_valid(patient_id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    patient = await patients_collection.find_one({"_id": ObjectId(patient_id)})
    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

@app.delete("/patients/{patient_id}")
async def delete_patient(patient_id: str):
    if not ObjectId.is_valid(patient_id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    delete_result = await patients_collection.delete_one({"_id": ObjectId(patient_id)})
    if delete_result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Patient not found")
    await reports_collection.delete_many({"patient_id": patient_id})
    return {"message": "Patient and all reports deleted"}

@app.post("/patients/{patient_id}/reports/", response_model=schemas.LabReport)
async def create_report_for_patient(
    patient_id: str, report: schemas.LabReportCreate
):
    if not ObjectId.is_valid(patient_id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    report_dict = report.model_dump()
    report_dict["patient_id"] = patient_id
    
    new_report = await reports_collection.insert_one(report_dict)
    created_report = await reports_collection.find_one({"_id": new_report.inserted_id})
    return created_report

@app.get("/patients/{patient_id}/reports/", response_model=List[schemas.LabReport])
async def get_patient_reports(patient_id: str):
    if not ObjectId.is_valid(patient_id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    reports = await reports_collection.find({"patient_id": patient_id}).to_list(100)
    return reports

class ChatMessage(schemas.BaseModel):
    message: str
    patient_id: Optional[str] = None

@app.post("/chat")
async def ai_chat(chat: ChatMessage):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "YOUR_API_KEY_HERE" or len(api_key) < 10:
        print("Gemini API Error: Missing or invalid GEMINI_API_KEY. Aborting chatbot logic.")
        return {"reply": "Service is temporarily unavailable. Please try again later."}

    context = ""
    if chat.patient_id and ObjectId.is_valid(chat.patient_id):
        latest_report = await reports_collection.find_one(
            {"patient_id": chat.patient_id},
            sort=[("_id", -1)]
        )
        if latest_report:
            latest_report.pop("_id", None)
            latest_report.pop("patient_id", None)
            clean_report = {k: v for k, v in latest_report.items() if v is not None}
            context = f"\n\n[SYSTEM CONTEXT: The user's latest lab results are: {json.dumps(clean_report)}]"

    system_prompt = (
        "CRITICAL INSTRUCTION: You are a strictly specialized AI medical diagnostic assistant. "
        "You MUST absolutely refuse to answer any question that is NOT related to medicine, "
        "human biology, healthcare, or analyzing pathological lab reports. If the user asks about "
        "programming, casual chat, or general knowledge, you MUST firmly reply: 'I am a highly "
        "specialized medical AI assistant. I can only assist with healthcare diagnostics and your "
        "lab reports.' Do not provide any non-medical information under any circumstance. "
        "FORMATTING RULES: You must provide a concise response that is short, clear, and organized topic-wise. "
        "Use structured bullet points or short bold headings. Avoid lengthy textbook explanations. "
        "If lab results are provided in the system context, reference them explicitly "
        "and concisely explain what they mean for the patient's health. Always remind the user "
        "that you are an AI and they should consult a licensed physician."
    )

    prompt = f"{system_prompt}{context}\n\nUser Query: {chat.message}"

    try:
        import urllib.request
        import asyncio
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
        payload = {"contents": [{"parts": [{"text": prompt}]}]}
        req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'})
        
        loop = asyncio.get_event_loop()
        def fetch_gemini():
            with urllib.request.urlopen(req) as response:
                return json.loads(response.read().decode('utf-8'))
                
        res_data = await loop.run_in_executor(None, fetch_gemini)
        reply_text = res_data['candidates'][0]['content']['parts'][0]['text']
        return {"reply": reply_text}
    except Exception as e:
        print("Gemini HTTP Error:", str(e))
        return {"reply": "Service is temporarily unavailable. Please try again later."}

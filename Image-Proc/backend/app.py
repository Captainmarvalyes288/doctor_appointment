# app.py
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os
import base64
import json
from pydantic import BaseModel
from typing import Optional, List
import io

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Environment variables for API keys (in production use proper env management)
GEMINI_API_KEY="AIzaSyD_MwkxaZUMjYEMpN4byy8SoMtdOQJ-u98"
GROQ_API_KEY="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"

# Store the latest image analysis to be used in chat
latest_image_analysis = None

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage] = []

@app.post("/api/analyze-scan")
async def analyze_scan(file: UploadFile = File(...)):
    """
    Analyze a CT/MRI scan using Gemini API
    """
    global latest_image_analysis
    
    try:
        # Read file content
        content = await file.read()
        
        # Convert to base64 for Gemini API
        encoded_content = base64.b64encode(content).decode("utf-8")
        
        # Prepare Gemini API request
        gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"
        
        # Medical prompt engineering to avoid dangerous medical advice
        prompt = """
        Analyze this medical scan image and provide a general description of what can be seen.
        Focus only on general observations. 
        DO NOT provide:
        - Specific diagnoses
        - Treatment recommendations
        - Critical or serious condition insights
        - Recommendations for surgery or major interventions
        
        Explicitly state that this is NOT medical advice and the patient should consult a healthcare professional.
        """
        
        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": prompt
                        },
                        {
                            "inline_data": {
                                "mime_type": file.content_type,
                                "data": encoded_content
                            }
                        }
                    ]
                }
            ]
        }
        
        # Make request to Gemini API
        async with httpx.AsyncClient() as client:
            response = await client.post(
                gemini_url,
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Error from Gemini API")
                
            result = response.json()
            
            # Extract text from response
            try:
                analysis_text = result["candidates"][0]["content"]["parts"][0]["text"]
                
                # Store the analysis for later use in chat
                latest_image_analysis = analysis_text
                
                return {"analysis": analysis_text}
            except (KeyError, IndexError):
                raise HTTPException(status_code=500, detail="Failed to parse Gemini API response")
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing scan: {str(e)}")

@app.post("/api/chat")
async def chat(request: ChatRequest):
    """
    Chat endpoint that connects to Groq's LLM API
    """
    global latest_image_analysis
    
    try:
        # Initialize messages list with system prompt
        sanitized_messages = [{
            "role": "system",
            "content": """You are a helpful medical information assistant. 
            DO NOT provide:
            - Specific diagnoses
            - Treatment recommendations for serious conditions
            - Prescription medications
            - Critical operation insights
            
            Always remind users that they should consult healthcare professionals for medical advice.
            Focus on general health information, lifestyle tips, and understanding medical terms."""
        }]
        
        # Check if there's a recent image analysis to include
        if latest_image_analysis:
            sanitized_messages.append({
                "role": "system",
                "content": f"The user previously uploaded a medical scan with the following analysis: {latest_image_analysis}"
            })
        
        # Add user messages if any are provided
        if request.messages:
            for msg in request.messages:
                sanitized_messages.append({
                    "role": msg.role,
                    "content": msg.content
                })
        else:
            # If no messages provided, add a default greeting prompt
            sanitized_messages.append({
                "role": "user",
                "content": "Hello, I'd like some general health information."
            })
        
        # Make request to Groq API
        groq_url = "https://api.groq.com/openai/v1/chat/completions"
        
        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": sanitized_messages,
            "temperature": 0.7,
            "max_tokens": 800
        }
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {GROQ_API_KEY}"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                groq_url,
                json=payload,
                headers=headers
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Error from Groq API")
                
            result = response.json()
            
            try:
                reply = result["choices"][0]["message"]["content"]
                return {"reply": reply}
            except (KeyError, IndexError):
                raise HTTPException(status_code=500, detail="Failed to parse Groq API response")
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in chat: {str(e)}")

@app.post("/api/simple-chat")
async def simple_chat(message: str = Form(...)):
    """
    Simplified chat endpoint that accepts a single message string
    and doesn't require previous conversation history
    """
    try:
        # Create a chat request with a single message
        chat_request = ChatRequest(
            messages=[ChatMessage(role="user", content=message)]
        )
        
        # Use the existing chat endpoint
        return await chat(chat_request)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in simple chat: {str(e)}")

@app.get("/")
def read_root():
    return {"status": "API is running"}
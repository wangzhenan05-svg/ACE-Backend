from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
import os
from pydantic import BaseModel
from openai import OpenAI

app = FastAPI()

app.mount("/static", StaticFiles(directory="."), name="static")

@app.get("/", response_class=HTMLResponse)
async def read_root():
    if os.path.exists("index.html"):
        with open("index.html", "r", encoding="utf-8") as f:
            return f.read()
    return "index.html not found"

class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
async def chat_endpoint(data: ChatRequest):
    user_msg = data.message
    
    # 從正確的環境變數讀取
    api_key = os.getenv("OPENROUTER_API_KEY")
    
    if not api_key:
        return {"reply": "錯誤：Render 雲端未讀到 OPENROUTER_API_KEY（請檢查變數名稱拼字）"}

    try:
        client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=api_key,
        )
        
        completion = client.chat.completions.create(
            model="deepseek/deepseek-r1:free",
            messages=[{"role": "user", "content": user_msg}]
        )
        
        reply_text = completion.choices[0].message.content
        return {"reply": reply_text}
        
    except Exception as e:
        return {"reply": f"AI 回應發生錯誤：{str(e)}"}
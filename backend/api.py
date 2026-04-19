from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mobile_llm import run_pradus_api
from web_llm import run_voltus_api
from web_llm_groq import run_voltus_groq_api

app = FastAPI()

# --- TO JEST KLUCZOWE: POZWALA VERSELOWI GADAĆ Z RENDEREM ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Wpuszczamy każdego (hackathon style!)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/chat/pradus")
def chat_with_pradus(message: str):
    # Wywołujemy Twoją gotową funkcję!
    return run_pradus_api(user_prompt=message)


@app.get("/api/chat/voltus")
def chat_with_voltus(message: str):
    return run_voltus_api(user_prompt=message)
    #return run_voltus_groq_api(user_prompt=message)

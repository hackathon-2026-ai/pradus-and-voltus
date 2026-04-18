from fastapi import FastAPI
from mobile_llm import run_pradus_api
from web_llm import run_voltus_api

app = FastAPI()


@app.get("/api/chat/pradus")
def chat_with_pradus(message: str):
    # Wywołujemy Twoją gotową funkcję!
    return run_pradus_api(user_prompt=message)


@app.get("/api/chat/voltus")
def chat_with_voltus(message: str):
    return run_voltus_api(user_prompt=message)

import os

import requests
import json
from dotenv import load_dotenv

def run_pradus_groq(user_prompt: str):
    # Twój kontekst z pliku...
    system_prompt = "Jesteś Prąduś..."

    url = "https://api.groq.com/openai/v1/chat/completions"

    API_KEY = os.getenv("GROQ_API_KEY")

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "llama-3.1-70b-versatile",  # Wybieramy najpotężniejszy darmowy model!
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "response_format": {"type": "json_object"},  # Groq wymaga tego, by oddać pięknego JSONa
        "temperature": 0.5
    }

    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()

        # Wyciągamy odpowiedź
        ai_response_text = response.json()["choices"][0]["message"]["content"]

        return json.loads(ai_response_text)

    except Exception as e:
        return {"status": "error", "message": str(e)}
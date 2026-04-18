import requests
import pandas as pd
import json
import os
import re
from config import DATA_PATH, DATA_PATH_2

def get_data_json(file_path: str = DATA_PATH):
    try:
        df = pd.read_excel(file_path)
        # Zmniejszamy do 24h, żeby mały model AI lepiej analizował
        df_subset = df.head(24).copy()
        json_data = df_subset.to_dict(orient='records')
        return json_data, df_subset.to_csv(index=False)
    except Exception as e:
        print(f"🚨 BŁĄD PANDASA (Excel): {e}")
        return [], f"Brak danych: {e}"

def get_production(file_path: str = DATA_PATH_2):
    try:
        df = pd.read_csv(file_path)
        df_subset = df.head(24).copy()
        json_data = df_subset.to_dict(orient='records')
        return json_data, df_subset.to_csv(index=False)
    except Exception as e:
        print(f"🚨 BŁĄD PANDASA (CSV): {e}")
        return [], f"Brak danych: {e}"

def run_voltus_api(user_prompt: str, model: str = "gemma4:e2b"):
    json_payload, csv_context = get_data_json()
    production_payload, production_context = get_production()

    print(f"🔍 DEBUG: Załadowano {len(json_payload)} wierszy Excel i {len(production_payload)} CSV")

    try:
        url = "http://localhost:11434/api/chat"
        system_prompt = f"""Jesteś Voltuś, ekspert energetyczny TAURONA.
        
        DANE (ostatnie 24h):
        Ceny RCE: {csv_context}
        Produkcja OZE (Wiatr/Słońce): {production_context}

        ZADANIE:
        Przeanalizuj dane i odpowiedz na pytanie użytkownika. 
        Jeśli w danych nie ma odpowiedzi (np. pytania o regiony/województwa), wyjaśnij to krótko.

        ODPOWIADAJ WYŁĄCZNIE W FORMACIE JSON:
        {{
            "summary": "Krótkie podsumowanie analizy lub informacja o braku danych.",
            "action": "Konkretna porada dla klienta (DSR).",
            "analysis": "Techniczne uzasadnienie (wpływ OZE na cenę)."
        }}
        """

        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "stream": False,
            "format": "json"
        }

        response = requests.post(url, json=payload)
        if response.status_code != 200:
            return {"status": "error", "message": f"Błąd Ollama: {response.status_code}"}

        ai_raw_content = response.json()["message"]["content"]
        
        # --- KULOODPORNY PARSER ---
        # 1. Czyścimy komentarze, których Python nie lubi
        clean_content = re.sub(r'//.*', '', ai_raw_content)
        
        # 2. Szukamy klamerek JSON
        match = re.search(r'\{.*\}', clean_content, re.DOTALL)
        
        if match:
            try:
                ai_data = json.loads(match.group(0))
            except json.JSONDecodeError:
                ai_data = {"summary": ai_raw_content}
        else:
            ai_data = {"summary": ai_raw_content}

        # --- MAPOWANIE NA FORMAT FRONTENDU ---
        summary = ai_data.get("summary") or ai_data.get("podsumowanie_dla_pracownika") or "Brak podsumowania"
        action = ai_data.get("action") or ai_data.get("rekomendacja_dsr") or "Brak zaleceń"
        analysis = ai_data.get("analysis") or ai_data.get("uzasadnienie_analityczne") or "Analiza trendów"

        return {
            "status": "success",
            "ui_components": {
                "ai_copilot_panel": {
                    "executive_summary": summary,
                    "dsr_action": action
                },
                "explainable_ai": analysis
            },
            "datasets": {
                "rce_chart_data": json_payload,
                "production_chart_data": production_payload
            },
            "compliance_and_legal": {
                "internal_guideline": "Wytyczna Legal: Rekomendacje są zmienne. Zakaz gwarantowania zysków.",
                "data_lineage": "Dane: PSE oraz ENTSO-E."
            }
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}
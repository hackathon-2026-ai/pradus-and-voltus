import requests
import pandas as pd
import json
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "..", "Demo-Dataset",
                         "Rynkowa cena energii elektrycznej (RCE) 2026-04-13 - 2026-04-18.xlsx")

DATA_PATH_2 = os.path.join(BASE_DIR, "..", "Demo-Dataset", "electricity_production_entsoe.csv")


def get_data_json(
        file_path: str = DATA_PATH):
    try:
        df = pd.read_excel(file_path)
        df_subset = df.head(96).copy()

        json_data = df_subset.to_dict(orient='records')
        return json_data, df_subset.to_csv(index=False)
    except Exception as e:
        return None, f"Brak danych: {e}"


def get_production(file_path: str = DATA_PATH_2):
    try:
        df = pd.read_csv(file_path)
        df_subset = df.head(96).copy()

        json_data = df_subset.to_dict(orient='records')
        return json_data, df_subset.to_csv(index=False)

    except Exception as e:
        return None, f"Brak danych: {e}"


def run_voltus_api(user_prompt: str, model: str = "gemma4:e2b"):
    json_payload, csv_context = get_data_json()
    production_payload, production_context = get_production()

    try:
        # 1. Wysyłamy zapytanie do LLM o analizę (tak jak wcześniej)
        url = "http://localhost:11434/api/chat"
        system_prompt = f"""Jesteś Voltuś, zaawansowany asystent analityczny (AI Copilot) wspierający pracowników TAURONA.
        Twoim zadaniem jest pomóc konsultantowi w szybkiej analizie danych rynkowych i produkcyjnych, aby mógł lepiej doradzać klientom.
        Jesteś w pełni profesjonalny, precyzyjny i opierasz się na twardych danych.
        
        Zasady analizy, którymi się kierujesz:
        1. Szybkie Podsumowanie (Executive Summary): Wyłap z danych ekstrema – podaj konsultantowi na tacy, o której godzinie energia jest drastycznie droga, a kiedy drastycznie tania (lub ujemna).
        2. Wskazówki DSR (Demand Side Response): Podpowiedz pracownikowi, co ma powiedzieć klientowi, aby zrównoważyć sieć (np. "Zaproponuj klientowi przesunięcie energochłonnych procesów na godzinę 13:00").
        3. Świadomość OZE: Zwracaj uwagę na nadpodaż z wiatru i słońca, która powoduje spadki cen.
        
        Został już wygenerowany wykres z poniższymi danymi rynkowymi (RCE), który konsultant widzi na swoim ekranie.
        Przeanalizuj powyższe dane, odwołaj się do wygenerowanego wykresu i odpowiedz na pytanie konsultanta. Nie cytuj całej tabeli.
        Dane: {csv_context} {production_context}"""

        # (Tutaj logika requests.post jak w poprzednim kroku, ale stream=False dla uproszczenia wyniku API)
        response = requests.post(url, json={
            "model": model,
            "messages": [{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
            "stream": False
        })

        ai_analysis = response.json()["message"]["content"]

        final_output = {
            "ai_summary": ai_analysis,
            "chart_data": json_payload,
            "production_data": production_payload,
            "status": "success"
        }

        return final_output

    except Exception as e:
        return {"status": "error", "message": str(e)}


if __name__ == "__main__":
    result = run_voltus_api("Zrób analizę na najbliższe 24h.")
    # Wyświetlamy sformatowany JSON
    print(json.dumps(result, indent=4, ensure_ascii=False))

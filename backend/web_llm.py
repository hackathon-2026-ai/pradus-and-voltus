import requests
import pandas as pd
import json
import os
from config import DATA_PATH, DATA_PATH_2


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
        Dane: {csv_context} {production_context}

        ODPOWIADAJ
        TYLKO
        W
        FORMACIE
        JSON
        według
        poniższego
        schematu:
        {{
            "podsumowanie_dla_pracownika": "Krótki alert, co dzieje się na rynku w ciągu najbliższych 24h",
            "rekomendacja_dsr": "Co konkretnie konsultant ma powiedzieć/zaproponować klientowi",
            "uzasadnienie_analityczne": "Wyjaśnienie, jak produkcja OZE wpłynęła na cenę RCE w kluczowej godzinie"
        }}
        """

        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "stream": False,
            "format": "json" # <-- Wymuszamy JSON z Ollamy!
        }

        response = requests.post(url, json=payload)

        # Zabezpieczenie HTTP
        if response.status_code != 200:
            return {"status": "error", "message": f"Błąd serwera Ollama ({response.status_code}): {response.text}"}

        # Wyciąganie odpowiedzi i zmuszanie Pythona do jej odczytania jako JSON
        ai_response_text = response.json()["message"]["content"]

        try:
            ai_data = json.loads(ai_response_text)
        except json.JSONDecodeError:
            return {"status": "error", "message": "Model nie zwrócił poprawnego formatu JSON."}

        # --- LEGAL FROM DAY ONE DLA PRACOWNIKA ---
        internal_compliance = "Wytyczna Legal: Rekomendacje oparte na przewidywaniach RCE są zmienne. Kategorycznie zabrania się pracownikom gwarantowania klientom stałych stóp zwrotu lub stałych rachunków na podstawie tego wykresu."
        data_lineage = "Dane pobrano ze źródeł: PSE (Rynkowa Cena Energii) oraz estymacji Generacji OZE. Zanonimizowano dane klienta (Brak PII)."

        # Budowanie finalnego wielkiego obiektu JSON
        final_output = {
            "status": "success",
            "ui_components": {
                "ai_copilot_panel": {
                    "executive_summary": ai_data.get("podsumowanie_dla_pracownika", "Brak danych"),
                    "dsr_action": ai_data.get("rekomendacja_dsr", "Brak danych")
                },
                "explainable_ai": ai_data.get("uzasadnienie_analityczne", "Analiza heurystyczna")
            },
            "datasets": {
                "rce_chart_data": json_payload,
                "production_chart_data": production_payload
            },
            "compliance_and_legal": {
                "internal_guideline": internal_compliance,
                "data_lineage": data_lineage
            }
        }

        return final_output

    except Exception as e:
        return {"status": "error", "message": str(e)}



if __name__ == "__main__":
    result = run_voltus_api("Zrób analizę na najbliższe 24h.")
    # Wyświetlamy sformatowany JSON
    print(json.dumps(result, indent=4, ensure_ascii=False))

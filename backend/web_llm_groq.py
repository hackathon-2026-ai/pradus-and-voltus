import os
import requests
import pandas as pd
import json
from dotenv import load_dotenv
from config import DATA_PATH, DATA_PATH_2,DATA_PATH_3,DATA_PATH_4

# Ładujemy zmienne z pliku .env (żeby zaciągnąć klucz API)
load_dotenv()


def get_data_json(file_path: str = DATA_PATH):
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

def get_customer_behaviour(file_path: str = DATA_PATH_3):
    try:
        df = pd.read_csv(file_path)
        df_subset = df.head(96).copy()

        json_data = df_subset.to_dict(orient='records')
        return json_data, df_subset.to_csv(index=False)
    except Exception as e:
        return None, f"Brak danych: {e}"

def get_mock_oze(file_path: str = DATA_PATH_4):
    try:
        df = pd.read_csv(file_path)
        df_subset = df.head(96).copy()

        json_data = df_subset.to_dict(orient='records')
        return json_data, df_subset.to_csv(index=False)
    except Exception as e:
        return None, f"Brak danych: {e}"


def run_voltus_groq_api(user_prompt: str, model: str = "llama-3.3-70b-versatile"):
    # Zabezpieczenie: sprawdzamy, czy klucz API w ogóle istnieje
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return {"status": "error", "message": "Brak klucza GROQ_API_KEY. Upewnij się, że masz plik .env!"}

    json_payload, csv_context = get_data_json()
    production_payload, production_context = get_production()
    customer_payload,customer_context = get_customer_behaviour()
    mock_oze_payload,mock_oze_context = get_mock_oze()

    if json_payload is None or production_payload is None or customer_payload is None or mock_oze_payload is None:
        return {"status": "error", "message": "Nie można wczytać plików z danymi."}

    try:
        # Endpoint Groq API
        url = "https://api.groq.com/openai/v1/chat/completions"

        system_prompt = f"""Jesteś Voltuś, zaawansowany asystent analityczny (AI Copilot) wspierający pracowników TAURONA.
        Twoim zadaniem jest pomóc konsultantowi w szybkiej analizie danych rynkowych i produkcyjnych, aby mógł lepiej doradzać klientom.
        Jesteś w pełni profesjonalny, precyzyjny i opierasz się na twardych danych.

        Zasady analizy, którymi się kierujesz:
        1. Szybkie Podsumowanie (Executive Summary): Wyłap z danych ekstrema – podaj konsultantowi na tacy, o której godzinie energia jest drastycznie droga, a kiedy drastycznie tania (lub ujemna).
        2. Wskazówki DSR (Demand Side Response): Podpowiedz pracownikowi, co ma powiedzieć klientowi, aby zrównoważyć sieć (np. "Zaproponuj klientowi przesunięcie energochłonnych procesów na godzinę 13:00").
        3. Świadomość OZE: Zwracaj uwagę na nadpodaż z wiatru i słońca, która powoduje spadki cen.

        Dane: {csv_context} {production_context} {customer_context} {mock_oze_context}
        
        Jeśli zostaniesz poproszony o wygenerowanie raportu, to wygeneruj według uznania podstawowy raport.
        SCHEMAT RAPORTU:
        {{
            "Autor":"Voltuś",
            "Timestamp":"Tutaj podajesz obecną godzinę minuty itd..."
            
            "Treść":"W tym miejscu ma być raport na podstawie zapytania użytkownika. Ma on zawierać jak przeprowadzałeś analizę tematu, wyniki, wnioski, ewentulanie jakieś tabelki/ wykresy"
        }}
        Jeśli poproszony zostaniesz o wygenerowanie samego wykresu, wyślij dane do wykresu jako JSON.
        

        ODPOWIADAJ TYLKO W FORMACIE JSON według poniższego schematu:
        {{
            "podsumowanie_dla_pracownika": "Krótki alert, co dzieje się na rynku w ciągu najbliższych 24h",
            "rekomendacja_dsr": "Co konkretnie konsultant ma powiedzieć/zaproponować klientowi",
            "uzasadnienie_analityczne": "Wyjaśnienie, jak produkcja OZE wpłynęła na cenę RCE w kluczowej godzinie"
        }}
        """

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "response_format": {"type": "json_object"},  # Groq wie, że musi zwrócić poprawnego JSON-a
            "temperature": 0.5
        }

        response = requests.post(url, headers=headers, json=payload)

        # Zabezpieczenie HTTP
        if response.status_code != 200:
            return {"status": "error", "message": f"Błąd serwera Groq ({response.status_code}): {response.text}"}

        # Wyciąganie odpowiedzi (struktura zapożyczona z OpenAI/Groq, nie z Ollamy)
        ai_response_text = response.json()["choices"][0]["message"]["content"]

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

    except requests.exceptions.ConnectionError:
        return {"status": "error", "message": "Błąd połączenia. Sprawdź dostęp do internetu."}
    except Exception as e:
        return {"status": "error", "message": str(e)}


if __name__ == "__main__":
    result = run_voltus_groq_api("Zrób analizę na najbliższe 24h. Na co mam uważać przy kliencie PV?")
    print(json.dumps(result, indent=4, ensure_ascii=False))
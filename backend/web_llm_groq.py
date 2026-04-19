import os
import requests
import pandas as pd
import json
from dotenv import load_dotenv
from config import DATA_PATH, DATA_PATH_2, DATA_PATH_3, DATA_PATH_4

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
    customer_payload, customer_context = get_customer_behaviour()
    mock_oze_payload, mock_oze_context = get_mock_oze()

    if json_payload is None or production_payload is None or customer_payload is None or mock_oze_payload is None:
        return {"status": "error", "message": "Nie można wczytać plików z danymi."}

    try:
        # Endpoint Groq API
        url = "https://api.groq.com/openai/v1/chat/completions"

        # ZAKTUALIZOWANY PROMPT - INTELIGENTNY ROUTER
        system_prompt = f"""Jesteś Voltuś, zaawansowany asystent analityczny (AI Copilot) wspierający pracowników TAURONA.
        Twoim zadaniem jest pomóc konsultantowi w szybkiej analizie danych rynkowych i produkcyjnych, aby mógł lepiej doradzać klientom.
        Jesteś w pełni profesjonalny, precyzyjny i opierasz się na twardych danych. (Jeśli użytkownik prosi o gwarę śląską, dostosuj ton tekstu!).

        Dane dla Ciebie: 
        RCE: {csv_context}
        Produkcja: {production_context}
        Klienci: {customer_context}
        Mock OZE: {mock_oze_context}

        KROK 1: ZROZUM INTENCJĘ UŻYTKOWNIKA. 
        Zdecyduj, czy użytkownik prosi o:
        - "zwykle_zapytanie" (chce tylko porady, analizy, odpowiedzi na pytanie, pogawędki)
        - "raport" (wyraźnie prosi o wygenerowanie raportu lub podsumowania dokumentu)
        - "wykres" (pyta stricte o dane do wykresu, trendy liczbowe)

        KROK 2: WYGENERUJ JSON.
        ODPOWIADAJ TYLKO W FORMACIE JSON. Zawsze wypełniaj pola podsumowania i uzasadnienia. 
        Jeśli intencja to "raport", wypełnij obiekt "raport". Jeśli nie, zostaw "raport" jako null.

        SCHEMAT JSON, którego MUSISZ użyć:
        {{
            "typ_zapytania": "Wstaw tu jedno z: zwykle_zapytanie, raport, wykres",
            "podsumowanie_dla_pracownika": "Odpowiedź na zapytanie użytkownika / Krótki alert",
            "rekomendacja_dsr": "Co konkretnie konsultant ma powiedzieć/zaproponować klientowi",
            "uzasadnienie_analityczne": "Wyjaśnienie zjawiska na podstawie twardych danych",
            "raport": {{
                "Autor": "Voltuś Copilot",
                "Timestamp": "Obecna data i czas",
                "Tresc": "Szczegółowy raport analityczny z wnioskami na podstawie danych. Użyj formatowania Markdown."
            }}
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
            "response_format": {"type": "json_object"},
            "temperature": 0.5
        }

        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()

        ai_response_text = response.json()["choices"][0]["message"]["content"]

        try:
            ai_data = json.loads(ai_response_text)
        except json.JSONDecodeError:
            return {"status": "error", "message": "Model nie zwrócił poprawnego formatu JSON."}

        internal_compliance = "Wytyczna Legal: Rekomendacje oparte na przewidywaniach RCE są zmienne. Kategorycznie zabrania się pracownikom gwarantowania klientom stałych stóp zwrotu."
        data_lineage = "Dane pobrano ze źródeł: PSE oraz estymacji Generacji OZE."

        # --- ZAKTUALIZOWANE WYJŚCIE DLA FRONTENDU ---
        final_output = {
            "status": "success",
            "akcja_dla_frontendu": ai_data.get("typ_zapytania", "zwykle_zapytanie"),  # INTENCJA (Dla JS/Reacta)
            "ui_components": {
                "ai_copilot_panel": {
                    "executive_summary": ai_data.get("podsumowanie_dla_pracownika", "Brak danych summary"),
                    "dsr_action": ai_data.get("rekomendacja_dsr", "Brak danych dsr")
                },
                "explainable_ai": ai_data.get("uzasadnienie_analityczne", "Brak uzasadnienia")
            },
            "generowany_raport": ai_data.get("raport", None),  # JEST RAPORT LUB GO NIE MA (NULL)
            "datasets": {
                "rce_chart_data": json_payload,
                "production_chart_data": production_payload,
                "customer_behavior_data": customer_payload,
                "mock_oze_data": mock_oze_payload
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
    '''
    print("TEST 1:")
    result_1 = run_voltus_groq_api("Porozmawiaj ze mną o produkcji prądu w Polsce po Śląsku")
    print(f"Wykryta intencja: {result_1.get('akcja_dla_frontendu')}")
    print(result_1["ui_components"]["ai_copilot_panel"]["executive_summary"])
'''
    print("\n" + "=" * 50 + "\n")

    # Test 2: Raport (Wymuszamy PDF-a)
    print("TEST 2:")
    result_2 = run_voltus_groq_api("Wygeneruj mi obszerny raport analityczny o stanie OZE na jutro.")
    print(f"Wykryta intencja: {result_2.get('akcja_dla_frontendu')}")
    if result_2.get("generowany_raport"):
        print("Raport został poprawnie wygenerowany w JSON!")
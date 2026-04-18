import requests
import pandas as pd
import json
import os
from config import DATA_PATH


def get_rce(file_path: str = DATA_PATH):
    try:
        if not os.path.exists(file_path):
            return f"Błąd: Nie znaleziono pliku pod ścieżką: {os.path.abspath(file_path)}"

        df = pd.read_excel(file_path)
        return df.head(96).to_csv(index=False)
    except Exception as e:
        return f"Brak danych: {e}"


def run_pradus_api(user_prompt: str, model: str = "gemma4:e2b"):
    demo_rce_csv = get_rce()

    if "Błąd" in demo_rce_csv or "Brak danych" in demo_rce_csv:
        return {"status": "error", "message": demo_rce_csv}

    try:
        url = "http://localhost:11434/api/chat"

        profil_klienta = """
            - Posiada: Taryfa Dynamiczna TAURON, auto elektryczne (EV).
            - Złe nawyki: Ładuje auto wieczorem (kiedy jest najdrożej).
            """

        # Zmiana: Wymagamy od LLM-a Explainability (Wyjaśnialności)
        system_prompt = f"""Jesteś Prąduś, proaktywny, inteligentny doradca energetyczny TAURONA. 
    Mówisz wesoło, używasz gwary śląskiej. 

    Profil klienta: {profil_klienta}
    Dane RCE (szukaj najniższych cen): {demo_rce_csv}

    Twoje cele:
    1. Doradź, kiedy jest najtańsze okno.
    2. Oszacuj oszczędność (przesunięcie 1h ładowania z drogiej na tanią to ok. 5 PLN oszczędności).
    3. EXPLAINABILITY (Wyjaśnialność): Krótko wyjaśnij, DLACZEGO cena o tej godzinie jest niska (np. z powodu wiatru/słońca z danych RCE).

    Odpowiedz TYLKO w formacie JSON:
    {{
        "wiadomosc_slaska": "Twoja wesoła porada dla klienta",
        "najlepsza_godzina": "np. 13:00",
        "estymowana_oszczednosc_za_1h_pln": 5,
        "wyjasnienie_ai": "Krótkie logiczne uzasadnienie na jakiej podstawie podjąłeś decyzję (np. O 13:00 cena RCE jest ujemna z powodu fotowoltaiki)"
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
            return {"status": "error", "message": f"Błąd serwera Ollama ({response.status_code})"}

        ai_response_text = response.json()["message"]["content"]

        try:
            ai_data = json.loads(ai_response_text)
        except json.JSONDecodeError:
            return {"status": "error", "message": "Ollama nie zwróciła poprawnego JSON-a."}

        # --- LEGAL FROM DAY ONE: TWARDA NAKŁADKA PRAWNA ---
        legal_disclaimer = "UWAGA: Powyższe wyliczenia to estymacja oparta na rynkowych cenach energii (RCE) analizowana przez algorytm AI. Nie stanowią one wiążącej oferty handlowej w rozumieniu Kodeksu Cywilnego. Rzeczywiste oszczędności zależą od Twojej ostatecznej taryfy i dokładnego zużycia."
        data_transparency = "Prywatność: Twoje dane zostały zanonimizowane (Brak PII). AI przeanalizowało tylko Twój profil zużycia (EV) i ogólnodostępne ceny giełdowe."

        # Finalny JSON z wbudowanym modułem prawnym
        return {
            "status": "success",
            "ui_components": {
                "pradus_alert": ai_data.get("wiadomosc_slaska", "Błąd"),
                "kalkulator_dane": {
                    "okno_czasowe": ai_data.get("najlepsza_godzina", "Brak danych"),
                    "stawka_oszczednosciowa_pln": ai_data.get("estymowana_oszczednosc_za_1h_pln", 0)
                }
            },
            "compliance_and_legal": {
                "explainability_xai": ai_data.get("wyjasnienie_ai", "Decyzja algorytmiczna"),
                "disclaimer": legal_disclaimer,
                "data_privacy_notice": data_transparency
            }
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}


# Testowe odpalenie (możesz usunąć po sprawdzeniu)
if __name__ == "__main__":
    user_prompt = "Witoj Prąduś, sprawdzisz mi kiedy ładwoać fure?"
    print("Łączę z Prądusiem...")
    result = run_pradus_api(user_prompt)
    print(json.dumps(result, indent=4, ensure_ascii=False))
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


def run_pradus_api(user_prompt: str, model: str = "gemma4:e2b"):  # Zmieniono nazwę modelu na poprawną
    demo_rce_csv = get_rce()

    # Zabezpieczenie przed brakiem danych w Excelu
    if "Błąd" in demo_rce_csv or "Brak danych" in demo_rce_csv:
        return {"status": "error", "message": demo_rce_csv}

    try:
        url = "http://localhost:11434/api/chat"

        system_prompt = f"""Jesteś Prąduś, inteligentny doradca energetyczny klientów TAURONA. 
        Odpowiadasz wesoło, używasz gwary śląskiej i pomagasz klientom.

        Twoim głównym celem jako AI jest analiza danych i przekształcanie ich w praktyczne wnioski. 
        Gdy klient pyta o zużycie lub ceny, zawsze kieruj się tymi zasadami:
        1. Analizuj zużycie energii: Na podstawie dostarczonych danych cenowych szukaj najtańszych godzin.
        2. Wzorce zużycia: Tłumacz klientowi, kiedy system energetyczny ma nadwyżki (np. z OZE, co widać po niskich cenach).
        3. Zachowania klientów: Doradzaj zmianę nawyków (np. "włącz pralkę w południe").
        4. Prognozowanie i optymalizacja: Przedstawiaj klientowi konkretne, zoptymalizowane "Zielone Okna" czasowe na używanie prądu.

        Oto aktualne dane o Rynkowej Cenie Energii (RCE), które masz przeanalizować, aby odpowiedzieć klientowi:
        {demo_rce_csv}

        Nie wymieniaj wszystkich danych z tabeli. Użyj ich tylko po to, by znaleźć najtańsze i najdroższe godziny, i przekaż to klientowi jako prostą poradę.
        """

        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "stream": False  # Czekamy na całość odpowiedzi
        }

        response = requests.post(url, json=payload)

        # Zabezpieczenie HTTP (wyłapie m.in. błąd 404, jeśli modelu nie ma)
        if response.status_code != 200:
            return {"status": "error", "message": f"Błąd serwera Ollama ({response.status_code}): {response.text}"}

        response_json = response.json()

        # Zabezpieczenie struktury JSON
        if "message" not in response_json:
            return {"status": "error", "message": f"Nieoczekiwana odpowiedź API: {response_json}"}

        # Wyciągamy sam tekst odpowiedzi od AI
        ai_response = response_json["message"]["content"]

        # Zwracamy piękny, ustrukturyzowany słownik (gotowy do bycia JSON-em)
        return {
            "status": "success",
            "pradus_message": ai_response
        }

    except requests.exceptions.ConnectionError:
        return {"status": "error", "message": "Nie można połączyć się z modelem. Czy Ollama jest uruchomiona?"}
    except Exception as e:
        return {"status": "error", "message": f"Wystąpił błąd w kodzie: {str(e)}"}

'''
if __name__ == "__main__":
    user_prompt = "Witoj Prąduś, powiedz mi kiedy najlepij jutro uprać ciuchy żeby było tanij?"

    print("Łączę z Prądusiem... (Przetwarzanie w tle)\n")

    # Wywołujemy funkcję
    result = run_pradus_api(user_prompt)

    # Drukujemy wynik jako poprawny format JSON (z polskimi znakami)
    print(json.dumps(result, indent=4, ensure_ascii=False))'''
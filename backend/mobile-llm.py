import requests
import pandas as pd
import json
import os
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Budujemy ścieżkę: wyjdź wyżej (..), wejdź do Demo-Dataset i wybierz plik
DATA_PATH = os.path.join(BASE_DIR, "..", "Demo-Dataset", "Rynkowa cena energii elektrycznej (RCE) 2026-04-13 - 2026-04-18.xlsx")

def get_rce(file_path: str = DATA_PATH):
    try:
        df = pd.read_excel(file_path)
        return df.head(96).to_csv(index=False)
    except Exception as e:
        return f"Brak danych: {e}"

def run_pradus(user_prompt: str, model: str = "gemma4:e2b"):
    demo_rce_csv = get_rce()

    try:
        url = "http://localhost:11434/api/chat"

        # TWORZYMY SUPER-PROMPT SYSTEMOWY
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
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": user_prompt
                }
            ],
            "stream": True
        }

        response = requests.post(url, json=payload,stream=True)
        response.raise_for_status()

        print("Prąduś godo: ", end="", flush=True)
        full_text = ""

        # ZMIANA 3: Czytamy odpowiedź kawałek po kawałku w locie
        for line in response.iter_lines():
            if line:
                chunk = json.loads(line)
                # Wyciągamy mały fragment tekstu z JSON-a
                text_piece = chunk["message"]["content"]
                full_text += text_piece

                # Wypisujemy na ekran od razu!
                # end="" zapobiega przechodzeniu do nowej linii
                # flush=True wymusza natychmiastowe wypisanie na ekran
                print(text_piece, end="", flush=True)

        print()  # Dodajemy pustą linijkę na sam koniec wiadomości
        return full_text  # Zwracamy całość na wypadek, gdybyś chciał to zapisać w bazie

    except requests.exceptions.HTTPError as err:
        return f"Błąd API (HTTP Error): {err}. Upewnij się, że pobrałeś model (ollama pull {model})"
    except Exception as e:
        return f"Wystąpił błąd: {e}"


if __name__ == "__main__":
    user_prompt = "Pomóż mi zrobić analizę RCE, dane powinieneś już mnieć"

    print("Łączę z Prądusiem \n")
    run_pradus(user_prompt)

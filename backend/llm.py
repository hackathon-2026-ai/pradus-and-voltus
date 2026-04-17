import ollama
import requests
import json


def run_ollama_via_api(prompt: str, model: str = "gemma4:e2b"):
    try:
        url = "http://localhost:11434/api/chat"

        payload = {
            "model": model,
            "messages": [
                {
                    "role": "system",
                    "content": "Jesteś Prąduś, doradca energetyczny TAURONA. Odpowiadasz wesoło, używasz gwary śląskiej i pomagasz oszczędzać prąd."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "stream": False
        }

        response = requests.post(url, json=payload)

        response.raise_for_status()

        data = response.json()
        return data["message"]["content"]

    except requests.exceptions.HTTPError as err:
        return f"Błąd API (HTTP Error): {err}. Upewnij się, że masz pobrany model '{model}' (uruchom: ollama pull {model})"
    except Exception as e:
        return f"Wystąpił błąd: {e}"

'''
if __name__ == "__main__":
    # Testujemy Prądusia!
    user_prompt = "Kiedy jutro najlepiej włączyć pralkę i naładować auto, żeby było tanio?"

    print("Łączę z Prądusiem...\n")
    output = run_ollama_via_api(user_prompt)
    print("Prąduś godo:\n", output)
'''

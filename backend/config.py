import os
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "..", "Demo-Dataset",
                         "Rynkowa cena energii elektrycznej (RCE) 2026-04-13 - 2026-04-18.xlsx")

DATA_PATH_2 = os.path.join(BASE_DIR, "..", "Demo-Dataset", "electricity_production_entsoe.csv")

DEFAULT_PROMPTS=[
    "Proszę o podsumowanie produkcji",
    "Jakiej produkcji możemy się spodziewać jutro?",
    "Proszę opowiedzieć mi o zachowaniach klientów"
]
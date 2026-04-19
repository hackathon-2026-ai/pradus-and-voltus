import os
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "..", "Demo-Dataset",
                         "Rynkowa cena energii elektrycznej (RCE) 2026-04-13 - 2026-04-18.xlsx")

DATA_PATH_2 = os.path.join(BASE_DIR, "..", "Demo-Dataset", "electricity_production_entsoe.csv")
DATA_PATH_3 = os.path.join(BASE_DIR,"..","Demo-Dataset","Mock_Data","mock_customer_behavior.csv")
DATA_PATH_4 = os.path.join(BASE_DIR,"..","Demo-Dataset","Mock_Data","mock_oze_rce_24h.csv")
DEFAULT_PROMPTS=[
    "Jak produkcja OZE wpływa na ceny RCE i co z tego wynika dla klienta?",
    "Który segment klientów najlepiej skorzysta na taryfie dynamicznej i dlaczego?",
    "Zrób raport po śląsku o rynku energii z ostatnich 24h."
]
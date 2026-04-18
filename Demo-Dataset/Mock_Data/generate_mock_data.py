import pandas as pd
import numpy as np
import os


def generate_realistic_mock_data():
    # Tworzymy 24 godziny (jedna doba)
    godziny = [f"{i:02d}:00" for i in range(24)]

    slonce_mw = []
    wiatr_mw = []
    cena_rce = []

    for i in range(24):
        # 1. SŁOŃCE (PV) - Świeci w dzień (kształt dzwonu od 6:00 do 18:00)
        if 6 <= i <= 18:
            # Szczyt o 12:00-13:00 (np. 3000 MW)
            pv = max(0, np.sin((i - 6) * np.pi / 12) * 3500 + np.random.normal(0, 150))
        else:
            pv = 0
        slonce_mw.append(round(pv, 2))

        # 2. WIATR - Bardziej losowy, często wieje mocniej w nocy/nad ranem
        # Baza 1500 MW + wahania
        wind = max(0, 1500 + np.cos(i * np.pi / 12) * 800 + np.random.normal(0, 300))
        wiatr_mw.append(round(wind, 2))

        # 3. CENA RCE (Prawa rynku) - Im więcej OZE, tym taniej!
        total_oze = pv + wind
        # Bazowa cena 500 zł, odejmujemy proporcjonalnie do produkcji OZE
        cena = 600 - (total_oze * 0.12)

        # Symulacja "Doliny" (ceny ujemne w szczycie słońca, np. o 13:00)
        if total_oze > 4000:
            cena -= 150

        cena_rce.append(round(cena, 2))

    # Tworzymy DataFrame
    df = pd.DataFrame({
        "Time": godziny,
        "Sun_Production_MW": slonce_mw,
        "Wind_Production_MW": wiatr_mw,
        "Price_RCE_PLN": cena_rce
    })

    # Zapisujemy do pliku
    output_path = "mock_oze_rce_24h.csv"
    df.to_csv(output_path, index=False)
    print(f"✅ Zmockowane dane wygenerowane i zapisane jako {output_path}!")
    print(df.head(24))


if __name__ == "__main__":
    generate_realistic_mock_data()
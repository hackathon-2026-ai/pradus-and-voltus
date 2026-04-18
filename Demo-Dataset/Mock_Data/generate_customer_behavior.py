import pandas as pd
import numpy as np


def generate_customer_segments():
    godziny = [f"{i:02d}:00" for i in range(24)]

    # Inicjalizacja list na zużycie (wartości w kWh jako uśrednione dla grupy na godzinę)
    seg_tradycyjny = []
    seg_prosument = []
    seg_ev = []

    for i in range(24):
        # 1. TRADYCYJNA RODZINA (Brak OZE, brak EV)
        # Szczyt rano (7-8) przed pracą i duży szczyt wieczorem (18-22).
        if 6 <= i <= 8:
            zuzycie_t = 1.2
        elif 17 <= i <= 22:
            zuzycie_t = 2.5
        else:
            zuzycie_t = 0.4
        # Lekki szum dla realizmu
        seg_tradycyjny.append(max(0.1, round(zuzycie_t + np.random.normal(0, 0.1), 2)))

        # 2. PROSUMENT (Posiada Panele PV)
        # Pobór z sieci w nocy i wieczorem, ale w dzień (10-15) pobór spada blisko zera (autokonsumpcja),
        # a czasem wręcz oddaje prąd do sieci (wartości ujemne).
        if 10 <= i <= 15:
            zuzycie_p = -1.5  # Oddaje do sieci
        elif 18 <= i <= 23:
            zuzycie_p = 2.0  # Wraca z pracy, PV nie działa, pobiera z sieci
        else:
            zuzycie_p = 0.5
        seg_prosument.append(round(zuzycie_p + np.random.normal(0, 0.1), 2))

        # 3. WŁAŚCICIEL EV (Taryfa Nocna)
        # Przez cały dzień zużycie normalne, ale potężny pik w nocy (23:00 - 05:00), bo ładuje auto
        if 0 <= i <= 5 or i == 23:
            zuzycie_e = 5.0  # Szybkie ładowanie
        elif 18 <= i <= 22:
            zuzycie_e = 1.5
        else:
            zuzycie_e = 0.3
        seg_ev.append(max(0.1, round(zuzycie_e + np.random.normal(0, 0.2), 2)))

    # Tworzymy zestawienie w DataFrame
    df = pd.DataFrame({
        "Godzina": godziny,
        "Segment_Tradycyjny_kWh": seg_tradycyjny,
        "Segment_Prosument_PV_kWh": seg_prosument,
        "Segment_Posiadacz_EV_kWh": seg_ev
    })

    # Dodajemy wiersz podsumowujący (tzw. metadane dla AI) na samym końcu
    # AI będzie wiedziało jak ocenić dany segment
    df_meta = pd.DataFrame({
        "Godzina": ["METADANE_BIZNESOWE"],
        "Segment_Tradycyjny_kWh": ["Potencjał optymalizacji: Wysoki. Brak elastyczności."],
        "Segment_Prosument_PV_kWh": ["Gotowość na taryfę dynamiczną: Bardzo wysoka."],
        "Segment_Posiadacz_EV_kWh": ["Zagrożenie: Obciążają sieć w nocy. Szansa: DSR w ciągu dnia."]
    })

    df_final = pd.concat([df, df_meta], ignore_index=True)

    output_path = "mock_customer_behavior.csv"
    df_final.to_csv(output_path, index=False)
    print(f"✅ Dane behawioralne wygenerowane i zapisane jako {output_path}!")
    print(df.head())  # Wyświetlamy tylko dane liczbowe do podglądu


if __name__ == "__main__":
    generate_customer_segments()
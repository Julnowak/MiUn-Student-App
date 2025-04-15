import pandas as pd
import re


def excel_to_dict(file_path="../AGH_Progi_punktowe.xlsx"):
    # Wczytanie arkusza Excel o nazwie 201920
    df = pd.read_excel(file_path, sheet_name="201920", header=None)

    # Inicjalizacja słownika
    result_dict = {}

    # Aktualny wydział
    current_department = None

    # Iteracja po wierszach
    for i in range(len(df)):
        row = df.iloc[i]

        # Sprawdzenie czy wiersz jest pusty
        if pd.isna(row[0]):
            continue

        # Sprawdzenie czy to wiersz z nazwą wydziału
        if pd.isna(row[1]) and not re.match(r"^\s*Kierunek", row[0]):
            current_department = row[0]
            result_dict[current_department] = []

        # Sprawdzenie czy to wiersz z nazwą kierunku
        elif current_department is not None:
            course_name = row[0]

            # Inicjalizacja listy tur dla kierunku
            tours = []

            # Dodanie danych dla każdej tury
            for j in range(1, len(row)):
                if not pd.isna(row[j]):
                    # Tworzenie nazwy tury (I TURA, II TURA, III TURA itd.)
                    tour_name = f"{to_roman(j)} TURA"
                    tours.append({tour_name: row[j]})

            # Dodanie kierunku do słownika wydziału
            course_dict = {course_name: tours}
            result_dict[current_department].append(course_dict)

    return result_dict


def to_roman(num):
    """Konwersja liczby na rzymski zapis (dla nazw tur)"""
    roman_numerals = {1: "I", 2: "II", 3: "III", 4: "IV", 5: "V"}
    return roman_numerals.get(num, str(num))


# Przykład użycia
if __name__ == "__main__":
    result = excel_to_dict()

    # print(0)
    # # Wypisanie wyników (opcjonalne)
    # import json
    #
    # print(json.dumps(result, indent=4, ensure_ascii=False))

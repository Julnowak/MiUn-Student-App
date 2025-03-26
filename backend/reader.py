import pandas as pd

from mainApp.models import Building

plik_excel = r'C:\Users\Julia\Desktop\MiUn\budynki_oznaczenia_1_10_2024.xlsx'
df = pd.read_excel(plik_excel)

# Na przykład, aby odczytać dane z kolumny "nazwa_kolumny":
for index, row in df.iterrows():
    print(f'Wiersz {index}:')
    d = row.to_dict()
    print('---')
    Building.objects.create(address=d['ADRES'], symbol=d['DOTYCHCZASOWY'],
                            name=d['NAZWA UŻYTKOWA'], abbreviation=d['NOWY SYMBOL OBIEKTU'], function=['DOMINUJĄCA FUNKCJA OBIEKTU'],
                            longitude=d['LOKALIZACJA X'], latitude=d['LOKALIZACJA Y'])

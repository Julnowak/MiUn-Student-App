import os
import django
import pandas as pd

# Ustawienie Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from mainApp.models import Faculty, Field, Round, Building

# Plik Excel
file_path = os.path.join("..", "AGH_Progi_punktowe.xlsx")
sheet_name = "202324"
year_label = "2023/2024"

df = pd.read_excel(file_path, sheet_name=sheet_name, header=None)
round_names = df.iloc[0, 1:4].tolist()

# Pobranie budynku domyślnego
building = Building.objects.first()
if not building:
    print("Brak budynków w bazie danych. Przerwano.")
    exit()

# 📌 A1 to pierwszy wydział
first_faculty_name = str(df.iloc[0, 0]).strip()
current_faculty, created = Faculty.objects.get_or_create(
    name=first_faculty_name,
    defaults={"building": building}
)
if not created:
    current_faculty.building = building
    current_faculty.save()
print(f"[+] Wydział: {first_faculty_name} (budynek: {building})")

# Iteracja od drugiego wiersza
for index in range(1, len(df)):
    row = df.iloc[index]
    first_cell = row[0]
    rest_cells = row[1:4]

    # Nowy wydział
    if pd.notna(first_cell) and pd.isna(rest_cells).all():
        faculty_name = str(first_cell).strip()
        current_faculty, created = Faculty.objects.get_or_create(
            name=faculty_name,
            defaults={"building": building}
        )
        if not created:
            current_faculty.building = building
            current_faculty.save()
        print(f"[+] Wydział: {faculty_name} (budynek: {building})")
        continue

    # Kierunek
    if current_faculty and pd.notna(first_cell):
        field_name = str(first_cell).strip()
        field, created = Field.objects.get_or_create(
            name=field_name,
            faculty=current_faculty,
            defaults={"formula": "2*M+3*G1+G2"}
        )
        if created:
            print(f"  [-] Kierunek: {field_name} (wydział: {current_faculty.name})")

        # Tury
        for i, round_label in enumerate(round_names):
            score = row[i + 1]
            if pd.notna(score):
                round_exists = Round.objects.filter(
                    name=round_label,
                    field=field,
                    year=year_label
                ).exists()

                if not round_exists:
                    Round.objects.create(
                        name=round_label,
                        field=field,
                        min_threshold=int(score),
                        year=year_label
                    )
                    print(f"     • Tura: {round_label} – próg: {int(score)}")
                else:
                    print(f"     • [POMINIĘTO] Tura {round_label} dla kierunku {field_name} ({year_label}) już istnieje")

print("\nImport zakończony bez duplikatów.")

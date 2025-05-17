import os
import django
import pandas as pd
import re

# Django setup
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from mainApp.models import Faculty, Field, Round, Building

Round.objects.all().delete()
Field.objects.all().delete()
Faculty.objects.all().delete()

# Paths configuration
base_dir = os.path.dirname(os.path.abspath(__file__))
original_file_path = os.path.join(base_dir, "AGH_Progi_punktowe.xlsx")
scraped_files = [
    (os.path.join(base_dir, "mainApp", "scrape_data", "agh_progi_punktowe_2023_2024.xlsx"), "2023/2024"),
    (os.path.join(base_dir, "mainApp", "scrape_data", "agh_progi_punktowe_2024_2025.xlsx"), "2024/2025")
]

building = Building.objects.first()
if not building:
    print("Brak budynków w bazie danych. Przerwano.")
    exit()

# --- Helpers ---
def create_field_and_add_faculty(field_name, current_faculty, formula="2*M+3*G1+G2", study_type="stacjonarne"):
    existing_fields = Field.objects.filter(name=field_name, type=study_type)
    for existing_field in existing_fields:
        if current_faculty in existing_field.faculty.all():
            return existing_field
    field = Field.objects.create(
        name=field_name,
        formula=formula,
        type=study_type,
        description="",
        specialization=""
    )
    field.faculty.add(current_faculty)
    return field

def convert_cycle_to_tura(label):
    if "cykl" in label.lower():
        match = re.search(r"cykl\s*(\d+)", label.lower())
        if match:
            number = int(match.group(1))
            roman = {1: "I", 2: "II", 3: "III", 4: "IV", 5: "V"}.get(number, str(number))
            return f"{roman} TURA"
    return label

def extract_min_threshold(score):
    if isinstance(score, str) and '(' in score:
        return int(score.split(' ')[0])
    return int(score)

field_to_faculty_map = {}

try:
    xl = pd.ExcelFile(original_file_path)
    sheet_names = [s for s in xl.sheet_names if s.isdigit() and s < '202425']

    for sheet_name in sheet_names:
        df_original = pd.read_excel(original_file_path, sheet_name=sheet_name, header=None)
        round_names_original = df_original.iloc[0, 1:4].tolist()
        current_faculty = None

        for index, row in df_original.iterrows():
            first_cell = row[0]
            rest_cells = row[1:4]

            # Sprawdzamy czy to wydział (wyjątek jeśli nazwa zaczyna się od 'Wydział')
            if pd.notna(first_cell) and (pd.isna(rest_cells).all() or str(first_cell).strip().startswith('Wydział')):
                faculty_name = str(first_cell).strip()
                current_faculty, _ = Faculty.objects.get_or_create(
                    name=faculty_name, defaults={"building": building}
                )
                print(f"[INFO] Wykryto wydział: {faculty_name}")
                continue

            # Sprawdzamy czy to kierunek - pierwsza komórka i przynajmniej jedna z kolejnych są niepuste
            if current_faculty and pd.notna(first_cell) and rest_cells.notna().any():
                field_name = str(first_cell).strip()
                print(f"[INFO] Dodawanie kierunku '{field_name}' do wydziału '{current_faculty.name}'")
                field_to_faculty_map[field_name] = faculty_name
                field = create_field_and_add_faculty(field_name, current_faculty)

                for i, round_label in enumerate(round_names_original):
                    score = row[i + 1]
                    if pd.notna(score):
                        try:
                            min_threshold = int(score)
                            year = f"{sheet_name[:4]}/{int(sheet_name[4:]):04d}"
                            Round.objects.get_or_create(
                                name=round_label,
                                field=field,
                                year=year,
                                defaults={"min_threshold": min_threshold}
                            )
                        except ValueError:
                            print(f"[UWAGA] Niepoprawna wartość progu ({score}) dla kierunku '{field.name}', runda '{round_label}', rok {sheet_name}")
except FileNotFoundError:
    print(f"Plik {original_file_path} nie istnieje. Pominięto import oryginalnego pliku.")

# --- Scraped Excel processing ---
def get_faculty_for_field(field_name):
    faculty_name = field_to_faculty_map.get(field_name)
    if faculty_name:
        faculty, _ = Faculty.objects.get_or_create(name=faculty_name, defaults={"building": building})
        return faculty
    else:
        print(f"[UWAGA] Brak przypisanego wydziału dla kierunku: {field_name}")
        faculty, _ = Faculty.objects.get_or_create(name="Brak przypisanego wydziału", defaults={"building": building})
        return faculty

print("\nCzyszczenie danych dla roku 2023/2024...")
Round.objects.filter(year="2023/2024").delete()

for file_path, year_label in scraped_files:
    if not os.path.exists(file_path):
        print(f"Plik {file_path} nie istnieje. Pominięto.")
        continue

    try:
        xl_scraped = pd.ExcelFile(file_path)
    except Exception as e:
        print(f"Błąd podczas otwierania pliku {file_path}: {e}")
        continue

    if year_label == "2023/2024" or year_label == "2024/2025":
        for sheet_name in xl_scraped.sheet_names:
            print(f"[INFO] Przetwarzanie arkusza '{sheet_name}' dla roku {year_label}...")
            df = pd.read_excel(file_path, sheet_name=sheet_name)
            valid_rounds = [col for col in df.columns if "cykl" in col.lower()]

            for _, row in df.iterrows():
                field_name = row.get("Kierunek studiów", None)
                if pd.notna(field_name):
                    current_faculty = get_faculty_for_field(field_name.strip())
                    field = create_field_and_add_faculty(field_name.strip(), current_faculty, study_type='stacjonarne')

                    for round_label in valid_rounds:
                        score = row.get(round_label, None)
                        if pd.notna(score):
                            try:
                                min_threshold = extract_min_threshold(score)
                                corrected_round_label = convert_cycle_to_tura(round_label.strip())
                                Round.objects.get_or_create(
                                    name=corrected_round_label,
                                    field=field,
                                    year=year_label,
                                    defaults={"min_threshold": min_threshold}
                                )
                            except ValueError:
                                print(f"[UWAGA] Niepoprawna wartość progu ({score}) dla kierunku '{field.name}', runda '{round_label}', rok {year_label}")
    else:
        scraper_sheet_names = [
            ('studia_stacjonarne_I_st', 'stacjonarne', 'I'),
            ('studia_niestacjonarne_I_st', 'niestacjonarne', 'I'),
        ]

        for sheet_name, study_type, degree in scraper_sheet_names:
            if sheet_name not in xl_scraped.sheet_names:
                print(f"[UWAGA] Arkusz '{sheet_name}' nie istnieje w pliku {file_path}. Pominięto.")
                continue

            df = pd.read_excel(file_path, sheet_name=sheet_name)
            rounds = df.columns[2:].tolist()

            for _, row in df.iterrows():
                field_name = row.get("Kierunek studiów", None)
                if pd.notna(field_name):
                    current_faculty = get_faculty_for_field(field_name.strip())
                    field = create_field_and_add_faculty(
                        field_name.strip(), current_faculty, study_type=study_type
                    )

                    for round_label in rounds:
                        score = row.get(round_label, None)
                        if pd.notna(score):
                            try:
                                min_threshold = int(score)
                                Round.objects.get_or_create(
                                    name=round_label.strip(),
                                    field=field,
                                    year=year_label,
                                    defaults={"min_threshold": min_threshold}
                                )
                            except ValueError:
                                print(
                                    f"[UWAGA] Niepoprawna wartość progu ({score}) dla kierunku '{field.name}', runda '{round_label}', rok {year_label}")

        # Wyraźnie ignorujemy arkusze dotyczące II stopnia
        ignored_sheets = ['studia_stacjonarne_II_st', 'studia_niestacjonarne_II_st']
        for sheet in ignored_sheets:
            if sheet in xl_scraped.sheet_names:
                print(f"[INFO] Ignoruję arkusz '{sheet}' (studia II stopnia).")

print("\nImport wszystkich danych zakończony.")

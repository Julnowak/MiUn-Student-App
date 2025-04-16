import ast
import operator

# from excel_to_dict import excel_to_dict


def calc_G(value: int) -> int:
    if value >= 80:
        return value + 100
    elif value >= 60:
        return value * 2 + abs(value-60)
    elif value >= 30:
        return value * 2 - abs(value-60)
    else:
        return value


def calc_score_fun(scores: dict) -> float:
    """
    Budowa scores:
        - "M" - wynik z matury z matmy podstawowej
        - "G1" - wynik z pierwszego rozszerzonego przedmiotu
        - "G2" - wynik z drugiego rozszerzonego przedmiotu
        - "formula" - wzór, taki sam dla każdego kierunku w postaci "2*M+3*G1+G2"
    """
    formula = scores["formula"]

    if "G1" in scores.keys() and "G2" in scores.keys():
        scores["G1"], scores["G2"] = calc_G(scores["G1"]), calc_G(scores["G2"])

    for score_name, score_value in scores.items():
        formula = formula.replace(score_name, str(score_value))

    # Utworzenie bezpiecznego środowiska do ewaluacji
    def safe_eval(expr):
        # Pozwolone operatory
        operators = {
            ast.Add: operator.add,
            ast.Sub: operator.sub,
            ast.Mult: operator.mul,
            ast.Div: operator.truediv,
            ast.Pow: operator.pow,
            ast.USub: operator.neg,  # Unary minus
        }

        def eval_node(node):
            # Liczby
            if isinstance(node, ast.Constant):
                return node.value
            # Operatory binarne (np. +, -, *, /)
            elif isinstance(node, ast.BinOp):
                left = eval_node(node.left)
                right = eval_node(node.right)
                for op_type, op_func in operators.items():
                    if isinstance(node.op, op_type):
                        return op_func(left, right)
                else:
                    raise TypeError(f"Nieobsługiwany operator: {type(node.op)}")
            # Unary operators (np. -)
            elif isinstance(node, ast.UnaryOp):
                operand = eval_node(node.operand)
                for op_type, op_func in operators.items():
                    if isinstance(node.op, op_type):
                        return op_func(operand)
                else:
                    raise TypeError(f"Nieobsługiwany operator unarny: {type(node.op)}")
            else:
                raise TypeError(f"Nieobsługiwany typ węzła: {node}")

        return eval_node(ast.parse(expr, mode="eval").body)

        # Oblicz wynik
    try:
        result = safe_eval(formula)
        print(f"Oblicozna ilość punktów to: {result}")
        return result
    except Exception as e:
        raise ValueError(f"Błąd obliczania formuły '{formula}': {str(e)}")
#
#
# def calc_score_for_course(scores: dict) -> int:
#     course = search_course_data(data_dict)
#     if "formula" not in course.keys():
#         course["formula"] = "G1*5+G2*5"  # tylko do testów
#     formula = course["formula"]
#     for score_name, score_value in scores.items():
#         formula = formula.replace(score_name, str(score_value))
#
#     # Utworzenie bezpiecznego środowiska do ewaluacji
#     def safe_eval(expr):
#         # Pozwolone operatory
#         operators = {
#             ast.Add: operator.add,
#             ast.Sub: operator.sub,
#             ast.Mult: operator.mul,
#             ast.Div: operator.truediv,
#             ast.Pow: operator.pow,
#             ast.USub: operator.neg,  # Unary minus
#         }
#
#         def eval_node(node):
#             # Liczby
#             if isinstance(node, ast.Constant):
#                 return node.value
#             # Operatory binarne (np. +, -, *, /)
#             elif isinstance(node, ast.BinOp):
#                 left = eval_node(node.left)
#                 right = eval_node(node.right)
#                 for op_type, op_func in operators.items():
#                     if isinstance(node.op, op_type):
#                         return op_func(left, right)
#                 else:
#                     raise TypeError(f"Nieobsługiwany operator: {type(node.op)}")
#             # Unary operators (np. -)
#             elif isinstance(node, ast.UnaryOp):
#                 operand = eval_node(node.operand)
#                 for op_type, op_func in operators.items():
#                     if isinstance(node.op, op_type):
#                         return op_func(operand)
#                 else:
#                     raise TypeError(f"Nieobsługiwany operator unarny: {type(node.op)}")
#             else:
#                 raise TypeError(f"Nieobsługiwany typ węzła: {node}")
#
#         return eval_node(ast.parse(expr, mode="eval").body)
#
#     # Oblicz wynik
#     try:
#         result = safe_eval(formula)
#         print(f"Oblicozna ilość punktów to: {result}")
#         return result
#     except Exception as e:
#         raise ValueError(f"Błąd obliczania formuły '{formula}': {str(e)}")
#
#
# def search_course_data(data_dict, course_name="Automatyka i Robotyka") -> dict:
#     """
#     Wyszukuje dane o turach dla wskazanego kierunku w słowniku danych.
#     Obsługuje sytuację, gdy kierunek występuje na wielu wydziałach.
#
#     Args:
#         data_dict (dict): Słownik z danymi wydziałów i kierunków
#         course_name (str): Nazwa kierunku do wyszukania
#
#     Returns:
#         None: Funkcja wypisuje znalezione dane
#     """
#     # Lista znalezionych kierunków (wydział, nazwa kierunku, dane o turach)
#     found_courses = []
#
#     # Przeszukanie słownika
#     for department, courses in data_dict.items():
#         for course in courses:
#             for key in course:
#                 # Sprawdzenie czy to szukany kierunek (bez uwzględnienia wielkości liter)
#                 if key.lower() == course_name.lower():
#                     found_courses.append((department, course))
#
#     # Sprawdzenie czy znaleziono kierunki
#     if not found_courses:
#         print(f"Nie znaleziono kierunku o nazwie '{course_name}'.")
#         return {}
#
#     # Jeśli znaleziono tylko jeden kierunek
#     if len(found_courses) == 1:
#         department, course = found_courses[0]
#         return course
#
#     # Jeśli znaleziono wiele kierunków o tej samej nazwie
#     else:
#         print(
#             f"Znaleziono kierunek '{course_name}' na {len(found_courses)} wydziałach:"
#         )
#
#         # Wyświetl listę wydziałów
#         for i, (department, _) in enumerate(found_courses, 1):
#             print(f"{i}. {department}")
#
#         # Poproś użytkownika o wybór wydziału
#         while True:
#             try:
#                 choice = int(
#                     input(
#                         "\nWybierz numer wydziału (1-" + str(len(found_courses)) + "): "
#                     )
#                 )
#                 if 1 <= choice <= len(found_courses):
#                     break
#                 else:
#                     print(f"Proszę podać liczbę od 1 do {len(found_courses)}.")
#             except ValueError:
#                 print("Proszę podać liczbę.")
#
#             # Zwróć dane dla wybranego wydziału
#         department, course = found_courses[choice - 1]
#
#         return course
#
#
# # Przykład użycia
# if __name__ == "__main__":
#     # data_dict = excel_to_dict()
#     # calc_score_for_course(scores={"G1": 100, "G2": 100})
#
#     calc_score(scores={
#         "M": 100,
#         "G1": 94,
#         "G2": 94,
#         "formula": "2*M+3*G1+G2"
#     })

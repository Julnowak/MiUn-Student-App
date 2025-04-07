from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import pandas as pd
import os
import time

def save_to_excel(dfs, sheet_names, filename):
    if not os.path.exists('scrape_data'):
        os.makedirs('scrape_data')
    with pd.ExcelWriter(f'scrape_data/{filename}', engine='xlsxwriter') as writer:
        for df, sheet_name in zip(dfs, sheet_names):
            df.to_excel(writer, sheet_name=sheet_name, index=False)

def scrape_agh_progi(url, filename):
    driver = webdriver.Chrome()
    driver.get(url)

    WebDriverWait(driver, 10).until(
        EC.presence_of_all_elements_located((By.CLASS_NAME, 'tablepress'))
    )
    time.sleep(2)

    html = driver.page_source
    soup = BeautifulSoup(html, 'html.parser')

    driver.quit()

    tables = soup.find_all('table', class_='tablepress')
    dfs = []
    sheet_names = [
        'studia_stacjonarne_I_st',
        'studia_stacjonarne_II_st',
        'studia_niestacjonarne_I_st',
        'studia_niestacjonarne_II_st'
    ]

    for table in tables:
        headers = [header.text.strip() for header in table.find_all('th')]

        rows = []
        for row in table.find('tbody').find_all('tr'):
            cols = [col.text.strip() for col in row.find_all('td')]
            rows.append(cols)

        df = pd.DataFrame(rows, columns=headers)
        dfs.append(df)

    save_to_excel(dfs, sheet_names, filename)

if __name__ == '__main__':
    scrape_agh_progi('https://rekrutacja.agh.edu.pl/progi-punktowe-l-2023-2024/#progi-punktowe', 'agh_progi_punktowe_2023_2024.xlsx')
    scrape_agh_progi('https://rekrutacja.agh.edu.pl/progi-punktowe-l-2024-2025/#progi-punktowe', 'agh_progi_punktowe_2024_2025.xlsx')

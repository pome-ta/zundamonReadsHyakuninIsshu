import requests
from bs4 import BeautifulSoup


load_url = 'http://www.manabu-oshieru.com/hyakunin/hiragana.html'
html = requests.get(load_url)
soup = BeautifulSoup(html.content, 'html.parser')

print(soup)

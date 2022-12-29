from pathlib import Path

import arrow
import requests
from bs4 import BeautifulSoup


def _get_nowtime() -> str:
    utc = arrow.utcnow().to('JST')
    now_str = utc.format('YYMMDD_HHmm')
    return now_str


def get_htmldata(url: str) -> str:
    html = requests.get(url)
    soup = BeautifulSoup(html.content, 'html.parser')
    return str(soup)


def save_htmldata(htmldata: str,  save_to_path: Path) -> None:
    save_name = _get_nowtime()
    save_file = Path(save_to_path, f'{save_name}.html')
    save_file.write_text(htmldata, encoding='utf-8')


if __name__ == '__main__':
    load_url = 'http://www.manabu-oshieru.com/hyakunin/hiragana.html'
    save_path = './pyWS/outlog'

    html_str = get_htmldata(load_url)
    save_htmldata(html_str, Path(save_path))

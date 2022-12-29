import re
from pathlib import Path
from pprint import pprint

from bs4 import BeautifulSoup
import numpy as np


target_dir = './pyWS/outlog'
target_file = '221226_1933.html'
path = Path(target_dir, target_file)

html_str = path.read_text()
soup = BeautifulSoup(html_str, 'html.parser')

# tb_center = soup.find_all('td', align='center')
a_tags = soup.find_all('a')

pattern = '[0-9]{3}.html'
repatter = re.compile(pattern)


rough_list = []

for a in a_tags:
    link = a.get('href')
    if (repatter.match(str(link))):
        rough_list.append(a)

rough_array = np.array(rough_list)
re_rough = rough_array.reshape(100, 4)
hirafuda_array = re_rough[:, 1]

hira_fuda = [str(fuda).replace('\u3000', ' ') for fuda in hirafuda_array]

Path(target_dir, 'outlist.txt').write_text(
    '\n'.join(hira_fuda), encoding='utf-8')

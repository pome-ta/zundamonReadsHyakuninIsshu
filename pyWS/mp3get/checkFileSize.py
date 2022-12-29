from pathlib import Path
import os


mp3s = Path('./pyWS/mp3get/mp3s')
iter_mp3s = mp3s.iterdir()
mp3_list = sorted(list(iter_mp3s))


for mp3 in mp3_list:
    # print(mp3.name)
    print(os.path.getsize(mp3), mp3.name)

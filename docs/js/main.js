import { MDParser } from './modules/mdParser.js';
import { create_buttons, create_table } from './setUpDOMs.js';
import { hiraFuda } from './yomifuda.js';

const parser = new MDParser();


async function getMP3(uri) {
  const res = await fetch(uri);
  const blob = await res.blob()
  return blob
}


const dataURI = './media/mp3/001.mp3'
let mp3data = getMP3(dataURI)
console.log(mp3data)



/**
 * DOM
 */

const topLineText = `
# ずんだもん 百人一首 なのだ

ずんだんもが百人一首をよむのだ。発音やイントネーションが違うかもしれないのだ。ゆるしてほしいのだ。

諸事情でスマホサイズに最適化しているのだ。
`;

const topLineDiv = document.createElement('div');
topLineDiv.innerHTML = parser.BuildHtml(topLineText);
document.body.appendChild(topLineDiv);

topLineDiv.childNodes.forEach((node, index) => {
  const tagName = node.localName;
  if (tagName === 'h1') {
    node.style.margin = '1rem 0';
  }
  if (tagName === 'p') {
    node.style.fontSize = '0.8rem';
  }
  if (topLineDiv.childNodes.length - 1 === index) {
    node.style.fontSize = '0.64rem';
  }
});

const playDiv = document.createElement('div');
playDiv.style.width = '10rem';
playDiv.style.height = '8rem';
// playDiv.textContent = '再生';
playDiv.style.background = 'red';
playDiv.style.margin = '1rem auto';
document.body.appendChild(playDiv);



const audioMP3 = new Audio('../media/mp3/001.mp3');

playDiv.addEventListener('touchend', (event) => {
//playDiv.addEventListener('click', (event) => {
  event.preventDefault();
  console.log('きた');
  
  audioMP3.play();
});

/** 百人一首選択エリア */
const inputText = document.createElement('input');
inputText.setAttribute('type', 'search');
inputText.setAttribute('placeholder', '1, 2, 12, 43');
inputText.style.width = '100%';
inputText.style.background = '#86C16680';

const buttonWrap = document.createElement('div');
buttonWrap.style.margin = '1rem 0';
buttonWrap.style.display = 'flex';
buttonWrap.style.justifyContent = 'space-between';

const btnTexts = ['入力された順番に読むのだ', 'ランダムな順番で読むのだ'];

const [sortOrderBtn, randomOrderBtn] = create_buttons('45%', ...btnTexts);

document.body.appendChild(inputText);

buttonWrap.appendChild(sortOrderBtn);
buttonWrap.appendChild(randomOrderBtn);
document.body.appendChild(buttonWrap);

/** 使い方エリア */

const howtoUseDiv = document.createElement('div');
const howtoUseText = `
## 使い方なのだ

- よんでほしい歌番号を数字で入れるのだ
- たくさんあるなら「,」 で区切るのだ
- 全部よむなら何も入力しなくていいのだ
    - 読み込みに時間かかるのですこし待つのだ
- 変だと思ったらリロードしてほしいのだ
- 下の検索バーから歌をさがせるのだ
`;
howtoUseDiv.innerHTML = parser.BuildHtml(howtoUseText);
document.body.appendChild(howtoUseDiv);

/** 札テーブル */
const fudaTable = create_table(...hiraFuda);
document.body.appendChild(fudaTable);

/**　メモ書き */
const memoText = `
### 📝 todo なのだ

エラーや改善イメージなど、とりあえず宣言するところなのだ

#### エラーや不備

- 読み込みに失敗すると、音声再生不能
- 同じ番号を入力した場合、読み込み不可
- チェックボックスとinput area がバラバラ
- 音声データの読み込みが遅い
    - なるべく無駄な読み込みはしたくない


#### 改善やtodo

- 音声データを取得して一つのバッファーとして音声出力をしている
    - 個別に取得して再生
    - PC とスマホで再生できる、もっとスマートな再生方法
- 歌チェックと、input area との連動
    - 同番号の複数入力の処理をどうするか
        - input area
        - 音声出力
- フッターエリアがスクロールバーでガタつく
- どこまでjs でコネコネするか

`;
const memoDiv = document.createElement('div');
memoDiv.innerHTML = parser.BuildHtml(memoText);
document.body.appendChild(memoDiv);

memoDiv.childNodes.forEach((node) => {
  const tagName = node.localName;
  if (tagName === 'p' || tagName === 'ul') {
    node.style.fontSize = '0.8rem';
  }
});

const marginBuffer = document.createElement('div');
marginBuffer.style.width = '100%';
marginBuffer.style.height = '8rem';

document.body.appendChild(marginBuffer);

/** フッターと検索エリア */
const footerTag = document.createElement('footer');
footerTag.style.position = 'fixed';
footerTag.style.bottom = 0;
footerTag.style.left = 0;
footerTag.style.right = 0;
footerTag.style.fontSize = '0.64rem';
footerTag.style.background = '#f8f8f8';
footerTag.style.display = 'flex';
footerTag.style.flexDirection = 'column';
footerTag.style.justifyContent = 'center';
footerTag.style.height = '6rem';

const searchArea = document.createElement('input');
searchArea.classList.add('Light-table-filter');
searchArea.setAttribute('type', 'search');
searchArea.setAttribute('data-table', 'order-table');
searchArea.setAttribute('placeholder', '検索');
searchArea.style.background = '#86C16680';
searchArea.style.maxWidth = '360px';
searchArea.style.width = '100%';
searchArea.style.height = '2rem';
searchArea.style.margin = '0 auto';

function inputTrigger(event) {
  const target = event.target;
  const searchStr = target.value.toLowerCase();
  const searchFilter = (row) => {
    const text = row.textContent.toLowerCase();
    row.style.display = ~text.indexOf(searchStr) ? 'table-row' : 'none';
  };
  const tables = document.getElementsByClassName(
    target.getAttribute('data-table')
  );

  Array.from(tables).forEach((table) =>
    Array.from(table.tBodies).forEach((tbody) =>
      Array.from(tbody.rows).forEach((row) => searchFilter(row))
    )
  );
}
searchArea.addEventListener('input', inputTrigger);

const credit = document.createElement('p');
credit.textContent = 'VOICEVOX:ずんだもん';
credit.style.margin = '0.8rem auto 0';
credit.style.maxWidth = '360px';

const aTag = document.createElement('a');
aTag.style.margin = '0 0 0 1rem';
aTag.href = 'https://voicevox.hiroshiba.jp/';
aTag.textContent = 'https://voicevox.hiroshiba.jp/';

credit.appendChild(aTag);

footerTag.appendChild(searchArea);
footerTag.appendChild(credit);

document.body.appendChild(footerTag);

let selectArray = new Array();

/**
 * audio
 */

const audioctx = new AudioContext();

let isPlay = false;
sortOrderBtn.addEventListener('click', async () => {
  if (audioctx.state === 'suspended') {
    audioctx.resume();
  }
  if (!isPlay) {
    isPlay = true;
    const value = inputText.value;
    const _value_list = value.split(',').filter((n) => Number(n));
    const value_list = _value_list.length
      ? _value_list
      : [...Array(100)].map((_, i) => i + 1);
    const rootPath = './media/mp3/';
    const url_list = value_list.map(
      (n) => `${rootPath}${n.toString().padStart(3, '0')}.mp3`
    );
    await callZundaMon(url_list);
  }
});

const shuffle = ([...array]) => {
  for (let i = array.length - 1; i >= 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

randomOrderBtn.addEventListener('click', async () => {
  if (audioctx.state === 'suspended') {
    audioctx.resume();
  }
  if (!isPlay) {
    isPlay = true;
    const value = inputText.value;
    const _value_list = value.split(',').filter((n) => Number(n));
    const value_list = _value_list.length
      ? _value_list
      : [...Array(100)].map((_, i) => i + 1);
    const rootPath = './media/mp3/';
    const _url_list = value_list.map(
      (n) => `${rootPath}${n.toString().padStart(3, '0')}.mp3`
    );
    const url_list = shuffle(_url_list);
    await callZundaMon(url_list);
  }
});

async function callZundaMon(urls) {
  const buffers = new Array(urls.length);
  const sources = new Array(urls.length);
  async function loadSample(actx, uri) {
    const res = await fetch(uri);
    const arraybuf = await res.arrayBuffer();
    return actx.decodeAudioData(arraybuf);
  }
  const load = async (url, index) => {
    buffers[index] = await loadSample(audioctx, url);
  };
  for (const [index, url] of urls.entries()) {
    await load(url, index);
  }
  if (!buffers.length) {
    isPlay = false;
  }
  const t0 = audioctx.currentTime;
  const interval = 8.5;
  buffers.forEach((buffer, index) => {
    const source = (sources[index] = audioctx.createBufferSource());
    source.buffer = buffer;
    source.connect(audioctx.destination);
    const intervalIndex = interval * index;
    const durationPlaybackRate = source.buffer.duration / 1;
    const startTime = [t0 + intervalIndex, 0, durationPlaybackRate];
    const stopTime = t0 + intervalIndex + durationPlaybackRate;
    source.start(...startTime);
    source.stop(stopTime);
    source.addEventListener('ended', () => {
      if (index === urls.length - 1) {
        isPlay = false;
      }
    });
  });
}

/**
 * DOM func
 */

export const create_buttons = (width, ...textContents) => {
  const btns = textContents.map((text) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.style.width = width;
    btn.style.height = '4rem';
    btn.style.fontSize = '0.72rem';
    btn.textContent = text;
    return btn;
  });
  return btns;
};

/** テーブル作成 */
export const create_table = (...utas) => {
  const tbl = document.createElement('table');
  tbl.classList.add('order-table');
  tbl.style.width = '100%';
  tbl.style.margin = '1rem 0';

  const tb = document.createElement('tbody');
  tbl.appendChild(tb);

  utas.forEach((uta, index) => {
    const tr = document.createElement('tr');
    tr.style.height = '2rem';
    tr.style.fontSize = '0.64rem';

    const content = `${index + 1}`;

    const numText = document.createElement('span');
    numText.style.verticalAlign = 'top';
    numText.textContent = content;

    const labelNum = document.createElement('label');
    labelNum.appendChild(numText);

    const tdNum = document.createElement('td');
    tdNum.style.width = '1.2rem';
    tdNum.style.textAlign = 'right';
    tdNum.appendChild(labelNum);

    const checkBox = document.createElement('input');
    checkBox.setAttribute('type', 'checkbox');
    checkBox.setAttribute('name', 'num');
    checkBox.setAttribute('value', content);
    checkBox.style.width = '0.5rem';
    checkBox.style.height = '0.5rem';
    checkBox.style.margin = '0.5rem 0.25rem';
    checkBox.addEventListener('change', getCheckValue);

    const utaText = document.createElement('span');
    utaText.textContent = uta;

    const labelCheck = document.createElement('label');
    labelCheck.style.cursor = 'pointer';
    labelCheck.appendChild(checkBox);
    labelCheck.appendChild(utaText);

    const tdUtaCheck = document.createElement('td');
    tdUtaCheck.style.margin = '0 1rem';
    tdUtaCheck.appendChild(labelCheck);

    tr.appendChild(tdNum);
    tr.appendChild(tdUtaCheck);
    tb.appendChild(tr);
  });

  return tbl;
};

/**
 * select event
 */

function getCheckValue(event) {
  const box = event.target;
  if (box.checked) {
    const value = `${box.value}, `;
    inputText.value += value;
  }
}

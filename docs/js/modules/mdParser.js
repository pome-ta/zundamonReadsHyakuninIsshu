export class MDParser {
  constructor() {
    this.NewLine = '\n'; //改行コード
    this.ImageRoot = ''; //イメージパスのルート指定
    this.EnablePreview = true; //previewによるHTML直接記述

    const MDParserObject = this;
    const me = this;
    let input = '';
    let inputs;
    let pointer;

    this.BuildHtml = function (markdown) {
      input = markdown.trim();
      inputs = input.split(/\r?\n/);
      pointer = 0;

      const buf = new HtmlBuilder();

      while (true) {
        const str = NextLine();
        if (str == null) {
          break;
        }
        //区切り
        if (str.length == 0) {
          buf.popAll();
          continue;
        }
        //見出し
        if (parser_h.test(str)) {
          buf.popAll();
          buf.push(parser_h.tag(str), parser_h.text(str));
          buf.popAll();
          continue;
        }
        //水平線
        if (parser_hr.test(str)) {
          buf.popAll();
          buf.add('<hr />', true, true);
          continue;
        }
        //リスト
        if (parser_olul.test(str)) {
          const isblock = buf.currentTag() == 'li';
          const indent = parser_olul.indent(str);
          const oldindent = isblock ? parser_olul.indent(PeekPrevLine()) : -1;
          if (indent - oldindent > 1) {
            //noproc
          } else {
            if (!isblock) buf.popAll();

            const tag = parser_olul.tag(str);
            const txt = parser_olul.text(str);
            if (oldindent < indent) {
              buf.push(tag);
              buf.push('li', txt);
            } else if (oldindent > indent) {
              buf.pop();
              for (let i = 0; i < oldindent - indent; i++) {
                buf.pop();
                buf.pop();
              }
              buf.push('li', txt);
            } else {
              buf.pop();
              buf.push('li', txt);
            }
            continue;
          }
        }
        //テーブル
        if (parser_table.test(str, PeekNextLine())) {
          //先に--部解析
          const aligns = [];
          parser_table.texts(NextLine()).forEach(function (x) {
            aligns.push(parser_table.align(x));
          });
          //ヘッダ部
          buf.popAll();
          buf.push('table');
          buf.push('thead');
          buf.push('tr');
          parser_table.texts(str).forEach(function (x, i) {
            const style = "style='text-align:" + aligns[i] + ";'";
            buf.push('th', x, style);
            buf.pop();
          });
          buf.pop();
          buf.pop();
          //レコード部
          buf.push('tbody');
          while (true) {
            str = PeekNextLine();
            if (str == null || !parser_table.test(str)) break;
            buf.push('tr');
            parser_table.texts(NextLine()).forEach(function (x, i) {
              if (i > aligns.length) return;
              const style = "style='text-align:" + aligns[i] + ";'";
              buf.push('td', x, style);
              buf.pop();
            });
            buf.pop();
          }
          continue;
        }
        //pre
        if (parser_pre.test(str)) {
          if (buf.currentTag() != 'pre') {
            buf.popAll();
            buf.push('pre', '');
          } else {
            buf.add(me.NewLine);
          }
          buf.add(parser_pre.text(str), false, true);
          continue;
        }
        //引用
        if (parser_blockquote.test(str)) {
          buf.popAll();
          //終了まで進める
          const indent = 0;
          while (true) {
            const newindent = parser_blockquote.indent(str);
            if (newindent > indent) {
              for (const i = indent; i < newindent; i++)
                buf.push('blockquote', '');
            } else if (newindent < indent) {
              for (const i = newindent; i < indent; i++)
                buf.pop('blockquote', '');
            } else {
              buf.add('<br />', true, true);
            }
            indent = newindent;
            buf.add(parser_blockquote.text(str), false, true);

            str = NextLine();
            if (str == null || !parser_blockquote.test(str)) {
              buf.popAll();
              if (str != null) {
                Back();
              }
              break;
            }
          }
          continue;
        }
        //コード
        if (parser_code.test(str)) {
          const ctype = parser_code.type(str);
          if (ctype == 'preview' && me.EnablePreview) {
            //HTML直接表示
            buf.popAll();
            //終了まで進める
            while (true) {
              str = NextLine();
              if (str == null || parser_code.test(str)) break;
              buf.add(str, true, true);
            }
          } else {
            buf.popAll();
            buf.push('pre', '');
            buf.push('code', '', ctype != '' ? "class='" + ctype + "'" : '');
            const i = 0;
            //終了まで進める
            while (true) {
              str = NextLine();
              if (str == null || parser_code.test(str)) break;
              if (i > 0) buf.add(me.NewLine);
              buf.add(str, false, true);
              i++;
            }
            buf.popAll();
          }
          continue;
        }
        //コメント
        if (parser_comment.test(str)) {
          //終了まで進める(HTMLには含めない)
          while (!parser_comment.testEnd(NextLine()));
          continue;
        }

        //一部タグの終了判定
        if (buf.currentTag() == 'li') buf.popAll();

        //通常文書
        if (buf.currentTag() == '' && str.trim() != '') {
          buf.push('p', str);
        } else {
          buf.add(str);
        }

        if (/  $/.test(str)) buf.add('<br />', true, true);
      }
      return buf.output();
    };

    function NextLine() {
      if (inputs.length <= pointer) return null;
      const s = inputs[pointer];
      pointer++;
      return s;
    }
    function PeekPrevLine() {
      const p = pointer - 2;
      if (p < 0) return null;
      return inputs[p];
    }
    function Back() {
      if (pointer > 0) pointer--;
    }
    function PeekNextLine() {
      if (inputs.length <= pointer) return null;
      return inputs[pointer];
    }

    //----------------------------------------
    //HTML構築オブジェクト
    class HtmlBuilder {
      constructor() {
        const me = this;
        this.p = 0;
        this.tag = [''];
        this.buf = [''];
        this.attr = [''];

        this.push = function (tag, str, attr) {
          if (me.tag.length <= me.p) {
            me.tag.push(null);
            me.buf.push(null);
            me.attr.push(null);
          }
          me.p++;
          me.tag[me.p] = tag;
          me.buf[me.p] = '';
          me.attr[me.p] = attr == undefined ? '' : attr;
          me.add(str);
        };
        this.add = function (str, noEscape, noReplace) {
          if (str === undefined || str === null || str == '') return;
          if (!noEscape) {
            escapes.forEach(function (x) {
              str = str.replace(x[0], x[1]);
            });
          }
          if (!noReplace) {
            replaces.forEach(function (x) {
              str = str.replace(x[0], x[1]);
            });
          }
          me.buf[me.p] += str;
        };
        this.pop = function () {
          if (me.p <= 0) return;
          const ret = me.html(me.tag[me.p], me.buf[me.p], me.attr[me.p]);
          me.tag[me.p] = null;
          me.buf[me.p] = null;
          me.attr[me.p] = null;
          me.p--;
          me.buf[me.p] += ret;
        };
        this.popAll = function () {
          while (me.p > 0) me.pop();
        };
        this.output = function () {
          me.popAll();
          return me.buf[0];
        };
        this.html = function (tag, text, attr) {
          let ret = '<' + tag + ` class="mdParser mdParser_${tag}"`;
          if (attr.length > 0) ret += ' ' + attr;
          ret += '>' + text + '</' + tag + '>';
          return ret;
        };
        this.currentTag = function () {
          if (me.p < 1) return '';
          return me.tag[me.p];
        };
        const escapes = [
          [/&/g, '&amp;'],
          [/\\\\/g, '&#92'],
          [/\\\(/g, '&#40'],
          [/\\\)/g, '&#41'],
          [/\\\*/g, '&#42'],
          [/\\\[/g, '&#91'],
          [/\\\]/g, '&#93'],
          [/\\_/g, '&#95'],
          [/\\`/g, '&#96'],
          [/\\~/g, '&#126'],
          [/>/g, '&gt;'],
          [/</g, '&lt;'],
        ];
        const replaces = [
          [/\*{2}(.+?)\*{2}/g, '<strong>$1</strong>'],
          [/ _{2}(.+?)_{2} /g, '<strong>$1</strong>'],
          [/\*(.+?)\*/g, '<em>$1</em>'],
          [/ _(.+?)_ /g, '<em>$1</em>'],
          [/`(.+?)`/g, '<code>$1</code>'],
          [/~~(.+?)~~/, '<del>$1</del>'],
          [
            /!\[(.*?)\]\((.+?)\)/g,
            "<img src='" + MDParserObject.ImageRoot + "$2' alt='$1' />",
          ],
          [/\[(.+?)\]\((.+?)\)/g, "<a href='$2' target='_blank'>$1</a>"],
        ];
      }
    }

    //----------------------------------------
    //パーサ群
    const parser_h = new (function () {
      const regex = /^#+ +/;

      this.test = function (str) {
        return regex.test(str);
      };
      this.tag = function (str) {
        const h = str.match(regex)[0];
        return 'h' + ('' + h).indexOf(' ');
      };
      this.text = function (str) {
        return str.replace(regex, '');
      };
    })();
    const parser_olul = new (function () {
      const regex = /^\s*([-*+]|[1-9]\.) +/;
      const regexUl = /^\s*[-*+] +/;
      const regexOl = /^\s*[1-9]\. +/;

      this.test = function (str) {
        return regex.test(str);
      };
      this.tag = function (str) {
        if (regexOl.test(str)) return 'ol';
        if (regexUl.test(str)) return 'ul';
        return 'ol';
      };
      this.text = function (str) {
        return str.replace(regex, '');
      };
      this.indent = function (str) {
        const indent = str.match(/^\s*/)[0].replace(/\t/, '    ');
        return Math.floor(indent.length / 4);
      };
    })();
    const parser_hr = new (function () {
      const regex = /^\s*((- *){3,}|(\* *){3,})\s*$/;
      this.test = function (str) {
        return regex.test(str);
      };
    })();
    const parser_table = new (function () {
      const me = this;
      const regex1 = /^\s*\|.*\|\s*$/;
      const regex2 = /^\s*(\|\s*:?-+:?\s*)+\|\s*$/;

      this.test = function (str1, str2) {
        if (str2 == undefined) {
          return regex1.test(str1);
        } else {
          if (!regex1.test(str1)) return false;
          if (!regex2.test(str2)) return false;
          return me.texts(str1).length == me.texts(str2).length;
        }
      };
      this.texts = function (str) {
        const spl = str.split('|');
        return spl.slice(1, spl.length - 1);
      };
      this.align = function (str) {
        const st = /:-+/.test(str);
        const ed = /-+:/.test(str);
        if (st && !ed) return 'left';
        if (!st && ed) return 'right';
        if (st && ed) return 'center';
        return 'initial';
      };
    })();
    const parser_pre = new (function () {
      const regex = /^( {4,}|\t)/;
      this.test = function (str) {
        return regex.test(str);
      };
      this.tag = function (str) {
        return 'pre';
      };
      this.text = function (str) {
        return str.replace(regex, '');
      };
    })();
    const parser_blockquote = new (function () {
      const regex = /^\s*(>+) */;
      this.test = function (str) {
        return regex.test(str);
      };
      this.indent = function (str) {
        return regex.exec(str)[1].length;
      };
      this.text = function (str) {
        return str.replace(regex, '');
      };
    })();
    const parser_code = new (function () {
      const regex = /^\s*`{3,}\s*/;
      this.test = function (str) {
        return regex.test(str);
      };
      this.type = function (str) {
        return str.replace(regex, '');
      };
    })();
    const parser_comment = new (function () {
      const regexS = /^\s*<!-{2,}\s*/;
      const regexE = /^\s*-{2,}>\s*/;
      this.test = function (str) {
        return regexS.test(str);
      };
      this.testEnd = function (str) {
        return regexE.test(str);
      };
    })();
  }
}

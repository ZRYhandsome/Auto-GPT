// 几个对话框：导入名单、打印、排序设置、"左右怎么算"。
import { esc, icon, openDialog, pickFiles, readDropped } from './dom.js';
import { parseRoster } from './parse.js';
import { importFile } from './importers.js';
import { rankOf } from './rank.js';

const ACCEPT = '.xlsx,.xlsm,.docx,.csv,.txt,.tsv,.xls,.doc,.et,.wps';

/** 读文件，读不了时把原因交给 onError。返回文字或 null。 */
export async function filesToText(files, onError) {
  const out = [];
  for (const f of files) {
    try {
      out.push((await importFile(f.name, f.bytes)).text);
    } catch (e) {
      onError(`${f.name}：${e.message}`);
    }
  }
  return out.length ? out.join('\n') : null;
}

/**
 * 导入名单：可以粘贴、拖文件进来、选文件；右边实时显示识别结果。
 * 返回 { text, mode:'replace'|'append' }，取消返回 null。
 */
export function importDialog({ existing = [], type = 'podium', text = '', files = [] } = {}) {
  const has = existing.length > 0;
  const body = `<div class="imp">
  <div class="imp-in">
    <div class="drop" id="imp-drop">
      ${icon('upload', 26)}
      <div><b>把 Excel、Word 名单文件拖到这里</b><br><span class="muted">或者 <button type="button" class="link" id="imp-pick">选择文件…</button>（.xlsx .docx .csv .txt）</span></div>
    </div>
    <label class="lbl" for="imp-text">也可以直接粘贴：从 Excel 选中"姓名、职务、单位"几列复制，或者从微信、Word 里复制，一行一个人</label>
    <textarea id="imp-text" spellcheck="false" autofocus placeholder="姓名&#9;职务&#9;单位&#10;王建华&#9;副市长&#9;市人民政府&#10;陈  平&#9;局长&#9;市教育局"></textarea>
    <p class="err" id="imp-err" hidden></p>
  </div>
  <div class="imp-out">
    <div class="imp-head"><b>识别结果</b><span id="imp-count" class="muted"></span></div>
    <div class="imp-preview" id="imp-preview"></div>
    <ul class="imp-warn" id="imp-warn"></ul>
    <p class="muted small">认错了列？在名单第一行加上表头，比如"姓名　职务　单位${type === 'podium' ? '' : '　主客'}"，就会按表头认。</p>
  </div>
</div>
${has ? `<div class="imp-mode" role="radiogroup" aria-label="怎么处理现有名单">
  <label><input type="radio" name="imp-mode" value="append" checked> 加在现有 ${existing.length} 人后面<span class="muted">（同名的跳过）</span></label>
  <label><input type="radio" name="imp-mode" value="replace"> 替换现有名单<span class="muted">（拿到了新的完整名单时用）</span></label>
</div>` : ''}`;
  let lastCount = 0;
  return openDialog({
    title: '导入名单',
    className: 'dlg-wide',
    body,
    buttons: [
      { label: '取消', value: null },
      {
        label: '导入', kind: 'primary', id: 'imp-ok',
        onClick: (close, dlg) => {
          if (!lastCount) return;
          const mode = dlg.querySelector('input[name="imp-mode"]:checked')?.value || 'replace';
          close({ text: dlg.querySelector('#imp-text').value, mode });
        },
      },
    ],
    onMount: (dlg) => {
      const ta = dlg.querySelector('#imp-text');
      const err = dlg.querySelector('#imp-err');
      const ok = dlg.querySelector('#imp-ok');
      const showErr = (msg) => { err.hidden = !msg; err.textContent = msg || ''; };
      const names = new Set(existing.map((p) => p.name));
      const update = () => {
        const mode = dlg.querySelector('input[name="imp-mode"]:checked')?.value || 'replace';
        const { people, warnings } = parseRoster(ta.value);
        const skip = (p) => mode === 'append' && names.has(p.name);
        const fresh = people.filter((p) => !skip(p));
        lastCount = fresh.length;
        const showSide = type !== 'podium' || people.some((p) => p.side === 'guest');
        dlg.querySelector('#imp-count').textContent = people.length ? `${people.length} 人${people.length > fresh.length ? `，其中 ${people.length - fresh.length} 人已在名单里` : ''}` : '';
        dlg.querySelector('#imp-preview').innerHTML = people.length
          ? `<table><thead><tr><th>姓名</th><th>职务</th><th>单位</th>${showSide ? '<th>主/客</th>' : ''}</tr></thead><tbody>${people.slice(0, 200).map((p) => `<tr class="${skip(p) ? 'skip' : ''}" title="${skip(p) ? '已在名单里，跳过' : `排序依据：${esc(rankOf(p.title).label)}`}"><td>${esc(p.name)}</td><td>${esc(p.title)}</td><td>${esc(p.unit)}</td>${showSide ? `<td>${p.side === 'guest' ? '<span class="tag guest">客</span>' : '<span class="tag">主</span>'}</td>` : ''}</tr>`).join('')}</tbody></table>`
          : '<div class="imp-empty">粘贴或拖入名单后，这里显示识别出的每个人</div>';
        dlg.querySelector('#imp-warn').innerHTML = warnings.map((w) => `<li>${esc(w)}</li>`).join('');
        ok.textContent = fresh.length ? `导入 ${fresh.length} 人` : '导入';
        ok.disabled = !fresh.length;
      };
      const loadFiles = async (list) => {
        if (!list.length) return;
        showErr('');
        const t = await filesToText(list, showErr);
        if (t !== null) { ta.value = t; update(); }
      };
      ta.value = text;
      ta.addEventListener('input', update);
      dlg.querySelectorAll('input[name="imp-mode"]').forEach((r) => r.addEventListener('change', update));
      dlg.querySelector('#imp-pick').addEventListener('click', async () => loadFiles(await pickFiles(ACCEPT)));
      const drop = dlg.querySelector('#imp-drop');
      dlg.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('over'); });
      dlg.addEventListener('dragleave', (e) => { if (!dlg.contains(e.relatedTarget)) drop.classList.remove('over'); });
      dlg.addEventListener('drop', async (e) => { e.preventDefault(); drop.classList.remove('over'); loadFiles(await readDropped(e.dataTransfer)); });
      update();
      loadFiles(files);
    },
  });
}

/**
 * 打印 / 存 PDF。返回 { what:'cards'|'chart', range:'all'|'changed', target:'print'|'pdf' }。
 * info: { total, changed, printedBefore, cardsDesc, chartDesc, desktop }
 */
export function printDialog(info, initial = 'cards') {
  const { total, changed, printedBefore, desktop } = info;
  const preferChanged = printedBefore && changed > 0 && changed < total;
  const body = `<div class="choice">
  <label class="opt"><input type="radio" name="what" value="cards"${initial === 'cards' ? ' checked' : ''}>
    <span><b>桌签</b><span class="muted">${esc(info.cardsDesc)}</span></span></label>
  <div class="opt-sub" id="pr-range"${printedBefore ? '' : ' hidden'}>
    <label><input type="radio" name="range" value="all"${preferChanged ? '' : ' checked'}> 全部 ${total} 人</label>
    <label${changed ? '' : ' class="disabled"'}><input type="radio" name="range" value="changed"${preferChanged ? ' checked' : ''}${changed ? '' : ' disabled'}> 只打新增和改过的${changed ? ` ${changed} 人` : '（都打过了，没有改动）'}</label>
  </div>
  <label class="opt"><input type="radio" name="what" value="chart"${initial === 'chart' ? ' checked' : ''}>
    <span><b>座次图</b><span class="muted">${esc(info.chartDesc)}</span></span></label>
</div>
<p class="tip">${icon('help', 16)}<span>打印机设置里纸张选 <b>A4</b>，缩放选<b>"实际大小"或"100%"</b>，不要选"适合页面"，否则桌签对折后会歪。${desktop ? '' : '要存成 PDF：在打印窗口的"目标打印机"里选"另存为 PDF"。'}</span></p>`;
  const pick = (target) => (close, dlg) => {
    const what = dlg.querySelector('input[name="what"]:checked').value;
    const range = dlg.querySelector('input[name="range"]:checked')?.value || 'all';
    close({ what, range, target });
  };
  const buttons = [{ label: '取消', value: null }];
  if (desktop) buttons.push({ label: '存为 PDF…', onClick: pick('pdf') });
  buttons.push({ label: '打印…', kind: 'primary', onClick: pick('print') });
  return openDialog({
    title: '打印',
    body,
    buttons,
    onMount: (dlg) => {
      const sync = () => {
        const cards = dlg.querySelector('input[name="what"]:checked').value === 'cards';
        dlg.querySelector('#pr-range').classList.toggle('off', !cards);
        dlg.querySelectorAll('#pr-range input').forEach((i) => { i.disabled = !cards || (i.value === 'changed' && !changed); });
      };
      dlg.querySelectorAll('input[name="what"]').forEach((r) => r.addEventListener('change', sync));
      sync();
    },
  });
}

/** 排序设置：书记是否在前、单位顺序。返回 { partyFirst, unitOrder } 或 null。 */
export function sortDialog({ partyFirst, unitOrder }) {
  const body = `<p class="dlg-msg">"按职务排序"的规则：</p>
<ol class="rules">
  <li>职务里写了级别（正厅、副处、正科……）的按级别排，排在最前；</li>
  <li>地方党政领导（书记、市长、区长、人大主任、政协主席……）排在部门领导前，副市长排在局长前；</li>
  <li>部门领导按层级：部、厅 → 局 → 处 → 科 → 股，同一层级正职在副职前；</li>
  <li>秘书长、助理、调研员、经理、总监等排在后面，没写职务的排最后；</li>
  <li>"党组书记、局长"这样的兼职，按其中最高的算。</li>
</ol>
<label class="check"><input type="checkbox" id="so-party"${partyFirst ? ' checked' : ''}> 同一单位里，书记排在行政正职前（党政机关惯例）</label>
<label class="lbl" for="so-units">同一档职务里，按单位顺序排（一行一个单位，可选）：</label>
<textarea id="so-units" class="short" spellcheck="false" placeholder="市委办公室&#10;市政府办公室&#10;市发展改革委&#10;市财政局">${esc(unitOrder)}</textarea>
<p class="muted small">自动排出来只是起点，以本单位惯例为准。拖动名单或在座次图上拖动座位，都可以手动调整。</p>`;
  return openDialog({
    title: '排序规则',
    body,
    buttons: [
      { label: '取消', value: null },
      {
        label: '按这个规则重新排序', kind: 'primary',
        onClick: (close, dlg) => {
          close({ partyFirst: dlg.querySelector('#so-party').checked, unitOrder: dlg.querySelector('#so-units').value });
        },
      },
    ],
  });
}

export function rulesDialog() {
  const body = `<div class="rules-help">
<h3>左右以谁为准？</h3>
<p>一律以<b>坐在座位上的人自己</b>的左右为准，不是以看图的人、拍照的人为准。</p>
<h3>主席台（以左为尊，党政机关惯例）</h3>
<p>1 号居中，2 号坐 1 号<b>左手</b>，3 号坐 1 号右手，依次左右交替。所以从台下看过去，左右正好反过来：</p>
<div class="demo"><span>7</span><span>5</span><span>3</span><span class="one">1</span><span>2</span><span>4</span><span>6</span><em>← 7 人，从台下看</em></div>
<div class="demo"><span>5</span><span>3</span><span class="one">1</span><span>2</span><span>4</span><span>6</span><em>← 6 人，从台下看（1、2 号同时居中）</em></div>
<p>商务、涉外活动一般<b>以右为尊</b>，左右对调即可，在"尊位"里切换。</p>
<h3>会见、会谈</h3>
<p>长桌两边对坐：客方坐<b>面对门</b>的一侧，主方背对门。门在侧面时，以进门方向看，客方坐右边。</p>
<h3>宴请圆桌</h3>
<p>主陪坐<b>面对门</b>的主位，主宾坐主陪右手，副主宾坐左手；副陪坐主陪对面，三宾、四宾坐副陪右手、左手。也可以选"主人居中"坐法。</p>
<p class="muted">各地各单位惯例不尽相同，排出来以后都可以手动调，以本单位要求为准。</p>
</div>`;
  return openDialog({ title: '左右怎么算', body, className: 'dlg-wide', buttons: [{ label: '知道了', value: true, kind: 'primary' }] });
}

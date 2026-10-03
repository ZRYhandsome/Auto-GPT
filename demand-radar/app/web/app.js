// 需求雷达界面：新建采集、任务（进度、日志、结果）、搜全部数据、平台与登录、设置。
// 不用框架；所有数据都来自本机服务 /api/*。
'use strict';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const main = $('#main');

let STATE = null; // /api/state
let JOBS = [];
let pollTimer = 0;

// ---------- 和本机服务通信 ----------
async function api(path, body) {
  const opts = body === undefined ? {} : { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Radar': '1' }, body: JSON.stringify(body) };
  const r = await fetch(path, opts);
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || `出错了（${r.status}）`);
  return data;
}

// 自己的确认框和输入框：独立窗口（pywebview）里不一定支持浏览器自带的 confirm/prompt
function ask(message, { input = null, ok = '确定', danger = false } = {}) {
  return new Promise((resolve) => {
    const dlg = document.createElement('dialog');
    dlg.className = 'modal';
    dlg.innerHTML = `<form method="dialog"><p>${esc(message)}</p>${input !== null ? `<input type="text" id="ask-in" value="${esc(input)}">` : ''}
      <div class="row end"><button value="no" type="submit">取消</button><button value="yes" type="submit" class="${danger ? 'primary danger-fill' : 'primary'}">${esc(ok)}</button></div></form>`;
    document.body.appendChild(dlg);
    dlg.addEventListener('close', () => {
      const v = dlg.returnValue === 'yes' ? (input !== null ? $('#ask-in', dlg).value.trim() : true) : (input !== null ? null : false);
      dlg.remove();
      resolve(v);
    });
    dlg.showModal();
    ($('#ask-in', dlg) || $('button[value=yes]', dlg)).focus();
  });
}

function toast(msg, bad = false) {
  const el = document.createElement('div');
  el.className = 'toast' + (bad ? ' bad' : '');
  el.textContent = msg;
  $('#toasts').appendChild(el);
  setTimeout(() => el.remove(), bad ? 7000 : 3500);
}

const STATUS = { queued: '排队中', running: '采集中', done: '完成', failed: '失败', stopped: '已停止', interrupted: '中断了' };
const STEP = { waiting: '等待', running: '采集中', done: '完成', failed: '失败', stopped: '已停止', skipped: '跳过', interrupted: '中断了' };
const pname = (id) => STATE?.platforms.find((p) => p.id === id)?.name || id;
const plat = (id) => STATE?.platforms.find((p) => p.id === id);

function jobTitle(j) {
  const s = j.spec || {};
  if (s.label) return s.label;
  if (s.mode === 'search') return (s.keywords || []).join('、') || '（没有关键词）';
  const t = s.targets || [];
  return `${s.mode === 'creator' ? '作者' : '深挖'}：${t.length} 个链接`;
}

// ---------- 路由 ----------
const routes = { new: viewNew, jobs: viewJobs, job: viewJob, search: viewSearch, platforms: viewPlatforms, settings: viewSettings };

function route() {
  clearInterval(pollTimer);
  const [, name = 'new', arg] = (location.hash || '#/new').split('/');
  const key = name === 'jobs' && arg ? 'job' : name;
  $$('.side a').forEach((a) => a.classList.toggle('on', a.dataset.nav === (key === 'job' ? 'jobs' : key)));
  (routes[key] || viewNew)(arg ? decodeURIComponent(arg) : undefined);
  main.scrollTop = 0;
}

async function refreshState() {
  STATE = await api('/api/state');
  $('#ver').textContent = `版本 ${STATE.version}`;
  $('#side-foot').innerHTML = `数据保存在<br><span title="${esc(STATE.home)}">${esc(STATE.home.replace(/^\/Users\/[^/]+/, '~'))}/runs</span>`
    + (window.pywebview ? '' : '<br><button class="link small" id="quit" style="margin-top:8px">关闭需求雷达</button>');
  const q = $('#quit');
  if (q) q.onclick = async () => {
    if (!(await ask('关闭需求雷达？正在采集的任务会停止（已抓到的数据会保留）。', { ok: '关闭' }))) return;
    await api('/api/quit', {}).catch(() => {});
    document.body.innerHTML = '<div class="empty" style="padding-top:120px">需求雷达已关闭，可以关掉这个页面了。</div>';
  };
}

async function refreshJobs() {
  JOBS = (await api('/api/jobs')).jobs;
  const running = JOBS.filter((j) => j.status === 'running' || j.status === 'queued').length;
  const b = $('#running-badge');
  b.hidden = !running;
  b.textContent = running;
  return JOBS;
}

// ---------- 新建采集 ----------
const DOMAINS = [
  [/xiaohongshu\.com|xhslink\.com|rednote/i, 'xhs'], [/douyin\.com|iesdouyin/i, 'dy'], [/bilibili\.com|b23\.tv/i, 'bili'],
  [/zhihu\.com/i, 'zhihu'], [/weibo\.(com|cn)/i, 'wb'], [/tieba\.baidu\.com/i, 'tieba'], [/kuaishou\.com|chenzhongtech|gifshow/i, 'ks'],
  [/apps\.apple\.com|itunes\.apple\.com/i, 'appstore'], [/reddit\.com|redd\.it/i, 'reddit'], [/news\.ycombinator\.com/i, 'hn'], [/github\.com/i, 'github'],
  [/youtube\.com|youtu\.be/i, 'youtube'], [/(^|[/.])(x|twitter)\.com\//i, 'x'],
];
function detectPlatform(text) {
  for (const [rx, id] of DOMAINS) if (rx.test(text)) return id;
  return /https?:\/\//.test(text) ? 'web' : null;
}

const draft = { mode: 'search', platforms: ['xhs'], keywords: '', targets: '', notes: null, comments: null, sub: false, label: '' };

function viewNew() {
  const s = STATE.settings;
  if (draft.notes === null) { draft.notes = s.default_notes; draft.comments = s.default_comments; }
  main.innerHTML = `<div class="page">
  <div class="page-head"><div><h1>新建采集</h1><div class="muted">选平台、填关键词或链接，点开始。采集在后台跑，可以同时去看别的任务。</div></div></div>
  <section class="card">
    <h2 class="step-title"><span class="n">1</span>抓什么</h2>
    <div class="seg" id="modes">${Object.entries(STATE.modes).map(([k, v]) => `<button data-mode="${k}" class="${draft.mode === k ? 'on' : ''}">${esc(v)}</button>`).join('')}</div>
    <p class="muted small" id="mode-help"></p>
  </section>
  <section class="card">
    <h2 class="step-title"><span class="n">2</span>去哪抓 <span class="muted small" id="plat-help"></span></h2>
    <div class="group-label">国内平台（用你自己的账号登录，第一次会弹出 Chrome 窗口扫码）</div>
    <div class="pgrid" id="pg-cn"></div>
    <div class="group-label">不用登录</div>
    <div class="pgrid" id="pg-api"></div>
    <div id="plat-notes"></div>
  </section>
  <section class="card">
    <h2 class="step-title"><span class="n">3</span><span id="input-title"></span></h2>
    <div id="input-area"></div>
  </section>
  <section class="card">
    <h2 class="step-title"><span class="n">4</span>抓多少</h2>
    <div class="nums">
      <label id="notes-l">每个关键词抓 <input type="number" id="notes" min="1" max="500" value="${draft.notes}"> 条帖子</label>
      <label>每条帖子抓 <input type="number" id="comments" min="0" max="5000" value="${draft.comments}"> 条评论</label>
      <label class="check"><input type="checkbox" id="sub" ${draft.sub ? 'checked' : ''}> 也抓楼中楼回复（更慢）</label>
    </div>
    <p class="muted small" id="estimate"></p>
    <div class="row" style="margin-top:12px">
      <input type="text" id="label" placeholder="给这次采集起个名字（可选）" value="${esc(draft.label)}" style="width:320px">
      <span style="flex:1"></span>
      <button class="primary big" id="start">开始采集</button>
    </div>
  </section></div>`;

  const renderPlatforms = () => {
    const single = draft.mode !== 'search';
    draft.platforms = draft.platforms.filter((id) => plat(id)?.modes.includes(draft.mode));
    if (single && draft.platforms.length > 1) draft.platforms = draft.platforms.slice(0, 1);
    const card = (p) => {
      const can = p.modes.includes(draft.mode);
      const on = draft.platforms.includes(p.id);
      let st = '';
      if (p.kind === 'browser') st = p.login === 'saved' ? '<span class="st ok">登录过</span>' : '<span class="st">第一次要扫码</span>';
      else if (p.configured === false) st = '<span class="st warn">要先在设置里填 Key</span>';
      else if (p.region === 'global') st = '<span class="st warn">要代理</span>';
      return `<button class="pcard ${on ? 'on' : ''}" data-p="${p.id}" ${can ? '' : 'disabled title="这个平台不支持这种抓法"'}>
        <span class="tick">${on ? '✓' : ''}</span><b>${esc(p.name)}</b><span class="hint">${esc(p.hint)}</span>${st}</button>`;
    };
    $('#pg-cn').innerHTML = STATE.platforms.filter((p) => p.kind === 'browser').map(card).join('');
    $('#pg-api').innerHTML = STATE.platforms.filter((p) => p.kind !== 'browser').map(card).join('');
    $('#plat-help').textContent = single ? '（一次选一个；贴链接后会自动选好）' : '（可以多选，按顺序一个个抓）';
    const sel = draft.platforms.map(plat);
    const notes = [];
    if (sel.some((p) => p.kind === 'browser') && !STATE.mc_ready) notes.push(['bad', '还没装好 MediaCrawler：国内平台抓不了。在终端运行一次 setup_mac.sh 就好。']);
    if (sel.some((p) => p.kind === 'browser' && p.login !== 'saved')) notes.push(['warn', '会弹出一个 Chrome 窗口，用手机上对应的 App 扫码登录（只要第一次）。遇到滑块验证就在那个窗口里拖一下。']);
    sel.filter((p) => p.configured === false).forEach((p) => notes.push(['bad', `${p.name} 要先在"设置 → 网络和接口"里填 Key，填好才能采集。`]));
    if (sel.some((p) => p.region === 'global')) notes.push(['', '国外网站（Reddit、YouTube、X……）在国内要开代理。软件会自动用系统代理，也可以在"设置"里填代理地址。']);
    $('#plat-notes').innerHTML = notes.map(([c, t]) => `<div class="note ${c}">${esc(t)}</div>`).join('');
    estimate();
  };

  const renderInput = () => {
    const box = $('#input-area');
    if (draft.mode === 'search') {
      $('#input-title').textContent = '关键词';
      box.innerHTML = `<div class="chips"><span class="muted small">关键词组：</span>${STATE.settings.keyword_sets.map((k, i) => `<button class="chip" data-set="${i}" title="${esc(k.keywords.join('、'))}">${esc(k.name)}</button>`).join('')}
        <button class="link small" id="save-set">把下面的存成关键词组</button></div>
        <textarea id="keywords" rows="6" placeholder="一行一个。越像用户求助、抱怨的原话越好，例如：&#10;有没有app可以 记账&#10;为什么没有人做&#10;r/SaaS alternative to（Reddit：只搜某个版块）">${esc(draft.keywords)}</textarea>`;
      $('#keywords').addEventListener('input', (e) => { draft.keywords = e.target.value; estimate(); });
      box.addEventListener('click', (e) => {
        const b = e.target.closest('[data-set]');
        if (b) {
          const set = STATE.settings.keyword_sets[+b.dataset.set];
          const cur = draft.keywords.trim();
          draft.keywords = (cur ? cur + '\n' : '') + set.keywords.join('\n');
          $('#keywords').value = draft.keywords;
          estimate();
        }
      });
      $('#save-set').addEventListener('click', async () => {
        const words = lines(draft.keywords);
        if (!words.length) return toast('先填几个关键词');
        const name = await ask('给这组关键词起个名字', { input: '我的关键词', ok: '保存' });
        if (!name) return;
        await api('/api/settings', { keyword_sets: [...STATE.settings.keyword_sets, { name, keywords: words }] });
        await refreshState();
        renderInput();
        toast('已存成关键词组');
      });
    } else {
      $('#input-title').textContent = draft.mode === 'creator' ? '作者主页链接' : '链接';
      box.innerHTML = `<textarea id="targets" rows="6" placeholder="一行一个，直接从浏览器地址栏或 App 的分享里复制。&#10;贴进来会自动认出是哪个平台。">${esc(draft.targets)}</textarea>
        <div id="detect" class="muted small"></div>`;
      $('#targets').addEventListener('input', (e) => {
        draft.targets = e.target.value;
        const id = detectPlatform(draft.targets);
        if (id && plat(id)?.modes.includes(draft.mode) && !draft.platforms.includes(id)) {
          draft.platforms = [id];
          renderPlatforms();
          $('#detect').textContent = `认出来是：${pname(id)}`;
        }
        estimate();
      });
    }
  };

  const helps = {
    search: '在每个平台搜这些关键词，抓搜到的帖子和帖子下的评论。',
    detail: '把指定帖子的评论抓全（搜索时每帖只抓前几十条）。也可以贴任意网页，抓正文。',
    creator: '抓某个作者发过的帖子和评论（只支持国内平台）。',
  };
  const renderMode = () => {
    $$('#modes button').forEach((b) => b.classList.toggle('on', b.dataset.mode === draft.mode));
    $('#mode-help').textContent = helps[draft.mode];
    $('#notes-l').hidden = draft.mode === 'detail';
    renderInput();
    renderPlatforms();
  };

  function estimate() {
    const n = +$('#notes').value || 0;
    const c = +$('#comments').value || 0;
    const sel = draft.platforms.map(plat).filter(Boolean);
    const units = draft.mode === 'search' ? lines(draft.keywords).length * n : lines(draft.targets).length;
    if (!sel.length || !units) { $('#estimate').textContent = ''; return; }
    const browser = sel.filter((p) => p.kind === 'browser').length;
    const secs = units * (browser * (6 + c / 10) + (sel.length - browser) * (2 + c / 50));
    $('#estimate').textContent = `大约 ${units * sel.length} 条帖子、最多 ${units * sel.length * c} 条评论，预计 ${secs < 90 ? '1–2 分钟' : `${Math.round(secs / 60)} 分钟左右`}。平台限流时会慢一些。`;
  }

  $('#modes').addEventListener('click', (e) => {
    const b = e.target.closest('[data-mode]');
    if (!b) return;
    draft.mode = b.dataset.mode;
    if (draft.mode !== 'search' && draft.comments < 100) { draft.comments = 300; $('#comments').value = 300; }
    renderMode();
  });
  main.querySelector('section:nth-of-type(2)').addEventListener('click', (e) => {
    const b = e.target.closest('.pcard');
    if (!b || b.disabled) return;
    const id = b.dataset.p;
    if (draft.mode !== 'search') draft.platforms = [id];
    else draft.platforms = draft.platforms.includes(id) ? draft.platforms.filter((x) => x !== id) : [...draft.platforms, id];
    renderPlatforms();
  });
  ['notes', 'comments'].forEach((k) => $('#' + k).addEventListener('input', (e) => { draft[k] = +e.target.value; estimate(); }));
  $('#sub').addEventListener('change', (e) => { draft.sub = e.target.checked; });
  $('#label').addEventListener('input', (e) => { draft.label = e.target.value; });
  $('#start').addEventListener('click', async () => {
    const noKey = draft.platforms.map(plat).filter((p) => p?.configured === false);
    if (noKey.length) return toast(`${noKey.map((p) => p.name).join('、')} 还没填 Key：先去"设置 → 网络和接口"里填`, true);
    const spec = {
      platforms: draft.platforms, mode: draft.mode, keywords: lines(draft.keywords), targets: lines(draft.targets),
      notes: +$('#notes').value, comments: +$('#comments').value, sub: draft.sub, label: draft.label.trim(),
    };
    try {
      $('#start').disabled = true;
      const job = await api('/api/jobs', spec);
      draft.label = '';
      location.hash = `#/jobs/${encodeURIComponent(job.id)}`;
    } catch (err) {
      toast(err.message, true);
      $('#start').disabled = false;
    }
  });
  renderMode();
}

const lines = (t) => String(t || '').split(/\r?\n/).map((s) => s.trim()).filter(Boolean);

// ---------- 任务列表 ----------
async function viewJobs() {
  main.innerHTML = `<div class="page"><div class="page-head"><div><h1>采集任务</h1><div class="muted">最新的在上面。点一行看进度、日志和结果。</div></div>
    <button class="primary" onclick="location.hash='#/new'">＋ 新建采集</button></div>
    <div class="card" style="padding:0"><ul class="jobs" id="jobs"></ul></div></div>`;
  const render = () => {
    const ul = $('#jobs');
    if (!ul) return;
    if (!JOBS.length) { ul.innerHTML = '<li class="empty">还没有采集任务。点右上角"新建采集"开始。</li>'; return; }
    ul.innerHTML = JOBS.map((j) => {
      const t = j.totals || {};
      const tot = j.status === 'running'
        ? (j.steps || []).map((s) => s.state === 'running' ? `${pname(s.platform)}：${s.posts} 帖 ${s.comments} 评` : '').filter(Boolean).join(' ')
        : (t.posts || t.comments ? `${t.posts || 0} 帖 · ${t.comments || 0} 评${t.signals != null ? ` · <b>${t.signals}</b> 条需求信号` : ''}` : '');
      return `<li class="job" data-id="${esc(j.id)}">
        <span><span class="status ${j.status}">${STATUS[j.status] || j.status}${j.queue_pos ? ` 第${j.queue_pos}` : ''}</span></span>
        <span style="min-width:0"><div class="t">${esc(jobTitle(j))}</div>
          <div class="meta">${esc(j.created || '')} · ${(j.spec?.platforms || []).map(pname).join('、')}${j.legacy ? ' · 终端跑的' : ''}</div></span>
        <span class="tot">${tot}</span></li>`;
    }).join('');
  };
  $('#jobs').addEventListener('click', (e) => {
    const li = e.target.closest('.job');
    if (li) location.hash = `#/jobs/${encodeURIComponent(li.dataset.id)}`;
  });
  await refreshJobs();
  render();
  pollTimer = setInterval(async () => { await refreshJobs(); render(); }, 2000);
}

// ---------- 任务详情 ----------
async function viewJob(id) {
  let job;
  try { job = await api(`/api/jobs/${encodeURIComponent(id)}`); } catch (e) { main.innerHTML = `<div class="page empty">${esc(e.message)}</div>`; return; }
  let tab = job.status === 'running' || job.status === 'queued' ? 'log' : 'signals';
  let logOffset = 0;
  main.innerHTML = `<div class="page">
    <div class="page-head"><div><div class="muted small"><a href="#/jobs">采集任务</a> ›</div><h1 id="jt"></h1><div class="muted" id="jmeta"></div></div>
      <div class="row" id="jactions"></div></div>
    <section class="card"><div class="steps" id="steps"></div><div id="jnote"></div></section>
    <section class="card"><div class="tabs" id="tabs"></div><div id="tabbody"></div></section></div>`;

  const renderHead = () => {
    $('#jt').textContent = jobTitle(job);
    const s = job.spec;
    $('#jmeta').innerHTML = `<span class="status ${job.status}">${STATUS[job.status] || job.status}</span> ${esc(job.created || '')} · ${esc(STATE.modes[s.mode] || s.mode)}${s.mode === 'search' ? ` · 每词 ${s.notes || '?'} 帖、每帖 ${s.comments || '?'} 评` : ''}`;
    const busy = job.status === 'running' || job.status === 'queued';
    $('#jactions').innerHTML = busy
      ? '<button class="danger" data-a="stop">停止</button>'
      : `<button data-a="copy" class="primary" ${job.totals?.posts || job.totals?.comments ? '' : 'disabled'}>复制给 Claude</button>
         <button data-a="xlsx">用 Excel 打开</button><button data-a="open">打开文件夹</button>
         <button data-a="rerun">再跑一次</button><button data-a="rescore" title="改了打分规则后，用已有数据重新打分">重新打分</button>
         <button data-a="delete" class="danger">删除</button>`;
    $('#steps').innerHTML = (job.steps || []).map((st) => {
      const msg = st.state === 'running' && st.hint ? `<span class="msg hint">${esc(st.hint)}</span>`
        : st.error ? `<span class="msg err" title="${esc(st.error)}">${esc(st.error.slice(0, 160))}</span>`
          : st.partial ? '<span class="msg muted">中途停了，已抓到的照样保存</span>' : '<span></span>';
      return `<div class="stp"><b>${esc(pname(st.platform))}</b><span class="status ${st.state === 'done' ? 'done' : st.state === 'failed' ? 'failed' : st.state === 'running' ? 'running' : 'stopped'}">${STEP[st.state] || st.state}</span>${msg}<span class="cnt">${st.posts || 0} 帖 · ${st.comments || 0} 评</span></div>`;
    }).join('');
    const t = job.totals || {};
    $('#jnote').innerHTML = !busy && (t.items != null)
      ? `<div class="note ok">共 ${t.items} 条帖子和评论，其中 <b>${t.signals}</b> 条命中需求信号。看下面"需求信号"，或者点"复制给 Claude"让它帮你归类、核实。</div>`
      : (!busy && !(t.posts || t.comments) ? '<div class="note warn">没有抓到数据。看看"日志"里的报错：常见原因是没扫码登录、被要求验证、网络或代理问题。</div>' : '');
  };

  const renderTabs = () => {
    const t = job.totals || {};
    const items = [['signals', '需求信号', t.signals], ['posts', '按帖子汇总', null], ['all', '全部数据', t.items], ['log', '日志', null]];
    $('#tabs').innerHTML = items.map(([k, label, c]) => `<button data-t="${k}" class="${tab === k ? 'on' : ''}">${label}${c != null ? `<span class="c">${c}</span>` : ''}</button>`).join('');
  };

  const renderBody = async () => {
    const body = $('#tabbody');
    if (tab === 'log') {
      body.innerHTML = '<pre class="log" id="log"></pre>';
      logOffset = 0;
      await pullLog(true);
      return;
    }
    body.innerHTML = '<div class="empty">读取中…</div>';
    const data = await api(`/api/jobs/${encodeURIComponent(id)}/results?view=${tab}`);
    if (!data.rows.length) {
      body.innerHTML = `<div class="empty">${job.status === 'running' ? '采集完、打完分以后这里显示结果。' : '没有数据。'}</div>`;
      return;
    }
    dataTable(body, data, { view: tab });
  };

  const pullLog = async (first) => {
    const pre = $('#log');
    if (!pre) return;
    const r = await api(`/api/jobs/${encodeURIComponent(id)}/log?offset=${logOffset}`);
    const atBottom = first || pre.scrollTop + pre.clientHeight >= pre.scrollHeight - 30;
    if (first) pre.textContent = r.text || '（还没有日志）';
    else if (r.text) pre.textContent += r.text;
    logOffset = r.offset;
    if (atBottom) pre.scrollTop = pre.scrollHeight;
  };

  $('#tabs').addEventListener('click', (e) => {
    const b = e.target.closest('[data-t]');
    if (!b) return;
    tab = b.dataset.t;
    renderTabs();
    renderBody();
  });
  $('#jactions').addEventListener('click', async (e) => {
    const a = e.target.closest('[data-a]')?.dataset.a;
    if (!a) return;
    const path = `/api/jobs/${encodeURIComponent(id)}`;
    try {
      if (a === 'stop') { await api(`${path}/stop`, {}); toast('正在停止，已经抓到的会保存并打分'); }
      if (a === 'open') await api(`${path}/open`, {});
      if (a === 'xlsx') {
        const r = await api(`${path}/open-file`, { name: '需求信号.xlsx' });
        if (!r.ok) location.href = `${path}/file?name=${encodeURIComponent(r.fallback || '需求信号.csv')}`;
      }
      if (a === 'rescore') { job = await api(`${path}/rescore`, {}); toast('已重新打分'); renderHead(); renderTabs(); renderBody(); }
      if (a === 'rerun') { const j = await api(`${path}/rerun`, {}); location.hash = `#/jobs/${encodeURIComponent(j.id)}`; }
      if (a === 'delete') {
        if (!(await ask('删除这次采集的全部数据？（会移到数据目录下的 .trash 文件夹，还能找回）', { ok: '删除', danger: true }))) return;
        await api(`${path}/delete`, {});
        location.hash = '#/jobs';
      }
      if (a === 'copy') {
        const r = await api(`${path}/copy-summary`, {});
        if (r.copied) toast(`已复制 summary.md（${r.chars} 字），去和 Claude 的对话框里粘贴`);
        else if (r.text) { await navigator.clipboard.writeText(r.text); toast('已复制 summary.md，去和 Claude 的对话框里粘贴'); }
        else toast(r.message || '没有可复制的内容', true);
      }
    } catch (err) { toast(err.message, true); }
  });

  renderHead();
  renderTabs();
  renderBody();
  pollTimer = setInterval(async () => {
    if (!$('#steps')) return clearInterval(pollTimer);
    const was = job.status;
    job = await api(`/api/jobs/${encodeURIComponent(id)}`);
    renderHead();
    if (tab === 'log') await pullLog(false);
    if ((was === 'running' || was === 'queued') && !['running', 'queued'].includes(job.status)) {
      refreshJobs();
      refreshState();
      if (job.totals?.items != null) tab = 'signals';
      renderTabs();
      renderBody();
      toast(job.status === 'done' ? '采集完成，已经打好分' : `任务${STATUS[job.status] || job.status}`);
    }
  }, 1200);
}

// ---------- 结果表格 ----------
const NUM_COLS = new Set(['得分', '点赞', '回复数', '信号总分', '命中评论', '已抓评论', '平台评论数', '求其他平台', '求其他平台点赞', '帖子点赞', '帖子收藏', '求模板', '口令评论']);
const TXT_COLS = new Set(['内容', '代表评论']);
const POST_COLS = new Set(['所属帖子', '帖子']);
const HIDE = { signals: ['帖子类型'], all: [], posts: [], search: ['帖子类型'] };

function dataTable(box, data, { view = 'signals', onJob } = {}) {
  const cols = data.columns;
  const idx = (n) => cols.indexOf(n);
  const st = { q: '', platform: '', kind: '', sig: '', minLikes: 0, sort: -1, asc: false, page: 0 };
  const per = 200;
  const show = cols.map((c, i) => i).filter((i) => !HIDE[view]?.includes(cols[i]));
  const platforms = [...new Set(data.rows.map((r) => r[idx('平台')]).filter(Boolean))];
  const kinds = idx('类型') >= 0 ? [...new Set(data.rows.map((r) => r[idx('类型')]).filter(Boolean))] : [];
  const sigs = idx('需求信号') >= 0 ? [...new Set(data.rows.flatMap((r) => String(r[idx('需求信号')] || '').split('、')).filter(Boolean))] : [];
  const likeCol = idx('点赞') >= 0 ? idx('点赞') : idx('帖子点赞');
  box.innerHTML = `<div class="filters">
      <input type="search" id="f-q" placeholder="在结果里找…">
      ${platforms.length > 1 ? `<select id="f-p"><option value="">全部平台</option>${platforms.map((p) => `<option>${esc(p)}</option>`).join('')}</select>` : ''}
      ${kinds.length > 1 ? `<select id="f-k"><option value="">帖子和评论</option>${kinds.map((p) => `<option>${esc(p)}</option>`).join('')}</select>` : ''}
      ${sigs.length ? `<select id="f-s"><option value="">全部信号</option>${sigs.map((p) => `<option>${esc(p)}</option>`).join('')}</select>` : ''}
      ${likeCol >= 0 ? '<label class="muted small">点赞 ≥ <input type="number" id="f-l" min="0" value="0" style="width:70px"></label>' : ''}
      <span class="muted small" id="f-count"></span></div>
    <div class="tablewrap"><table class="data"><thead><tr>${show.map((i) => `<th data-c="${i}">${esc(cols[i])}</th>`).join('')}</tr></thead><tbody></tbody></table></div>
    <div class="pager" id="pager"></div>`;

  const num = (v) => { const n = parseFloat(String(v).replace(/,/g, '')); return Number.isNaN(n) ? 0 : n; };
  const filtered = () => {
    const q = st.q.toLowerCase();
    let rows = data.rows.filter((r) => (!q || r.some((v) => String(v).toLowerCase().includes(q)))
      && (!st.platform || r[idx('平台')] === st.platform) && (!st.kind || r[idx('类型')] === st.kind)
      && (!st.sig || String(r[idx('需求信号')] || '').split('、').includes(st.sig))
      && (!st.minLikes || num(r[likeCol]) >= st.minLikes));
    if (st.sort >= 0) {
      const c = st.sort;
      const isNum = NUM_COLS.has(cols[c]);
      rows = [...rows].sort((a, b) => {
        const d = isNum ? num(a[c]) - num(b[c]) : String(a[c]).localeCompare(String(b[c]), 'zh');
        return st.asc ? d : -d;
      });
    }
    return rows;
  };
  const cell = (c, v, row) => {
    const name = cols[c];
    if (name === '链接') return v ? `<td class="nowrap"><a href="${esc(v)}" target="_blank" rel="noopener">打开 ↗</a></td>` : '<td></td>';
    if (name === '任务' && onJob) return `<td class="nowrap"><a href="#/jobs/${encodeURIComponent(v)}">${esc(v)}</a></td>`;
    if (name === '需求信号') return `<td>${String(v || '').split('、').filter(Boolean).map((s) => `<span class="sig ${s === '付费意愿' ? 'pay' : s === '抱怨现有' ? 'complain' : ''}">${esc(s)}</span>`).join('')}</td>`;
    if (NUM_COLS.has(name)) return `<td class="num">${esc(v)}</td>`;
    if (TXT_COLS.has(name)) return `<td class="txt"><div class="clamp" title="点一下展开">${esc(v)}</div></td>`;
    if (POST_COLS.has(name)) return `<td class="post"><div class="clamp" title="${esc(v)}">${esc(v)}</div></td>`;
    return `<td class="nowrap">${esc(v)}</td>`;
  };
  const render = () => {
    const rows = filtered();
    const pages = Math.max(1, Math.ceil(rows.length / per));
    st.page = Math.min(st.page, pages - 1);
    const slice = rows.slice(st.page * per, (st.page + 1) * per);
    $('tbody', box).innerHTML = slice.map((r) => `<tr>${show.map((i) => cell(i, r[i], r)).join('')}</tr>`).join('');
    $$('th', box).forEach((th) => { th.classList.toggle('sorted', +th.dataset.c === st.sort); th.classList.toggle('asc', +th.dataset.c === st.sort && st.asc); });
    $('#f-count', box).textContent = `${rows.length} 条${rows.length !== data.rows.length ? `（共 ${data.rows.length}）` : ''}${data.truncated ? '，只显示前 300 条' : ''}`;
    $('#pager', box).innerHTML = pages > 1 ? `<button data-pg="-1" ${st.page ? '' : 'disabled'}>上一页</button><span>第 ${st.page + 1} / ${pages} 页</span><button data-pg="1" ${st.page < pages - 1 ? '' : 'disabled'}>下一页</button>` : '';
  };
  box.addEventListener('input', (e) => {
    const id = e.target.id;
    if (id === 'f-q') st.q = e.target.value;
    else if (id === 'f-p') st.platform = e.target.value;
    else if (id === 'f-k') st.kind = e.target.value;
    else if (id === 'f-s') st.sig = e.target.value;
    else if (id === 'f-l') st.minLikes = +e.target.value || 0;
    else return;
    st.page = 0;
    render();
  });
  box.addEventListener('click', (e) => {
    const th = e.target.closest('th[data-c]');
    if (th) { const c = +th.dataset.c; st.asc = st.sort === c ? !st.asc : false; st.sort = c; render(); return; }
    const pg = e.target.closest('[data-pg]');
    if (pg) { st.page += +pg.dataset.pg; render(); $('.tablewrap', box).scrollTop = 0; return; }
    const cl = e.target.closest('td.txt .clamp');
    if (cl) cl.classList.toggle('open');
  });
  render();
}

// ---------- 搜全部数据 ----------
function viewSearch() {
  main.innerHTML = `<div class="page"><div class="page-head"><div><h1>搜全部数据</h1><div class="muted">在所有采集过的帖子和评论里找一句话，比如某个 App 的名字、"安卓"、"会员"。</div></div></div>
    <div class="card"><div class="row"><input type="search" id="gq" placeholder="输入要找的词，回车" style="width:420px" autofocus><button class="primary" id="go">搜索</button></div>
    <div id="gres" style="margin-top:14px"></div></div></div>`;
  const go = async () => {
    const q = $('#gq').value.trim();
    if (!q) return;
    $('#gres').innerHTML = '<div class="empty">搜索中…</div>';
    const data = await api(`/api/search?q=${encodeURIComponent(q)}`);
    if (!data.rows.length) { $('#gres').innerHTML = `<div class="empty">没有找到"${esc(q)}"。</div>`; return; }
    dataTable($('#gres'), data, { view: 'search', onJob: true });
  };
  $('#go').addEventListener('click', go);
  $('#gq').addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
}

// ---------- 平台与登录 ----------
function viewPlatforms() {
  const row = (p) => {
    const login = p.kind === 'browser'
      ? (p.login === 'saved' ? '<span class="status done">已保存登录</span>' : '<span class="status">还没登录</span>')
      : p.configured === false ? '<span class="status failed">没填 Key</span>'
      : (p.region === 'global' ? '<span class="status stopped">要代理</span>' : '<span class="status done">不用登录</span>');
    const btn = p.kind === 'browser'
      ? `<button data-clear="${p.id}" ${p.login === 'saved' ? '' : 'disabled'} title="清除保存的登录，下次采集时重新扫码（换账号、账号被限制时用）">重新登录</button>`
      : `<button data-probe="${p.id}">检查连接</button>`;
    return `<div class="prow"><b>${esc(p.name)}</b><div><div>${login} <span class="s" id="pr-${p.id}">${p.last_ok ? `上次成功采集：${esc(p.last_ok)}` : ''}</span></div><div class="s">${esc(p.hint)}</div></div>${btn}</div>`;
  };
  main.innerHTML = `<div class="page"><div class="page-head"><div><h1>平台与登录</h1><div class="muted">国内平台用你自己的账号登录（只在这台电脑上保存）；其余走公开接口。</div></div>
    <button id="probe-all">全部检查一遍</button></div>
    <section class="card"><h2>运行环境</h2>
      <div class="plist">
        <div class="prow"><b>MediaCrawler</b><div>${STATE.mc_ready ? '<span class="status done">已装好</span>' : '<span class="status failed">没装</span> <span class="s">在终端运行 setup_mac.sh 安装</span>'}</div><span></span></div>
        <div class="prow"><b>Chrome</b><div>${STATE.chrome ? '<span class="status done">找到了</span>' : '<span class="status failed">没找到</span> <span class="s">国内平台要用 Chrome 登录和采集</span>'}</div><span></span></div>
      </div></section>
    <section class="card"><h2>国内平台</h2><div class="plist">${STATE.platforms.filter((p) => p.kind === 'browser').map(row).join('')}</div>
      <div class="note">登录过的平台，下次采集不用再扫码。账号被限制、想换账号时点"重新登录"。小红书、抖音频繁采集容易被要求验证，建议每次几十条、隔一会儿再跑。</div></section>
    <section class="card"><h2>不用登录的来源</h2><div class="plist">${STATE.platforms.filter((p) => p.kind !== 'browser').map(row).join('')}</div></section></div>`;
  $('.page', main).addEventListener('click', onPlatformClick);
  async function probe(id) {
    const s = $(`#pr-${id}`);
    s.textContent = '检查中…';
    const r = await api(`/api/probe/${id}`, {});
    s.innerHTML = `<span style="color:var(${r.ok ? '--ok' : '--bad'})">${esc(r.message)}</span>`;
  }
  async function onPlatformClick(e) {
    const c = e.target.closest('[data-clear]');
    if (c) {
      if (!(await ask(`清除${pname(c.dataset.clear)}保存的登录？下次采集时会重新弹出窗口扫码。`, { ok: '清除' }))) return;
      await api(`/api/login/${c.dataset.clear}/clear`, {});
      await refreshState();
      viewPlatforms();
      toast('已清除，下次采集时重新扫码');
    }
    const p = e.target.closest('[data-probe]');
    if (p) probe(p.dataset.probe);
    if (e.target.id === 'probe-all') STATE.platforms.filter((x) => x.kind !== 'browser').forEach((x) => probe(x.id));
  }
}

// ---------- 设置 ----------
function viewSettings() {
  const s = STATE.settings;
  main.innerHTML = `<div class="page"><div class="page-head"><div><h1>设置</h1></div><button class="primary" id="save">保存</button></div>
  <section class="card"><h2>采集</h2><div class="form">
    <label>请求间隔</label><div><input type="number" id="sleep_sec" min="0" max="60" value="${s.sleep_sec}"> 秒<div class="help">每次请求之间至少等这么久。太快容易被平台要求验证或限流；2–5 秒比较稳。</div></div>
    <label>默认抓多少</label><div>每个关键词 <input type="number" id="default_notes" value="${s.default_notes}"> 条帖子，每条帖子 <input type="number" id="default_comments" value="${s.default_comments}"> 条评论</div>
    <label>小红书搜索排序</label><div><select id="xhs_sort">${[['general', '综合（推荐）'], ['popularity_descending', '最热'], ['time_descending', '最新']].map(([v, t]) => `<option value="${v}" ${s.xhs_sort === v ? 'selected' : ''}>${t}</option>`).join('')}</select>
      <div class="help">按最热排，搜出来多是高赞的推广帖和段子。</div></div>
    <label>浏览器</label><div><input type="text" id="browser_path" value="${esc(s.browser_path)}" placeholder="空着就用 Chrome；用 Edge 等填可执行文件路径">
      <div><label class="check" style="margin-top:8px"><input type="checkbox" id="connect_existing" ${s.connect_existing ? 'checked' : ''}> 用我日常 Chrome 的登录状态（要先按 MediaCrawler 文档开远程调试）</label></div></div>
  </div></section>
  <section class="card"><h2>网络和接口</h2><div class="form">
    <label>代理</label><div><input type="text" id="proxy" value="${esc(s.proxy)}" placeholder="例如 http://127.0.0.1:7890"><div class="help">只给不用登录的来源（Reddit、Hacker News、GitHub…）用。空着就用系统代理。</div></div>
    <label>GitHub Token</label><div><input type="password" id="github_token" value="${esc(s.github_token)}" placeholder="可选"><div class="help">不填每小时只能请求 60 次；填一个（不用勾任何权限）能到 5000 次。只保存在这台电脑上。</div></div>
    <label>YouTube API key</label><div><input type="password" id="youtube_api_key" value="${esc(s.youtube_api_key)}" placeholder="抓 YouTube 要填"><div class="help">在 Google Cloud 控制台免费申请：新建项目 → 启用 YouTube Data API v3 → 凭据 → 创建 API 密钥。免费额度每天大约能搜 100 次。</div></div>
    <label>X Bearer Token</label><div><input type="password" id="x_bearer_token" value="${esc(s.x_bearer_token)}" placeholder="抓 X（推特）要填"><div class="help">在 developer.x.com 建一个应用后拿到。X API 按用量收费，每读一条推文都算钱；只能搜最近 7 天。</div></div>
    <label>App Store 地区</label><div><input type="text" id="appstore_country" value="${esc(s.appstore_country)}" style="width:80px"><div class="help">cn 中国，us 美国，jp 日本……</div></div>
    <label>Reddit 默认版块</label><div><input type="text" id="reddit_subs" value="${esc(s.reddit_subs)}"><div class="help">关键词前没写 r/版块名 时，在这些版块里搜。英文逗号分隔。</div></div>
  </div></section>
  <section class="card"><h2>关键词组</h2><div class="muted small" style="margin-bottom:10px">新建采集时点一下就能填进去。一行一个关键词。</div>
    <div id="sets"></div><button id="add-set">＋ 加一组</button></section></div>`;
  let sets = JSON.parse(JSON.stringify(s.keyword_sets));
  const renderSets = () => {
    $('#sets').innerHTML = sets.map((k, i) => `<div class="kwset"><div class="row"><input type="text" data-n="${i}" value="${esc(k.name)}"><span style="flex:1"></span><button class="link danger" data-del="${i}">删除这组</button></div>
      <textarea data-k="${i}" rows="4">${esc(k.keywords.join('\n'))}</textarea></div>`).join('');
  };
  renderSets();
  $('#sets').addEventListener('input', (e) => {
    if (e.target.dataset.n) sets[+e.target.dataset.n].name = e.target.value;
    if (e.target.dataset.k) sets[+e.target.dataset.k].keywords = lines(e.target.value);
  });
  $('#sets').addEventListener('click', (e) => { const d = e.target.closest('[data-del]'); if (d) { sets.splice(+d.dataset.del, 1); renderSets(); } });
  $('#add-set').addEventListener('click', () => { sets.push({ name: '新的关键词组', keywords: [] }); renderSets(); });
  $('#save').addEventListener('click', async () => {
    const patch = { keyword_sets: sets };
    ['sleep_sec', 'default_notes', 'default_comments'].forEach((k) => { patch[k] = +$('#' + k).value; });
    ['xhs_sort', 'browser_path', 'proxy', 'github_token', 'youtube_api_key', 'x_bearer_token', 'appstore_country', 'reddit_subs'].forEach((k) => { patch[k] = $('#' + k).value; });
    patch.connect_existing = $('#connect_existing').checked;
    try {
      STATE = await api('/api/settings', patch);
      draft.notes = null;
      toast('已保存');
    } catch (err) { toast(err.message, true); }
  });
}

// ---------- 启动 ----------
(async () => {
  try {
    await refreshState();
    await refreshJobs();
  } catch (e) {
    main.innerHTML = `<div class="page empty">连不上需求雷达的本机服务：${esc(e.message)}</div>`;
    return;
  }
  window.addEventListener('hashchange', route);
  route();
  // 侧栏上的"采集中"数字一直跟着更新
  setInterval(() => refreshJobs().catch(() => {}), 4000);
})();

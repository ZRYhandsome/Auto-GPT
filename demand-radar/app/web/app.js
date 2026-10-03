// 需求雷达界面：新建采集、任务（进度、日志、结果）、线索与回复、搜全部数据、平台与登录、设置。
// 不用框架；所有数据都来自本机服务 /api/*。
'use strict';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// 链接来自别人的帖子：只认 http(s)，挡住 javascript: 这类
const safeUrl = (u) => (/^https?:\/\//i.test(String(u || '').trim()) ? String(u).trim() : '');
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
  while ($('#toasts').children.length > 3) $('#toasts').firstElementChild.remove(); // 最多同时显示 3 条
  setTimeout(() => el.remove(), Math.max(bad ? 7000 : 3500, String(msg).length * 90)); // 长消息多停一会儿
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
const routes = { new: viewNew, jobs: viewJobs, job: viewJob, leads: viewLeads, search: viewSearch, platforms: viewPlatforms, settings: viewSettings };

function route() {
  clearInterval(pollTimer);
  const [, name = 'new', arg] = (location.hash || '#/new').split('/');
  const key = name === 'jobs' && arg ? 'job' : name;
  $$('.side a').forEach((a) => a.classList.toggle('on', a.dataset.nav === (key === 'job' ? 'jobs' : key)));
  main.scrollTop = 0; // 先回到顶上，页面自己可以再滚到某一节（设置 → 线索与回复）
  (routes[key] || viewNew)(arg ? decodeURIComponent(arg) : undefined);
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
  const r = await api('/api/jobs');
  JOBS = r.jobs;
  const running = JOBS.filter((j) => j.status === 'running' || j.status === 'queued').length;
  const b = $('#running-badge');
  b.hidden = !running;
  b.textContent = running;
  setHotBadge(r.hot || 0);
  return JOBS;
}

// 侧栏「线索与回复」上的数字：热线索（对方想试用、问价格、要链接）有几个
function setHotBadge(n) {
  const b = $('#hot-badge');
  if (!b) return;
  b.hidden = !n;
  b.textContent = n;
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
    sel.filter((p) => p.configured === false).forEach((p) => notes.push(['bad', `${p.name} 要先在"设置 → 抓取用的 Key"里填 Key，填好才能采集。`]));
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
    if (plat(id)?.configured === false && !draft.platforms.includes(id)) toast(`${pname(id)} 要先在"设置 → 抓取用的 Key"里填 Key，填好才能采集`, true);
    if (draft.mode !== 'search') draft.platforms = [id];
    else draft.platforms = draft.platforms.includes(id) ? draft.platforms.filter((x) => x !== id) : [...draft.platforms, id];
    renderPlatforms();
  });
  ['notes', 'comments'].forEach((k) => $('#' + k).addEventListener('input', (e) => { draft[k] = +e.target.value; estimate(); }));
  $('#sub').addEventListener('change', (e) => { draft.sub = e.target.checked; });
  $('#label').addEventListener('input', (e) => { draft.label = e.target.value; });
  $('#start').addEventListener('click', async () => {
    const noKey = draft.platforms.map(plat).filter((p) => p?.configured === false);
    if (noKey.length) return toast(`${noKey.map((p) => p.name).join('、')} 还没填 Key：先去"设置 → 抓取用的 Key"里填`, true);
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
         ${job.totals?.signals ? '<button data-a="leads" title="把这次的需求信号导入「线索与回复」，让 AI 判断谁需要你的产品">从这里找线索</button>' : ''}
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
      if (a === 'leads') location.hash = `#/leads/${encodeURIComponent(id)}`;
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
    if (name === '链接') return safeUrl(v) ? `<td class="nowrap"><a href="${esc(safeUrl(v))}" target="_blank" rel="noopener">打开 ↗</a></td>` : '<td></td>';
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

// ---------- 线索与回复 ----------
// 从采集结果里挑出可能需要你产品的人 → AI 判断并写回复 → 你审核、批准 → 发出 → 查谁回了。
// 没有你点批准，什么都不会发；每天发多少、每个平台怎么发，都在设置里由你定。
const LEAD_STATUS = { new: '待判断', unfit: '不合适', draft: '待审核', approved: '待发送', sending: '发送中', sent: '已发出', failed: '没发出去', replied: '对方回复了', skipped: '已跳过', error: '判断出错' };
const LEAD_STATUS_CLS = { draft: 'queued', approved: 'queued', sending: 'running', sent: 'done', replied: 'done', failed: 'failed', error: 'failed' };
const INTENT = { trial: '想试用', price: '问价格', question: '提问', positive: '积极', negative: '拒绝', stop: '别再联系', other: '其他' };
const TASK_KIND = { judge: 'AI 正在判断', send: '正在发送', check: '正在查回复' };
const TASK_DONE = { judge: 'AI 判断', send: '发送', check: '查回复' };
const LEAD_TABS = [
  // 点了「复制并打开」的留在原地，方便接着点「我已发出」
  ['review', '待审核', (l) => ['draft', 'new', 'error'].includes(l.status) || (l.status === 'approved' && lv.stay.has(l.id))],
  ['queue', '待发送', (l) => ['approved', 'sending', 'failed'].includes(l.status)],
  ['hot', '🔥 热线索', (l) => l.hot],
  ['sent', '已发', (l) => ['sent', 'replied'].includes(l.status)],
  ['other', '不合适/跳过', (l) => ['unfit', 'skipped'].includes(l.status)],
  ['all', '全部', () => true],
];
const LEAD_EMPTY = {
  review: '没有待审核的回复。在上面选一次采集，点「导入并让 AI 判断」。',
  queue: '没有待发送的。「待审核」里批准了的回复会放到这里。',
  hot: '还没有热线索。对方回复说想试用、问价格、要链接时，会出现在这里。',
  sent: '还没发出过回复。',
  other: '没有不合适或跳过的线索。',
  all: '还没有线索。在上面选一次采集，点「导入并让 AI 判断」。',
};
const LOCKED = ['sending', 'sent', 'replied'];
const PER_PAGE = 30;
// 页面上的临时状态：换页面再回来还在
const lv = { tab: 'review', page: 0, job: '', limit: 30, minScore: 0, sel: new Set(), open: new Set(), opened: new Set(), stay: new Set(), manual: new Set(), reply: {}, errsOpen: false, loaded: 0 };
let LEADS = null; // /api/outreach
let leadsSig = '';

const leadById = (id) => LEADS?.leads.find((l) => l.id === id);
const leadPath = (id, sub = '') => `/api/outreach/leads/${encodeURIComponent(id)}${sub}`;
// 「改为手动发」只对这一条生效；其余按设置里每个平台选的发送方式
const leadMode = (l) => (lv.manual.has(l.id) ? 'manual' : LEADS?.modes[l.platform] || 'manual');
const whoOf = (l) => (l.platform === 'reddit' ? `u/${l.author}` : l.platform === 'x' ? `@${l.author}` : l.author);
const pad2 = (n) => String(n).padStart(2, '0');

function fmtAt(at) {
  let d = null;
  if (typeof at === 'number' || /^\d{9,}(\.\d+)?$/.test(String(at))) d = new Date(Number(at) * 1000);
  else if (/\dT\d/.test(String(at))) d = new Date(at);
  if (!d || Number.isNaN(d.getTime())) return String(at || '');
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

async function copyText(text) {
  if (!text) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // 独立窗口里可能用不了剪贴板接口：退回老办法
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    ta.remove();
    return ok;
  }
}

async function viewLeads(jobArg) {
  if (jobArg) lv.job = jobArg;
  leadsSig = '';
  main.innerHTML = `<div class="page">
    <div class="page-head"><div><h1>线索与回复</h1><div class="muted">从采集结果里挑出可能需要你产品的人，AI 帮你写好回复。每一条都要你看过、批准了才会发出去；对方回了，AI 帮你看是不是想试用。</div></div></div>
    <div id="lsetup"></div>
    <section class="card"><h2>找线索</h2><div id="limport"></div></section>
    <section class="card" id="lstatus"></section>
    <section class="card"><div class="tabs" id="ltabs"></div><div id="lbatch"></div><div id="llist"></div><div class="pager" id="lpager"></div></section></div>`;
  try {
    await refreshJobs();
    LEADS = await api('/api/outreach');
    lv.loaded = Date.now();
  } catch (e) {
    if ($('#llist')) main.innerHTML = `<div class="page empty">${esc(e.message)}</div>`;
    return;
  }
  if (!$('#llist')) return; // 读取期间已经去了别的页面
  renderLeadImport();
  renderLeads(true);

  $('#lstatus').addEventListener('click', async (e) => {
    try {
      if (e.target.id === 'lstop') { await api('/api/outreach/stop', {}); toast('正在停止：做完手上这一条就停'); }
      if (e.target.id === 'lcheck') { await api('/api/outreach/check', {}); toast('正在查回复…'); }
    } catch (err) { toast(err.message, true); }
    if (['lstop', 'lcheck'].includes(e.target.id)) loadLeads().catch(() => {});
  });
  $('#lstatus').addEventListener('toggle', (e) => { if (e.target.matches('details.errs')) lv.errsOpen = e.target.open; }, true);
  $('#ltabs').addEventListener('click', (e) => {
    const b = e.target.closest('[data-lt]');
    if (!b) return;
    lv.tab = b.dataset.lt;
    lv.page = 0;
    lv.sel.clear();
    renderLeads(true);
  });
  $('#lpager').addEventListener('click', (e) => {
    const b = e.target.closest('[data-pg]');
    if (!b) return;
    lv.page += +b.dataset.pg;
    lv.sel.clear();
    renderLeads(true);
    $('#ltabs').scrollIntoView({ block: 'start' });
  });
  $('#lbatch').addEventListener('change', (e) => {
    if (e.target.id !== 'lall') return;
    const page = pagePickable();
    lv.sel = e.target.checked ? new Set(page.map((l) => l.id)) : new Set();
    $$('[data-pick]').forEach((c) => { c.checked = lv.sel.has(c.dataset.pick); });
    renderBatch(page);
  });
  $('#lbatch').addEventListener('click', onBatch);
  const list = $('#llist');
  list.addEventListener('change', (e) => {
    const id = e.target.dataset.pick;
    if (!id) return;
    if (e.target.checked) lv.sel.add(id); else lv.sel.delete(id);
    renderBatch(pagePickable());
  });
  list.addEventListener('input', (e) => { if (e.target.dataset.reply) lv.reply[e.target.dataset.reply] = e.target.value; });
  // 回复草稿：离开输入框就保存
  list.addEventListener('focusout', (e) => {
    const ta = e.target.closest('textarea[data-draft]');
    if (!ta) return;
    saveDraft(ta.dataset.draft, ta.closest('.lead'))
      .then((changed) => { if (changed) toast('回复已保存'); })
      .catch((err) => toast(err.message, true));
  });
  list.addEventListener('click', onLeadClick);

  // 有任务在跑时每 3 秒刷新，平时 20 秒
  pollTimer = setInterval(() => {
    if (!$('#llist')) return clearInterval(pollTimer);
    if (LEADS?.task.kind || Date.now() - lv.loaded >= 20000) loadLeads().catch(() => {});
  }, 3000);
}

async function loadLeads(force = false) {
  const prev = LEADS?.task;
  LEADS = await api('/api/outreach');
  lv.loaded = Date.now();
  setHotBadge(LEADS.counts.hot || 0);
  if (!$('#llist')) return;
  const t = LEADS.task;
  if (prev?.kind && !t.kind && t.message) toast(t.message, t.errors.length > 0 && t.last !== 'check');
  renderLeads(force);
}

function renderLeads(force) {
  renderLeadSetup();
  renderLeadStatus();
  renderLeadTabs();
  // 正在改回复草稿或贴回复时不重画列表，免得打断输入
  const editing = document.activeElement?.tagName === 'TEXTAREA' && document.activeElement.closest('#llist');
  const sig = JSON.stringify([lv.tab, lv.page, LEADS.modes, LEADS.task.kind, [...lv.manual], [...lv.opened], [...lv.stay], pageLeads().map((l) => [l.id, l.status, l.draft, l.error, l.hot, l.fit_score, (l.replies || []).length])]);
  if (force || (sig !== leadsSig && !editing)) {
    leadsSig = sig;
    renderLeadList();
  }
}

function renderLeadImport() {
  const box = $('#limport');
  const jobs = JOBS.filter((j) => !['running', 'queued'].includes(j.status) && (j.totals?.signals || 0) > 0);
  if (!jobs.length) {
    box.innerHTML = '<div class="note">还没有能用的采集结果。先去<a href="#/new">新建采集</a>抓一些帖子和评论，采集完会自动打分，再回到这里。</div>';
    return;
  }
  if (!jobs.some((j) => j.id === lv.job)) lv.job = jobs[0].id;
  box.innerHTML = `<div class="row">
      <label class="field">从哪次采集 <select id="ljob">${jobs.map((j) => `<option value="${esc(j.id)}" ${j.id === lv.job ? 'selected' : ''}>${esc(jobTitle(j))} · ${esc((j.created || '').slice(5, 16))} · ${j.totals.signals} 条信号${j.signals_file === false ? '（要先重新打分）' : ''}</option>`).join('')}</select></label>
      <label class="field">最多导入 <input type="number" id="llimit" min="1" max="1000" value="${lv.limit}"> 条</label>
      <label class="field">信号得分至少 <input type="number" id="lmin" min="0" step="0.5" value="${lv.minScore}"></label>
      <button class="primary" id="lgo"></button></div>
    <div class="muted small" style="margin-top:8px">按需求信号得分从高到低导入。同一个人在同一个平台只导入一次；说过别再联系的人会跳过；App Store 评论没法回复，不导入。</div>`;
  setImportLabel();
  $('#ljob').addEventListener('change', (e) => { lv.job = e.target.value; });
  $('#llimit').addEventListener('input', (e) => { lv.limit = +e.target.value || 30; });
  $('#lmin').addEventListener('input', (e) => { lv.minScore = +e.target.value || 0; });
  $('#lgo').addEventListener('click', async () => {
    const btn = $('#lgo');
    btn.disabled = true;
    try {
      const r = await api('/api/outreach/import', { job: lv.job, limit: lv.limit, min_score: lv.minScore, judge: true });
      const i = r.import;
      const parts = [`导入了 ${i.added} 条新线索`];
      if (i.dup) parts.push(`${i.dup} 条以前导入过（或这个人已经有一条）`);
      if (i.blocked) parts.push(`${i.blocked} 条是不再联系的人`);
      if (i.no_author) parts.push(`${i.no_author} 条没有作者名，联系不上`);
      if (i.no_contact) parts.push(`${i.no_contact} 条是 App Store 评论，没法回复`);
      let msg = parts.join('，') + '。';
      if (r.judging) msg += 'AI 正在判断，写好的回复会出现在「待审核」里。';
      else if (r.judge_error) msg += r.judge_error;
      toast(msg);
      lv.tab = 'review';
      lv.page = 0;
      lv.sel.clear();
      await loadLeads(true);
    } catch (err) { toast(err.message, true); }
    btn.disabled = false;
  });
}

function setImportLabel() {
  const b = $('#lgo');
  if (!b || !LEADS) return;
  const ok = LEADS.ready.ai && LEADS.ready.profile;
  b.textContent = ok ? '导入并让 AI 判断' : '只导入（AI 还没设置好）';
}

function renderLeadSetup() {
  const r = LEADS.ready;
  const box = $('#lsetup');
  if (r.ai && r.profile) { box.innerHTML = ''; return; }
  const item = (ok, text, optional) => `<li class="${ok ? 'ok' : optional ? 'opt' : 'todo'}"><span class="mark">${ok ? '✓' : optional ? '–' : '!'}</span>${text}</li>`;
  box.innerHTML = `<section class="card setup"><h2>先在设置里填好这几样，AI 才能帮你判断和写回复</h2><ul class="checklist">
      ${item(r.ai, 'Anthropic API key（AI 判断、写回复、读回复都用它）')}
      ${item(r.profile, '产品资料：产品名称、一句话说明、你的身份（每条回复都会写明你是做这个产品的人）')}
      ${item(r.reddit, 'Reddit 发送账号（可选：不填的话 Reddit 也是复制后你自己去发）', true)}
      ${item(r.x, 'X 发送账号（可选：同上）', true)}
    </ul><button class="primary" onclick="location.hash='#/settings/outreach'">去设置</button></section>`;
}

function renderLeadStatus() {
  const L = LEADS;
  const t = L.task;
  const present = new Set(L.leads.map((l) => l.platform));
  const chips = Object.keys(L.today).filter((p) => present.has(p) || L.modes[p] === 'api').map((p) => {
    const d = L.today[p];
    const how = L.modes[p] === 'api' ? '自动发' : L.modes[p] === 'none' ? '不能发' : '手动发';
    if (!d.cap) return `<span class="today off" title="设置里的每天上限是 0，不往这个平台发">${esc(pname(p))} 不发（上限 0）</span>`;
    return `<span class="today ${d.sent >= d.cap ? 'full' : ''}" title="今天已发 / 你设的每天上限"><b>${esc(pname(p))}</b> 今天 ${d.sent}/${d.cap} · ${how}</span>`;
  }).join('');
  const canCheck = L.ready.reddit || L.ready.x;
  let task = '';
  if (t.kind) {
    const pct = t.total ? Math.round((t.done / t.total) * 100) : 0;
    task = `<div class="taskline"><span class="status running">${TASK_KIND[t.kind] || esc(t.kind)}</span>
      ${t.total ? `<span class="bar"><i style="width:${pct}%"></i></span><span>${t.done} / ${t.total}</span>` : ''}
      ${t.message ? `<span class="muted">${esc(t.message)}</span>` : ''}<span class="sp"></span><button class="danger" id="lstop">停止</button></div>`;
    if (t.kind === 'send') task += `<div class="muted small" style="margin-top:4px">一条一条发，每条之间等约 ${esc(STATE.settings.send_gap_sec)} 秒（设置里能改）。可以去别的页面，发送在后台继续。</div>`;
  } else if (t.message) {
    task = `<div class="taskline muted"><span><span class="lbl">上次</span>${TASK_DONE[t.last] ? `${TASK_DONE[t.last]}：` : ''}${esc(t.message)}</span><span class="small">${esc(t.finished)}</span></div>`;
  }
  if (t.errors?.length) task += `<details class="errs" ${lv.errsOpen ? 'open' : ''}><summary>${t.errors.length} 个问题（点开看）</summary><ul>${t.errors.map((e) => `<li>${esc(e)}</li>`).join('')}</ul></details>`;
  const sentAny = L.leads.some((l) => ['sent', 'replied'].includes(l.status));
  $('#lstatus').innerHTML = `<div class="row"><div class="today-row">${chips || '<span class="muted small">还没有线索</span>'}</div><span class="sp"></span>
      <span class="muted small">共 ${L.leads.length} 条线索${L.last_check ? ` · 上次查回复 ${esc(L.last_check.slice(5, 16))}` : ''}</span>
      ${canCheck ? `<button id="lcheck" ${t.kind ? 'disabled' : ''} title="用你的 Reddit / X 账号查有没有人回复">查回复</button>` : ''}</div>
    ${task}
    ${sentAny ? '<div class="muted small" style="margin-top:6px">手动发的平台查不了回复：对方回了，把原话贴到那条线索里（在「已发」里）。</div>' : ''}`;
  setImportLabel();
}

function renderLeadTabs() {
  $('#ltabs').innerHTML = LEAD_TABS.map(([k, label, f]) => `<button data-lt="${k}" class="${lv.tab === k ? 'on' : ''}">${label}<span class="c">${LEADS.leads.filter(f).length}</span></button>`).join('');
}

function tabLeads() {
  const f = (LEAD_TABS.find(([k]) => k === lv.tab) || LEAD_TABS[0])[2];
  const rows = LEADS.leads.filter(f);
  if (lv.tab !== 'review') return rows;
  // 写好回复的排前面（AI 觉得越合适越靠前），没判断的放后面
  const rank = { approved: 0, draft: 0, error: 1, new: 2 };
  return [...rows].sort((a, b) => rank[a.status] - rank[b.status] || (b.fit_score ?? -1) - (a.fit_score ?? -1) || (+b.score || 0) - (+a.score || 0));
}

function pageLeads() {
  const rows = tabLeads();
  lv.page = Math.max(0, Math.min(lv.page, Math.ceil(rows.length / PER_PAGE) - 1));
  return rows.slice(lv.page * PER_PAGE, (lv.page + 1) * PER_PAGE);
}
const pagePickable = () => pageLeads().filter((l) => !LOCKED.includes(l.status));

function renderLeadList() {
  const rows = tabLeads();
  const pages = Math.max(1, Math.ceil(rows.length / PER_PAGE));
  const slice = pageLeads();
  const pickable = slice.filter((l) => !LOCKED.includes(l.status));
  lv.sel = new Set([...lv.sel].filter((id) => pickable.some((l) => l.id === id)));
  $('#llist').innerHTML = slice.length ? slice.map(leadCard).join('') : `<div class="empty">${LEAD_EMPTY[lv.tab]}</div>`;
  $('#lpager').innerHTML = pages > 1 ? `<button data-pg="-1" ${lv.page ? '' : 'disabled'}>上一页</button><span>第 ${lv.page + 1} / ${pages} 页</span><button data-pg="1" ${lv.page < pages - 1 ? '' : 'disabled'}>下一页</button>` : '';
  renderBatch(pickable);
}

function renderBatch(pickable) {
  const box = $('#lbatch');
  const n = lv.sel.size;
  const apiNames = Object.entries(LEADS.modes).filter(([, m]) => m === 'api').map(([p]) => pname(p));
  const drafts = LEADS.leads.filter((l) => l.status === 'draft' && leadMode(l) === 'api');
  const queued = LEADS.leads.filter((l) => ['approved', 'failed'].includes(l.status) && leadMode(l) === 'api');
  const left = pickable.length ? `<label class="check"><input type="checkbox" id="lall" ${n && n === pickable.length ? 'checked' : ''}> 全选本页</label>
    <span class="muted small">已选 ${n} 条</span>
    ${lv.tab === 'other' ? `<button data-b="restore" ${n ? '' : 'disabled'}>批量恢复到待审核</button>`
    : `<button data-b="send" ${n ? '' : 'disabled'}>${!apiNames.length ? '批量批准（放进待发送）' : `${lv.tab === 'queue' ? '批量发送' : '批量批准并发送'}（只自动发 ${esc(apiNames.join(' / '))}）`}</button>
       <button data-b="skip" ${n ? '' : 'disabled'}>批量跳过</button>`}` : '';
  const right = lv.tab === 'review' && drafts.length ? `<button class="primary" data-b="all" title="待审核里，能用官方接口自动发的平台的全部回复">全部批准并发送（${drafts.length} 条）</button>`
    : lv.tab === 'queue' && queued.length ? `<button class="primary" data-b="queue" title="待发送里，能用官方接口自动发的平台的全部回复">发送全部待发送（${queued.length} 条）</button>` : '';
  box.innerHTML = left || right ? `<div class="batch">${left}<span class="sp"></span>${right}</div>` : '';
}

async function onBatch(e) {
  const b = e.target.closest('[data-b]');
  if (!b) return;
  const act = b.dataset.b;
  const ids = [...lv.sel];
  b.disabled = true;
  try {
    if (act === 'send') await sendIds(ids, true);
    if (act === 'all') await sendIds(LEADS.leads.filter((l) => l.status === 'draft' && leadMode(l) === 'api').map((l) => l.id), true);
    if (act === 'queue') await sendIds(LEADS.leads.filter((l) => ['approved', 'failed'].includes(l.status) && leadMode(l) === 'api').map((l) => l.id), true);
    if (act === 'skip' || act === 'restore') {
      let ok = 0;
      for (const id of ids) {
        try { await api(leadPath(id), { action: act }); ok += 1; } catch (err) { toast(err.message, true); }
      }
      toast(act === 'skip' ? `跳过了 ${ok} 条` : `恢复了 ${ok} 条到「待审核」`);
      lv.sel.clear();
    }
  } catch (err) { toast(err.message, true); }
  b.disabled = false;
  await loadLeads(true).catch(() => {});
}

// 批准并发送：自动发的在后台一条条发；手动发的批准后放进「待发送」
async function sendIds(ids, confirmFirst) {
  const leads = ids.map(leadById).filter((l) => l && ['new', 'draft', 'error', 'failed', 'approved'].includes(l.status) && (l.draft || '').trim());
  if (!leads.length) return toast('选中的线索还没有回复草稿，没法发', true);
  const auto = leads.filter((l) => leadMode(l) === 'api');
  const manual = leads.filter((l) => leadMode(l) !== 'api');
  const approve = async (ls) => {
    for (const l of ls) if (l.status !== 'approved') await api(leadPath(l.id), { action: 'approve' });
  };
  if (LEADS.task.kind) {
    // 同一时间只跑一个后台任务：先批准，等它做完再发
    await approve(leads);
    toast(auto.length ? `现在${TASK_KIND[LEADS.task.kind] || '有任务在跑'}，先帮你批准了 ${leads.length} 条，放在「待发送」。等它做完，再到「待发送」里点发送。`
      : `已批准 ${leads.length} 条，放进「待发送」：点「复制并打开」`);
    return;
  }
  if (confirmFirst && !(await ask(sendPlanText(auto, manual), { ok: auto.length ? '批准并发送' : '批准' }))) return;
  // 还没判断过的（自己写了回复）和这台电脑上改成手动发的，先批准；改成手动发的不交给官方接口
  await approve(leads.filter((l) => ['new', 'error'].includes(l.status) || lv.manual.has(l.id)));
  const toServer = leads.filter((l) => !lv.manual.has(l.id)).map((l) => l.id);
  const r = toServer.length ? await api('/api/outreach/send', { ids: toServer }) : { queued: 0, manual: [] };
  const msg = [];
  if (r.queued) msg.push(r.queued > 1 ? `开始发送 ${r.queued} 条：在后台一条一条发，随时可以停止` : '正在发送…');
  if (manual.length) msg.push(`${manual.length} 条要你自己发，已放进「待发送」：点「复制并打开」`);
  toast(msg.join('；') || '没有能发的');
}

function sendPlanText(auto, manual) {
  const group = (ls) => Object.entries(ls.reduce((m, l) => ({ ...m, [l.platform]: (m[l.platform] || 0) + 1 }), {}));
  const lines = [`批准这 ${auto.length + manual.length} 条回复？`];
  if (auto.length) {
    const g = group(auto);
    const gap = +STATE.settings.send_gap_sec || 0;
    lines.push(`用你的账号、通过官方接口自动发 ${auto.length} 条：${g.map(([p, n]) => `${pname(p)} ${n} 条`).join('、')}。`);
    if (auto.length > 1) lines.push(gap ? `一条一条发，每条间隔约 ${gap} 秒（全部发完大约 ${Math.max(1, Math.round(((auto.length - 1) * gap * 1.25) / 60))} 分钟），随时可以停止。` : '设置里的发送间隔是 0 秒：会一条接一条马上发。');
    lines.push(`今天上限 ${g.map(([p]) => {
      const d = LEADS.today[p] || {};
      return d.cap === 0 ? `${pname(p)} 是 0（不发）` : `${pname(p)} ${d.cap ?? '?'} 条（已发 ${d.sent ?? 0}）`;
    }).join('、')}，超出的留在「待发送」，上限在设置里改。`);
  }
  if (manual.length) lines.push(`${group(manual).map(([p, n]) => `${pname(p)} ${n} 条`).join('、')}要你自己复制去发，会放进「待发送」。`);
  const off = group(manual).filter(([p]) => LEADS.today[p]?.cap === 0).map(([p]) => pname(p));
  if (off.length) lines.push(`注意：${off.join('、')} 的每天上限是 0（不发），要发先去设置里改上限。`);
  return lines.join('\n');
}

function leadCard(l) {
  const id = l.id;
  const locked = LOCKED.includes(l.status);
  const text = l.text || '';
  const long = text.length > 260 || text.split('\n').length > 5;
  const open = lv.open.has(id);
  const url = safeUrl(l.url);
  const sigs = String(l.signals || '').split('、').filter(Boolean).map((s) => `<span class="sig ${s === '付费意愿' ? 'pay' : s === '抱怨现有' ? 'complain' : ''}">${esc(s)}</span>`).join('');
  const fit = l.fit_score == null ? '' : `<span class="fit ${l.fit_score >= 80 ? 'hi' : l.fit_score >= 50 ? 'mid' : ''}" title="AI 觉得你的产品和对方的需求有多对得上（0–100）">匹配 ${esc(l.fit_score)}</span>`;
  const title = esc(l.post_title || '打开原帖');
  const link = url ? `<a href="${esc(url)}" target="_blank" rel="noopener">${title} ↗</a>` : esc(l.post_title || '');
  const where = !link ? '' : l.kind === 'comment' ? `评论在：${link}` : `帖子：${link}`;
  return `<article class="lead ${l.hot ? 'is-hot' : ''}" data-id="${esc(id)}">
    <div class="lead-head">
      ${locked ? '' : `<input type="checkbox" data-pick="${esc(id)}" ${lv.sel.has(id) ? 'checked' : ''} aria-label="选中这条">`}
      <span class="ptag">${esc(pname(l.platform))}</span><b class="who">${esc(whoOf(l))}</b>
      <span class="muted small">${l.kind === 'comment' ? '评论' : '帖子'} · 信号得分 ${esc(l.score)}${l.likes ? ` · 赞 ${esc(l.likes)}` : ''}</span>${sigs}
      <span class="sp"></span>${l.hot ? '<span class="hot-tag">🔥 热线索</span>' : ''}${fit}<span class="status ${LEAD_STATUS_CLS[l.status] || ''}">${LEAD_STATUS[l.status] || esc(l.status)}</span>
    </div>
    <div class="lead-grid">
      <div class="them">
        ${where ? `<div class="where small muted">${where}</div>` : ''}
        <blockquote class="quote ${long && !open ? 'clamp' : ''}">${esc(text)}</blockquote>
        ${long ? `<button class="link small" data-act="expand">${open ? '收起' : '展开全文'}</button>` : ''}
        ${l.need || l.reason ? `<div class="ai">${l.need ? `<div><span class="lbl">对方想要</span>${esc(l.need)}</div>` : ''}${l.reason ? `<div><span class="lbl">AI 的看法</span>${esc(l.reason)}</div>` : ''}</div>` : ''}
      </div>
      <div class="us">${locked ? sentBox(l) : replyBox(l)}</div>
    </div></article>`;
}

const actBtn = (act, label, cls = '') => `<button data-act="${act}" class="${cls}">${label}</button>`;

function replyBox(l) {
  const st = l.status;
  const mode = leadMode(l);
  const hasDraft = !!(l.draft || '').trim();
  const acts = [];
  let note = '';
  if (st === 'new' && !hasDraft && LEADS.task.kind === 'judge') {
    return `<div class="note">AI 正在判断，写好的回复会出现在这里。</div><div class="lead-actions">${actBtn('skip', '跳过')}${actBtn('block', '不再联系此人', 'danger')}</div>`;
  }
  if (st === 'new' || st === 'error') acts.push(actBtn('judge', st === 'error' ? '让 AI 再判断一次' : '让 AI 判断', hasDraft ? '' : 'primary'));
  if (st === 'error') note = `<div class="note bad">AI 判断出错：${esc(l.error)}</div>`;
  if (st === 'failed') note = `<div class="note bad">没发出去：${esc(l.error)}</div>`;
  if (st === 'approved' && l.error) note = `<div class="note warn">上次没发成：${esc(l.error)}</div>`;
  if (st === 'unfit') note = '<div class="note">AI 觉得不合适，没写回复。你觉得合适的话，点「恢复到待审核」，再让 AI 判断或者自己写。</div>';
  if (st === 'skipped') note = '<div class="note">已跳过，不会发。</div>';
  let canSend = ['draft', 'approved', 'failed'].includes(st) || (['new', 'error'].includes(st) && hasDraft);
  const day = LEADS.today[l.platform];
  if (canSend && day && !day.cap) {
    // 上限设成 0 = 你选了不往这个平台发
    note += `<div class="note warn">${esc(pname(l.platform))} 的每天上限设成了 0（不往这个平台发）。要发的话先去 <a href="#/settings/outreach">设置 → 线索与回复</a> 里改上限。</div>`;
    canSend = false;
  } else if (canSend && day && day.sent >= day.cap) {
    note += `<div class="note warn">今天 ${esc(pname(l.platform))} 已发 ${day.sent} 条，到你设的上限了。批准的会留在「待发送」，明天再发；上限在设置里能改。</div>`;
  }
  if (canSend) {
    if (mode === 'api' && st === 'failed') acts.push(actBtn('retry', '重试发送', 'primary'), actBtn('to-manual', '改为手动发'));
    else if (mode === 'api' && st === 'approved') acts.push(actBtn('send', '发送', 'primary'));
    else if (mode === 'api') acts.push(actBtn('approve', '批准'), actBtn('approve-send', '批准并发送', 'primary'));
    else {
      const opened = lv.opened.has(l.id);
      acts.push(actBtn('open', '复制并打开', opened ? '' : 'primary'), actBtn('sent', '我已发出', opened ? 'primary' : ''));
    }
  }
  if (st === 'unfit' || st === 'skipped') acts.push(actBtn('restore', '恢复到待审核'));
  else acts.push(actBtn('skip', '跳过'));
  acts.push(actBtn('block', '不再联系此人', 'danger'));
  const showDraft = !['unfit', 'skipped'].includes(st) || hasDraft;
  const ro = ['unfit', 'skipped'].includes(st);
  const draftBox = showDraft ? `<div class="lbl-row"><span class="lbl">${hasDraft ? '回复草稿' : '回复'}${l.edited ? '（你改过）' : ''}</span>${ro ? '' : '<span class="muted small">可以直接改，离开输入框就保存</span>'}</div>
    <textarea data-draft="${esc(l.id)}" rows="${hasDraft ? 5 : 3}" maxlength="4000" ${ro ? 'readonly' : ''} placeholder="${hasDraft ? '' : '还没有回复。点「让 AI 判断」，或者自己写'}">${esc(l.draft)}</textarea>` : '';
  const hint = canSend && mode !== 'api' ? `<div class="muted small hint">${esc(pname(l.platform))} 要你自己发：点「复制并打开」，在打开的页面里粘贴发出，再回来点「我已发出」。</div>` : '';
  return `${draftBox}${note}${hint}<div class="lead-actions">${acts.join('')}</div>`;
}

function sentBox(l) {
  if (l.status === 'sending') return `<div class="note">正在用官方接口发…</div><div class="mine">${esc(l.draft)}</div>`;
  const replies = l.replies || [];
  const url = safeUrl(l.url);
  const blocked = replies.some((r) => ['stop', 'negative'].includes(r.intent));
  const typed = lv.reply[l.id] || '';
  const rec = `<textarea data-reply="${esc(l.id)}" rows="2" placeholder="对方回了什么？把原话贴进来，AI 帮你看是不是想试用">${esc(typed)}</textarea>
    <div class="lead-actions">${actBtn('reply', '记录对方回复')}</div>`;
  const items = replies.map((r, i) => `<div class="reply">
      <div class="rhead"><span class="intent ${esc(r.intent)}">${INTENT[r.intent] || esc(r.intent)}</span>${r.hot ? '<span class="hot-tag">🔥 热</span>' : ''}<b>${esc(r.author)}</b><span class="muted small">${esc(fmtAt(r.at))}</span></div>
      <div class="rtext">${esc(r.text)}</div>
      ${r.summary ? `<div class="small muted">AI：${esc(r.summary)}</div>` : ''}
      ${r.suggested_reply ? `<div class="suggest"><span class="lbl">可以这样回</span>${esc(r.suggested_reply)} <button class="link small" data-act="copy-suggest" data-i="${i}">复制</button></div>` : ''}
    </div>`).join('');
  return `<div class="small muted">${l.sent_via === 'api' ? '用官方接口发出' : '你手动发出'} · ${esc(l.sent_at)}${url ? ` · <a href="${esc(url)}" target="_blank" rel="noopener">去原帖看看 ↗</a>` : ''}</div>
    <div class="mine" title="你发出的回复">${esc(l.draft)}</div>
    ${items}
    ${blocked ? '<div class="note">对方说了不感兴趣或别再联系，已经加进不再联系名单，以后不会再联系这个人。</div>' : ''}
    ${l.sent_via === 'api' && !typed ? `<details class="rec"><summary class="small">对方在别处回复了？手动记录</summary>${rec}</details>` : `<div class="rec">${rec}</div>`}`;
}

async function saveDraft(id, card) {
  const ta = card ? $('textarea[data-draft]', card) : null;
  const l = leadById(id);
  if (!ta || ta.readOnly || !l || LOCKED.includes(l.status)) return false;
  const v = ta.value.trim();
  if (v === (l.draft || '').trim()) return false;
  Object.assign(l, await api(leadPath(id), { draft: v }));
  return true;
}

async function onLeadClick(e) {
  const b = e.target.closest('[data-act]');
  const card = b?.closest('.lead');
  if (!card) return;
  const id = card.dataset.id;
  const act = b.dataset.act;
  if (act === 'expand') {
    if (lv.open.has(id)) lv.open.delete(id); else lv.open.add(id);
    $('.quote', card).classList.toggle('clamp', !lv.open.has(id));
    b.textContent = lv.open.has(id) ? '收起' : '展开全文';
    return;
  }
  if (act === 'copy-suggest') {
    const r = leadById(id)?.replies?.[+b.dataset.i];
    if (await copyText(r?.suggested_reply)) toast('已复制'); else toast('没能复制，请手动选中文字复制', true);
    return;
  }
  b.disabled = true;
  try {
    await leadAct(act, id, card);
  } catch (err) { toast(err.message, true); }
  b.disabled = false;
  await loadLeads(true).catch(() => {});
}

async function leadAct(act, id, card) {
  const l = leadById(id);
  if (!l) return;
  const path = leadPath(id);
  if (act === 'open' || act === 'to-manual') {
    // 先复制：网页一打开，这个窗口就不在前台了，有的系统就不让复制了
    const ta = $('textarea[data-draft]', card);
    const copying = copyText(ta ? ta.value.trim() : l.draft);
    await saveDraft(id, card);
    if (act === 'to-manual') lv.manual.add(id);
    const r = await api(`${path}/open`, {});
    const copied = r.copied || (await copying);
    const url = safeUrl(r.url);
    if (!r.opened && url) window.open(url, '_blank', 'noopener');
    lv.opened.add(id);
    if (lv.tab === 'review') lv.stay.add(id);
    if (!url) toast(copied ? '回复已复制。这条没有原帖链接：去平台上找到这条帖子，粘贴发出后回来点「我已发出」' : '这条没有原帖链接，也没能自动复制：请在回复框里全选复制', !copied);
    else toast(copied ? '回复已复制，原帖已打开：在那边粘贴发出后，回来点「我已发出」' : '原帖已打开，但没能自动复制：请在回复框里全选复制', !copied);
    return;
  }
  if (act !== 'reply') await saveDraft(id, card);
  if (act === 'approve') {
    await api(path, { action: 'approve' });
    toast('已批准，放进「待发送」');
  } else if (act === 'approve-send' || act === 'send' || act === 'retry') {
    await sendIds([id], false);
  } else if (act === 'sent') {
    await api(`${path}/sent`, {});
    lv.opened.delete(id);
    lv.stay.delete(id);
    toast('已记为发出。对方回了的话，把回复贴到这条线索里（在「已发」里）');
  } else if (act === 'skip') {
    await api(path, { action: 'skip' });
    toast('已跳过');
  } else if (act === 'restore') {
    await api(path, { action: 'restore' });
    toast('已恢复到「待审核」');
  } else if (act === 'judge') {
    await api('/api/outreach/judge', { ids: [id] });
    toast('AI 正在判断这条');
  } else if (act === 'block') {
    if (!(await ask(`以后不再联系 ${whoOf(l)}（${pname(l.platform)}）？\n这条会跳过；以后导入时也会跳过这个人。`, { ok: '不再联系', danger: true }))) return;
    await api(path, { action: 'block' });
    toast('已加进不再联系名单');
  } else if (act === 'reply') {
    const text = ($('textarea[data-reply]', card)?.value || '').trim();
    if (!text) return toast('先把对方的回复贴进来');
    toast('AI 在看对方的回复…');
    const r = await api(`${path}/reply`, { text });
    delete lv.reply[id];
    const last = (r.replies || []).slice(-1)[0] || {};
    if (last.hot) toast(`🔥 热线索：${last.summary || '对方有兴趣'}`);
    else if (['stop', 'negative'].includes(last.intent)) toast('已记录。对方不感兴趣，已加进不再联系名单');
    else toast(`已记录${last.summary ? `：${last.summary}` : ''}`);
  }
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
// Key 和密码不回显：输入框空着，提示"已填写"；不改就空着，保存时不动它
const SECRET_HINTS = {
  github_token: '可选', youtube_api_key: '抓 YouTube 要填', x_bearer_token: '抓 X（推特）要填', anthropic_api_key: 'sk-ant- 开头',
  reddit_client_secret: '', reddit_password: '', x_api_key: '', x_api_secret: '', x_access_token: '', x_access_secret: '',
};
const SET_NUMS = ['sleep_sec', 'default_notes', 'default_comments', 'cap_reddit', 'cap_x', 'cap_youtube', 'cap_other', 'send_gap_sec', 'reply_check_min'];
const SET_TEXTS = ['xhs_sort', 'browser_path', 'proxy', 'appstore_country', 'reddit_subs', 'ai_model', 'product_name', 'product_pitch', 'product_link',
  'sender_identity', 'reply_style', 'send_mode_reddit', 'send_mode_x', 'reddit_client_id', 'reddit_username'];
const SEND_MODES = [['api', '批准后用官方接口自动发'], ['manual', '复制后我自己去发']];

function viewSettings(section) {
  const s = STATE.settings;
  const wiped = new Set();
  const secret = (k) => `<span class="secret"><input type="password" id="${k}" value="" autocomplete="off" placeholder="${s[k] ? '已填写' : esc(SECRET_HINTS[k])}">
    <button type="button" class="link small" data-wipe="${k}" ${s[k] ? '' : 'hidden'} title="删掉保存的这一项">清除</button></span>`;
  const text = (k, ph = '', max = 300) => `<input type="text" id="${k}" value="${esc(s[k])}" placeholder="${esc(ph)}" maxlength="${max}">`;
  const area = (k, ph, rows) => `<textarea id="${k}" rows="${rows}" maxlength="1000" placeholder="${esc(ph)}">${esc(s[k])}</textarea>`;
  const num = (k, max = 1000) => `<input type="number" id="${k}" min="0" max="${max}" value="${esc(s[k])}">`;
  const pick = (k, opts) => `<select id="${k}">${opts.map(([v, t]) => `<option value="${v}" ${s[k] === v ? 'selected' : ''}>${t}</option>`).join('')}</select>`;
  const tester = (id, label) => `<div class="row tester"><button type="button" data-test="${id}">${label}</button><span class="test-r" id="test-${id}-r"></span></div>`;
  main.innerHTML = `<div class="page"><div class="page-head sticky"><div><h1>设置</h1><div class="muted small">改完点右边的「保存」。Key 和密码只保存在这台电脑上。</div></div><button class="primary" id="save">保存</button></div>
  <section class="card"><h2>采集</h2><div class="form">
    <label>请求间隔</label><div><input type="number" id="sleep_sec" min="0" max="60" value="${s.sleep_sec}"> 秒<div class="help">每次请求之间至少等这么久。太快容易被平台要求验证或限流；2–5 秒比较稳。</div></div>
    <label>默认抓多少</label><div>每个关键词 <input type="number" id="default_notes" value="${s.default_notes}"> 条帖子，每条帖子 <input type="number" id="default_comments" value="${s.default_comments}"> 条评论</div>
    <label>小红书搜索排序</label><div>${pick('xhs_sort', [['general', '综合（推荐）'], ['popularity_descending', '最热'], ['time_descending', '最新']])}
      <div class="help">按最热排，搜出来多是高赞的推广帖和段子。</div></div>
    <label>浏览器</label><div>${text('browser_path', '空着就用 Chrome；用 Edge 等填可执行文件路径', 1000)}
      <div><label class="check" style="margin-top:8px"><input type="checkbox" id="connect_existing" ${s.connect_existing ? 'checked' : ''}> 用我日常 Chrome 的登录状态（要先按 MediaCrawler 文档开远程调试）</label></div></div>
  </div></section>
  <section class="card"><h2>网络和接口</h2><div class="form">
    <label>代理</label><div>${text('proxy', '例如 http://127.0.0.1:7890')}<div class="help">国外网站（Reddit、YouTube、X……）、AI 和发送账号都走这个代理。抓取时空着就用系统代理；AI 在国内一般要在这里填上。</div></div>
    <label>App Store 地区</label><div><input type="text" id="appstore_country" value="${esc(s.appstore_country)}" style="width:80px" maxlength="10"><div class="help">cn 中国，us 美国，jp 日本……</div></div>
    <label>Reddit 默认版块</label><div>${text('reddit_subs', '', 2000)}<div class="help">关键词前没写 r/版块名 时，在这些版块里搜。英文逗号分隔。</div></div>
  </div></section>
  <section class="card" id="sec-keys"><h2>抓取用的 Key</h2><div class="form">
    <label>GitHub Token</label><div>${secret('github_token')}<div class="help">不填每小时只能请求 60 次；填一个（不用勾任何权限）能到 5000 次。</div></div>
    <label>YouTube API key</label><div>${secret('youtube_api_key')}<div class="help">在 Google Cloud 控制台免费申请：新建项目 → 启用 YouTube Data API v3 → 凭据 → 创建 API 密钥。免费额度每天大约能搜 100 次。</div></div>
    <label>X Bearer Token</label><div>${secret('x_bearer_token')}<div class="help">在 developer.x.com 建一个应用后拿到。X API 按用量收费，每读一条推文都算钱；只能搜最近 7 天。</div></div>
  </div></section>
  <section class="card" id="sec-outreach"><h2>线索与回复</h2>
    <div class="muted small" style="margin-bottom:14px">AI 帮你从采集结果里挑出需要你产品的人、写好回复草稿；每一条都要你批准才会发。每天发多少、每个平台怎么发，都在这里由你自己定。</div>
    <div class="form">
    <label>Anthropic API key</label><div>${secret('anthropic_api_key')}${tester('ai', '测试 AI')}
      <div class="help">在 console.anthropic.com 申请，按用量付费。AI 判断、写回复、读回复都用它。国内要开代理：在上面「代理」里填。</div></div>
    <label>模型</label><div>${text('ai_model', 'claude-opus-5-5', 100)}<div class="help">一般不用改。</div></div>
    <label>产品名称</label><div>${text('product_name', '比如：浇水提醒')}</div>
    <label>一句话说明</label><div>${area('product_pitch', '做什么、解决什么问题、给谁用。比如：一个手机 App，按每盆植物提醒你什么时候该浇水，给总忘记浇水的上班族。', 3)}
      <div class="help">AI 只按这里写的介绍你的产品，不会编功能。写得越具体，判断越准。</div></div>
    <label>产品链接</label><div>${text('product_link', '可以空着')}<div class="help">每条回复里最多放一次。小红书、抖音、快手、B站、微博上不放链接（放了容易被折叠），只写产品名。</div></div>
    <label>你的身份</label><div>${text('sender_identity', '比如：我是浇水提醒的独立开发者')}<div class="help">会写进每条回复：每条都说明你是做这个产品的人，不假装路人或用户。</div></div>
    <label>额外要求</label><div>${area('reply_style', '可选。比如：语气轻松一点；不要用感叹号', 2)}</div>
    <label>每天上限</label><div><div class="caps">
        <label>Reddit ${num('cap_reddit')} 条</label><label>X ${num('cap_x')} 条</label><label>YouTube ${num('cap_youtube')} 条</label><label>其他平台 ${num('cap_other')} 条</label></div>
      <div class="help">每天最多发多少条，你自己定（0–1000）；0 = 不往这个平台发。你手动发的也算在里面。没有"每天至少要发多少"。</div></div>
    <label>发送方式</label><div><div class="caps"><label>Reddit ${pick('send_mode_reddit', SEND_MODES)}</label><label>X ${pick('send_mode_x', SEND_MODES)}</label></div>
      <div class="help">自动发：你点批准以后，软件用下面填的你自己的账号、通过官方接口发出去。选了自动发但还没填账号，也按"复制后自己去发"。其他平台（小红书、YouTube……）都是复制后自己去发。</div></div>
    <label>批量发送间隔</label><div>${num('send_gap_sec', 3600)} 秒<div class="help">批量发送时每条之间等这么久（还会随机多等一点）。发太快容易被平台当成刷屏。</div></div>
    <label>自动查回复</label><div>每隔 ${num('reply_check_min', 1440)} 分钟查一次<div class="help">软件开着时，用 Reddit / X 账号查谁回复了你。0 = 不自动查（线索页上可以点「查回复」）。</div></div>
  </div></section>
  <section class="card" id="sec-senders"><h2>发送账号（每个平台一个，就是你自己的）</h2>
    <div class="muted small" style="margin-bottom:14px">只有发送方式选了"自动发"才用得到。不填也行：那就复制后自己去发。</div>
    <div class="form">
    <div class="sub">Reddit</div>
    <div class="howto">在 reddit.com/prefs/apps 点「create another app」，类型选 <b>script</b>，redirect uri 填 http://localhost:8080。建好后，应用名下面那串字是 client id，secret 是 client secret。用户名、密码就是你登录 Reddit 用的（开了两步验证的账号用不了这种方式）。</div>
    <label>client id</label><div>${text('reddit_client_id', '', 100)}</div>
    <label>client secret</label><div>${secret('reddit_client_secret')}</div>
    <label>用户名</label><div>${text('reddit_username', '不带 u/', 100)}</div>
    <label>密码</label><div>${secret('reddit_password')}${tester('reddit', '测试 Reddit 账号')}</div>
    <div class="sub">X（推特）</div>
    <div class="howto">在 developer.x.com 建一个应用；在 User authentication settings 里把 App permissions 设成 <b>Read and write</b>；再到 Keys and tokens 里拿 API Key 和 Secret，生成 Access Token 和 Secret（改了权限要重新生成）。X API 按用量收费。</div>
    <label>API key</label><div>${secret('x_api_key')}</div>
    <label>API key secret</label><div>${secret('x_api_secret')}</div>
    <label>Access token</label><div>${secret('x_access_token')}</div>
    <label>Access token secret</label><div>${secret('x_access_secret')}${tester('x', '测试 X 账号')}</div>
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

  const save = async () => {
    const patch = { keyword_sets: sets, connect_existing: $('#connect_existing').checked };
    SET_NUMS.forEach((k) => { const v = $('#' + k).value.trim(); if (v !== '') patch[k] = +v; }); // 空着的数字不改
    SET_TEXTS.forEach((k) => { patch[k] = $('#' + k).value; });
    Object.keys(SECRET_HINTS).forEach((k) => {
      const v = $('#' + k).value;
      if (v.trim()) patch[k] = v;
      else if (wiped.has(k)) patch[k] = '';
    });
    STATE = await api('/api/settings', patch);
    draft.notes = null;
    wiped.clear();
    Object.keys(SECRET_HINTS).forEach((k) => {
      const filled = !!STATE.settings[k];
      $('#' + k).value = '';
      $('#' + k).placeholder = filled ? '已填写' : SECRET_HINTS[k];
      $(`[data-wipe="${k}"]`).hidden = !filled;
    });
    SET_NUMS.forEach((k) => { $('#' + k).value = STATE.settings[k]; }); // 超出范围的已经被改成上下限
  };
  $('#save').addEventListener('click', async () => {
    try { await save(); toast('已保存'); } catch (err) { toast(err.message, true); }
  });
  $('.page', main).addEventListener('click', async (e) => {
    const w = e.target.closest('[data-wipe]');
    if (w) {
      const k = w.dataset.wipe;
      wiped.add(k);
      w.hidden = true;
      $('#' + k).value = '';
      $('#' + k).placeholder = '保存后清除';
      return;
    }
    const t = e.target.closest('[data-test]');
    if (!t) return;
    const which = t.dataset.test;
    const out = $(`#test-${which}-r`);
    out.className = 'test-r';
    out.textContent = '先保存，再测试…';
    t.disabled = true;
    try {
      await save();
      const r = await api(which === 'ai' ? '/api/outreach/test-ai' : `/api/outreach/test/${which}`, {});
      out.className = `test-r ${r.ok ? 'ok' : 'bad'}`;
      out.textContent = r.message;
    } catch (err) {
      out.className = 'test-r bad';
      out.textContent = err.message;
    }
    t.disabled = false;
  });
  if (section) $(`#sec-${section}`)?.scrollIntoView({ block: 'start' });
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

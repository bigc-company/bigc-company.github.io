// bigC company 사장님 앱 · 설치형 6판 · cc82a8caac · _만들기.mjs 가 시안.html 과 _설치층.js 로 만든 파일(직접 고치지 말 것)
// bigC company 사장님 앱 · 설치형 층 (WO-029 5판 · WO-030 6판). 시안.html 의 앱 코드(같은 화면 · 같은 장면)에 얹는다.
// 이 층이 하는 일: PIN 화면 잠금(PBKDF2 해시로 저장) · 누른 상태 저장 · 「설정」 탭(판 · 업종 · 단계 · 예시 · 밝기 · 되돌리기 · 만들 수 있는지)
//   · 서비스 워커 등록 · 설치 안내 · (6판) 본부판 「오늘」 · 「손님」을 접수 서버(/app/*)에 잇기.
// PIN 은 화면 잠금일 뿐이다: 폰 안의 자료(예시 상태 · 서버에서 받은 문의 · 서버 토큰)를 암호화하지 않는다.
// 저장은 이 폰의 브라우저 저장소(localStorage)에만, 키 앞에 배포 경로를 붙여 같은 출처(쇼룸)의 다른 페이지와 나눈다.
(() => {
  const VER = "6"; // _만들기.mjs 가 판 번호로 바꾼다 (sw.js 캐시 이름과 같은 값)
  const CAN_ROWS = [["업종 · 단계 바꿔 보기","<span class=\"pill acc\">바로</span>","상담 자리에서 손님이 자기 업종의 단계를 눌러 보는 데모입니다. 납품하는 앱에는 계약한 단계만 들어가고, 잠긴 화면과 값은 나오지 않습니다.","없음"],["오늘 · 손님 진행판 · 지시 · 자료 (본부판)","<span class=\"pill acc\">바로</span>","쇼룸 문의가 들어오는 접수 서버(Cloudflare 무료)에 화면을 붙입니다. 텔레그램 받은함과 같은 길을 씁니다.","없음"],["PIN 잠금","<span class=\"pill acc\">바로</span>","폰에만 저장된 열쇠와 숫자 PIN을 함께 봅니다. 주소는 쇼룸과 나누고 검색에 걸리지 않게 합니다.","폰에서 첫 등록 한 번"],["끊겼을 때 보관 · 마지막 시각 · 되돌리기","<span class=\"pill acc\">바로</span>","누른 것은 폰에 모아 두었다가 연결되면 보냅니다. 끝낸 일은 알림의 「되돌리기」로 다시 꺼냅니다(보내기를 마친 일은 제외).","없음"],["오늘 할 일 접기 · 펼치기","<span class=\"pill acc\">바로</span>","누를 것이 넷 이상이면 줄마다 「왜」 한 줄만 보이고, 누르면 설명과 단추가 펼쳐집니다. 첫 줄의 단추는 늘 보입니다.","없음"],["고객 · 기사 · 호텔 · 대화방 · 본사에 보내는 글 (여행 · 골프 · 부동산 · 커뮤니티 · 공장)","<span class=\"pill wait\">조건</span>","앱은 글 · 견적서 이미지 · 안내 링크 · 답 링크 · 마감 보고를 준비하고, 보내기는 대표님 폰의 메신저 · 카톡 공유 창으로 합니다. 메신저 회사의 자동 발송 연결은 따로 확인합니다.","대표님 폰에 쓰시는 메신저"],["안내 링크 · 읽은 기록 (부동산 · 비자)","<span class=\"pill acc\">바로</span>","안내를 접수 서버의 한 장 주소로 올립니다. 고객별 링크는 누가 언제 읽었는지 남고, 단톡방 링크는 조회 수만 남습니다.","정리된 안내"],["밝음 · 어두움","<span class=\"pill acc\">바로</span>","폰 설정을 따릅니다.","없음"],["게시 승인 → 카톡 방에 올림 (본부판)","<span class=\"pill wait\">조건</span>","본부 PC가 켜져 있을 때만 실행됩니다. 꺼져 있으면 앱에 마지막 시각과 대기 건수가 남습니다.","본부 PC 켜 두기 · PC 카톡 로그인"],["올라간 화면 사진 돌려받기 (본부판)","<span class=\"pill wait\">조건</span>","PC가 올린 직후 그 방 화면을 찍어 보냅니다. 카톡 PC 화면 배치가 바뀌면 손봐야 합니다.","없음"],["새 문의 폰 알림","<span class=\"pill\">먼저 확인</span>","안드로이드 크롬 홈 화면 앱은 알림을 받을 수 있습니다. 실제 폰에서 한 번 시험해 봐야 합니다.","알림 허용"],["지문으로 열기","<span class=\"pill\">먼저 확인</span>","홈 화면 웹앱에서 지문 열쇠(패스키)가 폰 기종에서 되는지 봐야 합니다.","폰 기종 · 안드로이드 판 번호"]]; // 시안.html 「만들 수 있는지」 표 그대로 (_만들기.mjs 가 넣는다)
  // 쇼룸(bigc-company.github.io)과 출처를 나눠 쓴다 → 키 앞에 이 앱이 놓인 폴더 경로를 붙인다 (예: bigc@/a/x7k2/#pin)
  const BASE = 'bigc@' + location.pathname.slice(0, location.pathname.lastIndexOf('/') + 1) + '#';
  const KEY = { pin: BASE + 'pin', state: BASE + 'state', fail: BASE + 'fail', theme: BASE + 'theme', reset: BASE + 'reset',
    conn: BASE + 'conn', live: BASE + 'live', queue: BASE + 'queue' };
  const OLD = { pin: 'bigc5-pin', state: 'bigc5-state', fail: 'bigc5-fail', theme: 'bigc-app-theme' }; // 5판 키(경로 없음)
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* 저장소가 막힌 폰: 다음 실행에 처음부터 */ } },
  };
  // 5판 키가 남아 있으면 이 경로의 키로 한 번 옮기고 옛 키는 지운다 (PIN 은 옛 형식 그대로 옮겨, 다음에 맞게 열 때 새 형식으로)
  for (const k of Object.keys(OLD)) { const v = store.get(OLD[k]); if (v != null) { if (store.get(KEY[k]) == null) store.set(KEY[k], v); store.del(OLD[k]); } }

  // ---------- SHA-256 (5판 옛 형식 PIN 을 확인할 때만 쓴다) ----------
  function sha256(text) {
    const rr = (v, n) => (v >>> n) | (v << (32 - n));
    const H = [], K = []; let p = 2, c = 0;
    const prime = (n) => { for (let f = 2; f * f <= n; f++) if (n % f === 0) return false; return true; };
    while (c < 64) { if (prime(p)) { if (c < 8) H[c] = (Math.pow(p, 1 / 2) * 4294967296) | 0; K[c] = (Math.pow(p, 1 / 3) * 4294967296) | 0; c++; } p++; }
    const src = new TextEncoder().encode(text), len = src.length;
    const buf = new Uint8Array(((len + 9 + 63) >> 6) << 6); buf.set(src); buf[len] = 0x80;
    const dv = new DataView(buf.buffer); dv.setUint32(buf.length - 4, len * 8);
    const w = new Array(64);
    for (let i = 0; i < buf.length; i += 64) {
      for (let j = 0; j < 16; j++) w[j] = dv.getUint32(i + j * 4);
      for (let j = 16; j < 64; j++) {
        const s0 = rr(w[j - 15], 7) ^ rr(w[j - 15], 18) ^ (w[j - 15] >>> 3), s1 = rr(w[j - 2], 17) ^ rr(w[j - 2], 19) ^ (w[j - 2] >>> 10);
        w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
      }
      let [a, b, cc, d, e, f, g, h] = H;
      for (let j = 0; j < 64; j++) {
        const t1 = (h + (rr(e, 6) ^ rr(e, 11) ^ rr(e, 25)) + ((e & f) ^ (~e & g)) + K[j] + w[j]) | 0;
        const t2 = ((rr(a, 2) ^ rr(a, 13) ^ rr(a, 22)) + ((a & b) ^ (a & cc) ^ (b & cc))) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0; d = cc; cc = b; b = a; a = (t1 + t2) | 0;
      }
      H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + cc) | 0; H[3] = (H[3] + d) | 0;
      H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
    }
    return H.map((x) => (x >>> 0).toString(16).padStart(8, '0')).join('');
  }
  const randHex = () => { const a = new Uint8Array(16); try { crypto.getRandomValues(a); } catch (e) { for (let i = 0; i < 16; i++) a[i] = Math.floor(Math.random() * 256); } return [...a].map((x) => x.toString(16).padStart(2, '0')).join(''); };
  // ---------- PIN: PBKDF2-SHA256 · 21만 회 · 기기마다 무작위 소금 16바이트 (crypto.subtle — https · 127.0.0.1 에서 됨) ----------
  const ITER = 210000;
  const hexBytes = (h) => new Uint8Array(h.match(/../g).map((x) => parseInt(x, 16)));
  const canKdf = () => !!(window.crypto && crypto.subtle && window.isSecureContext !== false);
  async function kdf(pin, salt, it) {
    const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: hexBytes(salt), iterations: it }, k, 256);
    return [...new Uint8Array(bits)].map((x) => x.toString(16).padStart(2, '0')).join('');
  }
  const readPin = () => { try { const v = JSON.parse(store.get(KEY.pin)); return v && v.salt && v.h ? v : null; } catch (e) { return null; } };
  async function savePin(pin) {
    if (!canKdf()) return false;
    const salt = randHex();
    return store.set(KEY.pin, JSON.stringify({ kdf: 'pbkdf2-sha256', it: ITER, salt, h: await kdf(pin, salt, ITER), at: Date.now() }));
  }
  async function checkPin(pin) {
    const v = readPin(); if (!v) return false;
    if (v.kdf === 'pbkdf2-sha256') return canKdf() && (await kdf(pin, v.salt, +v.it || ITER)) === v.h;
    // 5판 옛 형식 SHA-256(소금:PIN): 맞으면 바로 새 형식으로 다시 저장한다
    if (sha256(v.salt + ':' + pin) !== v.h) return false;
    await savePin(pin);
    return true;
  }
  const readFail = () => { try { return JSON.parse(store.get(KEY.fail)) || { n: 0, until: 0 }; } catch (e) { return { n: 0, until: 0 }; } };
  const MAX_FAIL = 5, WAIT_MS = 30000;

  let api = null, S = null;
  let mode = 'enter', first = '', changing = false, busy = false, waitTimer = null, deferredInstall = null, swState = '확인 중', updated = false, confirmReset = false;
  const $ = (s) => document.querySelector(s);

  // ---------- 잠금 화면 ----------
  const ASK = { set1: '이 폰에서 쓸 PIN 네 자리를 정하십시오', set2: '확인을 위해 한 번 더 누르십시오', enter: 'PIN 네 자리를 누르십시오', old: '지금 쓰는 PIN을 누르십시오' };
  function say(text, tone) { const a = $('#ask'); a.textContent = text; a.dataset.tone = tone || ''; }
  function clearPin() { S.pin = ''; api.pinDots(); }
  function shake() { const d = $('#dots'); d.classList.remove('bad'); void d.offsetWidth; d.classList.add('bad'); if (navigator.vibrate) try { navigator.vibrate(60); } catch (e) { /* 진동 없는 폰 */ } }
  function lockStep(m) {
    mode = m; clearPin(); say(ASK[m]);
    $('#dots').classList.remove('ok');
    const has = !!readPin();
    $('#pinForget').hidden = !has || m === 'set1' || m === 'set2';
    $('#forgetBox').hidden = true; $('#keys').hidden = false; $('#dots').hidden = false;
    $('#lockFoot').textContent = has ? 'PIN은 화면 잠금입니다. 폰 안의 자료를 암호화하지는 않습니다.' : '처음 한 번 정하면 다음부터 이 PIN이 맞아야 열립니다.';
    if (m === 'enter') showWait();
  }
  function showWait() {
    clearTimeout(waitTimer);
    const left = readFail().until - Date.now();
    if (left > 0) { say(`${MAX_FAIL}번 틀렸습니다 · ${Math.ceil(left / 1000)}초 뒤에 다시 누르십시오`, 'stop'); waitTimer = setTimeout(showWait, 1000); }
    else if ($('#ask').dataset.tone === 'stop' && mode === 'enter') say(ASK.enter);
  }
  async function onFour() {
    const pin = S.pin;
    if (mode === 'set1') { first = pin; lockStep('set2'); return; }
    if (mode === 'set2') {
      if (pin === first) {
        first = '';
        if (!(await savePin(pin))) { lockStep('set1'); say(canKdf() ? '이 폰의 저장소가 막혀 PIN을 저장하지 못했습니다' : '이 주소에서는 PIN을 안전하게 저장할 수 없습니다 · https 주소로 여십시오', 'stop'); shake(); return; }
        store.del(KEY.fail); changing = false; mode = 'enter';
        api.unlock(); setTimeout(() => api.toast('PIN을 정했습니다. 다음부터 이 PIN이 맞아야 열립니다.'), 260);
      } else { first = ''; shake(); lockStep('set1'); say('두 번이 달랐습니다 · 처음부터 다시 정하십시오', 'stop'); }
      return;
    }
    // enter · old
    if (await checkPin(pin)) {
      store.del(KEY.fail);
      if (mode === 'old') { lockStep('set1'); say('새 PIN 네 자리를 정하십시오'); return; }
      api.unlock(); return;
    }
    const f = readFail(); f.n = (f.n || 0) + 1;
    if (f.n >= MAX_FAIL) { f.until = Date.now() + WAIT_MS; f.n = 0; }
    store.set(KEY.fail, JSON.stringify(f));
    shake(); clearPin();
    if (f.until > Date.now()) showWait(); else say(`PIN이 맞지 않습니다 · ${f.n} / ${MAX_FAIL}번`, 'stop');
  }
  function key(k) {
    if (busy || !$('#forgetBox').hidden) return;
    if (k === 'bio') { say('지문으로 열기는 준비 중입니다 · 지금은 PIN으로 여십시오'); return; }
    if (k === 'del') { S.pin = S.pin.slice(0, -1); api.pinDots(); return; }
    if ((mode === 'enter' || mode === 'old') && readFail().until > Date.now()) { showWait(); return; }
    if (S.pin.length >= 4) return;
    S.pin += k; api.pinDots();
    // 해시 계산(수백 ms) 동안은 다른 키를 받지 않는다
    if (S.pin.length === 4) { busy = true; setTimeout(() => { onFour().catch(() => { shake(); clearPin(); say('다시 누르십시오', 'stop'); }).finally(() => { busy = false; }); }, 140); }
  }
  function forgetAsk() { $('#dots').hidden = true; $('#forgetBox').hidden = false; $('#keys').hidden = true; $('#pinForget').hidden = true; say('PIN을 잊으셨습니까?'); }
  // PIN 을 잊으면 예시 상태와 함께 서버 토큰 · 받아 둔 문의 · 못 보낸 것도 지운다(다시 연결은 설정에서 토큰을 새로 붙여 넣기)
  function forgetYes() { wiping = true; clearTimeout(saveT); for (const k of ['pin', 'state', 'fail', 'conn', 'live', 'queue']) store.del(KEY[k]); location.reload(); }

  // ---------- 상태 저장 · 되살리기 ----------
  const SKIP_TOP = new Set(['pin', 'offline', 'queued', 'open']);
  const SKIP_KEY = (k) => k === 'timer' || k === 'deliver' || k === 'leave' || /Run$/.test(k);
  function snapshot() {
    const s = {}; for (const k of Object.keys(S)) if (!SKIP_TOP.has(k)) s[k] = S[k];
    return JSON.stringify({ v: VER, at: Date.now(), s }, (k, val) => (SKIP_KEY(k) ? undefined : val));
  }
  let saveT = null;
  let wiping = false; // 지우고 다시 열 때는 pagehide 저장이 지운 것을 되살리지 않게
  const saveNow = () => { clearTimeout(saveT); saveT = null; if (S && !wiping) store.set(KEY.state, snapshot()); };
  const saveSoon = () => { clearTimeout(saveT); saveT = setTimeout(saveNow, 250); };
  function restore() {
    let saved = null; try { saved = JSON.parse(store.get(KEY.state)); } catch (e) { saved = null; }
    if (!saved || !saved.s) return false;
    const s = saved.s;
    if (saved.v === VER) {
      for (const k of Object.keys(s)) S[k] = s[k];
      // 보내는 도중에 닫힌 것: 받은 것으로 마무리
      (S.talk || []).forEach((m) => { if (!m.no) { m.no = S.inbox++; m.st = '받음'; } });
      return 'all';
    }
    // 판이 바뀌면 고른 판 · 업종 · 예시 · 단계만 이어 쓴다(장면 구조가 바뀌었을 수 있어서)
    if (s.mode) S.mode = s.mode; if (s.biz && S.own[s.biz]) S.biz = s.biz;
    if (s.own) for (const k of Object.keys(S.own)) if (s.own[k] && s.own[k].lv) S.own[k].lv = s.own[k].lv;
    if (s.cv === 1) { S.cv = 1; S.own.community = api.mkCommunity(1, S.own.community.lv); }
    return 'prefs';
  }

  // ---------- 밝기 ----------
  const THEME_BG = { light: '#f3f5f5', dark: '#0b1012' };
  function applyTheme(v) {
    if (v === 'light' || v === 'dark') document.documentElement.setAttribute('data-theme', v); else document.documentElement.removeAttribute('data-theme');
    const dark = v === 'dark' || (v !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);
    document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', THEME_BG[dark ? 'dark' : 'light']));
  }
  const theme = () => store.get(KEY.theme) || 'auto';

  // ---------- 본부 서버 연결 (6판 · WO-030) ----------
  // conn = {url, token} 이 폰에만(PIN 과 따로). live = 마지막으로 맞춘 서버 값. queue = 끊겼을 때 누른 「답함」(연결되면 차례로 보냄).
  const readJ = (k) => { try { return JSON.parse(store.get(k)); } catch (e) { return null; } };
  let conn = readJ(KEY.conn); if (!conn || !conn.url || !conn.token) conn = null;
  let live = readJ(KEY.live); if (!live || !Array.isArray(live.items)) live = null;
  let queue = readJ(KEY.queue); if (!Array.isArray(queue)) queue = [];
  let net = 'idle';                 // idle · ok · down(닿지 않음) · denied(토큰 거절)
  let lastTry = 0, syncing = null, confirmOff = false, liveFilter = 'wait';
  const draft = { url: '', token: '', msg: '', tone: '', tested: null };
  const saveLive = () => store.set(KEY.live, JSON.stringify(live));
  const saveQueue = () => store.set(KEY.queue, JSON.stringify(queue));
  const liveOn = () => !!conn && S.mode === 'hq';
  const p2 = (n) => String(n).padStart(2, '0');
  const stamp = (ms) => { const d = new Date(ms); return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())} ${p2(d.getHours())}:${p2(d.getMinutes())}:${p2(d.getSeconds())}`; };
  const hhmm = (ms) => { if (!ms) return '--:--'; const d = new Date(ms), t = `${p2(d.getHours())}:${p2(d.getMinutes())}`; return stamp(ms).slice(0, 10) === stamp(Date.now()).slice(0, 10) ? t : `${d.getMonth() + 1}/${d.getDate()} ${t}`; };
  const ago = (ms) => { const m = Math.floor((Date.now() - ms) / 60000); return m < 1 ? '방금' : m < 60 ? `${m}분 전` : hhmm(ms); };
  const normUrl = (u) => { try { const x = new URL(String(u || '').trim()); if (x.protocol === 'https:' || (x.protocol === 'http:' && /^(127\.0\.0\.1|localhost)$/.test(x.hostname))) return x.origin; } catch (e) { /* 모양이 틀림 */ } return ''; };

  async function call(c, method, p, body) {
    const ac = new AbortController(), t = setTimeout(() => ac.abort(), 8000);
    try {
      const r = await fetch(c.url + p, { method, headers: { authorization: 'Bearer ' + c.token, ...(body ? { 'content-type': 'application/json' } : {}) },
        body: body ? JSON.stringify(body) : undefined, signal: ac.signal, cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer' });
      let j = null; try { j = await r.json(); } catch (e) { j = null; }
      return { status: r.status, j };
    } catch (e) { return { status: 0, j: null }; } finally { clearTimeout(t); }  // 닿지 않음 · 시간 넘김 · CORS 거절은 브라우저가 같은 모양으로 준다
  }
  async function flush(c) {
    while (queue.length && conn === c) {
      const q = queue[0], r = await call(c, 'POST', '/app/ack', { id: q.id, done: q.done });
      if (r.status === 200 || r.status === 400) { queue.shift(); saveQueue(); continue; }  // 400 = 모양이 틀린 것: 다시 보내도 같다
      return r.status === 401 ? 'denied' : 'down';
    }
    return 'ok';
  }
  function sync(why) {
    if (!conn) return Promise.resolve();
    if (syncing) return syncing;
    const c = conn, was = net; lastTry = Date.now();
    syncing = (async () => {
      let st = await flush(c);
      if (st === 'ok') {
        const [a, b] = await Promise.all([call(c, 'GET', '/app/today'), call(c, 'GET', '/app/inquiries')]);
        if (a.status === 401 || b.status === 401) st = 'denied';
        else if (a.status === 200 && b.status === 200 && a.j && b.j && Array.isArray(b.j.items)) {
          if (conn === c) { live = { at: Date.now(), today: a.j, items: b.j.items }; saveLive(); }
        } else st = 'down';
      }
      if (conn !== c) return;  // 맞추는 동안 연결을 끊었다
      net = st;
      if (why === 'manual') api.toast(st === 'ok' ? `맞췄습니다 · ${hhmm(live.at)}` : st === 'denied' ? '서버가 이 폰의 토큰을 받지 않습니다. 설정에서 다시 연결하십시오.' : '서버에 닿지 않습니다. 마지막에 맞춘 값을 보여 드립니다.');
      else if (st === 'ok' && (was === 'down' || was === 'denied')) api.toast('다시 연결됐습니다. 모아 둔 것을 보냈습니다.');
      redraw();
    })().finally(() => { syncing = null; if (conn === c && net === 'ok' && queue.length) setTimeout(() => sync(), 0); });  // 맞추는 동안 누른 것
    return syncing;
  }
  function redraw() {
    if (!api || api.app.classList.contains('locked')) return;
    if (S.mode === 'hq' || S.tab === 'set') api.render();
  }
  // 서버 값 + 아직 못 보낸 「답함」을 겹친 목록
  function items() {
    const list = (live ? live.items : []).map((x) => ({ ...x }));
    for (const q of queue) { const x = list.find((y) => y.id === q.id); if (x) x.ack = q.done ? q.at : null; }
    return list;
  }
  const titleOf = (x) => [x.trade, x.stage, x.price].filter(Boolean).join(' · ') || '업종을 적지 않은 문의';
  const snip = (t, n = 64) => { const s = String(t || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n) + '…' : s; };
  const dateLabel = () => { const d = new Date(); return `${d.getMonth() + 1}월 ${d.getDate()}일 ${'일월화수목금토'[d.getDay()]}`; };
  function livePill() {
    const at = live && live.at;
    if (net === 'down') return `<button class="pc off" data-a="csync" aria-label="지금 맞추기"><i></i>끊김 · ${at ? hhmm(at) + ' 맞춤' : '아직 못 맞춤'} ${api.I.chev}</button>`;
    if (net === 'denied') return `<button class="pc off" data-a="csync" aria-label="지금 맞추기"><i></i>거절 · ${at ? hhmm(at) + ' 맞춤' : '아직 못 맞춤'} ${api.I.chev}</button>`;
    if (!at) return `<button class="pc off" data-a="csync" aria-label="지금 맞추기"><i></i>맞추는 중 ${api.I.chev}</button>`;
    return `<button class="pc" data-a="csync" aria-label="지금 맞추기"><i></i>서버 · ${ago(at)} ${api.I.chev}</button>`;
  }
  function liveBand() {
    if (!liveOn()) return;
    // 「오늘」 탭 숫자도 서버 값(답할 문의)으로 — 시안의 숫자는 예시 할 일 수다
    const tb = $('#tabs [data-t="today"]');
    if (tb && live) { const n = items().filter((x) => !x.ack).length; let bd = tb.querySelector('.bd'); if (!n) { if (bd) bd.remove(); } else { if (!bd) { bd = document.createElement('span'); bd.className = 'bd'; tb.appendChild(bd); } bd.textContent = n; } }
    else if (tb && tb.querySelector('.bd')) tb.querySelector('.bd').remove();
    if (net !== 'down' && net !== 'denied') return;
    const band = $('#band'); band.hidden = false;
    band.innerHTML = net === 'denied' ? '<b>거절</b><span>서버가 이 폰의 토큰을 받지 않습니다. 설정에서 다시 연결하십시오.</span>'
      : queue.length ? `<b>끊김</b><span>누른 것 ${queue.length}건을 폰에 모아 두었습니다. 연결되면 보냅니다.</span>`
        : `<b>끊김</b><span>${live ? hhmm(live.at) + '에 맞춘 값을 보여 드립니다.' : '아직 서버 값을 받지 못했습니다.'} 연결되면 다시 맞춥니다.</span>`;
  }
  const noLive = () => `<div class="grp"><div class="row"><div class="m"><div class="t">${net === 'denied' ? '서버가 이 폰의 토큰을 받지 않습니다' : net === 'down' ? '서버에 닿지 않습니다' : '서버에서 받아 오는 중입니다'}</div>
    <div class="s">${net === 'idle' ? '잠시 뒤 문의가 보입니다.' : '설정 → 본부 서버 연결에서 주소와 토큰을 확인하십시오. 연결을 끊으면 예시로 돌아갑니다.'}</div>
    <div class="acts"><button class="btn q" data-a="csync">다시 맞추기</button><button class="btn" data-a="tab" data-t="set">설정</button></div></div></div></div>`;
  function vLiveToday() {
    const head = `<div class="pad"><div class="hd"><span class="d">${dateLabel()}</span>${livePill()}</div>`;
    if (!live) return head + noLive() + '</div>';
    const its = items(), wait = its.filter((x) => !x.ack), done = its.length - wait.length, t = live.today || {}, o = t.orders || {};
    const day = stamp(Date.now()).slice(0, 10), acked = its.filter((x) => x.ack && String(x.ack).slice(0, 10) === day);
    const shown = wait.slice(0, 8);
    return head + `<div class="hero"><div class="lab"><span>답할 문의</span><span class="num">${done}/${its.length}</span></div>
      <span class="big num" id="big">${wait.length}</span>${wait.length === 0 ? '<p class="zero">답할 문의가 없습니다</p>' : ''}
      ${its.length && its.length <= 12 ? `<div class="segs">${its.map((_, i) => `<i class="${i < done ? 'done' : ''}"></i>`).join('')}</div>` : ''}</div>
      ${shown.length ? `<div class="grp">${shown.map((x, i) => `<div class="row" id="row-${api.esc(x.id)}"><div class="m"><div class="kind">새 문의 · ${api.esc(String(x.at || '').slice(5, 16))}</div>
        <div class="t">${api.esc(titleOf(x))}</div><div class="s">${api.esc(snip(x.text))}</div>
        <div class="acts"><button class="btn ${i === 0 ? 'p' : 'q'}" data-a="lopen" data-id="${api.esc(x.id)}">문의 보기</button><button class="btn" data-a="lack" data-id="${api.esc(x.id)}">답함</button></div></div></div>`).join('')}</div>` : ''}
      ${wait.length > shown.length ? `<p class="resp">외 ${wait.length - shown.length}건은 손님 탭에 있습니다.</p>` : ''}
      <div class="sec"><span>지시</span></div>
      <div class="grp"><div class="row"><div class="m"><div class="t">오늘 보낸 지시 ${+o.today || 0}건</div><div class="s">텔레그램 받은함 마지막 #${+o.last || 0} · 지시 탭은 아직 예시입니다</div></div></div></div>
      ${acked.length ? `<div class="sec"><span>오늘 답함</span><span class="num">${acked.length}</span></div><div class="grp">${acked.map((x) => `<button class="row" data-a="lopen" data-id="${api.esc(x.id)}"><span class="num" style="width:46px;flex:none;font-weight:700">${api.esc(String(x.ack).slice(11, 16))}</span><div class="m"><div class="s" style="margin:0;color:var(--ink)">${api.esc(titleOf(x))}</div></div>${api.I.chev}</button>`).join('')}</div>` : ''}
      <p class="resp">서버 값 · ${hhmm(live.at)} 맞춤${t.inquiries && t.inquiries.more ? ' · 최근 50건까지' : ''}. 돈 · 게시 · 자료 · 지시 탭은 아직 예시입니다.</p></div>`;
  }
  function vLiveClients() {
    const head = (n) => `<div class="pad"><div class="hd"><h2 class="title">손님</h2>${live ? `<span class="d">서버 문의 <b class="num" style="color:var(--ink)">${n}</b>건</span>` : livePill()}</div>`;
    if (!live) return head(0) + noLive() + '</div>';
    const its = items(), wait = its.filter((x) => !x.ack);
    const list = liveFilter === 'wait' ? wait : liveFilter === 'done' ? its.filter((x) => x.ack) : its;
    const chip = (v, l, n) => `<button class="chip" data-a="lfilter" data-v="${v}" aria-pressed="${liveFilter === v}">${l} <b>${n}</b></button>`;
    return head(its.length) + `<div class="chips" role="group" aria-label="답 여부">${chip('wait', '답 기다림', wait.length)}${chip('done', '답함', its.length - wait.length)}${chip('all', '전체', its.length)}</div>
      <div class="grp">${list.length ? list.map((x) => `<button class="row" data-a="lopen" data-id="${api.esc(x.id)}"><div class="m">
          <div class="t">${api.esc(x.trade || '문의')} <span class="pill ${x.ack ? 'acc' : 'wait'}">${x.ack ? '답함' : '기다림'}</span></div>
          <div class="s">${api.esc(String(x.at || '').slice(5, 16))} · ${api.esc(snip(x.text, 40))}</div></div>${api.I.chev}</button>`).join('')
        : `<div class="row"><div class="m"><div class="t">${liveFilter === 'wait' ? '답할 문의가 없습니다' : '여기에 들어갈 문의가 없습니다'}</div><div class="s">다른 칸을 누르거나 전체로 보십시오.</div></div></div>`}</div>
      <p class="resp">쇼룸 문의 창으로 들어온 문의입니다(최근 50건). 상담 다음 단계(상담 · 시안 · 견적 …)는 아직 예시 판에만 있습니다.</p></div>`;
  }
  function inqSheet(x) {
    const line = (k, v) => (v ? `<div class="row"><div class="m"><div class="s" style="margin:0">${k}</div><div class="t">${api.esc(v)}</div></div></div>` : '');
    return `<h4>${api.esc(titleOf(x))}</h4><p class="sub">${api.esc(x.at || '')} 마닐라 · ${api.esc(x.from || '쇼룸 문의 창')}</p>
      <p class="quote">${api.esc(x.text || '').replace(/\n/g, '<br>')}${x.cut ? '<br>… (앞 1,000자만 받았습니다)' : ''}</p>
      <div class="grp">${line('연락처', x.reply)}${line('원하는 것', x.want)}${line('답함', x.ack)}</div>
      <div class="acts"><button class="btn p" data-a="lcopy" data-id="${api.esc(x.id)}">연락처 복사</button><button class="btn" data-a="lack" data-id="${api.esc(x.id)}">${x.ack ? '답함 취소' : '답함'}</button></div>`;
  }
  function connBlock() {
    const pill = net === 'ok' ? '<span class="pill acc">연결</span>' : net === 'down' ? '<span class="pill wait">끊김</span>' : net === 'denied' ? '<span class="pill stop">거절</span>' : '<span class="pill wait">맞추는 중</span>';
    const note = '<div class="row"><div class="m"><div class="s">토큰은 이 폰에만, PIN과 따로 저장됩니다. PIN은 화면 잠금이라 폰 안의 자료(받아 둔 문의 · 토큰)를 암호화하지 않습니다. 손님 실제 장부를 넣는 판부터는 서버 로그인(패스키)을 더합니다.</div></div></div>';
    if (conn) return `<div class="sec"><span>본부 서버 연결</span><span>본부판 오늘 · 손님</span></div><div class="grp">
      <div class="row"><div class="m"><div class="t">연결됨 · ${api.esc(new URL(conn.url).host)}</div>
        <div class="s">마지막 맞춤 ${live ? hhmm(live.at) : '아직 없음'}${queue.length ? ` · 보내지 못한 것 ${queue.length}건` : ''}</div>
        ${confirmOff ? `<div class="s" style="color:var(--ink)">이 폰에서 토큰과 받아 둔 문의를 지우고 예시로 돌아갑니다.${queue.length ? ` 보내지 못한 ${queue.length}건도 지워집니다.` : ''}</div>
        <div class="acts"><button class="btn p" data-a="coffok">끊고 예시로</button><button class="btn" data-a="coffno">취소</button></div>`
        : '<div class="acts"><button class="btn q" data-a="csync">지금 맞추기</button><button class="btn" data-a="coff">연결 끊고 예시로</button></div>'}</div>${pill}</div>${note}</div>`;
    return `<div class="sec"><span>본부 서버 연결</span><span>지금은 예시</span></div><div class="grp">
      <div class="row"><div class="m"><div class="t">서버 주소 · 토큰</div><div class="s">본부가 드린 주소와 토큰을 붙여 넣고 「시험」을 누르십시오. 연결 전에는 예시가 보입니다.</div>
        <label class="search cin"><input id="cUrl" type="url" inputmode="url" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="https://…workers.dev" aria-label="서버 주소" value="${api.esc(draft.url)}"></label>
        <label class="search cin"><input id="cTok" type="password" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="토큰 붙여 넣기" aria-label="토큰" value="${api.esc(draft.token)}"></label>
        ${draft.msg ? `<div class="s cmsg" data-tone="${draft.tone}" role="status">${api.esc(draft.msg)}</div>` : ''}
        <div class="acts"><button class="btn ${draft.tested ? '' : 'p'}" data-a="ctest">시험</button>${draft.tested ? '<button class="btn p" data-a="csave">저장하고 연결</button>' : ''}</div></div></div>${note}</div>`;
  }
  const readDraft = () => { const u = $('#cUrl'), t = $('#cTok'); if (u) draft.url = u.value; if (t) draft.token = t.value; };
  const connActions = {
    ctest: async () => {
      readDraft(); draft.tested = null;
      const url = normUrl(draft.url), token = draft.token.trim();
      if (!url) { draft.msg = '주소 모양이 다릅니다 · https:// 로 시작하는 주소를 붙여 넣으십시오'; draft.tone = 'stop'; api.render(); return; }
      if (token.length < 24) { draft.msg = '토큰이 짧습니다 · 본부가 드린 값을 통째로 붙여 넣으십시오'; draft.tone = 'stop'; api.render(); return; }
      draft.msg = '시험 중입니다…'; draft.tone = ''; api.render();
      const r = await call({ url, token }, 'GET', '/app/today');
      if (r.status === 200 && r.j && r.j.inquiries) { draft.tested = { url, token }; draft.msg = `연결됩니다 · 답할 문의 ${r.j.inquiries.waiting}건 · 「저장하고 연결」을 누르십시오`; draft.tone = 'ok'; }
      else if (r.status === 401) { draft.msg = '토큰이 맞지 않습니다 · 본부에 새 토큰을 받으십시오'; draft.tone = 'stop'; }
      else if (r.status === 0) { draft.msg = '서버에 닿지 않습니다 · 주소와 인터넷을 확인하십시오(서버가 이 앱 주소를 받지 않을 때도 이렇게 보입니다)'; draft.tone = 'stop'; }
      else { draft.msg = `서버가 ${r.status}으로 답했습니다 · 본부에 알려 주십시오`; draft.tone = 'stop'; }
      if (S.tab === 'set') api.render();
    },
    csave: () => {
      readDraft();
      const t = draft.tested;
      if (!t || t.url !== normUrl(draft.url) || t.token !== draft.token.trim()) { draft.tested = null; draft.msg = '시험한 뒤 값이 바뀌었습니다 · 다시 시험하십시오'; draft.tone = 'stop'; api.render(); return; }
      conn = { url: t.url, token: t.token, at: Date.now() };
      if (!store.set(KEY.conn, JSON.stringify(conn))) { conn = null; draft.msg = '이 폰의 저장소가 막혀 저장하지 못했습니다'; draft.tone = 'stop'; api.render(); return; }
      draft.url = ''; draft.token = ''; draft.msg = ''; draft.tested = null; live = null; queue = []; saveQueue(); store.del(KEY.live); net = 'idle';
      api.render(); api.toast('연결했습니다. 본부판 오늘 · 손님이 서버 값으로 바뀝니다.');
      sync();
    },
    csync: () => { if (conn) sync('manual'); },
    coff: () => { confirmOff = true; api.render(); },
    coffno: () => { confirmOff = false; api.render(); },
    coffok: () => {
      confirmOff = false; conn = null; live = null; queue = []; net = 'idle';
      for (const k of ['conn', 'live', 'queue']) store.del(KEY[k]);
      api.render(); api.toast('연결을 끊었습니다. 본부판이 예시로 돌아갔습니다.');
    },
    lfilter: (b) => { liveFilter = b.dataset.v; api.render(); },
    lopen: (b) => { const x = items().find((y) => y.id === b.dataset.id); if (x) api.openSheet(inqSheet(x)); },
    lcopy: (b) => {
      const x = items().find((y) => y.id === b.dataset.id); if (!x) return;
      try { navigator.clipboard && navigator.clipboard.writeText(x.reply).catch(() => {}); } catch (e) { /* 복사 막힌 폰 */ }
      api.toast('연락처를 복사했습니다.');
    },
    lack: (b) => {
      const id = b.dataset.id, x = items().find((y) => y.id === id); if (!x || !conn) return;
      const done = !x.ack;
      queue = queue.filter((q) => q.id !== id); queue.push({ id, done, at: stamp(Date.now()) }); saveQueue();
      api.closeSheet(); api.render();
      api.toast(net === 'ok' ? (done ? '답함으로 표시했습니다.' : '답함을 취소했습니다.') : (done ? '답함을 폰에 모아 두었습니다. 연결되면 보냅니다.' : '취소를 폰에 모아 두었습니다. 연결되면 보냅니다.'));
      sync();
    },
  };

  // ---------- 설정 화면 ----------
  const IC_SET = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6 6l1.6 1.6M16.4 16.4 18 18M6 18l1.6-1.6M16.4 7.6 18 6"/></svg>';
  const BIZ_KEYS = ['mart', 'food', 'golf', 'agent', 'factory', 'community'];
  const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const seg = (cls, act, items, cur) => `<div class="seg ${cls}" role="group">${items.map(([v, l]) => `<button data-a="${act}" data-v="${v}" aria-pressed="${String(v) === String(cur)}">${l}</button>`).join('')}</div>`;
  function installBlock() {
    if (standalone()) return '<div class="row"><div class="m"><div class="t">홈 화면 앱으로 열려 있습니다</div><div class="s">주소창 없이 전체 화면으로 열립니다</div></div><span class="pill acc">설치됨</span></div>';
    if (deferredInstall) return '<div class="row"><div class="m"><div class="t">홈 화면에 설치</div><div class="s">설치하면 아이콘을 눌러 바로 앱으로 엽니다</div><div class="acts"><button class="btn p" data-a="install">홈 화면에 설치</button></div></div></div>';
    if (isIOS()) return '<div class="row"><div class="m"><div class="t">홈 화면에 추가 · 아이폰</div><div class="s">사파리 아래쪽 공유 단추 → 「홈 화면에 추가」를 누르십시오</div></div></div>';
    return '<div class="row"><div class="m"><div class="t">홈 화면에 추가</div><div class="s">크롬 오른쪽 위 메뉴 → 「홈 화면에 추가」 또는 「앱 설치」를 누르십시오</div></div></div>';
  }
  function setView() {
    const own = S.mode !== 'hq', b = api.B(), o = own ? api.O() : null;
    const canRows = CAN_ROWS.map(([f, pill, why, prep]) => `<div class="row"><div class="m"><div class="t">${f}</div><div class="s">${why}</div>${prep && prep !== '없음' ? `<div class="s">준비물 · ${prep}</div>` : ''}</div>${pill}</div>`).join('');
    const steps = own ? b.steps.map((s, i) => `<div class="row"><div class="m"><div class="kind">${i + 1}단계</div><div class="t">${api.esc(s.name)}</div><div class="s num">${api.esc(api.stepVal(s))}${s.mo ? ` · 선택 월 관리 ${api.esc(s.mo)}` : ''}</div><div class="s">${s.feats.map(([f, c]) => `${api.esc(f)} <span class="pill ${api.CAN[c][1]}">${api.CAN[c][0]}</span>`).join(' · ')}</div></div></div>`).join('') : '';
    return `<div class="pad set"><div class="hd"><h2 class="title">설정</h2><span class="d">bigC company · ${VER}판</span></div>
      <p class="resp" style="margin-top:0">앱 안의 가게 이름 · 사람 이름 · 숫자 · 글은 모두 예시입니다. 누른 것은 이 폰에만 남습니다.</p>
      <div class="sec"><span>판</span></div>
      ${seg('', 'smode', [['owner', '사장님판'], ['hq', '본부판']], S.mode)}
      ${own ? `<div class="sec"><span>업종</span><span>${api.esc(b.label)}</span></div>
      <div class="sgrid" role="group" aria-label="업종">${BIZ_KEYS.map((k) => `<button class="chip" data-a="sbiz" data-v="${k}" aria-pressed="${S.biz === k}">${api.esc(api.BIZ[k].label)}</button>`).join('')}</div>
      ${S.biz === 'community' ? `<div class="sec"><span>커뮤니티 예시 · 단계와 값은 같습니다</span></div>${seg('', 'scv', api.CV.map((v, i) => [i, v.label]), S.cv)}` : ''}
      <div class="sec"><span>단계 · 고른 단계까지 켜집니다</span></div>
      <div class="lvs" role="group" aria-label="단계">${b.steps.map((s, i) => `<button data-a="slv" data-v="${i + 1}" class="${i + 1 <= o.lv ? 'on' : ''}" aria-pressed="${i + 1 === o.lv}"><b>${i + 1}</b><span>${api.esc(s.name)}</span></button>`).join('')}</div>` : ''}
      ${own ? '' : connBlock()}
      <div class="sec"><span>화면 밝기</span></div>
      ${seg('s3', 'stheme', [['auto', '자동'], ['light', '밝게'], ['dark', '어둡게']], theme())}
      <div class="sec"><span>잠금</span></div>
      <div class="grp">
        <div class="row"><div class="m"><div class="t">PIN 네 자리 · 화면 잠금</div><div class="s">PIN은 이 폰에만, 되돌려 풀기 어렵게 만든 값(PBKDF2)으로 저장됩니다 · ${MAX_FAIL}번 틀리면 30초 멈춤 · 3분 넘게 다른 앱에 있다 오면 다시 잠금</div><div class="s">화면만 잠급니다. 폰 안의 자료는 암호화하지 않습니다.</div><div class="acts"><button class="btn q" data-a="slock">지금 잠그기</button><button class="btn" data-a="spin">PIN 바꾸기</button></div></div></div>
        <div class="row"><div class="m"><div class="t">지문으로 열기</div><div class="s">홈 화면 웹앱에서 지문 열쇠가 폰 기종마다 되는지 먼저 확인합니다</div></div><span class="pill wait">준비 중</span></div>
      </div>
      <div class="sec"><span>이 폰에 설치</span></div>
      <div class="grp">${installBlock()}
        <div class="row"><div class="m"><div class="t">인터넷 없이 열기</div><div class="s">${swState === '준비됨' ? '한 번 열어 둔 뒤에는 인터넷이 끊겨도 열립니다' : swState === '안 됨' ? '이 브라우저에서는 오프라인 보관을 쓸 수 없습니다' : '처음 열 때 화면을 폰에 담는 중입니다'}${updated ? ' · 새 판을 받았습니다, 다음에 열 때 바뀝니다' : ''}</div></div><span class="pill ${swState === '준비됨' ? 'acc' : swState === '안 됨' ? 'stop' : 'wait'}">${swState}</span></div>
      </div>
      <div class="sec"><span>예시 데이터</span></div>
      <div class="grp"><div class="row"><div class="m"><div class="t">예시로 되돌리기</div><div class="s">끝낸 일 · 고른 판 · 업종 · 단계가 처음으로 돌아갑니다. PIN은 그대로입니다.</div>
        ${confirmReset ? '<div class="acts"><button class="btn p" data-a="sresetok">되돌리기</button><button class="btn" data-a="sresetno">취소</button></div>' : '<div class="acts"><button class="btn" data-a="sreset">예시로 되돌리기</button></div>'}</div></div></div>
      <div class="sec"><span>만들 수 있는지</span><span>바로 · 조건 · 먼저 확인</span></div>
      <p class="resp" style="margin:0 2px 8px">지금 돌아가는 접수 서버 위에 휴대폰 홈 화면 웹앱으로 얹는 기준입니다. 새 계정 · 새 결제는 없습니다.</p>
      <div class="grp">${canRows}</div>
      ${own ? `<div class="sec"><span>${api.esc(b.label)} · 단계 기능과 값</span><span>정가 · 시범가</span></div>
      <div class="grp">${steps}</div>
      <p class="resp">기능은 ${api.esc(b.src)}의 단계 그대로입니다. 값은 정가 · 첫 다섯 곳 시범가(사용 후기 조건)입니다.${b.conf ? ' 값은 현장 상담 후 확정합니다.' : ''}${b.foot ? ' ' + api.esc(b.foot) : ''}${b.resp ? ' ' + api.esc(b.resp) : ''}</p>` : ''}
      <p class="resp" style="text-align:center;margin-top:22px">bigC company</p></div>`;
  }
  const actions = {
    smode: (b) => { confirmReset = false; api.setMode(b.dataset.v); S.tab = 'set'; api.render(); },
    sbiz: (b) => { confirmReset = false; api.setBiz(b.dataset.v); S.tab = 'set'; api.render(); },
    scv: (b) => { api.setCv(+b.dataset.v); api.render(); },
    slv: (b) => { const n = +b.dataset.v, o = api.O(), up = n > o.lv; o.lv = n; api.render(); api.toast(`${n}단계 「${api.st(n).name}」까지 켰습니다.${up ? ' 새로 열린 기능이 더해졌습니다.' : ' 그다음 단계는 잠깁니다.'}`); },
    stheme: (b) => { store.set(KEY.theme, b.dataset.v); applyTheme(b.dataset.v); api.render(); },
    slock: () => { saveNow(); api.lock(); },
    spin: () => { saveNow(); changing = true; api.lock(); },
    sreset: () => { confirmReset = true; api.render(); },
    sresetno: () => { confirmReset = false; api.render(); },
    sresetok: () => { wiping = true; clearTimeout(saveT); store.del(KEY.state); try { sessionStorage.setItem(KEY.reset, '1'); } catch (e) { /* 알림만 빠진다 */ } location.reload(); },
    install: () => { if (!deferredInstall) return; const ev = deferredInstall; deferredInstall = null; ev.prompt(); ev.userChoice.finally(() => api.render()); },
    ...connActions,
  };
  { const sm = actions.smode; actions.smode = (b) => { sm(b); if (S.mode === 'hq' && conn && Date.now() - lastTry > 60000) sync(); }; }

  window.__bigcHook = {
    views: {
      set: setView,
      // 연결돼 있으면 본부판 「오늘」 · 「손님」만 서버 값으로. 아니면 undefined → 시안의 예시 화면
      get today() { return liveOn() ? vLiveToday : undefined; },
      get clients() { return liveOn() ? vLiveClients : undefined; },
    },
    actions,
    tab: () => `<button class="tab" role="tab" data-a="tab" data-t="set" aria-selected="${S.tab === 'set'}" aria-label="설정">${IC_SET}<span>설정</span></button>`,
    key,
    after: () => { saveSoon(); liveBand(); },
    onLock: () => { lockStep(!readPin() ? 'set1' : changing ? 'old' : 'enter'); },
    init(a) {
      api = a; S = a.S;
      const how = restore();
      // 되살린 판 · 업종 · 예시로 맞춘다 (바깥 단추가 없는 설치형이라 상태만 맞추면 된다)
      a.app.dataset.mode = S.mode;
      applyTheme(theme());
      matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => applyTheme(theme()));
      S.tab = 'today';
      (S.posts || []).filter((p) => p.state === 'run').forEach((p) => a.advance(p));
      $('#pinForget').addEventListener('click', forgetAsk);
      $('#forgetYes').addEventListener('click', forgetYes);
      $('#forgetNo').addEventListener('click', () => lockStep(mode === 'old' ? 'old' : 'enter'));
      let reset = false; try { reset = sessionStorage.getItem(KEY.reset) === '1'; sessionStorage.removeItem(KEY.reset); } catch (e) { reset = false; }
      if (reset) setTimeout(() => a.toast('예시로 되돌렸습니다.'), 600);
      window.__bigcRestored = how;
      if (conn) sync();
    },
  };

  // 연결: 5분마다(앱이 보이고 · 열려 있고 · 본부판일 때) · 돌아왔을 때 · 인터넷이 다시 잡혔을 때 맞춘다. 1분마다 「n분 전」을 고친다.
  const opened = () => api && !api.app.classList.contains('locked') && !document.hidden;
  setInterval(() => {
    if (!conn || !opened() || S.mode !== 'hq') return;
    if (Date.now() - lastTry > 5 * 60000) sync();
    else if ((S.tab === 'today' || S.tab === 'clients') && !document.querySelector('.sheet.on')) api.render();
  }, 60000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && conn && Date.now() - lastTry > 60000) sync(); });
  addEventListener('online', () => { if (conn) sync(); });
  addEventListener('offline', () => { if (conn) { net = 'down'; redraw(); } });

  // 3분 넘게 다른 앱에 있다 오면 다시 잠근다 · 숨겨질 때 바로 저장
  let hiddenAt = 0;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { hiddenAt = Date.now(); saveNow(); return; }
    if (api && hiddenAt && Date.now() - hiddenAt > 180000 && !api.app.classList.contains('locked')) api.lock();
  });
  addEventListener('pagehide', saveNow);
  window.__bigcInstall = { sha256, saveNow, setHiddenAt: (t) => { hiddenAt = t; }, KEY, ITER, // 점검용 (토큰 값은 내놓지 않는다)
    link: () => ({ on: !!conn, net, queued: queue.length, at: live && live.at, items: live ? live.items.length : 0 }), sync: () => sync() };

  // 설치 · 오프라인
  addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredInstall = e; if (api && S.tab === 'set') api.render(); });
  addEventListener('appinstalled', () => { deferredInstall = null; if (api && S.tab === 'set') api.render(); });
  if ('serviceWorker' in navigator) {
    const had = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.register('sw.js').catch(() => { swState = '안 됨'; if (api && S.tab === 'set') api.render(); });
    navigator.serviceWorker.ready.then(() => { swState = '준비됨'; if (api && S.tab === 'set') api.render(); });
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (had) { updated = true; if (api && S.tab === 'set') api.render(); } });
  } else swState = '안 됨';
})();

(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const HOOK = window.__bigcHook || {}; // 설치형(5판): 설정 탭 · 실제 PIN · 상태 저장. 시안에서는 비어 있다
  const app = $('#app'), view = $('#view'), tabsEl = $('#tabs'), sheet = $('#sheet'), scrim = $('#scrim');
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const won = (m) => m >= 10000 ? (m / 10000).toLocaleString('ko-KR') + '억 원' : m.toLocaleString('ko-KR') + '만 원';
  const peso = (n) => (n < 0 ? '−₱' : '₱') + Math.abs(n).toLocaleString('en-US');

  const I = {
    today: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="m8.5 12.2 2.4 2.4 4.6-5"/></svg>',
    clients: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3.5" y="4" width="4.5" height="16" rx="1.5"/><rect x="9.75" y="4" width="4.5" height="11" rx="1.5"/><rect x="16" y="4" width="4.5" height="7" rx="1.5"/></svg>',
    orders: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M20.5 3.5 3.5 10.6l6.6 2.8 2.8 6.6z"/><path d="m10.1 13.4 4.4-4.4"/></svg>',
    post: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="14" rx="3"/><path d="M12 15.5V9m-3 3 3-3 3 3"/></svg>',
    files: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M3.5 7.5a2 2 0 0 1 2-2h4l2 2.5h7a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/></svg>',
    box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="m12 3.5 8 4v9l-8 4-8-4v-9z"/><path d="m4 7.5 8 4 8-4M12 11.5v9"/></svg>',
    coin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><path d="M9.5 8.5h3.8a2 2 0 0 1 0 4H9.5h4.3a2 2 0 0 1 0 4H9.5zM11 7v1.5m0 8V18"/></svg>',
    cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 4.5h2.2l2 11h10.6l1.9-7.5H7"/><circle cx="9.5" cy="19" r="1.3"/><circle cx="17" cy="19" r="1.3"/></svg>',
    tag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M3.5 12.2V4.5h7.7l9.3 9.3-7.7 7.7z"/><circle cx="8" cy="9" r="1.4"/></svg>',
    people: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="9" cy="8.5" r="3.2"/><path d="M3.5 19.5a5.5 5.5 0 0 1 11 0M15.5 5.6a3.2 3.2 0 0 1 0 6M17 14.2a5.5 5.5 0 0 1 3.5 5.3"/></svg>',
    bowl: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 11h17a8.5 8.5 0 0 1-17 0z"/><path d="M9 7.5c0-1.5 1-1.5 1-3M13 7.5c0-1.5 1-1.5 1-3"/></svg>',
    doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3.5h8l4 4v13H6z"/><path d="M14 3.5v4h4M9 12h6M9 15.5h6"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/></svg>',
    chev: '<svg class="chev" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m8 5 5 5-5 5"/></svg>',
    send: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5m-6 6 6-6 6 6"/></svg>',
    cam: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M4 8.5a2 2 0 0 1 2-2h2l1.5-2h5l1.5 2h2a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><circle cx="12" cy="12.5" r="3.3"/></svg>',
    copy: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>',
    search: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/></svg>',
    cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5h16v10H10l-4.5 4v-4H4z"/><path d="M8 9.5h8M8 12.5h5"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.6 3.6 5.4 3.6 8.5s-1.1 5.9-3.6 8.5c-2.5-2.6-3.6-5.4-3.6-8.5s1.1-5.9 3.6-8.5z"/></svg>',
    line: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="4.5" width="17" height="11" rx="2"/><path d="m7 12 3-3 2.5 2 4.5-4M8 19.5h8M12 15.5v4"/></svg>',
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 20h16M7 16.5V11M12 16.5V6M17 16.5v-3.5"/></svg>',
    list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3.5" y="4" width="17" height="16" rx="2.5"/><path d="M7.5 9h9M7.5 12.5h9M7.5 16h5"/></svg>',
    store: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5 5.5 4.5h13L20 9.5M4 9.5h16M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0M5.5 12v7.5h13V12M10 19.5v-4h4v4"/></svg>',
    find: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2M8.5 11h5"/></svg>',
    down: '<svg class="cv" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m5 8 5 5 5-5"/></svg>',
  };

  // ---------- 사장님판 정의: 단계 · 기능 · 값은 승인된 단계 시안과 DECISIONS.md 그대로 (하한선.md 「단계 대응표」) ----------
  const CAN = { ok: ['바로', 'acc'], if: ['조건', 'wait'], ask: ['먼저 확인', ''] };
  const BIZ = {
    mart: {
      label: '마트', shop: '망고마트', date: '11월 26일 목', src: '마트 단계별 시안',
      steps: [
        { name: '품목 정비', list: '30만 원', pilot: '21만 원', feats: [['통합 품목표', 'ok'], ['경로별 마진', 'ok'], ['재고 실사표', 'ok']], prep: '포스 품목 파일, 앱 품목 목록, 수수료율' },
        { name: '정산 대조', list: '100만 원', pilot: '70만 원', mo: '월 15만 원', feats: [['앱 내역 올리기', 'if'], ['받을 돈 계산', 'ok'], ['차액 주문 찾기', 'ok']], prep: '최근 한 달 앱 내역, 통장 입금 내역' },
        { name: '재고 관리', list: '180만 원', pilot: '126만 원', feats: [['공통 재고', 'ok'], ['품절과 유통기한 알림', 'ok'], ['통합 주문함 · 추가 80만 원', 'if']], prep: '재고 기준 수량, 포스 판매 파일' },
        { name: '통합 운영', list: '380만~490만 원', pilot: '266만~343만 원', mo: '월 15만 원', feats: [['경로별 마감', 'ok'], ['권한과 변경 이력', 'ok'], ['그랩 자동 연동 · 별도 100만 원부터', 'ask']], prep: '직원별 담당 업무, 최근 3개월 판매 자료' },
        { name: '고객 앱', label: '별도 견적', feats: [['주문 홈페이지', 'ok'], ['지난 주문 다시 담기', 'ok'], ['배달 현황', 'if']], prep: '상품 사진, 배달 지역과 요금' },
        { name: '확장 구상', label: '검토 후 제안', feats: [['부족 수량 예측', 'ask'], ['발주서 준비', 'if'], ['단골 고객 안내', 'if']], prep: '통합 운영 단계의 판매 기록' },
      ],
      tabs: [['today', '오늘', 'today', 1], ['orders', '주문', 'cart', 3], ['stock', '재고', 'box', 1], ['settle', '정산', 'coin', 2], ['items', '품목', 'tag', 1]],
    },
    food: {
      label: '식당', shop: '한빛식당', date: '11월 26일 목', src: '식당 단계별 시안',
      steps: [
        { name: '서류 정비', list: '30만 원', pilot: '21만 원', feats: [['감독 서류함', 'ok'], ['만료일 관리', 'ok'], ['종이 기록 보관', 'ok']], prep: '직원 명단, 보관 중인 계약서와 타임카드' },
        { name: '근무 기록과 급여', list: '250만 원', pilot: '175만 원', mo: '월 15만 원', feats: [['하루 단위 서명 기록', 'ok'], ['급여 계산과 3년 보관', 'if'], ['임금 변경 알림', 'if']], prep: '직원별 일급과 근무 형태, 최근 급여대장' },
        { name: '재고와 원가', list: '180만 원', pilot: '126만 원', feats: [['레시피 차감', 'ok'], ['메뉴별 마진', 'ok'], ['실사 차이', 'ok']], prep: '메뉴와 레시피, 매입 단가, 포스 판매 파일' },
        { name: '주문과 정산', list: '180만 원', pilot: '126만 원', mo: '월 15만 원', feats: [['통합 주문함', 'if'], ['받을 돈 계산', 'if'], ['차액 주문 찾기', 'ok']], prep: '최근 한 달 앱 내역, 통장 입금 내역' },
        { name: '토탈 운영', list: '580만~750만 원', pilot: '406만~525만 원', mo: '월 25만 원', feats: [['오늘 순수익', 'ok'], ['권한과 변경 이력', 'ok'], ['그랩 자동 연동', 'ask']], prep: '직원별 담당 업무, 최근 3개월 매출과 매입' },
        { name: '확장 구상', label: '검토 후 제안', feats: [['근무표 제안', 'ask'], ['임금 변경 미리 계산', 'if'], ['발주서 준비', 'if']], prep: '토탈 운영 단계의 주문과 근무 기록' },
      ],
      tabs: [['today', '오늘', 'today', 1], ['staff', '직원', 'people', 2], ['cost', '원가', 'bowl', 3], ['settle', '정산', 'coin', 4], ['docs', '서류', 'doc', 1]],
    },
    // 여행 · 골프: 여행골프_단계 build.py T[0]~T[5] · 값 (120) 정가 ×2 / 시범가 = 지금 값 · 월 관리 (121)(124)
    golf: {
      label: '여행 · 골프', shop: '해오름골프', date: '12월 1일 화', src: '여행 · 골프 단계별 시안',
      steps: [
        { name: '업무 정비', list: '30만 원', pilot: '15만 원', feats: [['문의 응대 정리', 'ok'], ['함께 보는 예약 달력', 'ok'], ['골프장 요금표 통합', 'ok']], prep: '사용 중인 메신저 계정, 최근 견적 5건' },
        { name: '견적', list: '60만 원', pilot: '30만 원', mo: '월 10만 원', feats: [['메신저 문의를 견적으로', 'if'], ['발송 전 누락 점검', 'ok'], ['한글, 영문 견적서', 'ok']], prep: '골프장별 요금표, 차량 요금' },
        { name: '예약과 배차', list: '150만 원', pilot: '75만 원', mo: '월 10만 원', feats: [['입금 대조', 'ok'], ['배차 중복 차단', 'ok'], ['기사 전달과 확인', 'ok']], prep: '차량과 기사 명단, 업체별 지급 시점' },
        { name: '통합 운영', list: '240만~500만 원', pilot: '120만~250만 원', mo: '월 15만 원', feats: [['예약별 손익', 'ok'], ['기사 전용 화면', 'ok'], ['변경 이력', 'ok']], prep: '직원별 담당 업무, 최근 3개월 예약 자료' },
        { name: '고객 앱', label: '별도 견적', feats: [['총액이 보이는 예약 홈페이지', 'ok'], ['고객 전용 일정', 'ok'], ['협력 골프장 연동', 'if']], prep: '상품 사진, 협력 골프장 1곳' },
        { name: '확장 구상', label: '검토 후 제안', feats: [['지연 사전 감지', 'ask'], ['일정 재계산', 'if'], ['승인 후 발송', 'if']], prep: '통합 운영 단계의 예약 기록' },
      ],
      tabs: [['today', '오늘', 'today', 1], ['sched', '일정', 'cal', 1], ['quote', '견적', 'doc', 2], ['money', '돈', 'coin', 3], ['rates', '요금', 'tag', 1]],
    },
    // 부동산 · 비자: 개인페이지_단계 scenes.py T[0]~T[5] · 값 (91)(120) · 개인 페이지는 값 하나 (184) · 카나나 (116)
    agent: {
      label: '부동산 · 비자', shop: '대표님 사무실', date: '11월 26일 목', src: '부동산 · 비자 단계별 시안',
      resp: '비자와 임대 안내는 대표님이 확인하신 내용으로 채우며, 규정의 확인과 고객 안내의 책임은 대표님 사무실에 있습니다. 법률 또는 이민 자문이 아니며 비자 결과를 약속하지 않습니다.',
      steps: [
        { name: '답변 정비', list: '50만 원', pilot: '25만 원', inc: '카나나(카카오톡 채널)에 넣어 드림까지', feats: [['반복 질문 정리', 'ok'], ['안내 카드와 링크', 'ok'], ['확인일과 출처', 'ok']], prep: '반복되는 메신저 대화, 지금 쓰시는 안내 글' },
        { name: '개인 페이지', list: '60만 원', flat: true, feats: [['질문 하나씩 묻는 안내', 'ok'], ['한 장 페이지', 'ok'], ['상담 예약', 'ok']], prep: '소개 글, 업무 범위, 상담 가능한 시간' },
        { name: '답변 관리', list: '220만 원', pilot: '110만 원', mo: '월 5만 원', feats: [['예전 안내를 읽은 고객', 'ok'], ['확인일 지난 안내 잠금', 'ok'], ['한 번에 바뀌는 링크', 'ok']], prep: '정리된 안내, 안내마다 확인할 주기와 출처' },
        { name: '고객과 서류', list: '260만 원', pilot: '130만 원', mo: '월 5만 원', feats: [['빠진 서류 표시', 'ok'], ['첫 비용 계산', 'ok'], ['만료일과 사본 관리', 'if']], prep: '업무별 서류 목록, 진행 중인 고객 명단' },
        { name: '통합 운영', list: '640만~800만 원', pilot: '320만~400만 원', mo: '월 10만 원', feats: [['오늘 직접 응대할 문의', 'ok'], ['수수료 장부', 'ok'], ['변경 이력', 'ok']], prep: '최근 3개월 문의와 수수료 내역' },
        { name: '확장 구상', label: '검토 후 제안', feats: [['회신 초안', 'ask'], ['공지 변경 알림', 'ask'], ['외국인 고객', 'if']], prep: '통합 운영 단계의 안내와 문의 기록' },
      ],
      tabs: [['today', '오늘', 'today', 1], ['guide', '안내', 'chat', 1], ['page', '페이지', 'globe', 2], ['clients', '고객', 'people', 4], ['book', '장부', 'coin', 5]],
    },
    // 공장: 공장_단계 scenes.py T[0]~T[5] · 값 (101) 시범가 · (120) 정가 ×2 · 월 관리 (101) 단계 15만 · 통합 30만 · 「현장 상담 후 확정」 (101)
    factory: {
      label: '공장', shop: '대표님 공장', date: '11월 27일 목', src: '공장 단계별 시안', conf: true,
      foot: '값은 현장 상담 후 확정합니다. 서버, 도메인, TV와 휴대폰 같은 기기, 기계 신호 장치 비용은 계약 전에 별도로 안내해 드립니다.',
      steps: [
        { name: '업무 정비', list: '160만 원', pilot: '80만 원', feats: [['현장 진단 1쪽', 'ok'], ['오더 양식 통일', 'ok'], ['품목 · 자재 코드', 'ok']], prep: '최근 한 달 오더, 품목 목록, 작업지시서 견본' },
        { name: '오더와 납기', list: '400만 원', pilot: '200만 원', mo: '월 15만 원', feats: [['오더 한 곳 등록', 'ok'], ['끝나는 날 계산', 'ok'], ['지시량 확인', 'ok']], prep: '진행 중인 오더, 기계 목록과 하루 생산량' },
        { name: '현장 입력과 현황판', list: '480만 원', pilot: '240만 원', mo: '월 15만 원', feats: [['휴대폰 현장 입력', 'ok'], ['사무실 TV 현황판', 'ok'], ['작업 기준 카드', 'if']], prep: '기계와 금형 목록, 조별 근무표, TV 1대' },
        { name: '자재와 불량 추적', list: '520만 원', pilot: '260만 원', mo: '월 15만 원', feats: [['이동 기록 재고', 'ok'], ['부족 예고', 'ok'], ['LOT 추적과 8D 자료', 'if']], prep: '자재 목록과 현재 재고, 원자재 LOT 표기 방식' },
        { name: '통합 운영', list: '1,600만~2,000만 원', pilot: '800만~1,000만 원', mo: '월 30만 원', feats: [['대표 화면과 본사 보고', 'ok'], ['권한과 변경 기록', 'ok'], ['본사 ERP 연계 · 별도 견적', 'ask']], prep: '조직도와 역할별 담당자, 최근 3개월 오더와 출고' },
        { name: '확장 구상', label: '검토 후 제안', feats: [['기계 신호 연결', 'ask'], ['고객사 조회', 'if'], ['여러 공장 비교', 'if']], prep: '통합 운영 단계의 생산 기록' },
      ],
      tabs: [['today', '오늘', 'today', 1], ['orders', '오더', 'doc', 1], ['floor', '현장', 'line', 3], ['stock', '자재', 'box', 4], ['close', '마감', 'chart', 5]],
    },
    // 커뮤니티: 커뮤니티_단계 scenes.py T[0]~T[5] · 예시 두 갈래 V[0] 교민 · V[1] 분야별 (139) · 값 (140) 정가 / 첫 다섯 곳 · (184)
    community: {
      label: '커뮤니티', get shop() { return CV[S.cv].room; }, date: '11월 30일 일', src: '커뮤니티 단계별 시안',
      foot: '검색 순위와 AI 답변 인용은 약속하지 않습니다. 같은 질문으로 매달 측정한 결과표를 드립니다. 서버 · 도메인 · 측정 도구 비용은 실비입니다.',
      steps: [
        { name: '운영 정비', list: '50만 원', pilot: '25만 원', feats: [['자주 받는 질문 정리', 'ok'], ['업체 목록과 검색 등록', 'ok'], ['AI 답변 진단표', 'ok']], prep: '지금 쓰시는 카페 · 밴드 · 대화방 주소, 자주 받는 질문' },
        { name: '커뮤니티 열기', list: '160만 원', pilot: '80만 원', mo: '월 5만 원', feats: [['공개 게시판과 회원', 'ok'], ['금지선 필터', 'ok'], ['새 글과 문의 알림', 'if']], prep: '커뮤니티 이름과 도메인(대표님 명의), 게시판 주제' },
        { name: '업체 목록과 광고', list: '360만 원', pilot: '180만 원', mo: '월 10만 원', feats: [['업체 등록과 심사', 'ok'], ['글 옆 업체 연결', 'ok'], ['등록비와 배너 자리', 'ok']], prep: '첫 업체 10곳 명단, 등록비와 배너 정책' },
        { name: '검색과 AI 인용', list: '200만 원', pilot: '100만 원', mo: '월 15만 원', feats: [['질문 페이지 20~30개', 'ok'], ['검색과 AI가 읽는 구조', 'ok'], ['같은 질문으로 매달 측정', 'if']], prep: '답하고 싶은 질문 30개, 확인할 수 있는 공식 출처' },
        { name: '통합 운영', list: '600만~800만 원', pilot: '300만~400만 원', mo: '월 20만 원', feats: [['견적 요청과 업체 배정', 'if'], ['수수료 건별 기록', 'ok'], ['영어 화면과 월 보고', 'ok']], prep: '수수료 정책, 영어 담당자, 최근 석 달 문의 기록' },
        { name: '확장 구상', label: '검토 후 제안', feats: [['공식 출처 변경 감지', 'ask'], ['수정안과 운영자 승인', 'if'], ['읽은 회원에게 알림', 'if']], prep: '통합 운영 단계의 답 페이지, 회원 알림 동의' },
      ],
      tabs: [['today', '오늘', 'today', 1], ['faq', '질문', 'chat', 1], ['board', '게시판', 'list', 2], ['biz', '업체', 'store', 3], ['seo', '검색', 'find', 4]],
    },
  };


  // ---------- 커뮤니티 예시 두 갈래 (139): 커뮤니티_단계 scenes.py V[0] 교민 커뮤니티 · V[1] 분야별 커뮤니티(부동산 사무실이 운영) ----------
  // 단계 · 값 · 기능은 같고, 장면 속 이름 · 글 · 업체 · 수만 바뀐다(설계.md §1). 두 갈래에 같은 수(AI 진단 · 업체 연락처 · 점검표 · 견적 수)는 scenes.py S0~S4에 박힌 값 그대로.
  const CV = [
    { label: '교민 커뮤니티', room: '마닐라 생활 마당', size: '412명', members: '회원 412명 · 오늘 글 23', faqTotal: 46,
      askWho: '민지 엄마 · 21:14', ask: 'ACR 카드 갱신은 어디서 해요? 처음이라서요', askQ: 'ACR 카드 갱신은 어디서 해요?', askShort: 'ACR 카드 갱신',
      faq: [['ACR 카드 갱신은 어디서?', 14, 1, '11월 20일'], ['한국 면허를 필리핀 면허로', 11, 1, '11월 18일'], ['은행 계좌 열 때 서류', 9, 0, ''], ['콘도 보증금은 몇 달 치?', 8, 0, ''], ['아이 학교 입학 시기', 6, 0, '']],
      a1: 'ACR 카드 갱신, 준비할 것',
      cats: ['전체', '생활', '집', '비자', '학교', '사고팔기'], hot: 'ACR · 보증금 · 국제학교',
      posts: [['BGC에서 한국 반찬 배달 되는 곳', '주 2회 받을 수 있는 곳 있을까요? 아이들이 김치를…', '생활', 'BGC · 12분 전', 8, 0], ['ACR 카드 갱신 다녀왔습니다', '정리된 답 보고 서류 챙겨 갔더니 한 번에 끝났어요.', '비자', '마카티 · 1시간 전', 14, 1], ['알라방 국제학교 입학 상담 후기', '상담 예약부터 레벨 테스트까지 순서대로 적어 봅니다.', '학교', '알라방 · 3시간 전', 6, 0], ['유모차 팝니다, 거의 새것', '접이식이고 바퀴 상태 좋습니다. 파식에서 직접 거래…', '사고팔기', '파식 · 어제', 3, 0]],
      badTab: '사고팔기', bad: ['아이폰 15 팝니다. ', 'GCash로 먼저 보내 주시면', ' 바로 택배로 보내…'], badShort: '아이폰 15 팝니다. GCash로 먼저…',
      vendors: [['한솔 이사', '이사', '확인', '확인', '게시', 'acc'], ['서울 미소 치과', '병원', '확인', '확인', '게시', 'acc'], ['이지 렌터카', '차량', '없음', '—', '서류 요청', 'stop'], ['하늘 반찬', '음식', '확인', '금액 다름', '확인 필요', 'stop'], ['고수익 코인 투자', '투자', '—', '—', '반려 · 금지선', 'stop']],
      q: 'BGC에서 한국 반찬 배달 되는 곳', qN: 8, qSum: '회원 답 8개를 정리하면, 주 2회 배달되는 곳 두 곳 · 당일 주문되는 곳 한 곳입니다.',
      match: [['하늘 반찬', '반찬 · BGC 배달', 2], ['엄마손 도시락', '도시락 · 마카티', 1], ['한마음 식품', '식품 · 주 2회', 0]],
      checks: [['마닐라 ACR 카드 갱신 방법', 1, 1, 1, 0], ['필리핀 한국 면허 교환', 1, 0, 1, 1], ['BGC 한국 반찬 배달', 0, 1, 0, 0], ['마카티 소아과 한국어 진료', 0, 0, 0, 0]],
      src: '이민국 공지 (예시)', bullets: [['준비 서류', '4가지'], ['먼저 할 일', '온라인 예약'], ['지점', '가까운 곳 3곳']],
      reqs: [['이사 · 마카티 → BGC', '한솔 이사'], ['치과 · 아이 검진', '서울 미소 치과'], ['렌터카 · 클락 2박', '이지 렌터카'], ['통역 · 병원 동행', '마닐라 통역']],
      enH: 'Korean-run services in Manila', en: [['Moving', '12 listed'], ['Dental', '4 listed'], ['Korean food', '9 listed'], ['Interpreter', '3 listed']],
      rpt: [64, 212, 31, 2],
      chgSrc: '이민국 공지', chgW: '공지가 바뀐 답', chgT: 'ACR 카드 갱신, 준비할 것', chg: [['준비 서류', '4가지 → 5가지'], ['먼저 할 일', '온라인 예약']], readers: 142, vend2: '대행 업체 2곳' },
    { label: '분야별 커뮤니티', room: '마닐라 콘도 마당', size: '268명', members: '회원 268명 · 한빛 부동산 운영', faqTotal: 31,
      askWho: '준호 아빠 · 20:41', ask: 'BGC 콘도 보증금은 보통 몇 달 치예요?', askQ: 'BGC 콘도 보증금은 보통 몇 달 치예요?', askShort: '콘도 보증금',
      faq: [['보증금은 몇 달 치?', 18, 1, '11월 21일'], ['외국인 계약에 필요한 서류', 12, 1, '11월 19일'], ['관리비는 월세에 포함?', 10, 0, ''], ['반려견 되는 콘도', 7, 0, ''], ['1년 전에 나가면 위약금', 5, 0, '']],
      a1: '콘도 보증금, 계약 전에 볼 것',
      cats: ['전체', '월세', '매매', '계약', '동네', '이사'], hot: '보증금 · 반려견 · 관리비',
      posts: [['BGC 1베드 월세, 요즘 얼마쯤인가요', '내년 2월 입주 예정인데 가구 포함으로 찾고 있습니다.', '월세', 'BGC · 8분 전', 11, 0], ['보증금 돌려받을 때 빠진 항목', '정리된 답에 있던 대로 입주 사진을 남겨 둔 덕을 봤습니다.', '계약', '마카티 · 2시간 전', 9, 1], ['마카티 반려견 되는 콘도 후기', '소형견 한 마리, 관리사무소에 미리 등록해야 합니다.', '동네', '마카티 · 5시간 전', 7, 0], ['이사 업체 추천, 짐 1톤 정도', '토요일 오전에 옮길 수 있는 곳을 찾고 있습니다.', '이사', '오르티가스 · 어제', 4, 0]],
      badTab: '월세', bad: ['급매! 보증금 없이 바로 입주, ', '계약금은 개인 계좌로 먼저 보내', '…'], badShort: '급매! 보증금 없이 바로 입주, 계약금은…',
      vendors: [['한솔 이사', '이사', '확인', '확인', '게시', 'acc'], ['깔끔 청소', '청소', '확인', '확인', '게시', 'acc'], ['빠른 인터넷 설치', '인터넷', '없음', '—', '서류 요청', 'stop'], ['마닐라 인테리어', '인테리어', '확인', '금액 다름', '확인 필요', 'stop'], ['보장 수익 분양', '분양', '—', '—', '반려 · 금지선', 'stop']],
      q: '이사 업체 추천, 짐 1톤 정도', qN: 4, qSum: '회원 답 4개를 정리하면, 토요일 오전에 되는 곳은 두 곳입니다.',
      match: [['한솔 이사', '이사 · 1톤 트럭', 2], ['마닐라 익스프레스', '이사 · 주말 가능', 1], ['깔끔 청소', '입주 청소', 0]],
      checks: [['BGC 콘도 월세 보증금', 1, 1, 1, 0], ['필리핀 외국인 임대 계약 서류', 1, 0, 1, 1], ['마카티 반려견 가능 콘도', 0, 1, 0, 0], ['콘도 관리비 포함 여부', 0, 0, 0, 0]],
      src: '표준 임대 계약서 (예시)', bullets: [['보증금', '보통 2달 치'], ['선불 월세', '1달 치'], ['돌려받는 날', '퇴거 뒤 30일 안']],
      reqs: [['BGC 1베드 월세', '한빛 부동산'], ['이사 · 짐 1톤', '한솔 이사'], ['인터넷 설치', '빠른 인터넷 설치'], ['입주 청소', '깔끔 청소']],
      enH: 'Condos near BGC, explained in English', en: [['For rent', '38 listed'], ['Moving', '6 listed'], ['Cleaning', '4 listed'], ['Internet', '3 listed']],
      rpt: [41, 96, 22, 1],
      chgSrc: '콘도 관리 규정', chgW: '규정이 바뀐 답', chgT: '반려견 되는 콘도', chg: [['등록 서류', '1가지 → 2가지'], ['대형견', '허용 → 불가']], readers: 87, vend2: '관련 업체 2곳' },
  ];
  const cTodo = (v) => [
    { id: 'c_faq', w: `같은 질문 ${v.faq[0][1]}번째 · 답 있음`, lv: 1, kind: '반복 질문', t: `「${v.askQ}」 ${v.faq[0][1]}번째 질문입니다`, s: `${v.askWho} · ${v.faq[0][3]}에 확인한 정리된 답이 있습니다`, act: '정리된 답으로 답하기' },
    { id: 'c_ai', w: 'AI 답에 우리 글 1번', lv: 1, kind: 'AI 답변 진단', t: '질문 10개 · AI 세 곳 · 우리 글이 나온 답 1개', s: 'ChatGPT 0 / 10 · Gemini 1 / 10 · 네이버 AI 0 / 10', act: '진단표 보기' },
    { id: 'c_vend', w: '흩어진 업체 연락처 29곳', lv: 1, kind: '업체 연락처', t: '받은 명함과 글 37건 → 업체 29곳', s: '겹친 것 8건 · 연락처 없음 3곳', act: '한 목록으로 저장' },
    { id: 'c_bad', w: '선입금을 요구하는 글 1건', lv: 2, kind: '올리기 전 확인', t: `${v.badTab} · 「${v.badShort}」`, s: '금지선에 걸려 아직 올라가지 않았습니다 · 운영자 확인 차례', act: '글 확인하기' },
    { id: 'c_tg', w: '새 글 알림 받는 사람', lv: 2, kind: '새 글 알림', t: '새 글 알림 · 텔레그램 운영진 2명', s: '텔레그램은 바로 · 카톡 알림은 대표님 채널을 연 뒤에 연결', act: '알림 받는 사람 보기' },
    { id: 'c_reg', w: '업체 신청 5건 · 확인 3건', lv: 3, kind: '업체 등록 신청', t: '이번 주 업체 신청 5건 · 확인할 것 3건', s: '서류 없음 1 · 등록비 금액 다름 1 · 금지 업종 1', act: '심사하기' },
    { id: 'c_match', w: '질문 글 옆에 맞는 업체 3곳', lv: 3, kind: '글 옆 업체', t: `「${v.q}」`, s: `회원 답 ${v.qN}개 정리 · 맞는 업체 3곳 · 이 글에서 간 문의 3건`, act: '글 옆 업체 보기' },
    { id: 'c_week', w: '우리 답이 나온 곳 31 / 80', lv: 4, kind: '매주 점검표', t: '11월 4주 점검 · 질문 20개 × 4곳', s: '검색에 등록된 답 24 / 30 · 우리 답이 나온 곳 31 / 80 · 지난주보다 +3', act: '점검표 보기' },
    { id: 'c_none', w: '네 곳 모두 답이 없는 질문', lv: 4, kind: '답이 없는 질문', t: `「${v.checks[3][0]}」 · 네 곳 모두 없음`, s: '구글 · 네이버 · ChatGPT · Gemini · 정리된 답도 없습니다', act: '질문 페이지 목록에 넣기' },
    { id: 'c_req', w: '응답 없는 업체 1곳', lv: 5, kind: '견적 요청', t: `${v.reqs[2][0]} · ${v.reqs[2][1]}가 응답하지 않습니다`, s: '응답이 없으면 다른 업체로 넘깁니다', act: '다른 업체로 넘기기' },
    { id: 'c_rpt', w: '12월 1일 월 보고 한 장', lv: 5, kind: '월 보고', t: '월 보고 한 장 · 12월 1일', s: `새 회원 ${v.rpt[0]}명 · 질문 글 ${v.rpt[1]}건 · 업체 연결 ${v.rpt[2]}건 · 응답 없는 업체 ${v.rpt[3]}곳`, act: '월 보고 보기' },
    { id: 'c_chg', w: `${v.chgW} · 읽은 회원 ${v.readers}명`, lv: 6, kind: '공식 출처 변경', t: `${v.chgSrc}에서 바뀐 문장 2곳을 찾았습니다`, s: `정리된 답 3개의 수정안 · 석 달 안에 읽은 회원 ${v.readers}명 · ${v.vend2}`, act: '수정안 보기' },
  ];
  const mkCommunity = (i, lv = 2) => ({ lv, done: [], scanRun: false, scanned: false, cat: '전체', decided: null, todo: cTodo(CV[i]) });

  // ---------- state (모두 예시) ----------
  const STAGES = ['문의', '상담', '시안', '견적', '선금', '제작', '납품', '잔금', '후기'];
  const NEXT_WORK = {
    '상담': '본부가 상담 질문지를 준비합니다.',
    '시안': '본부가 시안 지시서를 씁니다.',
    '견적': '본부가 견적 한 장 초안을 준비합니다.',
    '선금': '은행 앱에서 입금을 보신 뒤 누르는 단추입니다. 본부가 제작 지시서를 엽니다.',
    '제작': '본부가 제작 지시서를 엽니다.',
    '납품': '본부가 납품 점검표를 돌립니다.',
    '잔금': '본부가 잔금 안내 문안을 준비합니다.',
    '후기': '본부가 후기 부탁 문안과 사례 한 장을 준비합니다.',
  };
  const S = {
    mode: 'owner', biz: 'mart', cv: 0, tab: 'today', mins: { hq: 9 * 60 + 12, mart: 18 * 60 + 20, food: 21 * 60 + 50, golf: 10 * 60 + 20, agent: 22 * 60 + 10, factory: 16 * 60 + 10, community: 21 * 60 + 20 }, open: {},
    pin: '', offline: false, queued: 0, stageFilter: 'all', orderSeg: 'talk', fileFilter: 'all', inbox: 54,
    todo: [
      { id: 'q1', kind: '새 문의', t: '망고마트 · 마트', s: '23:35 쇼룸 문의', act: '답 초안 보기' },
      { id: 'p1', kind: '게시 승인', t: '09:30 부동산방', s: '글 1 · 사진 1', act: '승인', post: 'r1' },
      { id: 'h1', kind: '본부 질문', t: '내일 글 12개, 이대로 올릴까요?', s: '권고 · 이대로, 마트방 둘만 저녁', choices: ['권고대로', '보류'] },
    ],
    doneToday: [{ t: '08:05', s: '마트방 글 승인 · 올라간 화면 받음' }],
    clients: [
      { id: 'c1', n: '망고마트', k: '마트', st: 0, next: '상담 날짜 잡기' },
      { id: 'c2', n: '한빛식당', k: '식당', st: 1, next: '시안 방향 정하기' },
      { id: 'c3', n: '마카티 하우스', k: '부동산', st: 2, next: '점검 받기' },
      { id: 'c4', n: '세부 그린투어', k: '여행 · 골프', st: 3, next: '한 장 보내기', amt: 120 },
      { id: 'c5', n: '클락 봉제', k: '공장', st: 4, next: '입금 확인', amt: 800, due: 400 },
      { id: 'c6', n: '파식 베이커리', k: '홈페이지', st: 5, next: '시안대로 만드는 중' },
      { id: 'c7', n: '바기오 마트', k: '마트', st: 7, next: '입금 확인', amt: 266, due: 133 },
    ],
    posts: [
      { id: 'r1', tm: '09:30', room: '부동산방', state: 'wait', text: 'BGC 콘도 월세, 계약 전에 볼 세 가지. 관리비가 들었는지, 보증금 돌려받는 날, 주차 자리 번호.', step: 0 },
      { id: 'r2', tm: '12:00', room: '마트방', state: 'wait', text: '이번 주 한국 식품 들어오는 날. 김치 · 두부는 목요일 오후부터 있습니다.', step: 0 },
      { id: 'r3', tm: '18:00', room: '골프방', state: 'sched', text: '클락 라운드, 캐디팁은 그린피와 따로입니다. 한 사람에 캐디 한 명.', step: 0 },
    ],
    openPost: 'r1',
    talk: [
      { no: 51, text: '마트 견적 한 장에 배달비 줄 하나 더', st: '끝', tm: '어제 21:10' },
      { no: 52, text: '쇼룸 첫 화면 사진을 밤 사진으로', st: '진행', wo: 'WO-019', tm: '어제 22:40' },
      { no: 53, text: '[사진 1장] 이 간판 색처럼 맞춰 줘', st: '보류', tm: '07:55', note: '본부 질문과 묶임' },
    ],
    board: [
      { wo: 'WO-019', t: '쇼룸 첫 화면 사진 교체', st: '진행' },
      { wo: 'WO-020', t: '업무 메일 주소 반영', st: '진행' },
      { wo: 'WO-018', t: '마트 카톡 이미지 3장', st: '끝' },
    ],
    files: [
      { g: '마트', t: '마트 단계별 시안', k: '시안' }, { g: '마트', t: '마트 카톡 이미지 3장', k: '카톡 이미지' },
      { g: '식당', t: '식당 토탈 관리 시안', k: '시안' },
      { g: '여행 · 골프', t: '여행 · 골프 단계 시안', k: '시안' }, { g: '여행 · 골프', t: '견적 한 장', k: '제안서' },
      { g: '공장', t: 'MES 기업형 · 대표용 한 장', k: '제안서' }, { g: '공장', t: 'MES 기업형 · 임원용 두 장', k: '제안서' },
    ],
    own: {
      mart: {
        lv: 4, done: [], itemFilter: 'all', countLang: 'ko', reason: null, hosuSent: false, matched: false,
        lines: [
          { q: '신라면 5', ok: '신라면 멀티 5입 × 1' },
          { q: '두부 2', note: '풀무원 두부 300g 재고 0', c: ['CJ 두부로 바꿀까요? 묻기', '빼기'], pick: null },
          { q: '지난번 그 김치', note: '김치가 두 가지입니다', c: ['종가 포기김치 1kg', '포기김치 3kg'], pick: null },
          { q: '2타워요', note: '호수가 없습니다', c: ['호수 묻는 글 보내기'], pick: null },
        ],
        todo: [
          { id: 'm_cnt', w: '어묵 3봉이 맞지 않습니다', lv: 1, kind: '재고 실사', t: '냉장 2번 · 어묵이 3봉 맞지 않습니다', s: '12개 선반 중 2번째 · 직원 화면은 영어로도', act: '실사 이어서' },
          { id: 'm_item', w: '앱마다 값이 다른 품목 2개', lv: 1, kind: '품목 확인', t: '앱마다 값이 다른 품목 2개', s: '대파 · 그랩에 없음 · 계란 30구 · 배달K가 ₱20 낮음', act: '품목표 보기' },
          { id: 'm_set', w: '그랩 입금이 ₱2,280 적습니다', lv: 2, kind: '정산 차이', t: '그랩 입금이 ₱2,280 모자랍니다', s: '11월 16일 ~ 22일 · 확인할 주문 2건', act: '대조 보기' },
          { id: 'm_low', w: '대파가 기준보다 적습니다', lv: 3, kind: '품절 위험', t: '대파 2단 · 기준 3단보다 적습니다', s: '아침 24단 · 네 경로에서 22단 팔림', act: '배달K · 그랩 품절 표시' },
          { id: 'm_match', w: '메신저 주문이 주문판에 없습니다', lv: 4, kind: '주문 옮기기', t: '메신저 주문이 18분째 주문판에 없습니다', s: '최 사모님 14:02 · 「신라면 5, 두부 2, 지난번 그 김치」', act: '주문으로 옮기기' },
          { id: 'm_close', w: '마감 전 확인 3건', lv: 4, kind: '마감', t: '오늘 매출 ₱33,340 · 마감 전 확인', s: '재고 차이 1건 · 정산 차액 1건 · 유통기한 임박 2건', act: '마감하기' },
          { id: 'm_po', w: '목요일 대파가 모자랄 것 같습니다', lv: 6, kind: '발주 제안', t: '목요일 대파 12단이 모자랄 것 같습니다', s: '예상 주문 22단 · 지금 재고 10단 · 제안 15단', act: '승인하고 보내기' },
        ],
      },
      food: {
        lv: 5, done: [], claimRun: false, claimDone: false, pay: 1, reasonText: '', wageDone: false,
        todo: [
          { id: 'f_card', lv: 1, kind: '종이 기록', t: '2024년 3월 ~ 10월 타임카드가 없습니다', s: '2월 16일 ~ 29일 12장까지 촬영함', choices: ['빠진 카드 촬영', '찾을 수 없음으로 표시'] },
          { id: 'f_claim', lv: 2, kind: '퇴사 직원 청구', t: '마리아 님이 연장 · 공휴일 5건을 청구했습니다', s: '2023년 11월 ~ 2026년 10월 근무 · 서명 기록과 맞춰 봅니다', act: '기록과 맞춰 보기' },
          { id: 'f_pay', lv: 2, kind: '급여대장', t: '11월 16일 ~ 30일 급여 · 검토 차례', s: '5명 · 실수령 합계 ₱48,203 · 서명 대기 1', act: '검토하기' },
          { id: 'f_wage', lv: 2, kind: '임금 기준 변경', t: '직원 3명 기본급이 기준보다 ₱4,368 적습니다', s: '9월 26일부터 ₱658 → ₱718 · 회계사 확인 완료', act: '다음 급여에 반영' },
          { id: 'f_gap', lv: 3, kind: '실사 차이', t: '삼겹살이 0.4kg 덜 남았습니다', s: '남아야 할 양 6.5kg · 저울 6.1kg · 2인분', act: '차이 이유 남기기' },
          { id: 'f_set', lv: 4, kind: '정산 차이', t: '그랩 입금이 ₱1,660 모자랍니다', s: '11월 16일 ~ 22일 · 확인할 주문 2건', act: '대조 보기' },
          { id: 'f_out', lv: 4, kind: '품절', t: '해물파전 · 오징어 2인분 남음', s: '배달K · 그랩에서는 아직 판매 중', act: '배달K · 그랩 품절 표시' },
          { id: 'f_ot', lv: 5, kind: '대표님 결정', t: '조이 연장 1시간을 승인하시겠습니까?', s: '퇴근 21:00 → 22:00 · 마크 매니저 21:42 기록', choices: ['승인', '보류'] },
          { id: 'f_close', lv: 5, kind: '마감', t: '오늘 매출 ₱48,600 · 마감 전 확인', s: '서명 없는 근무 1건 · 정산 차액 1건', act: '마감하기' },
          { id: 'f_roster', lv: 6, kind: '근무표 제안', t: '다음 주 넘치는 근무 24시간', s: '15시 ~ 17시 · 인건비 차이 ₱2,160', act: '승인하고 보내기' },
        ],
      },
      golf: {
        lv: 4, done: [], q: 0, tip: null, qView: 'calc', qLang: 'ko', paid: 0, guideResent: false, drv: 0, delayRun: false,
        todo: [
          { id: 'g_ask', w: '견적 문의 1건', lv: 1, kind: '문의 응대', t: '「12월 골프 4명 견적 부탁드립니다」', s: '우리 여행사 채널 · 날짜 · 인원 · 항공편부터 여쭙니다', act: '빠른 답장 보기' },
          { id: 'g_rate', w: '캐디팁이 따로인 골프장', lv: 1, kind: '요금표', t: '블루힐은 카트 · 캐디 · 캐디팁이 따로입니다', s: '선밸리는 카트 · 캐디 포함 · 같은 주말 18홀', act: '요금표 한 장 보기' },
          { id: 'g_quote', w: '견적 전 문의 1건', lv: 2, kind: '견적', t: '박 대표님 문의가 아직 견적이 아닙니다', s: '「11일 도착, 골프 4명 두 번입니다. 한 명은 관광하고 14일 낮에 출발합니다.」', act: '견적으로 옮기기' },
          { id: 'g_pay', w: '₩194,000 미입금', lv: 3, kind: '입금 대조', t: '박 대표님 일행 · ₩194,000이 덜 들어왔습니다', s: '받을 돈 ₩4,194,000 · 들어온 돈 ₩4,000,000 · 전액 입금 후 확정', act: '입금 대조 보기' },
          { id: 'g_dup', w: '토요일 밴 A 겹침', lv: 3, kind: '배차 겹침', t: '토요일 밴 A가 11:00에 겹칩니다', s: '박 대표님 05:40 ~ 20:15 배정 중 · 토요일 밴 B 이용 가능', act: '밴 B로 배정' },
          { id: 'g_pl', w: '선밸리 상품 마진 3%', lv: 4, kind: '대표님 결정', t: '선밸리 상품 마진이 3%입니다', s: '그린 투어 취소 4번 · 화요일 밴 2대 비어 있음', choices: ['요금 조정', '보류'] },
          { id: 'g_drv', w: '기사 현장 지출 ₱520', lv: 4, kind: '기사 화면', t: '로델 기사 현장 지출 ₱520', s: '톨비 ₱420 · 주차 ₱100 · 영수증 사진', act: '기사 화면 보기' },
          { id: 'g_tee', w: '빈 티업 3팀이 올라왔습니다', lv: 5, kind: '협력 골프장', t: '블루힐 CC가 토요일 빈 티업 3팀을 올렸습니다', s: '예약 홈페이지에 포함 항목을 밝힌 총액으로 보입니다', act: '예약 홈페이지 보기' },
          { id: 'g_delay', w: '항공편 40분 지연', lv: 6, kind: '항공편 지연', t: '박 대표님 일행 항공편이 40분 늦습니다', s: '13:20 → 14:00 도착 · 발송 대기 안내문 3건', act: '바뀐 일정 보기' },
        ],
      },
      agent: {
        lv: 3, done: [], merged: false, mergeRun: false, ans: 1, pageLang: 'ko', checks: [false, false, false],
        todo: [
          { id: 'r_q', w: '같은 질문 23번 · 설명 4가지', lv: 1, kind: '반복 질문', t: '「비자 연장, 어디서 합니까」를 23번 받았습니다', s: '지금까지 보낸 설명이 네 가지로 다릅니다', act: '하나로 정리' },
          { id: 'r_q2', w: '같은 질문 19번 · 설명 3가지', lv: 1, kind: '반복 질문', t: '「입주할 때 처음 내는 돈」 19번 · 설명 3가지', s: '보증금 · 선납 월세 · 입주 청소를 안내 카드 한 장에', act: '하나로 정리' },
          { id: 'r_book', w: '15분 상담 예약 1건', lv: 2, kind: '상담 예약', t: '박정우 님이 15분 상담을 예약했습니다', s: '페이지에서 고른 조건 · 비자 연장 · 2개월 ~ 5개월', choices: ['예약 확정', '다른 시간 제안'] },
          { id: 'r_lock', w: '확인일 지난 안내 · 보내기 잠김', lv: 3, kind: '확인일 지남', t: '연례 신고 준비물 · 322일 전에 확인한 안내입니다', s: '정해 두신 주기 90일 · 보낸 링크 41개 · 보내기 잠김', act: '다시 확인하기' },
          { id: 'r_old', w: '예전 안내를 읽은 고객 2명', lv: 3, kind: '예전 안내', t: '관광비자 연장 안내가 11월 20일에 바뀌었습니다', s: '예전 안내를 읽은 고객 5명 · 아직 모름 2명', act: '아직 모르는 2명에게 알리기' },
          { id: 'r_doc', w: '선일자 수표 11장 남음', lv: 4, kind: '빠진 서류', t: '이수민 님 · 선일자 수표 11장이 남았습니다', s: '콘도 임대 · 계약 시작 12월 5일 · 입주 첫 비용 ₱138,500', act: '첫 비용 안내 보기' },
          { id: 'r_exp', w: '12월 6일 체류 만료', lv: 4, kind: '만료', t: '김지훈 님 체류가 12월 6일에 끝납니다', s: '최은영 비자 12월 18일 · 박정우 여권 2월 20일', act: '만료 안내 보내기' },
          { id: 'r_fee', w: '받을 돈 ₱35,000', lv: 5, kind: '받을 돈', t: '11월 수수료 ₱35,000이 남았습니다', s: '이수민 ₱25,000 · 12월 1일 · 박정우 ₱10,000 · 12월 10일', act: '안내 링크 보내기' },
          { id: 'r_draft', w: '회신 초안 4건', lv: 6, kind: '회신 초안', t: '밤사이 문의 6건, 회신 초안 4건', s: '확인하신 안내로만 썼습니다 · 승인 전에는 보내지 않습니다', act: '초안 4건 확인하기' },
        ],
      },
      // 공장 (공장_단계 S0~S5 · 오더 · 수량 · 날짜 · 사람 이름은 단계 시안의 예시 그대로)
      factory: {
        lv: 3, done: [], lateRun: false, late: false, traceRun: false, traced: false,
        todo: [
          { id: 'pl_diag', w: '새는 곳 다섯 찾음', lv: 1, kind: '현장 진단', t: '11월 20일 방문 진단 · 새는 곳 다섯', s: '누락 5건 · 납기 지연 3건 · 재고는 주 1회 눈으로 · 반장 2명 의존', act: '진단서 받기' },
          { id: 'pl_code', w: '같은 품목 이름 25개', lv: 1, kind: '품목 코드', t: '같은 품목이 다른 이름으로 25개 있습니다', s: '배터리 커버 · Batt Cover · 밧데리 커바 · BC-02 → BC-02 하나로', act: '코드 하나로 묶기' },
          { id: 'pl_late', w: '2일 늦어질 오더 1건', lv: 2, kind: '늦어질 오더', t: 'PO-2611-09 배터리 커버가 2일 늦어집니다', s: '출고 12월 4일 · 예상 완료 12월 6일 · 출고 7일 전에 찾음', act: '끝나는 날 보기' },
          { id: 'pl_qty', w: '오더보다 많은 작업지시', lv: 2, kind: '지시량 확인', t: 'PO-2611-21 작업지시가 오더보다 4,000개 많습니다', s: '오더 22,000 · 작업지시 26,000 · 고객사 변경 메일 없음 · 생산 지시 잠김', choices: ['고객사 확인', '보류'] },
          { id: 'pl_input', w: '정전 중 입력 도착', lv: 3, kind: '현장 입력', t: '정전 14:00 ~ 16:00 · 휴대폰에 보관한 입력이 들어왔습니다', s: '사출 7번 · B조 · 양품 1,240 · 불량 38 · 정지 45분', act: '작업자 입력 보기' },
          { id: 'pl_card', w: '반장 없이 금형 교체', lv: 3, kind: '반장 없는 날', t: 'B조 반장 휴무 · 7번 금형을 교체합니다', s: '작업 기준 카드대로 진행 · 첫 제품 사진 확인 뒤 생산 시작', act: '작업 기준 카드 보기' },
          { id: 'pl_short', w: '포장 박스 B 450개 부족', lv: 4, kind: '자재 부족', t: '포장 박스 B가 450개 모자랍니다 · 발주 전', s: '다음 2주 오더 기준 · 창고 1,200 · 필요 1,650', act: '450개 발주 승인' },
          { id: 'pl_lot', w: '반품 120개 · 같은 LOT 찾기', lv: 4, kind: '고객사 반품', t: '배터리 커버 120개가 반품됐습니다', s: '11월 24일 생산 · 사출 7번 · B조 · 같은 원자재를 쓴 오더를 찾습니다', act: '거슬러 찾기' },
          { id: 'pl_close', w: '오늘 마감 · 본사 보고', lv: 5, kind: '마감', t: '오늘 생산 42,620개 · 마감 전 확인', s: '출고 3건 · 불량 1.8% · 반품 LOT 검사', act: '마감하기' },
          { id: 'pl_plan', w: '다음 주 계획 · 늦어질 오더 0건', lv: 6, kind: '다음 주 계획', t: '다음 주 생산 계획 제안 · 작업지시 9건', s: '필요한 기계 시간 1,480 · 가능 1,610 · 금형 교체 7회', act: '계획 보기' },
        ],
      },
      // 커뮤니티 (커뮤니티_단계 S0~S5 · 예시 CV[S.cv] · 이름 · 수 · 글은 단계 시안의 예시 그대로)
      community: mkCommunity(0),
    },
  };

  const ck = () => (S.mode === 'hq' ? 'hq' : S.biz);
  const clock = (m = S.mins[ck()]) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
  const tick = (n = 1) => { S.mins[ck()] += n; $('#clock').textContent = clock(); };
  const B = () => BIZ[S.biz];
  const O = () => S.own[S.biz];
  const st = (n) => B().steps[n - 1];
  const isDone = (id) => !!O().todo.find((t) => t.id === id && t.done);

  // ---------- hint (오른쪽 「볼 것」) ----------
  const HINT = {
    lock: ['첫 실행', '숫자 네 개를 누르십시오', '지문 단추를 눌러도 열립니다. 실제 앱은 이 폰의 열쇠와 PIN이 둘 다 맞아야 열립니다.', '손님 장부가 들어 있는 앱이라 쇼룸과 주소를 나누고 검색에 걸리지 않게 합니다.'],
    today: ['본부판 · 오늘', '누를 것만 위에 옵니다', '하나를 끝내면 막대가 차고 숫자가 줄어듭니다. 다 끝내면 빈 목록 대신 끝낸 시각이 남습니다.', '오른쪽 위 「PC 본부」를 누르면 연결이 끊겼을 때의 모습이 나옵니다.'],
    clients: ['본부판 · 손님', '손님을 눌러 다음 단계로 옮겨 보십시오', '줄이 그 단계로 옮겨 가고, 본부가 이어서 할 일이 바로 정해집니다. 선금 · 잔금은 은행 앱에서 입금을 보신 뒤 누릅니다.', '문의부터 후기까지 아홉 단계는 수주 순서(CLAUDE.md §8) 그대로입니다.'],
    orders: ['본부판 · 지시', '아래 칸에 아무 말이나 써서 보내십시오', '받은함 번호가 붙고, 본부가 받으면 진행으로 바뀝니다. 「지시서 보드」에는 PC가 마지막으로 올린 시각이 붙습니다.', '사진 한 장으로도 지시할 수 있습니다.'],
    post: ['본부판 · 게시', '「승인」을 누르십시오', 'PC 본부가 가져가고, 카톡 방에 올리고, 올라간 화면 사진이 돌아오는 순서가 이어집니다. 조사한 사장님 앱 열 곳 가운데 이 일을 하는 곳은 없었습니다.', '「오늘 멈춤」은 그 방의 오늘 글만 멈춥니다.'],
    files: ['본부판 · 자료', '상담 자리에서 링크를 바로 보냅니다', '줄 오른쪽 단추로 링크를 복사합니다. 「값」에는 결정된 값과 포함 항목만 나옵니다.', '값을 바꾸는 일은 지시로 보내고 본부가 기록합니다.'],
  };
  const OHINT = {
    mart: {
      today: ['고른 단계의 일만 「지금 누를 것」에 올라옵니다', '단계를 올리면 그 단계의 일이 더해지고 숫자가 늘어납니다. 끝낸 일은 아래에 남고, 알림의 「되돌리기」로 다시 꺼낼 수 있습니다.'],
      orders: ['배달K · 그랩 · 메신저 · 매장 주문이 시각 순으로 한 목록에', '메신저 주문은 호수가 빠지면 빨간 꼬리표가 붙습니다. 눌러서 요청 글을 보내 보십시오.'],
      stock: ['네 경로에서 팔린 것이 한 재고에서 빠집니다', '1단계에서는 선반 순서대로 세는 실사표만 열립니다. 3단계부터 기준보다 적은 품목과 유통기한 임박이 나옵니다.'],
      settle: ['주문 합계와 통장 입금을 한 표에', '수수료 · 할인 · 환불을 빼서 받을 돈을 내고, 어긋난 주문 두 건을 찾습니다. 「확인 완료로 표시」로 끝냅니다.'],
      items: ['포스 · 배달K · 그랩 값을 한 줄에', '값이 다르거나 앱에 없는 품목에 꼬리표가 붙습니다. 위 카드는 한 품목의 경로별 마진입니다.'],
    },
    food: {
      today: ['고른 단계의 일만 「지금 누를 것」에 올라옵니다', '2단계부터 퇴사 직원 청구를 서명 기록과 맞춰 보는 장면이 열립니다. 끝낸 일은 아래에 남고, 「되돌리기」로 다시 꺼낼 수 있습니다.'],
      staff: ['퇴사한 직원이 청구해도 날마다 받은 서명으로 맞춰 봅니다', '「퇴사 직원 청구」를 눌러 「서명 기록과 맞춰 보기」를 누르십시오. 다섯 건이 차례로 지급함 · 휴무 · 더 줄 돈 · 기록 보완으로 나뉩니다.'],
      cost: ['팔린 메뉴만큼 재료를 빼고, 저울에 잰 양과 견줍니다', '메뉴마다 매장 · 배달K · 그랩 마진을 나란히 봅니다. 차이가 나면 이유를 남깁니다.'],
      settle: ['앱 주문과 통장 입금을 한 건씩', '어긋난 주문 두 건과 그랩에 보낼 문의 글이 나옵니다. 5단계부터 오늘 마감이 붙습니다.'],
      docs: ['감독관이 찾을 서류를 직원별로', '있음 · 일부 · 없음 · 만료 임박을 한 표에 둡니다. 빠진 종이 기록은 촬영하거나 「찾을 수 없음」으로 남깁니다.'],
    },
    golf: {
      today: ['고른 단계의 일만 「지금 누를 것」에 올라옵니다', '2단계부터 메신저 문의를 견적으로 옮기는 장면이 열립니다. 캐디팁처럼 값이 빈 항목이 있으면 견적서가 나가지 않습니다.'],
      sched: ['직원 모두가 같은 달력을 봅니다', '3단계부터 한 차에 두 팀이 겹치면 막고 비어 있는 차를 보여 줍니다. 기사가 전달을 확인한 시각도 남습니다.'],
      quote: ['빠진 항목이 있는 견적은 나가지 않습니다', '「견적으로 옮기기」를 누르면 날짜 · 인원 · 골프가 채워지고, 값이 없는 캐디팁에서 멈춥니다. 캐디팁을 정해야 견적서가 만들어집니다.'],
      money: ['입금이 다 들어온 예약만 확정됩니다', '받을 돈과 들어온 돈을 나란히 놓고 차액을 바로 보여 줍니다. 4단계부터 통장 잔액과 실제 순수익을 나눠 봅니다.'],
      rates: ['골프장마다 다른 포함 항목을 한 장에', '카트 · 캐디 · 캐디팁이 그린피에 들었는지 골프장마다 표시합니다. 5단계부터 협력 골프장이 빈 티업을 직접 올립니다.'],
    },
    agent: {
      today: ['고른 단계의 일만 「지금 누를 것」에 올라옵니다', '「비자 연장, 어디서 합니까」에서 「하나로 정리」를 누르십시오. 서로 다른 설명 네 가지가 안내 카드 하나로 모입니다.'],
      guide: ['같은 질문에 보낸 설명을 하나로', '질문마다 받은 횟수와 지금까지 보낸 설명 수가 나옵니다. 3단계부터 확인일이 지난 안내는 다시 확인하실 때까지 보낼 수 없습니다.'],
      page: ['상담 전에 고객의 상황을 질문으로 받습니다', '체류 기간을 고르면 그 고객에게 맞는 안내가 나옵니다. 고른 내용은 상담 예약과 함께 대표님께 정리돼 옵니다.'],
      clients: ['고객마다 빠진 서류와 다음 날짜', '빠진 서류만 남겨 보여 줍니다. 입주 첫 비용은 보증금 · 선납 월세 · 입주 청소를 더해 계산합니다.'],
      book: ['하루를 마칠 때 직접 응대할 문의만 남습니다', '받은 돈과 받을 돈, 들어올 날을 건별로 남깁니다. 메신저와 통장은 쓰시던 대로 두시면 됩니다.'],
    },
    factory: {
      today: ['고른 단계의 일만 「지금 누를 것」에 올라옵니다', '2단계부터 늦어질 오더를 출고 전에 찾습니다. 「2일 늦어질 오더 1건」을 펼쳐 「끝나는 날 보기」를 누르십시오. 승인 전에는 배정이 바뀌지 않습니다.'],
      orders: ['어디서 온 오더든 한 화면에 출고일 순으로', '1단계는 오더가 들어오는 길과 품목 코드를 정리합니다. 2단계부터 남은 수량과 기계별 실적으로 끝나는 날을 계산해 출고일과 견줍니다.'],
      floor: ['사무실 TV와 같은 숫자를 대표님 휴대폰에서도', '작업자가 기계 앞에서 양품 · 불량 · 정지 이유를 넣습니다. 정전으로 끊겨도 휴대폰에 보관했다가 다시 보냅니다.'],
      stock: ['다음 2주 오더에 모자랄 자재를 먼저', '입고 · 투입 · 불량 · 스크랩 · 출고를 한 건씩 남깁니다. 반품 하나에서 같은 원자재 LOT를 쓴 오더까지 거슬러 찾습니다.'],
      close: ['공장을 나서기 전에 오늘 마감을 확인합니다', '오늘 생산 · 불량 · 늦어질 오더와 결정할 일을 한 화면에 모으고, 한국어 보고로 본사에 보냅니다. 누가 언제 배정을 바꿨는지 지워지지 않게 남깁니다.'],
    },
    community: {
      today: ['고른 단계의 일만 「지금 누를 것」에 올라옵니다', '2단계부터 글이 게시판에 올라가기 전에 금지선과 대조합니다. 「선입금을 요구하는 글」을 펼쳐 「글 확인하기」를 누르십시오.'],
      faq: ['같은 질문에는 정리된 답 링크 하나로', '대화방과 카페에서 자주 나온 질문을 많이 나온 순서대로 정리합니다. AI 세 곳에 질문 10개를 물은 진단표도 함께 드립니다.'],
      board: ['누구나 읽고 회원이 쓰는 게시판', '주제를 누르면 그 주제 글만 남습니다. 선입금 요구 · 불법 광고 · 신분증 사진이 든 글은 올라가기 전에 운영자가 확인합니다.'],
      biz: ['질문 글을 읽은 회원이 맞는 업체에 바로 문의합니다', '업체가 서류를 올리면 운영자가 확인한 뒤 게시합니다. 등록비는 GCash 송금 안내와 영수증 확인으로 받습니다.'],
      seo: ['같은 질문으로 매주 재는 점검표', '질문 20개를 구글 · 네이버 · ChatGPT · Gemini에 물어 우리 답이 나왔는지 봅니다. 순위와 인용은 약속하지 않습니다.'],
    },
  };
  function hint(key) {
    if (!$('#hint')) return;
    let h;
    if (key === 'lock') h = HINT.lock;
    else if (S.mode === 'hq') h = HINT[key];
    else {
      const b = B(), o = O(), tab = b.tabs.find((t) => t[0] === S.tab), s0 = st(o.lv);
      const locked = tab && tab[3] > o.lv;
      const base = locked ? [`${tab[3]}단계 「${st(tab[3]).name}」에서 열리는 화면입니다`, '아래 단추로 그 단계까지 켜 보실 수 있습니다. 납품하는 앱에는 계약한 단계만 들어가고, 잠긴 화면과 값은 나오지 않습니다.'] : OHINT[S.biz][S.tab];
      $('#hint').innerHTML = `<p class="k">지금 화면 · 사장님판 · ${b.label} · ${tab ? tab[1] : ''}</p><h2>${esc(base[0])}</h2><p>${esc(base[1])}</p>
        <ul><li><span>켠 단계</span><b>${o.lv} · ${esc(s0.name)}</b></li><li><span>이 단계 값</span><b class="num">${esc(stepVal(s0))}</b></li>${s0.mo ? `<li><span>선택 월 관리</span><b class="num">${esc(s0.mo)}</b></li>` : ''}</ul>
        <p class="why">기능은 ${esc(b.src)}의 단계 그대로입니다. 값은 정가 · 첫 다섯 곳 시범가(사용 후기 조건)입니다.${b.conf ? ' 값은 현장 상담 후 확정합니다.' : ''}${b.resp ? ' ' + esc(b.resp) : ''}</p>`;
      return;
    }
    if (!h) return;
    $('#hint').innerHTML = `<p class="k">지금 화면 · ${esc(h[0])}</p><h2>${esc(h[1])}</h2><p>${esc(h[2])}</p>${h[3] ? `<p class="why">${esc(h[3])}</p>` : ''}`;
  }
  const stepVal = (s) => (s.flat ? `${s.list} · 값 하나` : s.list ? `${s.list} · 시범가 ${s.pilot}` : s.label);

  // ---------- toast (되돌리기) / sheet ----------
  let tt;
  function toast(msg, undo) {
    const t = $('#toast'), a = $('#toastAct');
    $('#toastMsg').textContent = msg;
    t.classList.toggle('top', sheet.classList.contains('on'));
    a.hidden = !undo; t.classList.toggle('act', !!undo);
    a.onclick = undo ? () => { hideToast(); undo(); } : null;
    t.classList.add('on'); clearTimeout(tt); tt = setTimeout(hideToast, undo ? 4000 : 2600);
  }
  function hideToast() { const t = $('#toast'); t.classList.remove('on', 'act'); clearTimeout(tt); }
  function openSheet(html) { hideToast(); $('#sheetBody').innerHTML = html; sheet.style.transform = ''; sheet.classList.add('on'); scrim.classList.add('on'); $('#sheetBody').scrollTop = 0; }
  function closeSheet() { sheet.style.transform = ''; sheet.classList.remove('on'); scrim.classList.remove('on'); }
  scrim.addEventListener('click', closeSheet);
  (() => { // 끌어내려 닫기
    let y0 = null, dy = 0; const g = $('#grab');
    g.addEventListener('pointerdown', (e) => { y0 = e.clientY; dy = 0; sheet.style.transition = 'none'; g.setPointerCapture(e.pointerId); });
    g.addEventListener('pointermove', (e) => { if (y0 === null) return; dy = Math.max(0, e.clientY - y0); sheet.style.transform = `translateY(${dy}px)`; });
    const end = () => { if (y0 === null) return; y0 = null; sheet.style.transition = ''; if (dy > 80) closeSheet(); else sheet.style.transform = ''; };
    g.addEventListener('pointerup', end); g.addEventListener('pointercancel', end);
  })();

  // ---------- tabs ----------
  const TABS = {
    hq: [['today', '오늘', I.today], ['clients', '손님', I.clients], ['orders', '지시', I.orders], ['post', '게시', I.post], ['files', '자료', I.files]],
  };
  function badge(key) {
    if (S.mode === 'hq') {
      if (key === 'today') return S.todo.filter((x) => !x.done).length;
      if (key === 'post') return S.posts.filter((p) => p.state === 'wait').length;
    } else if (key === 'today') return O().todo.filter((x) => x.lv <= O().lv && !x.done).length;
    return 0;
  }
  function renderTabs() {
    const list = S.mode === 'hq' ? TABS.hq : B().tabs.map(([k, l, ic, lv]) => [k, l, I[ic], lv]);
    tabsEl.innerHTML = list.map(([k, l, ic, lv]) => {
      const lk = S.mode !== 'hq' && lv > O().lv;
      const b = lk ? 0 : badge(k);
      return `<button class="tab ${lk ? 'lkd' : ''}" role="tab" data-a="tab" data-t="${k}" aria-selected="${S.tab === k}" aria-label="${l}${lk ? ` · ${lv}단계에서 열림` : ''}">${ic}<span>${l}</span>${b ? `<span class="bd">${b}</span>` : ''}${lk ? `<span class="lki">${I.lock}</span>` : ''}</button>`;
    }).join('') + (HOOK.tab ? HOOK.tab() : '');
  }

  // ---------- 공통 조각 ----------
  const pcPill = () => {
    const own = S.mode !== 'hq';
    return S.offline
      ? `<button class="pc off" data-a="pc" aria-label="연결 상태 바꿔 보기"><i></i>끊김 · ${own ? clock(S.mins[ck()] - 5) : '09:05'} 맞춤 ${I.chev}</button>`
      : `<button class="pc" data-a="pc" aria-label="연결 상태 바꿔 보기"><i></i>${own ? '맞춤' : 'PC 본부'} · 2분 전 ${I.chev}</button>`;
  };
  function heroBlock(left, total, doneMsg) {
    const done = total - left;
    return `<div class="hero"><div class="lab"><span>지금 누를 것</span><span class="num">${done}/${total}</span></div>
      <span class="big num" id="big">${left}</span>
      ${left === 0 ? `<p class="zero">${esc(doneMsg)}</p>` : ''}
      <div class="segs">${Array.from({ length: total }, (_, i) => `<i class="${i < done ? 'done' : ''}"></i>`).join('')}</div></div>`;
  }
  function todoRow(x, first, own, fold) {
    const p = x.post ? S.posts.find((q) => q.id === x.post) : null;
    const running = p && (p.state === 'run' || p.state === 'done');
    let acts = '';
    if (x.choices) acts = `<div class="acts">${x.choices.map((c, i) => `<button class="btn ${first && i === 0 ? 'p' : i === 0 ? 'q' : ''}" data-a="${own ? 'ochoice' : 'choice'}" data-id="${x.id}" data-c="${esc(c)}">${esc(c)}</button>`).join('')}</div>`;
    else if (!running) acts = `<div class="acts"><button class="btn ${first ? 'p' : 'q'}" data-a="${own ? 'oact' : 'tact'}" data-id="${x.id}">${esc(x.act)}</button>${x.post ? `<button class="btn" data-a="tab" data-t="post">글 보기</button>` : ''}</div>`;
    // 누를 것이 넷 이상이면 접는다: 「왜」 한 줄(t)은 늘 보이고, 누르면 종류 · 설명 · 단추가 펼쳐진다. 첫 줄의 단추는 접혀도 보인다.
    if (fold) {
      const open = !!S.open[x.id];
      return `<div class="row ${x.leave ? 'leave' : ''}" id="row-${x.id}"><div class="m">${open ? `<div class="kind">${esc(x.kind)}</div>` : ''}<button class="fh" data-a="fold" data-id="${x.id}" aria-expanded="${open}" aria-label="${esc(x.t)} · ${open ? '접기' : '설명 펼치기'}"><span class="t">${esc(open ? x.t : x.w || x.t)}</span>${I.down}</button>${open ? `<div class="s">${esc(x.s)}</div>` : ''}${open || first ? acts : ''}</div></div>`;
    }
    return `<div class="row ${x.leave ? 'leave' : ''}" id="row-${x.id}"><div class="m"><div class="kind">${esc(x.kind)}</div><div class="t">${esc(x.t)}</div><div class="s">${esc(x.s)}</div>${running ? timeline(p) : acts}</div></div>`;
  }
  const doneList = (arr) => arr.length ? `<div class="sec"><span>오늘 끝낸 것</span><span class="num">${arr.length}</span></div>
    <div class="grp">${arr.map((d) => `<div class="row"><span class="num" style="width:46px;flex:none;font-weight:700">${d.t}</span><div class="m"><div class="s" style="margin:0;color:var(--ink)">${esc(d.s)}</div></div></div>`).join('')}</div>` : '';

  // 잠긴 기능
  const lockLine = (n) => `<span class="lk">${I.lock}${n}단계 「${esc(st(n).name)}」에서 열림</span>`;
  const lockCard = (n, what) => what ? `<button class="lockcard" data-a="lockinfo" data-n="${n}">${lockLine(n)}<div class="t">${esc(what)}</div><div class="s num">${esc(stepVal(st(n)))}</div></button>`
    : `<button class="lockcard" data-a="lockinfo" data-n="${n}" aria-label="다음 단계 · ${esc(st(n).name)} 자세히">${lockLine(n)}</button>`;
  const featList = (s) => `<ul class="flist">${s.feats.map(([f, c]) => `<li><span>${esc(f)}</span><span class="pill ${CAN[c][1]}">${CAN[c][0]}</span></li>`).join('')}</ul>`;
  const valBlock = (s) => `<div class="val">${s.flat ? `<div><span>값 · 시범가 없이 하나</span><b>${esc(s.list)}</b></div>` : s.list ? `<div><span>정가</span><b>${esc(s.list)}</b></div><div><span>첫 다섯 곳 시범가 · 사용 후기 조건</span><b>${esc(s.pilot)}</b></div>` : `<div><span>값</span><b>${esc(s.label)}</b></div>`}${s.inc ? `<div><span>포함</span><b style="font:600 14px var(--f)">${esc(s.inc)}</b></div>` : ''}${s.mo ? `<div><span>선택 월 관리</span><b>${esc(s.mo)}</b></div>` : ''}${B().conf && s.list ? '<div><span>확정</span><b style="font:600 14px var(--f)">현장 상담 후</b></div>' : ''}</div>`;
  function lockPanel(n) {
    const s = st(n);
    return `<div class="pad"><div class="lockp"><span class="ic">${I.lock}</span><p class="k">${n}단계에서 열리는 화면</p><h3>${esc(s.name)}</h3>
      ${featList(s)}${valBlock(s)}
      <p class="s" style="font-size:14px;color:var(--sub);margin:0">준비해 주실 자료 · ${esc(s.prep)}</p>
      <button class="btn p wide" data-a="setlv" data-n="${n}">${n}단계까지 켜 보기</button></div></div>`;
  }
  const lockSheet = (n) => { const s = st(n); return `<h4>${n}단계 · ${esc(s.name)}</h4><p class="sub">${esc(B().label)} 단계별 시안 그대로입니다</p>${featList(s)}<div style="height:10px"></div>${valBlock(s)}
    <p class="sub" style="margin:12px 0">준비해 주실 자료 · ${esc(s.prep)}</p><button class="btn p wide" data-a="setlv" data-n="${n}">${n}단계까지 켜 보기</button>`; };

  // 작은 표
  const atable = (head, rows, opt = {}) => `<div class="atw"><table class="at ${opt.c ? 'mx' : ''}"><thead><tr>${head.map((h, i) => `<th class="${opt.c && i ? 'c' : ''}">${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr class="${r.cls || ''}">${r.map((c, i) => `<td class="${opt.c && i ? 'c' : ''}">${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  const neg = (t) => `<span class="neg">${t}</span>`;
  const okc = (t) => `<span class="ok">${t}</span>`;

  // ---------- 본부판 views ----------
  function vToday() {
    const due = S.clients.reduce((a, c) => a + (c.due || 0), 0);
    const dueN = S.clients.filter((c) => c.due).length;
    const left = S.todo.filter((x) => !x.done);
    return `<div class="pad"><div class="hd"><span class="d">11월 28일 토</span>${pcPill()}</div>
      ${heroBlock(left.length, S.todo.length, `오늘 누를 것을 다 끝냈습니다 · ${clock()}`)}
      ${left.length ? `<div class="grp">${left.map((x, i) => todoRow(x, i === 0)).join('')}</div>` : ''}
      <div class="sec"><span>돈</span></div>
      <div class="grp"><button class="row" data-a="tab" data-t="clients"><div class="m"><div class="s">받을 돈 · 선금 · 잔금 ${dueN}건</div><div class="t num" style="font-size:20px">${won(due)}</div></div>${I.chev}</button></div>
      <div class="sec"><span>본부</span></div>
      <div class="grp"><button class="row" data-a="report"><div class="m"><div class="t">아침 보고 · 07:40</div><div class="s">지시서 2건 끝, 1건 진행 · 새 문의 1</div></div>${I.chev}</button></div>
      ${doneList(S.doneToday)}
    </div>`;
  }
  function vClients() {
    const counts = STAGES.map((_, i) => S.clients.filter((c) => c.st === i).length);
    const due = S.clients.reduce((a, c) => a + (c.due || 0), 0);
    const list = S.clients.filter((c) => S.stageFilter === 'all' || c.st === +S.stageFilter).sort((a, b) => b.st - a.st);
    return `<div class="pad"><div class="hd"><h2 class="title">손님</h2><span class="d">받을 돈 <b class="num" style="color:var(--ink)">${won(due)}</b></span></div>
      <div class="chips" role="group" aria-label="단계">
        <button class="chip" data-a="stage" data-s="all" aria-pressed="${S.stageFilter === 'all'}">전체 <b>${S.clients.length}</b></button>
        ${STAGES.map((n, i) => `<button class="chip" data-a="stage" data-s="${i}" aria-pressed="${S.stageFilter === String(i)}">${n} <b>${counts[i]}</b></button>`).join('')}
      </div>
      <div class="grp">${list.length ? list.map((c) => `<button class="row" data-a="client" data-id="${c.id}" id="cl-${c.id}">
          <div class="m"><div class="t">${esc(c.n)} <span class="pill">${esc(c.k)}</span></div><div class="s"><b style="color:var(--ink);font-weight:600">${STAGES[c.st]}</b> · ${esc(c.next)}</div>
          <div class="ticks" aria-hidden="true">${STAGES.map((_, i) => `<i class="${i < c.st ? 'd' : i === c.st ? 'c' : ''}"></i>`).join('')}</div></div>
          <div class="r">${c.due ? `<div class="num" style="font-weight:700">${won(c.due)}</div><div class="s">받을 돈</div>` : ''}</div>${I.chev}</button>`).join('')
        : `<div class="row"><div class="m"><div class="t">이 단계에 있는 손님이 없습니다</div><div class="s">다른 단계를 누르거나 전체로 보십시오.</div></div></div>`}</div>
    </div>`;
  }
  function clientSheet(c) {
    const last = c.st >= STAGES.length - 1;
    const nx = STAGES[c.st + 1];
    const label = nx === '선금' ? '선금 받음' : nx === '후기' ? '잔금 받음 · 후기로' : `${nx}(으)로 옮기기`;
    return `<h4>${esc(c.n)}</h4><p class="sub">${esc(c.k)} · 지금 ${STAGES[c.st]} 단계</p>
      <div class="steps">${STAGES.map((_, i) => `<i class="${i < c.st ? 'd' : i === c.st ? 'c' : ''}"></i>`).join('')}</div>
      <div class="stepnames"><span>문의</span><span>견적</span><span>제작</span><span>후기</span></div>
      ${last ? `<p class="quote">후기까지 끝난 손님입니다. 사례 한 장은 본부가 사실표 양식으로 만듭니다.</p>`
        : `<p class="quote"><b>다음 · ${nx}</b><br>${esc(NEXT_WORK[nx])}</p>
        <button class="btn p wide" data-a="move" data-id="${c.id}">${esc(label)}</button>`}`;
  }
  function vOrders() {
    const seg = `<div class="seg" role="tablist"><button data-a="oseg" data-s="talk" aria-pressed="${S.orderSeg === 'talk'}">지시</button><button data-a="oseg" data-s="board" aria-pressed="${S.orderSeg === 'board'}">지시서 보드</button></div>`;
    if (S.orderSeg === 'board') {
      const cnt = (s) => S.board.filter((b) => b.st === s).length;
      return `<div class="pad"><div class="hd"><h2 class="title">지시</h2><span class="d">PC 기준 ${S.offline ? '09:05' : '09:10'}</span></div>${seg}
        <div class="grp"><div class="row"><div class="m"><div class="s">열림</div><div class="t num" style="font-size:20px">${cnt('열림')}</div></div><div class="m"><div class="s">진행</div><div class="t num" style="font-size:20px">${cnt('진행')}</div></div><div class="m"><div class="s">끝</div><div class="t num" style="font-size:20px">${cnt('끝')}</div></div></div></div>
        <div class="sec"><span>지시서</span></div>
        <div class="grp">${S.board.map((b) => `<div class="row"><div class="m"><div class="s num">${b.wo}</div><div class="t">${esc(b.t)}</div></div><span class="pill ${b.st === '진행' ? 'acc' : b.st === '열림' ? 'wait' : ''}">${b.st}</span></div>`).join('')}</div>
        <p style="font-size:14px;color:var(--sub);margin:12px 2px 0">고칠 것은 지시로 보냅니다. PC가 꺼져 있으면 마지막으로 올린 시각이 그대로 남습니다.</p></div>`;
    }
    return `<div class="pad" style="flex:1"><div class="hd"><h2 class="title">지시</h2><span class="d">받은함 #${S.inbox - 1}까지</span></div>${seg}
      <div class="thread">${S.talk.map((m) => `<div class="msg ${m.isNew ? 'new' : ''}"><div class="bub">${esc(m.text)}</div><div class="st"><span class="num">#${m.no ?? '—'}</span><span>${m.tm}</span><span class="pill ${m.st === '진행' ? 'acc' : m.st === '보류' || m.st === '폰에 보관' ? 'wait' : ''}">${m.st}${m.wo ? ' · ' + m.wo : ''}</span></div>${m.note ? `<div class="st">${esc(m.note)}</div>` : ''}</div>`).join('')}</div></div>
      <form class="compose" id="compose"><button type="button" class="ib" data-a="photo" aria-label="사진 붙이기">${I.cam}</button><input id="msg" autocomplete="off" placeholder="생각나는 대로 쓰십시오" aria-label="지시 쓰기"><button class="send" type="submit" aria-label="보내기">${I.send}</button></form>`;
  }
  function timeline(p) {
    const steps = [['승인', p.t0], ['PC 본부가 가져감', p.t1], ['카톡 방에 올림', p.t2], ['올라간 화면 사진 도착', p.t3]];
    const held = S.offline && p.step < 2;
    return `<ol class="tl">${steps.map(([n, t], i) => `<li class="${i < p.step ? 'on' : i === p.step ? 'now' : ''}"><span>${n}${held && i === 1 ? ' · 연결되면 보냅니다' : ''}</span><span class="tm num">${i < p.step && t ? t : ''}</span></li>`).join('')}</ol>
      ${p.step >= 4 ? `<button class="shot" data-a="shot" data-id="${p.id}"><span class="mini" aria-hidden="true"><i style="width:60%"></i><i class="b"></i><i class="img"></i><i style="width:40%"></i></span><span class="m"><span class="t" style="display:block;font-size:14px">${esc(p.room)}에 올라간 화면</span><span class="s" style="display:block">${p.t2} 올림 · 경고 신호 없음</span></span>${I.chev}</button>` : ''}`;
  }
  function vPost() {
    const wait = S.posts.filter((p) => p.state === 'wait').length;
    return `<div class="pad"><div class="hd"><h2 class="title">게시</h2><span class="d">오늘 ${S.posts.length}건 · 승인 대기 ${wait}</span></div>
      <div class="grp">${S.posts.map((p) => {
        const open = S.openPost === p.id;
        const pill = p.state === 'wait' ? '<span class="pill wait">승인 대기</span>' : p.state === 'run' ? '<span class="pill acc">올리는 중</span>' : p.state === 'done' ? '<span class="pill acc">올림</span>' : p.state === 'pause' ? '<span class="pill stop">오늘 멈춤</span>' : p.state === 'fix' ? '<span class="pill wait">고치는 중</span>' : '<span class="pill">예약</span>';
        return `<div class="post" id="post-${p.id}"><button class="ph" data-a="popen" data-id="${p.id}" aria-expanded="${open}"><span class="tm num">${p.tm}</span><span class="m"><span class="t" style="display:block">${esc(p.room)}</span></span>${pill}</button>
          ${open ? `<div class="prev"><div>${esc(p.text)}</div><div class="art" aria-hidden="true"></div></div>
          ${p.state === 'wait' ? `<div class="acts"><button class="btn p" data-a="approve" data-id="${p.id}">승인</button><button class="btn" data-a="pause" data-id="${p.id}">오늘 멈춤</button><button class="btn" data-a="fix" data-id="${p.id}">고쳐 달라</button></div>` : ''}
          ${p.state === 'run' || p.state === 'done' ? timeline(p) : ''}` : ''}</div>`;
      }).join('')}</div>
      <p style="font-size:14px;color:var(--sub);margin:12px 2px 0">글과 사진은 본부가 준비합니다. 승인하시면 PC 본부가 정해진 시각에 올립니다.</p></div>`;
  }
  function vFiles() {
    const chips = ['all', '시안', '제안서', '카톡 이미지', '값'];
    const head = `<div class="pad"><div class="hd"><h2 class="title">자료</h2></div>
      <label class="search">${I.search}<input id="q" placeholder="업종이나 이름으로 찾기" aria-label="자료 찾기" value="${esc(S.q || '')}"></label>
      <div class="chips" role="group" aria-label="종류">${chips.map((c) => `<button class="chip" data-a="ffilter" data-f="${c}" aria-pressed="${S.fileFilter === c}">${c === 'all' ? '전체' : c}</button>`).join('')}</div>`;
    if (S.fileFilter === '값') {
      return head + `<div class="grp price"><div class="row" style="display:block"><div class="s">마트 · 선택 월 관리</div><div class="v num">월 15만 원</div>
        <ul class="inc"><li><span>오류 고치기 · 값 바꾸기</span><span>횟수 제한 없음</span></li><li><span>백업</span><span>매일</span></li><li><span>가벼운 수정</span><span>월 5건</span></li><li><span>점검</span><span>월 1회 30분 화상</span></li><li><span>서버 · AI 이용료</span><span>실비 별도</span></li></ul></div>
        <div class="row"><div class="m"><div class="s">한 장 홈페이지 월 관리</div><div class="t num">월 5만 원</div></div></div>
        <div class="row"><div class="m"><div class="s">여행 견적 · 예약과 배차 월 관리</div><div class="t num">월 10만 원</div></div></div>
        <div class="row"><div class="m"><div class="s">여행 통합 월 관리</div><div class="t num">월 15만 원</div></div></div></div>
        <p style="font-size:14px;color:var(--sub);margin:12px 2px 0">상품표에 결정된 값만 나옵니다. 고르지 않아도 프로그램은 손님 것입니다.</p></div>`;
    }
    const q = (S.q || '').trim();
    const list = S.files.filter((f) => (S.fileFilter === 'all' || f.k === S.fileFilter) && (!q || (f.g + f.t).includes(q)));
    const groups = [...new Set(list.map((f) => f.g))];
    return head + (groups.length ? groups.map((g) => `<div class="sec"><span>${esc(g)}</span></div><div class="grp">${list.filter((f) => f.g === g).map((f) => `<div class="row" style="align-items:center"><div class="m"><div class="t">${esc(f.t)}</div><div class="s">${esc(f.k)}</div></div><button class="ib" data-a="copy" data-t="${esc(f.t)}" aria-label="${esc(f.t)} 링크 복사">${I.copy}</button></div>`).join('')}</div>`).join('')
      : `<div class="grp"><div class="row"><div class="m"><div class="t">「${esc(q)}」에 맞는 자료가 없습니다</div><div class="s">업종 이름(마트 · 식당 · 공장)으로 찾아보십시오.</div></div></div></div>`) + '</div>';
  }

  // ---------- 사장님판 · 오늘 (마트 · 식당 같은 틀) ----------
  function vOToday() {
    const b = B(), o = O(), lv = o.lv;
    const list = o.todo.filter((t) => t.lv <= lv), left = list.filter((t) => !t.done);
    let extra = '';
    if (S.biz === 'mart' && lv >= 4) extra = `<div class="sec"><span>오늘 매출 · ${clock()} 기준</span></div><div class="grp"><button class="row" data-a="tab" data-t="settle"><div class="m"><div class="t num" style="font-size:20px">₱33,340</div><div class="s">매장 ₱11,200 · 배달K ₱8,740 · 그랩 ₱9,320 · 메신저 ₱4,080</div></div>${I.chev}</button></div>`;
    if (S.biz === 'food' && lv >= 5) extra = `<div class="sec"><span>오늘 · ${clock()} 기준</span></div><div class="grp"><button class="row" data-a="tab" data-t="settle"><div class="m"><div class="s">임대료 전 이익</div><div class="t num" style="font-size:20px">₱19,020</div><div class="s">매출 ₱48,600 · 재료 · 수수료 · 인건비 ₱29,580</div></div>${I.chev}</button></div>`;
    if (S.biz === 'golf' && lv >= 4) extra = `<div class="sec"><span>12월 · 예약별 손익</span></div><div class="grp"><button class="row" data-a="tab" data-t="money"><div class="m"><div class="s">예상 순수익</div><div class="t num" style="font-size:20px">₩2,520,000</div><div class="s">받은 돈 ₩12,480,000 · 줄 돈 ₩9,960,000</div></div>${I.chev}</button></div>`;
    if (S.biz === 'agent' && lv >= 5) extra = `<div class="sec"><span>오늘 · ${clock()} 기준</span></div><div class="grp"><button class="row" data-a="tab" data-t="book"><div class="m"><div class="s">대표님이 직접 응대할 문의</div><div class="t num" style="font-size:20px">5건</div><div class="s">오늘 문의 14건 · 안내 링크로 해결 9건</div></div>${I.chev}</button></div>`;
    // 누를 것이 넷 이상이면 접는다: 줄마다 짧은 「왜」 한 줄, 매출 · 손익 줄은 펼친 줄과 각 탭에서 보고, 다음 단계 카드는 한 줄로
    const fold = left.length > 3;
    if (fold) extra = '';
    const nx = lv < 6 ? (fold ? lockCard(lv + 1, '') : `<div class="sec"><span>다음 단계에서 열림</span></div>${lockCard(lv + 1, st(lv + 1).feats.map((f) => f[0].split(' · ')[0]).join(' · '))}`) : '';
    return `<div class="pad"><div class="hd"><span class="d">${b.shop} · ${b.date}</span>${pcPill()}</div>
      ${heroBlock(left.length, list.length, `오늘 누를 것을 다 끝냈습니다 · ${clock()}`)}
      ${left.length ? `<div class="grp">${left.map((x, i) => todoRow(x, i === 0, true, fold)).join('')}</div>` : ''}
      ${extra}${doneList(o.done.filter((d) => !d.lv || d.lv <= lv))}${nx}</div>`;
  }

  // ---------- 마트 ----------
  const MORD = [
    { tm: '10:42', src: '배달K', id: '#1182', n: 8, amt: 4080, st: '담는 중', c: '' },
    { tm: '10:45', src: '그랩', id: '#4531', n: 5, amt: 2310, st: '담는 중', c: '' },
    { tm: '10:48', src: '메신저', id: '이 대표님', n: 3, amt: 1120, st: '호수 확인', c: 'stop', hosu: true },
    { tm: '10:51', src: '매장', id: '계산대 1', n: 4, amt: 1640, st: '완료', c: 'acc' },
    { tm: '10:53', src: '그랩', id: '#4532', n: 6, amt: 2740, st: '대파 부족', c: 'stop' },
  ];
  function vMOrders() {
    const o = O(); if (o.lv < 3) return lockPanel(3);
    const rows = [];
    if (o.lv >= 5) rows.push(`<button class="row" data-a="dlv"><span class="num" style="width:46px;flex:none;font-weight:700">10:05</span><div class="m"><div class="t">고객 앱 · 그린베이 타워 2 · 2914호</div><div class="s">8품목 · 현금 ₱4,080 · 11:20 도착 예정</div></div><span class="pill acc">배달 중</span></button>`);
    if (o.matched) rows.push(`<div class="row fresh"><span class="num" style="width:46px;flex:none;font-weight:700">14:02</span><div class="m"><div class="t">메신저 · 최 사모님 · 세렌 파크 2타워</div><div class="s">주문판에 올림 · ${esc(o.lines.filter((l) => l.ok || (l.pick && l.pick !== '빼기')).length)}줄</div></div><span class="pill wait">호수 확인 중</span></div>`);
    MORD.forEach((r) => {
      const h = r.hosu && !o.hosuSent;
      const stt = r.hosu && o.hosuSent ? '회신 대기' : r.st;
      const cls = r.hosu && o.hosuSent ? 'wait' : r.c;
      const inner = `<span class="num" style="width:46px;flex:none;font-weight:700">${r.tm}</span><div class="m"><div class="t">${esc(r.src)} · ${esc(r.id)}</div><div class="s"><span class="num">${r.n}</span>품목 · <span class="num">${peso(r.amt)}</span></div></div><span class="pill ${cls}">${esc(stt)}</span>`;
      rows.push(h ? `<button class="row" data-a="hosu">${inner}</button>` : `<div class="row">${inner}</div>`);
    });
    return `<div class="pad"><div class="hd"><h2 class="title">주문</h2><span class="d">통합 주문함 · 추가 80만 원</span></div>
      <div class="grp">${rows.join('')}</div>
      <p style="font-size:14px;color:var(--sub);margin:10px 2px 0">앱 주문은 화면 캡처나 글로 올려 이 목록에 모읍니다.</p>
      ${o.lv < 4 ? lockCard(4, '메신저 글을 주문으로 옮기기 · 기사별 배차') : ''}
      ${o.lv < 5 ? lockCard(5, '고객 앱 주문 · 배달 현황') : ''}</div>`;
  }
  function vMStock() {
    const o = O();
    const cnt = isDone('m_cnt');
    let h = `<div class="pad"><div class="hd"><h2 class="title">재고</h2><span class="d">${clock()} 기준</span></div>
      <div class="grp"><button class="row" data-a="count"><div class="m"><div class="kind">재고 실사표</div><div class="t">냉장 2번 · 12개 선반 중 2번째</div><div class="s">${cnt ? '저장함 · 다음 선반은 냉장 3번' : '선반 순서대로 넣으면 차이가 바로 보입니다'}</div></div>${cnt ? '<span class="pill acc">저장함</span>' : '<span class="pill stop">어묵 3봉 차이</span>'}${I.chev}</button></div>`;
    if (o.lv >= 3) {
      const low = isDone('m_low');
      h += `<div class="sec"><span>공통 재고 · 네 경로 판매를 한 재고에서</span></div>
        <div class="grp"><button class="row" data-a="lowinfo"><div class="m"><div class="t">대파 · 채소 1번</div><div class="s">기준 3단 · 매장 · 배달K · 그랩 · 메신저에서 22단 팔림</div></div><div class="r"><div class="num" style="font-weight:800;font-size:20px;color:var(--stop)">2단</div>${low ? '<span class="pill acc">앱 품절 표시함</span>' : ''}</div>${I.chev}</button></div>
        <div class="sec"><span>유통기한 임박</span><span>2</span></div>
        <div class="grp"><div class="row"><div class="m"><div class="t">두부</div><div class="s">6모</div></div><span class="pill stop">내일</span></div><div class="row"><div class="m"><div class="t">콩나물</div><div class="s">4봉</div></div><span class="pill wait">모레</span></div></div>`;
    } else h += lockCard(3, '공통 재고 · 품절과 유통기한 알림');
    if (o.lv >= 4) {
      h += `<div class="sec"><span>변경 기록</span></div><div class="grp">${o.reason ? `<div class="row fresh"><span class="num" style="width:46px;flex:none;font-weight:700">${esc(o.reasonAt)}</span><div class="m"><div class="t">어묵 · 장부 −3봉</div><div class="s">대표님 · 사유 ${esc(o.reason)}</div></div></div>` : ''}<div class="row"><span class="num" style="width:46px;flex:none;font-weight:700">14:20</span><div class="m"><div class="t">포기김치 3kg · 12 → 9통</div><div class="s">마크 · 사유 실사</div></div></div></div>`;
    } else h += lockCard(4, '권한과 변경 이력 · 누가 언제 재고를 바꿨는지');
    if (o.lv >= 6) {
      h += `<div class="sec"><span>부족 수량 예측 · 05:10</span></div><div class="grp"><div class="row" style="display:block"><div class="t">대파 · 목요일 12단 부족 예상</div>
        <ul class="inc"><li><span>매장 평균</span><span class="num">9단</span></li><li><span>앱 주문 평균</span><span class="num">13단</span></li><li><span>지금 재고</span><span class="num">10단</span></li><li><span>발주 제안</span><span class="num">15단 · 여유 3단</span></li></ul></div></div>`;
    } else h += lockCard(6, '부족 수량 예측 · 발주서 준비');
    return h + '</div>';
  }
  function vMSettle() {
    const o = O(); if (o.lv < 2) return lockPanel(2);
    const dn = isDone('m_set');
    let h = `<div class="pad"><div class="hd"><h2 class="title">정산</h2><span class="d">11월 16일 ~ 22일</span></div>
      ${atable(['', '배달K', '그랩'], [
        ['<b>주문 합계</b>', '₱84,200', '₱112,600'], ['수수료', '−₱8,420', '−₱22,520'], ['할인 · 환불', '−₱1,240', '−₱3,180'],
        Object.assign(['<b>받을 돈</b>', '<b>₱74,540</b>', '<b>₱86,900</b>'], { cls: 'sum' }), ['통장 입금', '₱74,540', '₱84,620'],
        Object.assign(['<b>차액</b>', okc('0'), dn ? okc('확인 완료') : neg('−₱2,280')], { cls: dn ? '' : 'hi' })])}
      <div class="sec"><span>그랩 · 확인할 주문</span><span>대조 214건 · 맞음 212건</span></div>
      <div class="grp" id="gap"><div class="row"><div class="m"><div class="t num">#4471</div><div class="s">품절 환불 두 번</div></div><span class="num" style="font-weight:700;color:var(--stop)">₱1,480</span></div>
        <div class="row"><div class="m"><div class="t num">#4502</div><div class="s">할인은 누가 부담했나</div></div><span class="num" style="font-weight:700;color:var(--stop)">₱800</span></div></div>
      <div class="acts"><button class="btn" data-a="inq">그랩에 보낼 문의 글</button>${dn ? '' : '<button class="btn p" data-a="setdone">확인 완료로 표시</button>'}</div>
      <div class="sec"><span>자료 올리기</span></div>
      <div class="grp"><div class="row"><div class="m"><div class="t">그랩 판매 자료</div></div><span class="d" style="font-size:14px;color:var(--sub)">11월 22일까지</span></div><div class="row"><div class="m"><div class="t">배달K 내역</div></div><span style="font-size:14px;color:var(--sub)">11월 22일까지</span></div><div class="row"><div class="m"><div class="t">통장</div></div><span style="font-size:14px;color:var(--sub)">11월 25일까지</span></div></div>`;
    if (o.lv >= 4) {
      const cd = isDone('m_close');
      h += `<div class="sec"><span>오늘 마감 · 경로별</span></div><div class="grp"><button class="row" data-a="mclose"><div class="m"><div class="t">순수익 <span class="num">₱6,160</span></div><div class="s">매출 ₱33,340 · 매입 · 앱 수수료 ₱27,180</div></div>${cd ? '<span class="pill acc">마감함</span>' : ''}${I.chev}</button></div>`;
    } else h += lockCard(4, '경로별 마감 · 들어올 돈');
    return h + '</div>';
  }
  const ITEMS = [
    { n: '포기김치 3kg', p: '₱780', d: '₱850', g: '₱920', s: ['정상', 'acc'], f: '' },
    { n: '삼겹살 1kg', p: '₱590', d: '₱640', g: '₱690', s: ['정상', 'acc'], f: '' },
    { n: '대파 1단', p: '₱90', d: '₱100', g: '없음', s: ['등록 필요', 'stop'], f: 'miss' },
    { n: '계란 30구', p: '₱290', d: '₱270', g: '₱340', s: ['가격 낮음', 'stop'], f: 'diff' },
    { n: '냉동 손만두', p: '₱280', d: '₱310', g: '₱340', s: ['정상', 'acc'], f: '' },
  ];
  function vMItems() {
    const o = O(); const f = o.itemFilter; const dn = isDone('m_item');
    const list = ITEMS.filter((x) => f === 'all' || x.f === f);
    const chips = [['all', '전체', 300], ['diff', '값 다름', 1], ['miss', '앱에 없음', 1]];
    return `<div class="pad"><div class="hd"><h2 class="title">품목</h2><span class="d">통합 품목표 · 300품목</span></div>
      <div class="grp"><div class="row" style="display:block"><div class="kind">경로별 마진</div><div class="t">포기김치 3kg · 수수료를 뺀 금액</div>
        <div class="bars3"><div><span>매장</span><i><b style="width:100%"></b></i><span>₱180</span></div><div><span>배달K</span><i><b style="width:92%"></b></i><span>₱165</span></div><div class="lo"><span>그랩</span><i><b style="width:76%"></b></i><span>₱136</span></div></div></div></div>
      <div class="chips" role="group" aria-label="품목 거르기" style="margin-top:12px">${chips.map(([k, l, n]) => `<button class="chip" data-a="ifilter" data-f="${k}" aria-pressed="${f === k}">${l} <b>${n}</b></button>`).join('')}</div>
      ${atable(['품목', '포스', '배달K', '그랩', ''], list.map((x) => Object.assign([`<b>${x.n}</b>`, x.p, x.f === 'diff' ? neg(x.d) : x.d, x.f === 'miss' ? neg('없음') : x.g, `<span class="pill ${x.s[1]}">${x.s[0]}</span>`], { cls: '' })))}
      ${dn ? '<p style="font-size:14px;color:var(--sub);margin:12px 2px 0">고칠 목록에 넣었습니다 · 앱 값은 목록대로 고칩니다.</p>' : '<div class="acts"><button class="btn p wide" data-a="fixlist">값이 다른 2개 · 고칠 목록 만들기</button></div>'}</div>`;
  }
  function countSheet() {
    const o = O(), en = o.countLang === 'en', need = o.lv >= 3;
    const R = en
      ? [['Tofu', '18 pcs', 'was 24'], ['Bean sprouts', '11 packs', 'was 16'], ['Leek', '24 bundles', '+20 in'], ['Kimchi 3kg', '9 tubs', 'was 12'], ['Pork belly 1kg', '14 packs', 'was 21'], ['Fish cake', '3 packs off', '', 1], ['Perilla', '26 bunches', '+30 in']]
      : [['두부', '18모', '어제 24'], ['콩나물', '11봉', '어제 16'], ['대파', '24단', '입고 20'], ['포기김치 3kg', '9통', '어제 12'], ['삼겹살 1kg', '14팩', '어제 21'], ['어묵', '3봉 차이', '', 1], ['깻잎', '26묶음', '입고 30']];
    const ok = !need || o.reason;
    return `<h4>${en ? 'Count shelf by shelf' : '선반 순서대로 재고 확인'}</h4><p class="sub">${en ? 'Chiller 2 · shelf 2 of 12' : '냉장 2번 · 12개 선반 중 2번째'} · 직원 휴대폰 화면</p>
      <div class="seg" role="group" aria-label="직원 화면 말"><button data-a="clang" data-l="ko" aria-pressed="${!en}">한국어</button><button data-a="clang" data-l="en" aria-pressed="${en}">English</button></div>
      <div class="grp" style="background:var(--surface2)">${R.map(([a, b, c, hi]) => `<div class="row" style="${hi ? 'background:var(--stop-soft)' : ''};min-height:48px;padding:10px 14px"><div class="m"><div class="t" style="font-size:16px">${a}</div>${c ? `<div class="s">${c}</div>` : ''}</div><b class="num" style="${hi ? 'color:var(--stop)' : ''}">${b}</b></div>`).join('')}</div>
      ${need ? `<p class="sub" style="margin:14px 0 6px">어묵 · 장부를 고칠 사유 (사유를 고르지 않으면 저장되지 않습니다)</p>
        <div class="seg s3" role="group" aria-label="사유">${['입고', '실사', '손실'].map((r) => `<button data-a="reason" data-r="${r}" aria-pressed="${o.reason === r}">${r}</button>`).join('')}</div>`
        : `<div style="margin-top:12px">${lockCard(3, '사유가 남는 재고 수정')}</div><div style="height:12px"></div>`}
      <button class="btn p wide" data-a="countsave" ${ok ? '' : 'disabled'}>${ok ? (en ? 'Save · Next shelf' : '저장 · 다음 선반') : '사유를 고르면 저장됩니다'}</button>`;
  }
  function matchSheet() {
    const L = O().lines; const left = L.filter((l) => l.c && !l.pick).length;
    return `<h4>메신저 주문 → 주문판</h4><p class="sub">14:02 · 18분째 주문판에 없음 · 한 줄씩 물건을 붙입니다</p>
      <div class="bubble"><small>최 사모님</small>신라면 5, 두부 2, 지난번 그 김치 보내 주세요~ 2타워요</div>
      <ul class="ln">${L.map((l, i) => `<li><div class="q"><span>“${esc(l.q)}”</span>${l.ok ? `<span class="pill acc">${esc(l.ok)}</span>` : l.pick ? `<span class="pill acc">${esc(l.pick)}</span>` : `<span class="pill stop">${esc(l.note)}</span>`}</div>
        ${l.c ? `<div class="cands">${l.c.map((c) => `<button class="cand" data-a="mpick" data-i="${i}" data-c="${esc(c)}" aria-pressed="${l.pick === c}">${esc(c)}</button>`).join('')}</div>` : ''}</li>`).join('')}</ul>
      <p class="sub">세렌 파크 2타워 · 경비실에 신분증 · 서비스 엘리베이터</p>
      <button class="btn p wide" data-a="matchdone" ${left ? 'disabled' : ''}>${left ? `남은 줄 ${left}개 · 주문판에 못 올림` : '주문판에 올리기'}</button>`;
  }
  function martClose() {
    const W = (n) => `${(n / 33340 * 100).toFixed(1)}%`;
    return `<h4>오늘 마감</h4><p class="sub">${B().date} · ${clock()} · 포스와 회계는 쓰시던 대로 둡니다</p>
      <div class="wf"><div><span>오늘 매출</span><i><b style="--o:0%;--w:100%"></b></i><span>₱33,340</span></div>
        <div class="out"><span>매입 · 앱 수수료</span><i><b style="--o:${W(6160)};--w:${W(27180)}"></b></i><span>−₱27,180</span></div>
        <div><span>순수익</span><i><b style="--o:0%;--w:${W(6160)}"></b></i><span>₱6,160</span></div></div>
      <ul class="inc" style="margin-bottom:6px"><li><span>매장</span><span class="num">₱11,200</span></li><li><span>배달K</span><span class="num">₱8,740</span></li><li><span>그랩</span><span class="num">₱9,320</span></li><li><span>메신저</span><span class="num">₱4,080</span></li></ul>
      <p class="sub" style="margin:12px 0 6px">들어올 돈</p>
      <ul class="inc" style="margin:0 0 6px"><li><span>그랩 · 내일</span><span class="num">₱7,456</span></li><li><span>배달K · 금요일</span><span class="num">₱41,300</span></li></ul>
      <p class="sub" style="margin:12px 0">자동 확인 · 재고 차이 1건 · 정산 차액 1건 · 유통기한 임박 2건</p>
      ${isDone('m_close') ? '<button class="btn wide" data-a="close">닫기</button>' : '<button class="btn p wide" data-a="closeday">마감하기</button>'}`;
  }

  // ---------- 식당 ----------
  const CLAIMS = [
    ['8월 31일 월', '공휴일 12시간', '10:00 ~ 19:00', '공휴일 8시간', ['지급함', 'acc']],
    ['9월 5일 토', '연장 4시간', '10:00 ~ 20:00', '연장 1시간', ['지급함', 'acc']],
    ['9월 13일 일', '휴무일 근무', '휴무 서명', '근무 없음', ['휴무', '']],
    ['9월 19일 토', '연장 2시간', '10:00 ~ 21:00', '연장 2시간', ['지급 필요 ₱225', 'stop']],
    ['9월 24일 목', '연장 3시간', '서명 없음', '확인 전', ['기록 보완', 'stop']],
  ];
  function claimSheet() {
    const o = O(), on = o.claimDone;
    return `<h4>퇴사 직원 청구 대조 · 마리아</h4><p class="sub">2023년 11월 ~ 2026년 10월 근무 · 청구 5건</p>
      <ul class="cl" id="claims">${CLAIMS.map(([d, c, rec, calc, r], i) => `<li class="${on ? 'on' : ''}" data-i="${i}"><div class="a"><span>${d}</span><span>${c} 청구</span></div>
        <div class="b"><span class="res">기록 ${rec} · 계산 ${calc}</span><span class="pill ${r[1]} res">${r[0]}</span></div></li>`).join('')}</ul>
      <div id="claimSum" ${on ? '' : 'hidden'}><div class="sumr"><div><small>지급함</small><b>2건</b></div><div><small>휴무 · 근무 없음</small><b>1건</b></div><div><small>지급 필요</small><b style="color:var(--stop)">₱225</b></div><div><small>기록 보완</small><b style="color:var(--stop)">1건</b></div></div>
        <p class="sub">3년 기록 묶음 · 근무 864일 · 급여 명세 72장 · 13월 급여 3회 · 서명 없는 날 4일</p></div>
      ${on ? (isDone('f_claim') ? '<button class="btn wide" data-a="close">닫기</button>' : '<button class="btn p wide" data-a="claimok">확인 끝</button>') : '<button class="btn p wide" data-a="claimrun" id="claimRun">서명 기록과 맞춰 보기</button>'}`;
  }
  const PAY = [['조이', 13, '₱9,059', 1], ['라몬', 13, '₱9,552', 1], ['엘라', 12, '₱8,028', 0], ['마크', 13, '₱11,810', 1], ['지노', 13, '₱9,754', 1]];
  function paySheet() {
    const o = O(), p = o.pay; // 1 검토, 2 승인, 3 발송
    const names = ['작성', '검토', '승인', '명세서 발송'];
    return `<h4>급여대장 · 11월 16일 ~ 30일</h4><p class="sub">일급 기준 ₱718 · 휴일 · 연장 · 야간 · 공제 포함</p>
      <ol class="pipe">${names.map((n, i) => `<li class="${i < p ? 'dn' : i === p ? 'now' : ''}">${n}</li>`).join('')}</ol>
      ${atable(['직원', '일수', '실수령', '서명'], PAY.map(([n, d, v, s]) => [`<b>${n}</b>`, d, `<b>${v}</b>`, s ? okc('완료') : neg('대기')]).concat([Object.assign(['합계', '', '<b>₱48,203</b>', '대기 1'], { cls: 'sum' })]))}
      <div style="height:12px"></div>
      ${p >= 3 ? '<button class="btn wide" data-a="close">닫기</button>' : p === 1 ? '<button class="btn p wide" data-a="payadv">검토 끝 · 승인으로</button>' : '<button class="btn p wide" data-a="payadv">승인 · 명세서 발송</button>'}`;
  }
  const phoneSheet = () => `<h4>직원 휴대폰 · 출퇴근</h4><p class="sub">지문 대신 매장 QR과 직원 번호로 남기고, 직원이 시간을 확인해 서명합니다</p>
    <div class="phone" aria-hidden="true"><div class="s" style="font-size:14px;color:var(--sub)">출근 · 매장 QR 확인됨</div><div class="nm">엘라</div>
      <div class="s" style="font-size:14px">오늘 근무 <b>10:00 ~ 15:00 · 17:00 ~ 21:00</b></div>
      <div class="pd"><i></i><i></i><i class="e"></i><i class="e"></i></div>
      <div class="pad3">${'123456789'.split('').map((k) => `<span>${k}</span>`).join('')}<span style="font-size:14px">지움</span><span>0</span><span style="font-size:14px;color:var(--acc)">확인</span></div>
      <div style="font-size:14px">어제 휴게 시간 1시간을 쓰셨습니까?</div></div>
    <button class="btn wide" data-a="close">닫기</button>`;
  function reasonSheet() {
    return `<h4>삼겹살 · 냉장 1번 차이</h4><p class="sub">레시피로 계산한 양 6.5kg · 저울에 잰 양 6.1kg · 0.4kg(2인분)</p>
      <textarea class="field" id="why" placeholder="차이 이유를 짧게 남겨 주십시오" aria-label="차이 이유">${esc(O().reasonText)}</textarea>
      <button class="btn p wide" data-a="reasonsave">이유 남기기</button>`;
  }
  function foodClose() {
    const W = (n) => `${(n / 48600 * 100).toFixed(1)}%`;
    return `<h4>오늘 마감</h4><p class="sub">${B().date} · ${clock()} · 포스와 회계는 쓰시던 대로 둡니다</p>
      <div class="wf"><div><span>매출</span><i><b style="--o:0%;--w:100%"></b></i><span>₱48,600</span></div>
        <div class="out"><span>재료비</span><i><b style="--o:${W(31500)};--w:${W(17100)}"></b></i><span>−₱17,100</span></div>
        <div class="out"><span>인건비</span><i><b style="--o:${W(22200)};--w:${W(9300)}"></b></i><span>−₱9,300</span></div>
        <div class="out"><span>앱 수수료</span><i><b style="--o:${W(19020)};--w:${W(3180)}"></b></i><span>−₱3,180</span></div>
        <div><span>임대료 전 이익</span><i><b style="--o:0%;--w:${W(19020)}"></b></i><span>₱19,020</span></div></div>
      <ul class="inc"><li><span>매장</span><span class="num">₱28,000</span></li><li><span>배달K</span><span class="num">₱9,400</span></li><li><span>그랩</span><span class="num">₱11,200</span></li><li><span>재료비율 · 인건비율</span><span class="num">35.2% · 19.1%</span></li></ul>
      <p class="sub" style="margin:12px 0 6px">들어올 돈</p>
      <ul class="inc" style="margin:0 0 12px"><li><span>그랩 · 내일</span><span class="num">₱8,960</span></li><li><span>배달K · 금요일</span><span class="num">₱33,840</span></li></ul>
      ${isDone('f_close') ? '<button class="btn wide" data-a="close">닫기</button>' : '<button class="btn p wide" data-a="closeday">마감하기</button>'}`;
  }
  function vFStaff() {
    const o = O(); if (o.lv < 2) return lockPanel(2);
    const cd = isDone('f_claim'), pd = o.pay >= 3, wd = isDone('f_wage');
    const W = [['조이', '10:00 ~ 19:00', 1], ['라몬', '09:00 ~ 18:00', 1], ['엘라', '10:00 ~ 19:00', 0], ['마크', '10:00 ~ 22:00', 1], ['지노', '16:00 ~ 23:00', 1]];
    let h = `<div class="pad"><div class="hd"><h2 class="title">직원</h2><span class="d">${B().shop}</span></div>
      <div class="grp"><button class="row" data-a="claim"><div class="m"><div class="kind">퇴사 직원 청구</div><div class="t">마리아 · 청구 5건</div><div class="s">${cd ? '맞춰 봄 · 지급 필요 ₱225 · 기록 보완 1건' : '서명 기록과 하루씩 맞춰 봅니다'}</div></div>${cd ? '<span class="pill acc">확인 끝</span>' : '<span class="pill wait">대조 전</span>'}${I.chev}</button></div>
      <div class="sec"><span>11월 22일 일 · 근무 기록</span><span>매장 QR · 직원 서명</span></div>
      <div class="grp">${W.map(([n, t, p]) => `<div class="row"><div class="m"><div class="t">${n}</div><div class="s num">${t}</div></div>${p ? '<span class="pill acc">서명</span>' : '<span class="pill wait">종이 카드 없음 · 서명 있음</span>'}</div>`).join('')}</div>
      <div class="acts"><button class="btn wide" data-a="phone">직원 휴대폰 화면 보기</button></div>
      <div class="sec"><span>급여</span></div>
      <div class="grp"><button class="row" data-a="pay"><div class="m"><div class="t">급여대장 · 11월 16일 ~ 30일</div><div class="s">5명 · 실수령 합계 <span class="num">₱48,203</span></div></div><span class="pill ${pd ? 'acc' : 'wait'}">${pd ? '명세서 발송' : o.pay === 2 ? '승인 차례' : '검토 차례'}</span>${I.chev}</button>
        <div class="row"><div class="m"><div class="t">임금 기준 ₱658 → ₱718</div><div class="s">9월 26일부터 · 조이 · 라몬 · 엘라 부족분 <span class="num">₱4,368</span> · 회계사 확인 완료</div></div><span class="pill ${wd ? 'acc' : 'stop'}">${wd ? '반영함' : '반영 전'}</span></div></div>`;
    if (o.lv >= 6) {
      h += `<div class="sec"><span>다음 주 근무표 제안</span></div><div class="grp"><div class="row" style="display:block"><ul class="inc" style="margin:0"><li><span>예상 주문</span><span class="num">412건</span></li><li><span>필요한 시간</span><span class="num">428시간</span></li><li><span>지금 근무표</span><span class="num">452시간</span></li><li><span>넘치는 근무 · 15시 ~ 17시</span><span class="num" style="color:var(--stop)">24시간</span></li><li><span>인건비 차이</span><span class="num">₱2,160</span></li></ul></div></div>`;
    } else h += lockCard(6, '근무표 제안 · 임금 변경 미리 계산');
    return h + '</div>';
  }
  function vFCost() {
    const o = O(); if (o.lv < 3) return lockPanel(3);
    const gd = isDone('f_gap');
    return `<div class="pad"><div class="hd"><h2 class="title">원가</h2><span class="d">재료비와 앱 수수료를 뺀 마진</span></div>
      ${atable(['메뉴', '재료비', '매장', '배달K', '그랩'], [['<b>삼겹살 200g</b>', '₱171', '₱279', '₱261', '₱245'], ['<b>김치찌개</b>', '₱118', '₱202', '₱188', '₱178'], ['<b>제육볶음</b>', '₱126', '₱224', '₱207', '₱194'], ['<b>순두부찌개</b>', '₱96', '₱204', '₱192', '₱176'], ['<b>해물파전</b>', '₱190', '₱190', '₱152', neg('₱114')]])}
      <div class="sec"><span>레시피 차감 · 삼겹살 · 냉장 1번</span></div>
      <div class="grp"><div class="row" style="display:block"><ul class="inc" style="margin:0"><li><span>아침 재고</span><span class="num">14.0kg</span></li><li><span>매장 22인분</span><span class="num">−4.4</span></li><li><span>배달K 8인분</span><span class="num">−1.6</span></li><li><span>그랩 6인분</span><span class="num">−1.2</span></li><li><span>폐기</span><span class="num">−0.3</span></li><li><span><b>남아야 할 양</b></span><span class="num">6.5kg</span></li><li><span>저울에 잰 양</span><span class="num">6.1kg</span></li></ul></div>
        <button class="row" data-a="reason2"><div class="m"><div class="t" style="color:var(--stop)">차이 0.4kg · 2인분</div><div class="s">${gd ? '이유 · ' + esc(o.reasonText) : '이유를 남겨 다음 달과 비교합니다'}</div></div>${gd ? '<span class="pill acc">남김</span>' : ''}${I.chev}</button></div>
      <p style="font-size:14px;color:var(--sub);margin:12px 2px 0">오늘 재료비 <span class="num">₱17,100</span> · 매출 <span class="num">₱48,600</span>의 35.2% · 대표님 기준 35%</p></div>`;
  }
  function vFSettle() {
    const o = O(); if (o.lv < 4) return lockPanel(4);
    const dn = isDone('f_set'), od = isDone('f_out');
    let h = `<div class="pad"><div class="hd"><h2 class="title">정산</h2><span class="d">11월 16일 ~ 22일</span></div>
      ${atable(['', '배달K', '그랩'], [['<b>주문 합계</b>', '₱65,800', '₱78,400'], ['수수료', '−₱6,580', '−₱15,680'], ['할인 · 환불', '−₱920', '−₱2,640'],
        Object.assign(['<b>받을 돈</b>', '<b>₱58,300</b>', '<b>₱60,080</b>'], { cls: 'sum' }), ['통장 입금', '₱58,300', '₱58,420'],
        Object.assign(['<b>차액</b>', okc('0'), dn ? okc('확인 완료') : neg('−₱1,660')], { cls: dn ? '' : 'hi' })])}
      <div class="sec"><span>그랩 · 확인할 주문</span></div>
      <div class="grp" id="gap"><div class="row"><div class="m"><div class="t num">#7731</div><div class="s">환불 두 번</div></div><span class="num" style="font-weight:700;color:var(--stop)">₱1,120</span></div>
        <div class="row"><div class="m"><div class="t num">#7758</div><div class="s">할인은 누가 부담했나</div></div><span class="num" style="font-weight:700;color:var(--stop)">₱540</span></div></div>
      <div class="acts"><button class="btn" data-a="inq">그랩에 보낼 문의 글</button>${dn ? '' : '<button class="btn p" data-a="setdone">확인 완료로 표시</button>'}</div>
      <div class="sec"><span>통합 주문함 · 12:18 · 조리할 주문 5건</span></div>
      <div class="grp">${[['배달K #2217', '김치찌개 2'], ['그랩 #7804', '제육 1, 파전 1'], ['배달K #2218', '삼겹살 3'], ['매장 4번', '순두부 2'], ['그랩 #7805', '옵션 확인', 1]].map(([a, b, r]) => `<div class="row"><div class="m"><div class="t num">${a}</div></div><span class="${r ? 'pill stop' : ''}" style="font-size:14px">${b}</span></div>`).join('')}
        <div class="row"><div class="m"><div class="t">품절 표시 · 해물파전</div><div class="s">오징어 2인분</div></div><span class="pill ${od ? 'acc' : 'stop'}">${od ? '앱에서 끔' : '앱 판매 중'}</span></div></div>`;
    if (o.lv >= 5) {
      const cd = isDone('f_close');
      h += `<div class="sec"><span>오늘 마감</span></div><div class="grp"><button class="row" data-a="fclose"><div class="m"><div class="t">임대료 전 이익 <span class="num">₱19,020</span></div><div class="s">매출 ₱48,600 · 재료비 ₱17,100 · 인건비 ₱9,300 · 앱 수수료 ₱3,180</div></div>${cd ? '<span class="pill acc">마감함</span>' : ''}${I.chev}</button></div>`;
    } else h += lockCard(5, '오늘 순수익 · 권한과 변경 이력');
    return h + '</div>';
  }
  function vFDocs() {
    const D = (k, l) => `<span class="dt ${k}" role="img" aria-label="${l}"></span>`;
    const y = D('y', '있음'), p = D('p', '일부'), n = D('n', '없음'), w = D('w', '만료 임박');
    const cardDone = isDone('f_card');
    return `<div class="pad"><div class="hd"><h2 class="title">서류</h2><span class="d">감독 서류함 · 직원 6명</span></div>
      ${atable(['직원', '계약서', '근무 기록', '명세', '13월', '보건증'], [
        ['<b>마리아</b> <span class="pill">퇴사</span>', y, p, y, p, y], ['<b>조이</b>', n, y, y, y, y], ['<b>라몬</b>', y, y, y, y, w],
        ['<b>엘라</b>', n, y, y, y, y], ['<b>마크</b>', y, y, y, y, y], ['<b>지노</b>', y, p, y, n, y]], { c: 1 })}
      <div class="legend"><span>${y}있음</span><span>${p}일부</span><span>${n}없음</span><span>${w}만료 임박</span></div>
      <div class="sec"><span>다가오는 만료</span></div>
      <div class="grp"><div class="row"><div class="m"><div class="t">라몬 · 보건증</div></div><span class="pill stop">12월 8일</span></div><div class="row"><div class="m"><div class="t">영업허가</div></div><span class="pill wait">1월 20일</span></div><div class="row"><div class="m"><div class="t">대표님 취업허가</div></div><span class="pill">3월 14일</span></div></div>
      <div class="sec"><span>종이 기록 보관 · 2024년 타임카드</span></div>
      <div class="grp"><div class="row"><div class="m"><div class="t">2월 16일 ~ 29일</div></div><span class="pill acc">12장</span></div><div class="row"><div class="m"><div class="t">3월 1일 ~ 15일</div></div><span class="pill ${cardDone ? '' : 'stop'}">${cardDone ? esc(O().cardNote) : '없음'}</span></div><div class="row"><div class="m"><div class="t">3월 16일 ~ 31일</div></div><span class="pill ${cardDone ? '' : 'stop'}">${cardDone ? esc(O().cardNote) : '없음'}</span></div></div></div>`;
  }

  const closeBtn = '<button class="btn wide" data-a="close">닫기</button>';
  const tm = (t) => `<span class="num" style="width:46px;flex:none;font-weight:700">${esc(t)}</span>`;

  // ---------- 여행 · 골프 (여행골프_단계 S0~S5 · 숫자와 이름은 단계 시안의 예시 그대로) ----------
  const Q_FILL = [['날짜', '12월 11일 ~ 14일'], ['인원', '골프 4 · 동반 1'], ['골프', '2라운드']];
  const Q_ITEMS = [['그린피', '4명', '₱20,800'], ['카트', '2대', '₱2,600'], ['캐디', '4명', '₱2,400'], ['캐디팁', '4명', null], ['밴', '05:40 ~ 20:15', '₱8,500'], ['초과 3시간', '', '₱2,040'], ['한식당 저녁', '5명', '₱6,000'], ['호텔 3실', '3박', '₱40,500'], ['가이드', '하루', '₱3,000']];
  const TIPS = ['견적에 넣기 · ₱1,000', '손님이 현장에서 직접'];
  const qTotal = (o) => (o.tip === TIPS[0] ? '₩4,194,000' : '₩4,146,000');
  function quoteSheet() {
    const o = O();
    if (o.qView === 'doc') return `<h4>고객 견적서</h4><p class="sub">상호와 유효 기한이 담긴 견적서를 이미지로 보냅니다</p>${quoteDoc(true)}`;
    const on = o.q >= 1, show = on || o.qRunning;
    const fill = Q_FILL.map(([a, b]) => `<div class="qr rv ${on ? 'on' : ''}" data-q><span>${a}</span><span style="font-family:var(--f)">${b}</span></div>`).join('')
      + `<div class="qr rv ${on ? 'on' : ''}" data-q style="color:var(--stop)"><span><b>확인 필요</b></span><span style="font-family:var(--f);color:var(--stop)">${o.tip ? '없음' : '캐디팁 조건'}</span></div>`;
    const items = Q_ITEMS.map(([a, em, v]) => {
      const miss = v === null && !o.tip;
      const val = v !== null ? v : o.tip ? (o.tip === TIPS[0] ? '₱1,000' : '현장에서 직접') : '값 없음';
      return `<div class="qr rv ${on ? 'on' : ''} ${miss ? 'miss' : ''}" data-q${v === null ? ' id="tipRow"' : ''}><span>${a}${em ? `<em>${em}</em>` : ''}</span><span>${val}</span></div>`;
    }).join('');
    return `<h4>견적 · 박 대표님 일행 3박 4일</h4><p class="sub">문의 글을 붙여 넣으면 날짜와 인원이 입력됩니다</p>
      <div class="bubble"><small>메신저 문의</small>11일 도착, 골프 4명 두 번입니다. 한 명은 관광하고 14일 낮에 출발합니다.</div>
      ${show ? `<p class="sub" style="margin:12px 0 0">자동 입력</p>${fill}<p class="sub" style="margin:14px 0 0">항목</p>${items}
      <div class="qtot rv ${on ? 'on' : ''}" data-q><span class="sub" style="margin:0">${o.tip ? '합계' : '합계 · 확인이 필요한 항목 1건'}</span><b class="num">${qTotal(o)}</b></div>` : ''}
      ${on ? `<p class="sub" style="margin:10px 0 6px">캐디팁을 넣거나 「손님이 현장에서 직접」을 고르셔야 견적서가 만들어집니다</p><div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">${TIPS.map((c) => `<button class="cand" data-a="qtip" data-c="${esc(c)}" aria-pressed="${o.tip === c}">${esc(c)}</button>`).join('')}</div>
        <button class="btn p wide" data-a="qmake" ${o.tip ? '' : 'disabled'}>${o.tip ? '견적서 만들기' : '누락 항목 입력 후 발송 가능'}</button>`
      : `<div style="height:12px"></div><button class="btn p wide" data-a="qrun" id="qRun" ${o.qRunning ? 'disabled' : ''}>${o.qRunning ? '옮기는 중' : '견적으로 옮기기'}</button>`}`;
  }
  function quoteDoc(inSheet) {
    const o = O(), en = o.qLang === 'en', tipIn = o.tip !== TIPS[1];
    const L = en
      ? { co: 'Haeoreum Golf · Quotation', h: 'Manila Golf · 4 days, 3 nights', d: 'Fri Dec 11 – Mon Dec 14 · 5 guests', days: [['Day 1 · Airport arrival', 'Hotel check-in · Korean dinner'], ['Day 2 · Blue Hill CC 07:30', '18 holes · cart · caddie included'], ['Day 3 · Sun Valley CC 08:10', '18 holes · cart · caddie included'], ['Day 4 · Airport departure', 'Leave the hotel at 10:00']],
        g: 'Golfer', c: 'Companion', tipY: 'Caddie tip', tipYv: 'Included', tipN: 'Caddie tip', tipNv: 'Paid by guests on site', tot: 'Total', v: 'Version 2 · valid until Dec 5' }
      : { co: '해오름골프 · 고객 견적서', h: '마닐라 골프 3박 4일', d: '12월 11일 금 ~ 14일 월 · 5명', days: [['1일차 공항 도착', '호텔 체크인 · 한식 저녁'], ['2일차 블루힐 CC 07:30', '18홀 · 카트 · 캐디 포함'], ['3일차 선밸리 CC 08:10', '18홀 · 카트 · 캐디 포함'], ['4일차 공항 출발', '호텔 10:00 출발']],
        g: '골프 1인', c: '동반 1인', tipY: '캐디팁', tipYv: '포함', tipN: '캐디팁', tipNv: '손님이 현장에서 직접', tot: '합계', v: '2판 · 12월 5일까지 유효' };
    return `<div class="seg" role="group" aria-label="견적서 말"><button data-a="qlang" data-l="ko" aria-pressed="${!en}">한글</button><button data-a="qlang" data-l="en" aria-pressed="${en}">English</button></div>
      <div class="qdoc"><p class="co" style="margin:0">${L.co}</p><h5>${L.h}</h5><p class="sub" style="margin:0">${L.d}</p>
        <ol class="tl">${L.days.map(([a, b], i) => `<li class="${i === 0 ? 'now' : ''}"><span>${a}<em>${b}</em></span></li>`).join('')}</ol>
        <div style="margin-top:10px">${tipIn ? `<div class="qr"><span>${L.g}<em>× 4</em></span><span>₩935,000</span></div><div class="qr"><span>${L.c}<em>× 1</em></span><span>₩454,000</span></div>` : ''}
        <div class="qr"><span>${tipIn ? L.tipY : L.tipN}</span><span style="font-family:var(--f);font-weight:600">${tipIn ? L.tipYv : L.tipNv}</span></div>
        <div class="qr"><span><b>${L.tot}</b></span><span>${qTotal(o)}</span></div></div>
        <p class="sub" style="margin:8px 0 0">${L.v}</p></div>
      ${inSheet ? (isDone('g_quote') ? closeBtn : '<button class="btn p wide" data-a="qsend">이미지로 보내기</button>') : ''}`;
  }
  const askSheet = () => `<h4>빠른 답장 · 우리 여행사 채널</h4><p class="sub">날짜 · 인원 · 항공편을 먼저 확인한 뒤 담당자에게 전달합니다</p>
    <div class="bubble"><small>고객</small>12월 골프 4명 견적 부탁드립니다</div>
    <p class="quote">안녕하십니까. 아래 세 가지를 알려 주시면 견적을 준비해 드립니다.<br>① 날짜 ② 인원 ③ 항공편</p>
    <p class="sub" style="margin:0 0 6px">고객 화면의 단추</p><div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px"><span class="pill">견적 받기</span><span class="pill">티업 확인</span><span class="pill">차량 문의</span></div>
    ${isDone('g_ask') ? closeBtn : '<button class="btn p wide" data-a="gasksend">이 답장 보내기</button>'}`;
  const DRV = [['05:40 베이 호텔 로비', '4명 · 골프백 4개 · 도착 완료'], ['07:30 블루힐 CC', '대기 주차 B구역'], ['18:30 한식당', '5명 · 예약 확인됨']];
  function driverSheet() {
    const o = O(), k = o.drv, next = ['블루힐 CC 도착', '한식당 도착', null][k];
    return `<h4>기사 화면 · 로델</h4><p class="sub">기사 휴대폰 · 12월 12일 토 · 오늘 3곳</p>
      <ol class="tl">${DRV.map(([a, b], i) => `<li class="${i <= k ? 'on' : i === k + 1 ? 'now' : ''}"><span>${a}<em>${b}</em></span></li>`).join('')}</ol>
      ${next ? `<button class="btn q wide" style="margin-top:12px" data-a="gdrvnext">${next}</button>` : '<p class="sub" style="margin:12px 0 0">오늘 3곳 끝 · 도착 시각이 대표님 화면에 남았습니다</p>'}
      <p class="sub" style="margin:16px 0 4px">현장에서 나온 돈 · 기사가 영수증을 찍어 올림</p>
      <ul class="inc" style="margin:0 0 14px"><li><span>톨비</span><span class="num">₱420</span></li><li><span>주차</span><span class="num">₱100</span></li><li><span><b>오늘 합계</b></span><span class="num">₱520</span></li></ul>
      ${isDone('g_drv') ? closeBtn : '<button class="btn p wide" data-a="gdrvok">지출 확인</button>'}`;
  }
  const siteSheet = () => `<h4>예약 홈페이지 · 고객이 보는 화면</h4><p class="sub">포함 항목을 모두 밝힌 금액으로 안내합니다 · 한국어 · English</p>
    <div class="gcard"><p class="k">해오름골프 · 골프장 · 일정 · 예약</p><h5>마닐라 골프</h5><p class="sub" style="margin:0 0 4px">블루힐 · 선밸리 · 12.11 ~ 12.14 · 4명</p>
      <ul class="inc"><li><span>3박 4일 2라운드 · 전용 밴 · 한식 저녁 2회</span><span class="num">1인 ₩935,000</span></li><li><span>2박 3일 2라운드 · 전용 밴 · 공항 이동</span><span class="num">1인 ₩720,000</span></li><li><span>동반 관광 하루 · 가이드 · 점심 포함</span><span class="num">1인 ₩120,000</span></li></ul>
      <p class="sub" style="margin:8px 0 0">포함 · 그린피 · 카트 · 캐디 · 차량 · 톨비 · 총액으로 표시</p></div>
    <div class="sec"><span>협력 골프장 화면</span></div><div class="grp" style="background:var(--surface2)"><div class="row"><div class="m"><div class="t">블루힐 CC · 토요일 빈 티업</div><div class="s">골프장이 직접 올렸습니다 · 골프장의 참여 동의가 필요합니다</div></div><span class="pill acc">3팀</span></div></div>
    <div class="sec"><span>고객 앱 · 내 여행 2일차</span></div>
    <ol class="tl" style="margin:0 0 14px"><li class="now"><span>05:40 호텔 로비<em>로델 기사 · 흰색 밴 · 4821</em></span></li><li><span>07:30 블루힐 CC 티업<em>카트 2대 · 캐디 4명 준비됨</em></span></li><li><span>13:00 클럽하우스 점심</span></li><li><span>18:30 한식당<em>5명 · 안쪽 방</em></span></li></ol>
    <p class="sub" style="margin:0 0 12px">검색 순위는 약속드리지 않습니다.</p>
    ${isDone('g_tee') ? closeBtn : '<button class="btn p wide" data-a="gteeok">확인</button>'}`;
  const DELAY = [['공항 픽업', '13:50 →', '14:30'], ['밴 A 대기료', '', '₱0'], ['호텔 체크인', '15:00 →', '15:40'], ['한식당 저녁', '', '18:30 그대로'], ['다음 팀 밴 A', '', '밴 B로 바꿈']];
  const NOTES = [['고객 · 한국어', '14:30에 3번 출구에서 모시겠습니다. 석식 예약은 변동 없습니다.'], ['기사 · English', 'Pickup moved to 14:30, Gate 3. Four golf bags.'], ['호텔 · English', 'Park party of 5, check-in 15:40.']];
  function delaySheet() {
    const o = O(), on = o.delayRun;
    return `<h4>항공편 40분 지연</h4><p class="sub">03:12 · 대표님 휴대폰 · 박 대표님 일행 13:20 → 14:00 도착</p>
      ${DELAY.map(([a, b, c]) => `<div class="qr rv ${on ? 'on' : ''}" data-d><span>${a}</span><span>${b ? `<span style="color:var(--sub);font-weight:400">${b}</span> ` : ''}<span style="color:var(--acc)">${c}</span></span></div>`).join('')}
      <p class="sub" style="margin:14px 0 6px">발송 대기 안내문 3건</p>
      ${NOTES.map(([k, t]) => `<div class="bubble rv ${on ? 'on' : ''}" data-d><small>${k}</small>${t}</div>`).join('')}
      <p class="quote rv ${on ? 'on' : ''}" data-d style="font-size:14px"><b>운영 제안</b><br>이 항공편은 이번 달 4회 중 3회 지연되었습니다. 다음 견적부터 픽업을 30분 늦추시겠습니까?</p>
      ${isDone('g_delay') ? closeBtn : on ? '<button class="btn p wide" data-a="gdelayok">승인하고 보내기</button><p class="sub" style="text-align:center;margin:10px 0 0">대표님이 승인하신 것만 발송합니다</p>' : `<button class="btn p wide" data-a="gdelayrun" id="dRun" ${o.delayRunning ? 'disabled' : ''}>${o.delayRunning ? '다시 맞추는 중' : '일정 다시 맞추기'}</button>`}`;
  }
  function vGSched() {
    const o = O(), lv = o.lv, dup = isDone('g_dup'), t = lv >= 4 ? '07:48' : '07:30';
    let h;
    if (lv < 3) {
      const D = [['금 11', [['공항 13:20 · 밴 A', '차량'], ['베이 호텔 · 3실 체크인', '숙소']]], ['토 12', [[`블루힐 ${t} · 박 대표님 4명`, '티업'], ['출발 05:40 · 밴 A', '차량']]], ['일 13', [['선밸리 08:10 · 박 대표님 4명', '티업'], ['출발 06:20 · 밴 A', '차량']]], ['월 14', [['공항 10:00 · 밴 B', '차량'], ['체크아웃 09:00', '숙소']]]];
      h = `<div class="pad"><div class="hd"><h2 class="title">일정</h2><span class="d">12월 예약 달력 · 직원 4명 공유</span></div>
        <div class="grp">${D.map(([d, L]) => `<div class="day"><b>${d}</b><ul>${L.map(([a, k]) => `<li><span>${a}</span><span class="pill ${k === '티업' ? 'acc' : ''}">${k}</span></li>`).join('')}</ul></div>`).join('')}</div>
        <p class="resp">담당자가 자리를 비워도 같은 달력으로 업무가 이어집니다.</p>${lockCard(3, '배정 · 배차 중복 차단 · 기사 전달과 확인')}`;
    } else {
      const D = [
        ['금 11', [['밴 A · 13:20 ~ 18:00', '박 대표님']]],
        ['토 12', [[`블루힐 ${t} 티업`, '박 대표님 4명'], ['밴 A · 05:40 ~ 20:15', '박 대표님'], dup ? ['밴 B · 11:00', '바꿔 배정함', 'fresh'] : ['밴 A · 11:00', '겹침 · 들어가지 않음', 'x'], ['가이드 미나', '동반 1명 관광']]],
        ['일 13', [['선밸리 08:10 티업', '박 대표님 4명'], ['밴 A · 06:20 ~ 19:00', '박 대표님'], ['밴 B · 09:00 ~ 15:00', '최 대표님']]],
        ['월 14', [['밴 B · 10:00 ~ 12:30', '박 대표님']]]];
      h = `<div class="pad"><div class="hd"><h2 class="title">배정</h2><span class="d">12월 11일 ~ 14일</span></div>
        <div class="grp">${D.map(([d, L]) => `<div class="day"><b>${d}</b><ul>${L.map(([a, b, c]) => `<li class="${c || ''}"><span>${a}</span><span style="${c ? '' : 'color:var(--sub)'}">${b}</span></li>`).join('')}</ul></div>`).join('')}</div>
        ${dup ? '' : '<div class="acts"><button class="btn q wide" data-a="gdup">토요일 밴 B 이용 가능 · 밴 B로 배정</button></div>'}
        <div class="sec"><span>기사 전달</span><span>보낸 시각 · 확인 시각</span></div>
        <div class="grp"><div class="row"><div class="m"><div class="t">밴 A · 로델</div><div class="s">12/12 05:40 베이 호텔 로비 · 골프 4명 · 백 4개 · 블루힐 CC ${t} 티업</div></div><span class="pill acc">14:02 확인</span></div>
          <div class="row"><div class="m"><div class="t">가이드 · 미나</div><div class="s">12/12 10:00 동반 1명 관광</div>${o.guideResent ? '' : '<div class="acts"><button class="btn" data-a="gresend">다시 보내기</button></div>'}</div><span class="pill wait">${o.guideResent ? `${esc(o.guideResent)} 다시 보냄` : '확인 대기'}</span></div></div>`;
      if (lv >= 4) h += `<div class="sec"><span>변경 기록</span></div><div class="grp">${dup ? `<div class="row fresh">${tm(o.dupAt || '')}<div class="m"><div class="t">토요일 11:00 · 밴 A → 밴 B</div><div class="s">대표님</div></div></div>` : ''}<div class="row">${tm('10:12')}<div class="m"><div class="t">블루힐 티업 07:30 → 07:48</div><div class="s">김 실장</div></div></div></div>`;
      else h += lockCard(4, '변경 이력 · 누가 언제 무엇을 바꿨는지');
    }
    return h + '</div>';
  }
  function vGQuote() {
    const o = O(); if (o.lv < 2) return lockPanel(2);
    const dn = isDone('g_quote');
    const pill = dn ? ['보냄', 'acc'] : o.q >= 1 && !o.tip ? ['확인 1건', 'stop'] : o.q >= 1 ? ['만들기 전', 'wait'] : ['견적 전', 'wait'];
    let h = `<div class="pad"><div class="hd"><h2 class="title">견적</h2><span class="d">발송 전 누락 점검</span></div>
      <div class="grp"><button class="row" data-a="gquote"><div class="m"><div class="kind">메신저 문의</div><div class="t">박 대표님 일행 · 3박 4일 · 5명</div><div class="s">${dn ? `견적서 보냄 · ${esc(qTotal(o))}` : o.q >= 1 ? (o.tip ? '캐디팁 정함 · 견적서 만들기 전' : '캐디팁 값 없음 · 발송 잠김') : '아직 견적으로 옮기지 않았습니다'}</div></div><span class="pill ${pill[1]}">${pill[0]}</span>${I.chev}</button></div>`;
    h += dn ? `<div class="sec"><span>보낸 고객 견적서</span></div>${quoteDoc(false)}` : '<p class="resp">문의 글을 붙여 넣으면 날짜와 인원이 입력됩니다. 확인이 필요한 항목은 비워 두고 알려 드립니다. 입금 후에 추가 비용을 다시 안내하는 일이 줄어듭니다.</p>';
    return h + '</div>';
  }
  function vGMoney() {
    const o = O(); if (o.lv < 3) return lockPanel(3);
    const pd = isDone('g_pay');
    let h = `<div class="pad"><div class="hd"><h2 class="title">돈</h2><span class="d">입금 대조</span></div>
      <div class="grp" id="payBox"><div class="row" style="display:block"><div class="kind">박 대표님 일행 · 3박 4일</div>
        <ul class="inc" style="margin-top:4px"><li><span>받을 돈</span><span class="num">₩4,194,000</span></li><li><span>들어온 돈</span><span class="num">${o.paid ? '₩4,194,000' : '₩4,000,000'}</span></li>${o.paid ? `<li class="fresh"><span>새 입금 · ${esc(o.paidAt || '')}</span><span class="num">₩194,000</span></li>` : ''}<li><span><b>미입금</b></span><span class="num" style="color:${o.paid ? 'var(--acc)' : 'var(--stop)'}">${o.paid ? '₩0' : '₩194,000'}</span></li></ul>
        <div class="acts">${pd ? '<span class="pill acc">예약 확정</span>' : o.paid ? '<button class="btn p wide" data-a="gconfirm">예약 확정</button>' : '<button class="btn q wide" data-a="grefresh">통장 입금 내역 다시 맞추기</button><button class="btn wide" disabled>전액 입금 후 확정</button>'}</div></div></div>`;
    if (o.lv >= 4) {
      const W = [['월', 62], ['화', 24, 1], ['수', 48], ['목', 56], ['금', 88], ['토', 100], ['일', 94]];
      h += `<div class="sec"><span>대표 화면 · 12월 12일 토 08:10</span></div>
        <div class="sumr"><div><small>받은 돈</small><b class="num">₩12,480,000</b></div><div><small>줄 돈</small><b class="num">₩9,960,000</b></div><div class="w2"><small>예상 순수익 · 통장 잔액과 나눠 봅니다</small><b class="num" style="color:var(--acc)">₩2,520,000</b></div></div>
        <div class="grp"><div class="row" style="display:block"><div class="kind">자동 확인</div><ul class="inc"><li><span>미수금</span><span>0건</span></li><li><span>겹친 배정</span><span>0건</span></li><li><span>기사 미확인</span><span style="color:var(--stop)">1건</span></li></ul></div>
          <div class="row" style="display:block"><div class="kind">대표님 결정</div><ul class="inc"><li><span>선밸리 상품 · 마진 3%</span><span>요금 조정</span></li><li><span>그린 투어 · 취소 4번</span><span>선금 적용</span></li><li><span>화요일 · 밴 2대 비어 있음</span><span>할인 검토</span></li></ul></div>
          <div class="row" style="display:block"><div class="kind">요일별 예약 · 화요일이 가장 비어 있음</div><div class="wk" aria-hidden="true">${W.map(([, v, lo]) => `<i style="height:${v}%;${lo ? 'background:var(--wait)' : ''}"></i>`).join('')}</div><div class="wkl">${W.map(([d]) => `<span>${d}</span>`).join('')}</div></div></div>
        <p class="resp">받은 금액에서 지급할 금액을 빼고, 예약마다 순수익을 보여 드립니다. 화면의 금액은 예시입니다.</p>`;
    } else h += lockCard(4, '예약별 손익 · 통장 잔액과 실제 순수익');
    return h + '</div>';
  }
  function vGRates() {
    const o = O(), dn = isDone('g_rate');
    let h = `<div class="pad"><div class="hd"><h2 class="title">요금</h2><span class="d">골프장 요금표 한 장</span></div>
      <div class="grp" id="rateBox"><div class="row"><div class="m"><div class="t">블루힐 · 주말 18홀</div><div class="s">카트 · 캐디 · 캐디팁 따로</div></div><div class="r"><div class="num" style="font-weight:700">₱5,200</div><span class="pill stop">따로 3</span></div></div>
        <div class="row"><div class="m"><div class="t">선밸리 · 주말 18홀</div><div class="s">카트 · 캐디 포함</div></div><div class="r"><div class="num" style="font-weight:700">₱6,800</div><span class="pill acc">포함</span></div></div></div>
      ${dn ? '<p class="resp">확인했습니다 · 직원 4명이 같은 요금표를 봅니다.</p>' : '<div class="acts"><button class="btn p wide" data-a="grate">확인했습니다</button></div>'}`;
    if (o.lv >= 5) h += `<div class="sec"><span>협력 골프장 화면</span></div><div class="grp"><div class="row"><div class="m"><div class="t">블루힐 CC · 토요일 빈 티업</div><div class="s">골프장이 직접 올림 · 골프장의 참여 동의가 필요합니다</div></div><span class="pill acc">3팀</span></div></div>`;
    else h += lockCard(5, '협력 골프장 연동 · 빈 티업을 골프장이 직접 등록');
    return h + '</div>';
  }

  // ---------- 부동산 · 비자 (개인페이지_단계 S0~S5 · 이름 · 날짜 · 금액은 단계 시안의 예시 그대로) ----------
  const OLD_ANS = [['10월 2일', '연장은 온라인으로 하시면 됩니다.'], ['10월 21일', '첫 연장은 이민국에 직접 가셔야 합니다.'], ['11월 3일', '두 달째부터는 온라인이에요.'], ['11월 11일', '6개월 되시면 이민국 방문입니다.']];
  const CARD = [['첫 29일', '온라인'], ['첫 연장', '<b>이민국 방문</b>'], ['2~5개월째', '온라인'], ['6개월째', '<b>이민국 방문</b>'], ['7~12개월째', '온라인']];
  function mergeSheet() {
    const o = O(), m = o.merged;
    const R = (a, b, st = '') => `<div class="qr rv ${m ? 'on' : ''}" data-c><span>${a}</span><span style="font-family:var(--f);font-weight:400;${st}">${b}</span></div>`;
    return `<h4>비자 연장, 어디서 합니까 · 23번</h4><p class="sub">최근 30일 · 지금까지 보낸 설명 ${m ? '4가지 → 안내 하나' : '4가지'}</p>
      ${m ? '' : `<ul class="vb" id="olds">${OLD_ANS.map(([d, t]) => `<li><small>${d}에 보낸 설명</small>${t}</li>`).join('')}</ul>`}
      <div class="gcard" id="gcard" ${m ? '' : 'hidden'}><p class="k">안내 카드 · 비자</p><h5>관광비자 연장,<br>어디서 합니까</h5>
        ${CARD.map(([a, b]) => R(a, b)).join('')}
        <p class="sub rv ${m ? 'on' : ''}" data-c style="margin:12px 0 0">이 안내의 근거</p>${R('확인한 날', '11월 26일', 'color:var(--acc);font-weight:600')}${R('출처', '이민국 공지')}</div>
      <p class="resp" style="margin:12px 0">내용은 대표님이 확인하신 것만 씁니다.</p>
      ${m ? (isDone('r_q') ? closeBtn : '<button class="btn p wide" data-a="rcopy">안내 링크 복사</button><button class="btn wide" style="margin-top:8px" data-a="rimg">이미지로 저장</button>') : `<button class="btn p wide" data-a="rmerge" id="mRun" ${o.mergeRun ? 'disabled' : ''}>${o.mergeRun ? '정리하는 중' : '하나로 정리'}</button>`}`;
  }
  const QS5 = [['비자 연장, 어디서 합니까', 23, '서로 다른 설명 4가지', 'r_q'], ['입주할 때 처음 내는 돈', 19, '서로 다른 설명 3가지', 'r_q2'], ['연례 신고 준비물', 14, '작년 안내 그대로', 'r_lock'], ['주차가 포함됩니까', 11, '같은 안내 1가지', 'ok'], ['보증금은 언제 돌려받습니까', 9, '서로 다른 설명 2가지', '']];
  const OLDR = [['김지훈', '10월 2일', 1], ['이수민', '10월 14일', 0], ['박정우', '10월 21일', 1], ['최은영', '11월 3일', 0], ['한도윤', '11월 11일', 1]];
  function vRGuide() {
    const o = O();
    const pill = (k) => k === 'ok' ? ['정상', 'acc'] : k === 'r_lock' ? (isDone(k) ? ['다시 확인함', 'acc'] : ['다시 확인', 'stop']) : k && isDone(k) ? ['정리함', 'acc'] : ['하나로 정리', 'stop'];
    const rows = QS5.map(([q, n, d, k]) => { const p = pill(k); const inner = `<div class="m"><div class="t">${q}</div><div class="s"><span class="num">${n}</span>번 · ${d}</div></div><span class="pill ${p[1]}">${p[0]}</span>`; return k === 'r_q' ? `<button class="row" data-a="rq">${inner}${I.chev}</button>` : `<div class="row">${inner}</div>`; }).join('');
    let h = `<div class="pad"><div class="hd"><h2 class="title">안내</h2><span class="d">반복된 질문 · 최근 30일 76번</span></div>
      <div class="grp">${rows}</div>
      <div class="sec"><span>정리할 질문 20개</span></div>
      <div class="grp"><div class="row" style="display:block"><ul class="inc" style="margin:0"><li><span>비자</span><span>8개</span></li><li><span>임대와 매매</span><span>9개</span></li><li><span>생활</span><span>3개</span></li><li><span>확인이 필요한 안내</span><span style="color:var(--stop)">12개</span></li></ul></div></div>`;
    if (o.lv >= 3) {
      h += `<div class="sec"><span>예전 안내를 읽은 고객 · 관광비자 연장</span><span>11월 20일 바뀜</span></div>`
        + atable(['고객', '읽은 날', '확인'], OLDR.map(([n, d, k]) => [`<b>${n}</b>`, d, k ? okc('새 안내 읽음') : isDone('r_old') ? okc('새 안내 보냄') : neg('아직 모름')]))
        + '<p class="resp">고객별 링크로 보낸 안내는 누가 언제 읽었는지 남습니다. 단톡방 링크는 조회 수만 남습니다. 안내를 고치면 이미 보낸 링크도 새 내용으로 열립니다.</p>';
    } else h += lockCard(3, '답변 관리 · 예전 안내를 읽은 고객 · 확인일 지난 안내 잠금');
    return h + `<p class="resp">${esc(B().resp)}</p></div>`;
  }
  const STAY = [['첫 한 달', '이민국 방문', 'First month'], ['2개월 ~ 5개월', '온라인', '2 to 5 months'], ['6개월', '이민국 방문', '6th month'], ['7개월 ~ 12개월', '온라인', '7 to 12 months'], ['1년 넘음', null, 'Over a year']];
  const QS6 = [['비자 연장, 어디서 합니까', '11월 26일'], ['입주할 때 처음 내는 돈', '11월 24일'], ['연례 신고 준비물', '11월 26일'], ['보증금은 언제 돌려받습니까', '11월 20일'], ['주차가 포함됩니까', '11월 18일'], ['학교와 가까운 콘도', '11월 22일']];
  function vRPage() {
    const o = O(); if (o.lv < 2) return lockPanel(2);
    const en = o.pageLang === 'en', a = STAY[o.ans];
    const where = a[1] ? (en ? (a[1] === '온라인' ? 'Online' : 'In person at Immigration') : a[1]) : (en ? 'The agent answers directly' : '대표님이 직접 안내');
    return `<div class="pad"><div class="hd"><h2 class="title">페이지</h2><span class="d">한 장 페이지 · 고객이 보는 화면</span></div>
      <div class="seg" role="group" aria-label="페이지 말"><button data-a="plang" data-l="ko" aria-pressed="${!en}">한국어</button><button data-a="plang" data-l="en" aria-pressed="${en}">English</button></div>
      <div class="gcard"><p class="k">${en ? 'Visa · Rent · Buy · Book a call' : '대표님 사무실 · 비자 · 임대 · 매매'}</p><h5>${en ? 'Homes and visas in Manila.<br>Start with your question.' : '마닐라의 집과 비자,<br>궁금한 것부터 확인하십시오.'}</h5>
        <p class="sub" style="margin:8px 0 0">${en ? 'Visa extension · Question 1 / 2' : '비자 연장 · 질문 1 / 2'}</p>
        <p style="font-weight:600;margin:2px 0 0">${en ? 'How long have you been in Manila?' : '마닐라에 오신 지 몇 개월째이십니까?'}</p>
        <div class="op2" role="group" aria-label="${en ? 'Months in Manila' : '체류 기간'}">${STAY.map(([k, , e], i) => `<button data-a="pans" data-i="${i}" aria-pressed="${o.ans === i}"><span>${en ? e : k}</span>${o.ans === i ? `<span style="font-size:14px">${en ? 'Selected' : '선택'}</span>` : ''}</button>`).join('')}</div>
        <div class="qr" id="ansRow"><span>${en ? 'Where to apply' : '접수'}</span><span style="font-family:var(--f)">${where}</span></div>
        <div class="qr"><span>${en ? 'Last checked' : '확인한 날'}</span><span style="color:var(--acc)">${en ? 'Nov 26' : '11월 26일'}</span></div>
        <button class="btn p wide" style="margin-top:12px" data-a="pbook">${en ? 'Book a 15-minute call' : '15분 상담 예약'}</button></div>
      <div class="sec"><span>안내 · 확인한 날</span></div>
      <div class="grp"><div class="row" style="display:block"><div class="qs">${QS6.map(([q, d]) => `<div><b style="font-weight:500">${q}</b><span>${d} 확인</span></div>`).join('')}</div></div></div>
      <div class="sec"><span>단톡방에 올린 링크 하나 · 이번 주</span></div>
      <div class="grp"><div class="row" style="display:block"><ul class="inc" style="margin:0"><li><span>안내를 본 분</span><span>64명</span></li><li><span>가장 많이 본 안내</span><span>입주할 때 처음 내는 돈</span></li><li><span>상담 예약</span><span>7건</span></li></ul></div></div></div>`;
  }
  const CHK = [['기간', '1월 ~ 2월'], ['비용', '작년 금액'], ['온라인 접수', '작년 안내']];
  function recheckSheet() {
    const o = O(), dn = isDone('r_lock'), n = o.checks.filter(Boolean).length;
    return `<h4>보내기 전 확인 · 연례 신고 준비물</h4><p class="sub" style="color:var(--stop);font-weight:600">${dn ? '다시 확인해 저장한 안내입니다' : '322일 전에 확인한 안내입니다'}</p>
      <ul class="inc" style="margin:0 0 12px"><li><span>마지막 확인</span><span style="color:${dn ? 'var(--acc)' : 'var(--stop)'}">${dn ? esc(o.lockAt) : '1월 8일'}</span></li><li><span>정해 두신 확인 주기</span><span>90일</span></li><li><span>보낸 링크</span><span>41개</span></li><li><span>출처</span><span>이민국 공지</span></li></ul>
      <p class="sub" style="margin:0 0 4px">확인할 것 · 출처를 보고 하나씩 누르십시오</p>
      <ul class="ln">${CHK.map(([a, b], i) => `<li><div class="q"><span>${a} · <span style="color:${o.checks[i] || dn ? 'var(--ink)' : 'var(--stop)'}">${b}</span></span><button class="cand" data-a="rchk" data-i="${i}" aria-pressed="${o.checks[i] || dn}">${o.checks[i] || dn ? '확인함' : '확인'}</button></div></li>`).join('')}</ul>
      ${dn ? closeBtn : `<p class="sub" style="margin:0 0 10px">${n === 3 ? '세 줄을 확인했습니다 · 저장하면 다시 보낼 수 있습니다' : '보내기 잠김 · 다시 확인하실 때까지 이 안내는 보낼 수 없습니다'}</p><button class="btn p wide" data-a="rlocksave" ${n === 3 ? '' : 'disabled'}>${n === 3 ? '확인한 내용으로 저장' : `남은 확인 ${3 - n}개`}</button>`}`;
  }
  const CL = [['이수민', '콘도 임대', '선일자 수표', '12월 1일', 1], ['김지훈', '관광비자 연장', '없음', '12월 3일', 0], ['최은영', '취업비자 갱신', '계약서 서명', '12월 5일', 1], ['박정우', '은퇴비자', '연금 증빙, 사진', '12월 10일', 2], ['한도윤', '임대 연장', '없음', '1월 15일', 0]];
  function vRClients() {
    const o = O(); if (o.lv < 4) return lockPanel(4);
    const ed = isDone('r_exp');
    return `<div class="pad"><div class="hd"><h2 class="title">고객과 서류</h2><span class="d">진행 중 5명</span></div>
      <div class="grp">${CL.map(([n, w, miss, d, k]) => { const inner = `<div class="m"><div class="t">${n} <span class="pill">${w}</span></div><div class="s">빠진 서류 · ${miss} · 다음 날짜 ${d}</div></div><span class="pill ${k ? 'stop' : 'acc'}">${k ? `${k}건 남음` : '준비 끝'}</span>`; return n === '이수민' ? `<button class="row" data-a="rcost">${inner}${I.chev}</button>` : `<div class="row">${inner}</div>`; }).join('')}</div>
      <div class="sec"><span>다가오는 만료</span></div>
      <div class="grp"><div class="row"><div class="m"><div class="t">김지훈 · 체류</div></div><span class="pill ${ed ? 'acc' : 'stop'}">${ed ? '12월 6일 · 안내 보냄' : '12월 6일'}</span></div><div class="row"><div class="m"><div class="t">최은영 · 비자</div></div><span class="pill wait">12월 18일</span></div><div class="row"><div class="m"><div class="t">박정우 · 여권</div></div><span class="pill">2월 20일</span></div></div>
      <p class="resp">사본은 계약이 끝나고 30일 뒤 삭제됩니다. 만료 알림과 사본 보관 기한은 협의해 정합니다.</p></div>`;
  }
  function costSheet() {
    const W = (n) => `${(n / 138500 * 100).toFixed(1)}%`;
    return `<h4>이수민 님 · 입주 첫 비용</h4><p class="sub">콘도 임대 · 계약 시작 12월 5일 · 1년 · 고객에게 보낼 안내</p>
      <div class="qtot" style="margin:0 0 8px"><span class="sub" style="margin:0">처음 내는 돈</span><b class="num">₱138,500</b></div>
      <div class="wf"><div><span>보증금 · 2개월</span><i><b style="--o:0%;--w:${W(90000)}"></b></i><span>₱90,000</span></div>
        <div><span>선납 월세 · 1개월</span><i><b style="--o:${W(90000)};--w:${W(45000)}"></b></i><span>₱45,000</span></div>
        <div><span>입주 청소</span><i><b style="--o:${W(135000)};--w:${W(3500)}"></b></i><span>₱3,500</span></div></div>
      <p class="sub" style="margin:0 0 4px">준비하실 것</p>
      <ul class="inc" style="margin:0 0 12px"><li><span>여권 사본</span><span style="color:var(--acc)">확인</span></li><li><span>계약서 서명</span><span style="color:var(--acc)">확인</span></li><li><span>선일자 수표 · 12장 중</span><span style="color:var(--stop)">11장 남음</span></li></ul>
      <p class="sub" style="margin:0 0 12px">사본은 계약이 끝나고 30일 뒤 삭제됩니다</p>
      ${isDone('r_doc') ? closeBtn : '<button class="btn p wide" data-a="rcostsend">고객에게 안내 링크 보내기</button>'}`;
  }
  function vRBook() {
    const o = O(); if (o.lv < 5) return lockPanel(5);
    const fd = isDone('r_fee');
    const BARS = [['9시', 34], ['11시', 46], ['13시', 40], ['15시', 38], ['17시', 44], ['19시', 62], ['21시', 88, 1], ['22시', 100, 1], ['23시', 82, 1], ['0시', 48]];
    let h = `<div class="pad"><div class="hd"><h2 class="title">장부</h2><span class="d">대표 화면 · 11월 26일 목 22:10</span></div>
      <div class="sumr"><div><small>오늘 문의</small><b class="num">14건</b></div><div><small>안내 링크로 해결</small><b class="num" style="color:var(--acc)">9건</b></div><div class="w2"><small>대표님이 직접 응대할 문의</small><b class="num">5건</b></div></div>
      <div class="grp"><div class="row" style="display:block"><div class="kind">자동 확인</div><ul class="inc"><li><span>확인일 지난 안내</span><span style="color:var(--stop)">2건</span></li><li><span>빠진 서류</span><span style="color:var(--stop)">4건</span></li><li><span>12월 만료</span><span>2명</span></li></ul></div>
        <div class="row" style="display:block"><div class="kind">대표님 결정</div><ul class="inc"><li><span>이수민 · 수표 기한</span><span>12월 1일</span></li><li><span>박정우 · 상담 시간</span><span>15분</span></li><li><span>새 매물 · 소개 여부</span><span>2곳</span></li></ul></div>
        <div class="row" style="display:block"><div class="kind">문의가 온 시각 · 21시 ~ 23시에 몰림</div><div class="wk" aria-hidden="true">${BARS.map(([, v, hi]) => `<i style="height:${v}%;${hi ? 'background:var(--acc)' : ''}"></i>`).join('')}</div><div class="wkl">${BARS.map(([d], i) => `<span>${i % 2 === 0 ? d : ''}</span>`).join('')}</div></div></div>
      <div class="sec"><span>11월 수수료</span><span class="num" style="color:var(--ink);font-weight:700">₱97,000</span></div>
      <div class="grp"><div class="row" style="display:block"><ul class="inc" style="margin:0"><li><span>임대 중개 · 1건</span><span class="num">₱45,000</span></li><li><span>임대 연장 · 1건</span><span class="num">₱20,000</span></li><li><span>비자 대행 · 4건</span><span class="num">₱32,000</span></li><li><span>입금 확인</span><span class="num" style="color:var(--acc)">₱62,000</span></li><li><span>받을 돈</span><span class="num" style="color:var(--stop)">₱35,000</span></li></ul></div></div>
      <div class="sec"><span>들어올 날</span>${fd ? '<span>안내 링크 보냄</span>' : ''}</div>
      <div class="grp"><div class="row"><div class="m"><div class="t">이수민</div><div class="s">12월 1일</div></div><span class="num" style="font-weight:700">₱25,000</span></div><div class="row"><div class="m"><div class="t">박정우</div><div class="s">12월 10일</div></div><span class="num" style="font-weight:700">₱10,000</span></div></div>
      ${fd ? '' : '<div class="acts"><button class="btn q wide" data-a="rfee">안내 링크 보내기</button></div>'}
      <p class="resp">메신저와 통장은 쓰시던 대로 두시면 됩니다.</p>
      <div class="sec"><span>변경 이력</span></div><div class="grp">${isDone('r_lock') ? `<div class="row fresh">${tm(o.lockAt)}<div class="m"><div class="t">연례 신고 준비물 · 다시 확인</div><div class="s">기간 · 비용 · 온라인 접수 · 대표님</div></div></div>` : ''}<div class="row">${tm('09:12')}<div class="m"><div class="t">관광비자 연장 · 3판 → 4판</div><div class="s">창구와 출처를 고침 · 대표님 · 11월 26일</div></div></div></div>`;
    h += o.lv >= 6 ? `<div class="sec"><span>확장 구상 · 07:10</span></div><div class="grp"><button class="row" data-a="rdraft"><div class="m"><div class="t">밤사이 문의 6건, 회신 초안 4건</div><div class="s">확인하신 안내로만 썼습니다</div></div>${isDone('r_draft') ? '<span class="pill acc">승인함</span>' : ''}${I.chev}</button></div>` : lockCard(6, '회신 초안 · 공지 변경 알림 · 외국인 고객');
    return h + '</div>';
  }
  const draftSheet = () => `<h4>밤사이 문의 6건, 회신 초안 4건</h4><p class="sub">07:10 · 대표님 휴대폰 · 확인하신 안내로만 썼습니다</p>
    <ul class="inc" style="margin:0"><li><span>비자 연장 · 2건</span><span style="color:var(--acc)">초안 준비</span></li><li><span>입주 첫 비용 · 2건</span><span style="color:var(--acc)">초안 준비</span></li><li><span>은퇴비자 조건</span><span style="color:var(--stop)">근거 없음 · 비워 둠</span></li><li><span>학교 추천</span><span style="color:var(--stop)">대표님 직접 회신</span></li></ul>
    <p class="sub" style="margin:14px 0 6px">문의가 온 시각 · 22시 3건 · 23시 2건 · 0시 1건</p>
    <div class="bubble"><small>고객 · English</small>Two months deposit and one month advance. Please see the full list here.</div>
    <div class="bubble"><small>공지 변경 알림</small>확인하시는 공지가 바뀌었습니다. 안내 2개를 다시 확인하시겠습니까?</div>
    <div class="bubble"><small>새 안내 제안</small>이번 주에 반려동물 가능한 콘도를 7명이 물었습니다. 안내를 새로 만드시겠습니까?</div>
    ${isDone('r_draft') ? closeBtn : '<button class="btn p wide" data-a="rdraftok">초안 4건 승인하고 보내기</button><p class="sub" style="text-align:center;margin:10px 0 0">승인 전에는 보내지 않습니다</p>'}`;

  // ---------- 공장 (공장_단계 S0~S5 · 오더 · 수량 · 날짜 · 사람 이름은 단계 시안의 예시 그대로 · 실제 공장 자료 없음) ----------
  const PATH = [['고객사 메일 · 엑셀', 18, 3, '수량 변경 2건 누락'], ['카톡 · 바이버', 9, 4, '납기 변경 1건 누락'], ['본사 ERP 출력', 6, 2, ''], ['전화', 3, 4, '기록 없음 2건']];
  const POS = [['PO-2611-14', '커넥터 하우징', '48,000', '12월 2일', '12월 1일', 'ok'], ['PO-2611-09', '배터리 커버', '30,000', '12월 4일', '12월 6일 · 2일 늦음', 'late'], ['PO-2611-17', '단자 캡', '120,000', '12월 9일', '12월 8일', 'ok'], ['PO-2611-21', '하단 커버', '22,000', '12월 11일', '지시량 확인', 'qty'], ['PO-2611-23', '스위치 노브', '15,000', '12월 15일', '배정 전', '']];
  function vPOrders() {
    const o = O(), lv = o.lv, ok = isDone('pl_late'), cd = isDone('pl_code');
    let h = `<div class="pad"><div class="hd"><h2 class="title">오더</h2><span class="d">${lv >= 2 ? `오더 판 · 출고일 순 · ${clock()}` : '11월 · 오더 36건'}</span></div>`;
    if (lv >= 2) {
      h += `<div class="grp" id="poBox">${POS.map(([no, it, q, ship, fin, k]) => {
        const pill = k === 'ok' ? [`${fin} 완료`, 'acc'] : k === 'late' ? (ok ? ['12월 2일 · 8번', 'acc'] : [fin, 'stop']) : k === 'qty' ? (isDone('pl_qty') ? [o.qtyNote, 'wait'] : [fin, 'stop']) : [fin, ''];
        const inner = `<div class="m"><div class="t">${no}</div><div class="s">${it} · <span class="num">${q}</span>개 · 출고 ${ship}</div></div><span class="pill ${pill[1]}">${esc(pill[0])}</span>`;
        return k === 'late' && !ok ? `<button class="row" data-a="plate">${inner}${I.chev}</button>` : `<div class="row">${inner}</div>`;
      }).join('')}</div>
      <p class="resp">남은 수량과 기계별 하루 실적으로 끝나는 날을 계산해 출고일과 견줍니다. 작업지시가 오더 수량을 넘으면 승인 전에는 생산 지시가 나가지 않습니다.</p>`;
    }
    h += `<div class="sec"><span>오더가 들어오는 길 · 11월</span><span>오더 36건</span></div>
      <div class="grp">${PATH.map(([a, n, c, x]) => `<div class="row"><div class="m"><div class="t">${a}</div><div class="s"><span class="num">${n}</span>건 · 옮겨 적기 <span class="num">${c}</span>번</div></div><span class="pill ${x ? 'stop' : 'acc'}">${x || '정상'}</span></div>`).join('')}
        <div class="row" id="codeRow"><div class="m"><div class="t">품목 이름 37가지</div><div class="s">${cd ? '코드 12개로 묶음 · 배터리 커버는 BC-02 하나' : '배터리 커버 · Batt Cover · 밧데리 커바 · BC-02'}</div></div><span class="pill ${cd ? 'acc' : 'stop'}">${cd ? '코드 12개' : '같은 품목 25개'}</span></div></div>`;
    if (lv < 2) h += lockCard(2, '오더 한 곳 등록 · 끝나는 날 계산 · 지시량 확인');
    return h + '</div>';
  }
  // 대표 장면: 늦어질 오더를 출고 전에 안다 → 끝나는 날 계산 → 배정 바꾸기 승인 (S1 · T[1])
  const DAYS = ['28', '29', '1', '2', '3', '4', '5', '6'];
  function lateSheet() {
    const o = O(), on = o.late, dn = isDone('pl_late'), show = on || o.lateRun;
    const R = (a, b, em = '', red = 0, gr = 0) => `<div class="qr rv ${on ? 'on' : ''} ${red ? 'miss' : ''}" data-l><span>${a}${em ? `<em>${em}</em>` : ''}</span><span style="${gr ? 'color:var(--acc)' : ''}">${b}</span></div>`;
    const SB = (t) => `<p class="sub rv ${on ? 'on' : ''}" data-l style="margin:14px 0 0">${t}</p>`;
    const G = (lab, w, late) => `<div class="gl rv ${on ? 'on' : ''} ${late ? 'late' : ''}" data-l><span>${lab}</span><i class="tr"><b style="--w:${w}"></b></i></div>`;
    return `<h4>PO-2611-09 · 배터리 커버 30,000개</h4><p class="sub">출고 12월 4일 목 · 출고 7일 전 · 7번 사출기</p>
      ${show ? `${R('남은 수량', '18,600개')}${R('하루 실적', '2,325개', '7번 사출기')}${R('예상 완료', '12월 6일 · 2일 늦음', '', 1)}
        ${SB('늦어지는 이유')}${R('7번 금형 수리', '하루 45분 정지', '', 1)}${R('PC 레진', '1.4t 부족', '12월 1일 입고')}
        ${SB('바꾸면')}${R('8번 사출기로', '12월 2일 완료', '하루 4,650개', 0, 1)}
        <div class="gt" aria-hidden="true"><div class="ax rv ${on ? 'on' : ''}" data-l>${DAYS.map((d) => `<span>${d}</span>`).join('')}</div>${G('7번', '100%', 1)}${G('8번', '50%', 0)}<div class="cap rv ${on ? 'on' : ''}" data-l><span>11월 28일 ~ 12월 6일 · 일요일 쉼</span><span>세로 선 · 출고일</span></div></div>`
        : '<div class="bubble"><small>오더 판</small>남은 수량을 기계별 하루 실적으로 나눠 끝나는 날을 계산하고, 출고일과 견줍니다.</div>'}
      ${dn ? closeBtn : on ? '<p class="sub" style="margin:12px 0 10px">안나 생산관리 16:05 제안 · 대표님이 승인하시기 전에는 배정이 바뀌지 않습니다</p><button class="btn p wide" data-a="papprove">배정 바꾸기 승인</button>'
        : `<div style="height:12px"></div><button class="btn p wide" data-a="plrun" id="lRun" ${o.lateRun ? 'disabled' : ''}>${o.lateRun ? '계산하는 중' : '끝나는 날 계산'}</button>`}`;
  }
  const diagSheet = () => `<h4>현장 진단 1쪽 · 11월 20일 방문</h4><p class="sub">오더가 들어와 출고되기까지의 길과 새는 곳을 한 장으로</p>
    <p class="sub" style="margin:0 0 4px">새는 곳 다섯</p>
    <ul class="inc" style="margin:0 0 12px"><li><span>누락 · 옮겨 적다가</span><span style="color:var(--stop)">5건</span></li><li><span>납기 지연 · 11월</span><span style="color:var(--stop)">3건</span></li><li><span>재고 파악 · 눈으로</span><span style="color:var(--stop)">주 1회</span></li><li><span>불량 · 원인 기록 없음</span><span>1.9%</span></li><li><span>생산팀 의존 · 조건값 기억</span><span style="color:var(--stop)">반장 2명</span></li></ul>
    <p class="sub" style="margin:0 0 4px">정비 뒤</p>
    <ul class="inc" style="margin:0 0 14px"><li><span>오더 양식</span><span style="color:var(--acc)">1개</span></li><li><span>품목 코드</span><span style="color:var(--acc)">12개</span></li><li><span>자재 코드</span><span style="color:var(--acc)">41개</span></li></ul>
    ${isDone('pl_diag') ? closeBtn : '<button class="btn p wide" data-a="pdiagok">진단서 받기</button>'}`;
  const workerSheet = () => `<h4>작업자 휴대폰 · 사출 7번</h4><p class="sub">기계 앞에서 넣은 입력 · 정전 동안 휴대폰에 보관했다가 보냈습니다</p>
    <div class="phone"><p class="kind" style="margin:0">Machine 7 · Shift B · English</p><p class="nm">Battery cover</p>
      <ul class="inc" style="margin:0"><li><span>Good</span><span class="num">1,240</span></li><li><span>Reject · short shot</span><span class="num" style="color:var(--stop)">38</span></li><li><span>Stop · mold repair</span><span class="num" style="color:var(--stop)">45 min</span></li><li><span>Resin lot</span><span class="num">R-1108</span></li></ul>
      <p style="font-size:14px;color:var(--sub);margin:10px 0 0;text-align:center">Brownout 14:00 ~ 16:00 · saved on phone</p></div>
    ${isDone('pl_input') ? closeBtn : '<button class="btn p wide" data-a="pinputok">입력 확인</button>'}`;
  const cardSheet = () => `<h4>작업 기준 카드 · 배터리 커버</h4><p class="sub">리노 반장 확인 · 11월 12일 · 반장님이 없는 날에도 같은 조건으로</p>
    <ul class="inc" style="margin:0 0 12px"><li><span>금형 B-02</span><span class="num">275°C</span></li><li><span>사출압</span><span class="num">82 bar</span></li><li><span>냉각</span><span class="num">14초</span></li><li><span>미성형이 나면</span><span>금형 온도 먼저</span></li></ul>
    <p class="quote" style="font-size:14px"><b>반장 없는 날</b><br>B조 반장 휴무 · 7번 금형 교체를 작업 기준 카드대로 진행 · 첫 제품 사진 확인 뒤 생산 시작</p>
    ${isDone('pl_card') ? closeBtn : '<button class="btn p wide" data-a="pcardok">첫 제품 사진 확인 · 생산 시작</button>'}`;
  function lotSheet() {
    const o = O(), on = o.traced, dn = isDone('pl_lot'), show = on || o.traceRun;
    const R = (a, b, em = '', c = '') => `<div class="qr rv ${on ? 'on' : ''}" data-t><span>${a}${em ? `<em>${em}</em>` : ''}</span><span style="${c}">${b}</span></div>`;
    return `<h4>고객사 반품 · 배터리 커버 120개</h4><p class="sub">불량 제품의 기계 · 조 · 금형 · 원자재 LOT를 거슬러 찾습니다</p>
      ${show ? `${R('생산일', '11월 24일')}${R('기계 · 조', '사출 7번 · B조')}${R('금형', 'B-02')}${R('레진 LOT', 'R-1108', '', 'color:var(--stop)')}
        <p class="sub rv ${on ? 'on' : ''}" data-t style="margin:14px 0 0">같은 레진 LOT</p>${R('PO-2611-09', '출고 보류', '창고 8,400개', 'color:var(--stop)')}${R('PO-2611-17', '출고 보류', '창고 3,000개', 'color:var(--stop)')}${R('PO-2611-14', '다른 LOT', '', 'color:var(--acc)')}
        <p class="sub rv ${on ? 'on' : ''}" data-t style="margin:12px 0 0">고객사의 8D 요청에 낼 기록을 함께 모읍니다</p>` : ''}
      ${dn ? closeBtn : on ? '<div style="height:12px"></div><button class="btn p wide" data-a="ptraceok">검사 지시 보내기</button>'
        : `<div style="height:12px"></div><button class="btn p wide" data-a="ptrace" id="tRun" ${o.traceRun ? 'disabled' : ''}>${o.traceRun ? '찾는 중' : '거슬러 찾기'}</button>`}`;
  }
  function plantClose() {
    const ok = isDone('pl_late');
    return `<h4>본사 보고 · 한국어</h4><p class="sub">오늘 공장 마감 · 11월 27일 목 ${clock()}</p>
      <ul class="inc" style="margin:0 0 12px"><li><span>출고 · 3건</span><span class="num">58,000개</span></li><li><span>생산 · 목표 92%</span><span class="num">42,620개</span></li><li><span>불량 · 1.8%</span><span class="num">760개</span></li></ul>
      <p class="sub" style="margin:0 0 4px">다음 출고</p>
      <ul class="inc" style="margin:0 0 12px"><li><span>PO-2611-14 · 정상</span><span style="color:var(--acc)">12월 2일</span></li><li><span>PO-2611-09 · ${ok ? '배정 변경 뒤' : '2일 늦음'}</span><span style="color:${ok ? 'var(--acc)' : 'var(--stop)'}">${ok ? '12월 4일' : '12월 6일'}</span></li></ul>
      <p class="sub" style="margin:0 0 4px">확인할 일</p>
      <ul class="inc" style="margin:0 0 14px"><li><span>반품 LOT R-1108</span><span style="color:var(--stop)">검사 중</span></li></ul>
      ${isDone('pl_close') ? closeBtn : '<button class="btn p wide" data-a="pcloseok">마감하고 보고 보내기</button>'}`;
  }
  const planSheet = () => `<h4>다음 주 생산 계획 제안</h4><p class="sub">기계 신호 · 자동 수량 · 사출기 24대 · 오더 9건</p>
    <ul class="inc" style="margin:0 0 12px"><li><span>사출 횟수로 센 수량</span><span>자동</span></li><li><span>필요한 기계 시간</span><span class="num">1,480시간</span></li><li><span>가능한 기계 시간</span><span class="num">1,610시간</span></li><li><span><b>늦어질 오더</b></span><span style="color:var(--acc)">0건</span></li><li><span>금형 교체 · 토요일 2회</span><span>7회</span></li></ul>
    <div class="bubble"><small>고객사 조회 · English</small>PO-2611-14: 72% complete, ships on Dec 2.</div>
    <div class="bubble"><small>본사 ERP 연계</small>출고 3건과 자재 입고 2건을 본사 ERP 양식으로 보냅니다.</div>
    <div class="bubble"><small>두 공장 비교</small>라구나 불량률 1.8% · 호치민 1.2% · 같은 금형 조건을 비교합니다.</div>
    <p class="quote" style="font-size:14px"><b>운영 제안</b><br>7번 금형은 2주 동안 정지가 6번이었습니다. 다음 수리 일정을 잡으시겠습니까?</p>
    ${isDone('pl_plan') ? closeBtn : '<button class="btn p wide" data-a="pplanok">작업지시 9건 승인하고 보내기</button><p class="sub" style="text-align:center;margin:10px 0 0">대표님이 승인하신 작업지시만 현장에 보냅니다</p>'}`;
  const LINE = [['사출 5번', '커넥터 하우징', '6,200', 'ok:6,410', '0.9%'], ['사출 7번', '배터리 커버', '4,650', 'neg:2,325', 'neg:3.1%'], ['사출 8번', '단자 캡', '9,800', 'ok:9,640', '1.2%'], ['조립 1라인', '커넥터 하우징', '5,400', '5,120', '0.6%'], ['조립 2라인', '스위치 노브', '3,000', 'neg:정지 20분', '—']];
  const mark = (v) => v.startsWith('ok:') ? okc(v.slice(3)) : v.startsWith('neg:') ? neg(v.slice(4)) : v;
  function vPFloor() {
    const o = O(); if (o.lv < 3) return lockPanel(3);
    const inp = isDone('pl_input'), cd = isDone('pl_card');
    let h = `<div class="pad"><div class="hd"><h2 class="title">현장</h2><span class="d">라인 현황 · B조 · ${clock()}</span></div>
      ${atable(['기계', '목표', '실적', '불량'], LINE.map(([m, it, g, r, d]) => [`<b>${m}</b><br><span style="color:var(--sub);font-size:12px">${it}</span>`, g, mark(r), mark(d)]))}
      <p class="resp">사무실과 현장 TV에 같은 숫자가 나옵니다. 작업자가 기계 앞에서 넣은 입력이 그대로 올라옵니다.</p>
      <div class="sec"><span>현장 입력</span></div>
      <div class="grp" id="inpBox"><button class="row" data-a="pworker"><div class="m"><div class="t">사출 7번 · B조 · 작업자 휴대폰</div><div class="s">정전 14:00 ~ 16:00 · 휴대폰에 보관했다가 보냄</div></div><span class="pill ${inp ? 'acc' : 'wait'}">${inp ? '확인함' : '새 입력'}</span>${I.chev}</button>
        <button class="row" data-a="pcard"><div class="m"><div class="t">작업 기준 카드 · 금형 B-02</div><div class="s">${cd ? '첫 제품 사진 확인 · 생산 시작' : 'B조 반장 휴무 · 카드대로 금형 교체'}</div></div><span class="pill ${cd ? 'acc' : 'wait'}">${cd ? '생산 중' : '교체 전'}</span>${I.chev}</button></div>`;
    if (o.lv < 4) h += lockCard(4, '이동 기록 재고 · 부족 예고 · LOT 추적');
    return h + '</div>';
  }
  const MAT = [['PC 레진 흑색', '3.2t', '4.6t', '−1.4t', '12월 1일 2.0t 입고'], ['ABS 레진 백색', '5.8t', '3.1t', '', ''], ['인서트 단자', '410,000', '360,000', '', ''], ['포장 박스 B', '1,200', '1,650', '−450', '발주 전'], ['마스터배치 회색', '180kg', '95kg', '', '']];
  function vPStock() {
    const o = O(); if (o.lv < 4) return lockPanel(4);
    const sh = isDone('pl_short'), lt = isDone('pl_lot');
    return `<div class="pad"><div class="hd"><h2 class="title">자재</h2><span class="d">부족 예고 · 다음 2주 오더 기준</span></div>
      <div class="grp" id="matBox">${MAT.map(([n, have, need, short, note]) => {
        const box = n === '포장 박스 B', nt = box && sh ? '450개 발주 승인함' : note;
        return `<div class="row"><div class="m"><div class="t">${n}</div><div class="s">창고 <span class="num">${have}</span> · 필요 <span class="num">${need}</span>${nt ? ' · ' + nt : ''}</div></div>${short ? `<span class="pill ${box && sh ? 'wait' : 'stop'}">${short}</span>` : '<span class="pill acc">충분</span>'}</div>`;
      }).join('')}</div>
      <div class="sec"><span>불량 추적</span></div>
      <div class="grp"><button class="row" data-a="plot"><div class="m"><div class="t">배터리 커버 120개 · 고객사 반품</div><div class="s">${lt ? '레진 LOT R-1108 · PO-2611-09 · PO-2611-17 출고 보류 · 검사 지시 보냄' : '11월 24일 · 사출 7번 · B조 · 금형 B-02'}</div></div><span class="pill ${lt ? 'acc' : 'stop'}">${lt ? '검사 중' : '추적 전'}</span>${I.chev}</button></div>
      <div class="sec"><span>면세 자재 · 11월 입고분</span></div>
      <div class="grp"><div class="row" style="display:block"><ul class="inc" style="margin:0"><li><span>입고</span><span class="num">12.4t</span></li><li><span>투입</span><span class="num">10.9t</span></li><li><span>창고</span><span class="num">1.5t</span></li><li><span>투입 중 불량 · 스크랩</span><span class="num">0.6t</span></li></ul></div></div>
      <p class="resp">입고 · 투입 · 불량 · 스크랩 · 출고를 한 건씩 남깁니다. 스크랩 처분 신고 자료를 레진 LOT별로 준비합니다.</p></div>`;
  }
  function vPClose() {
    const o = O(); if (o.lv < 5) return lockPanel(5);
    const ok = isDone('pl_late'), cd = isDone('pl_close');
    const BARS = [['월', 92], ['화', 96], ['수', 88], ['목', 84, 1], ['금', 0], ['토', 0]];
    let h = `<div class="pad"><div class="hd"><h2 class="title">마감</h2><span class="d">대표 화면 · ${clock()} 기준</span></div>
      <div class="sumr"><div><small>오늘 생산</small><b class="num">42,620개</b></div><div><small>불량률</small><b class="num">1.8%</b></div><div class="w2"><small>늦어질 오더</small><b class="num" style="color:${ok ? 'var(--acc)' : 'var(--stop)'}">${ok ? '0건' : '1건'}</b></div></div>
      <div class="grp"><div class="row" style="display:block"><div class="kind">자동 확인</div><ul class="inc"><li><span>지시량 초과</span><span style="color:var(--stop)">1건</span></li><li><span>자재 부족</span><span style="color:var(--stop)">2건</span></li><li><span>출고 보류 LOT</span><span>1건</span></li></ul></div>
        <div class="row" style="display:block"><div class="kind">대표님 결정</div><ul class="inc"><li><span>PO-2611-09 · 8번 배정</span><span>${ok ? '승인함' : '승인'}</span></li><li><span>포장 박스 B · 발주</span><span>450개</span></li><li><span>PO-2611-21 · 고객사 확인</span><span>변경</span></li></ul></div>
        <div class="row" style="display:block"><div class="kind">요일별 생산 · 목요일까지</div><div class="wk" aria-hidden="true">${BARS.map(([, v, hi]) => `<i class="${hi ? 'hi' : ''}" style="height:${v}%"></i>`).join('')}</div><div class="wkl">${BARS.map(([d]) => `<span>${d}</span>`).join('')}</div></div></div>
      <div class="sec"><span>오늘 마감</span></div>
      <div class="grp"><button class="row" data-a="pclose"><div class="m"><div class="t">본사 보고 · 한국어</div><div class="s">출고 3건 · 생산 42,620개 · 불량 760개</div></div>${cd ? '<span class="pill acc">보냄</span>' : ''}${I.chev}</button></div>
      <div class="sec"><span>변경 기록</span></div>
      <div class="grp">${ok ? `<div class="row fresh">${tm(o.lateAt || '')}<div class="m"><div class="t">PO-2611-09 배정 7번 → 8번 · 승인</div><div class="s">대표님</div></div></div>` : ''}<div class="row">${tm('16:05')}<div class="m"><div class="t">PO-2611-09 배정 7번 → 8번 · 제안</div><div class="s">안나 생산관리</div></div></div></div>
      <p class="resp">누가 언제 배정과 수량을 바꾸었는지 지워지지 않게 남기고, 매일 백업합니다.</p>`;
    h += o.lv >= 6 ? `<div class="sec"><span>확장 구상 · 기계 신호</span></div><div class="grp"><button class="row" data-a="pplan"><div class="m"><div class="t">다음 주 생산 계획 제안</div><div class="s">사출기 24대 · 오더 9건 · 늦어질 오더 0건</div></div>${isDone('pl_plan') ? '<span class="pill acc">승인함</span>' : ''}${I.chev}</button></div>` : lockCard(6, '기계 신호 연결 · 고객사 조회 · 여러 공장 비교');
    return h + '</div>';
  }

  // ---------- 커뮤니티 (커뮤니티_단계 S0~S5 · 예시 V[0] · 이름 · 수 · 글은 단계 시안의 예시 그대로 · 운영자 수입 금액 없음 (142)) ----------
  function vCFaq() {
    const o = O(), v = CV[S.cv], fd = isDone('c_faq'), vd = isDone('c_vend');
    let h = `<div class="pad"><div class="hd"><h2 class="title">질문</h2><span class="d">최근 30일 · 질문 ${v.faqTotal}개 중 5개</span></div>
      <div class="grp">${v.faq.map(([q, n, made, d], i) => { const inner = `<div class="m"><div class="t">${q}</div><div class="s"><span class="num">${n}</span>회${d ? ` · 확인일 ${d}` : ''}${i === 0 && fd ? ' · 오늘 답 링크 보냄' : ''}</div></div><span class="pill ${made ? 'acc' : 'stop'}">${made ? '정리된 답' : '답 없음'}</span>`; return i === 0 && !fd ? `<button class="row" data-a="cfaq">${inner}${I.chev}</button>` : `<div class="row">${inner}</div>`; }).join('')}</div>
      <div class="sec"><span>AI 답변 진단 · 질문 10개</span><span>우리 글이 답에 나온 수</span></div>
      <div class="grp" id="aiBox"><div class="row" style="display:block"><ul class="inc" style="margin:0"><li><span>ChatGPT</span><span class="num" style="color:var(--stop)">0 / 10</span></li><li><span>Gemini</span><span class="num" style="color:var(--stop)">1 / 10</span></li><li><span>네이버 AI</span><span class="num" style="color:var(--stop)">0 / 10</span></li></ul></div></div>
      <div class="sec"><span>흩어진 업체 연락처</span></div>
      <div class="grp"><div class="row"><div class="m"><div class="t">받은 명함과 글 37건 → 업체 29곳</div><div class="s">겹친 것 8건 · 연락처 없음 3곳</div></div>${vd ? '<span class="pill acc">한 목록</span>' : ''}</div></div>`;
    if (o.lv < 4) h += lockCard(4, '검색과 AI 인용 · 질문 페이지 · 매주 점검표');
    return h + '</div>';
  }
  const faqSheet = () => { const v = CV[S.cv]; return `<h4>${v.room} · ${v.size}</h4><p class="sub">대화방 · 같은 질문 ${v.faq[0][1]}번째 · 최근 30일</p>
    <div class="bubble"><small>${v.askWho}</small>${v.ask}</div>
    <div class="me">정리해 둔 답입니다. 서류까지 적어 두었어요.<div class="lkc"><small>${v.room} · 확인일 ${v.faq[0][3]}</small><b>${v.a1}</b></div></div>
    ${isDone('c_faq') ? closeBtn : '<button class="btn p wide" data-a="cfaqok">답 링크 복사</button>'}`; };
  const aiSheet = () => `<h4>AI 답변 진단표</h4><p class="sub">질문 10개를 AI 세 곳에 물어, 지금 어떤 답이 나오는지 봅니다</p>
    <ul class="inc" style="margin:0 0 6px"><li><span>ChatGPT</span><span class="num" style="color:var(--stop)">0 / 10</span></li><li><span>Gemini</span><span class="num" style="color:var(--stop)">1 / 10</span></li><li><span>네이버 AI</span><span class="num" style="color:var(--stop)">0 / 10</span></li></ul>
    <p class="sub" style="margin:0 0 14px">우리 커뮤니티 글이 답에 나온 수</p>
    ${isDone('c_ai') ? closeBtn : '<button class="btn p wide" data-a="caiok">진단표 받기</button>'}`;
  function vCBoard() {
    const o = O(), v = CV[S.cv]; if (o.lv < 2) return lockPanel(2);
    const bd = isDone('c_bad'), tg = isDone('c_tg'), list = v.posts.filter((p) => o.cat === '전체' || p[2] === o.cat);
    let h = `<div class="pad"><div class="hd"><h2 class="title">게시판</h2><span class="d">${v.members}</span></div>
      <div class="chips" role="group" aria-label="주제">${v.cats.map((c) => `<button class="chip" data-a="ccat" data-c="${c}" aria-pressed="${o.cat === c}">${c}</button>`).join('')}</div>
      <p style="font-size:14px;color:var(--sub);margin:0 2px 10px">인기 · ${v.hot}</p>
      ${!bd && (o.cat === '전체' || o.cat === v.badTab) ? `<div class="grp" style="margin-bottom:10px"><button class="row" data-a="cbad"><div class="m"><div class="kind">올리기 전 확인 · ${v.badTab}</div><div class="t">${v.badShort}</div><div class="s">선입금 요구 · 아직 게시판에 없습니다</div></div><span class="pill stop">확인</span>${I.chev}</button></div>` : ''}
      <div class="grp" id="postBox">${list.length ? list.map(([t, p, c, m, n, off]) => `<div class="row"><div class="m"><div class="t">${t}${off ? ' <span class="pill acc">정리된 답</span>' : ''}</div><div class="s">${p}</div><div class="s">${c} · ${m} · 댓글 <span class="num">${n}</span></div></div></div>`).join('')
        : '<div class="row"><div class="m"><div class="t">이 주제의 글이 아직 없습니다</div><div class="s">다른 주제를 누르거나 전체로 보십시오.</div></div></div>'}</div>
      <div class="sec"><span>금지선 · 올라가기 전에 거름</span>${bd ? `<span>오늘 1건 · ${esc(o.decided || '')}</span>` : ''}</div>
      <div class="grp"><div class="row" style="display:block"><ul class="inc" style="margin:0"><li><span>선입금 · 송금 대행</span><span style="color:var(--stop)">확인 후 게시</span></li><li><span>불법 광고</span><span style="color:var(--stop)">막음</span></li><li><span>여권 · 신분증 사진</span><span>가림 요청</span></li></ul></div></div>
      <div class="sec"><span>새 글 알림</span></div>
      <div class="grp"><div class="row"><div class="m"><div class="t">텔레그램 · 운영진 2명</div><div class="s">카톡 알림은 대표님 채널을 연 뒤에 연결합니다</div></div><span class="pill ${tg ? 'acc' : 'wait'}">${tg ? '받는 중' : '확인 전'}</span></div></div>`;
    if (o.lv < 3) h += lockCard(3, '업체 등록과 심사 · 글 옆 업체 연결 · 배너 자리');
    return h + '</div>';
  }
  // 대표 장면: 올라가기 전에 금지선과 대조 → 운영자가 정함 (S1 · T[1].c[1] · 승인 랜딩 첫 화면 단계 show=1)
  function scanSheet() {
    const o = O(), v = CV[S.cv], on = o.scanned, dn = isDone('c_bad'), show = on || o.scanRun;
    const R = (a, b, hit) => `<div class="qr rv ${on ? 'on' : ''} ${hit ? 'miss' : ''}" data-s><span>${a}</span><span style="font-family:var(--f);${hit ? '' : 'color:var(--acc)'}">${b}</span></div>`;
    return `<h4>올리기 전 확인 · ${v.badTab}</h4><p class="sub">회원 글쓰기 · 아직 게시판에 올라가지 않았습니다</p>
      <div class="dr ${on ? 'hit' : ''}" id="dr"><small>글</small>${v.bad[0]}<mark>${v.bad[1]}</mark>${v.bad[2]}</div>
      ${show ? `<p class="sub rv ${on ? 'on' : ''}" data-s style="margin:0">금지선 세 가지와 대조</p>${R('선입금 · 송금 대행', '걸림 · 확인 후 게시', 1)}${R('불법 광고', '없음')}${R('여권 · 신분증 사진', '없음')}
        <div class="warn rv ${on ? 'on' : ''}" data-s><b>올리기 전에 운영자가 확인합니다</b><p>선입금 요구 · 개인 계좌 안내</p></div>` : ''}
      ${dn ? closeBtn : on ? '<div class="acts" style="margin-top:4px"><button class="btn p" data-a="cdecide" data-c="게시하지 않음">게시하지 않음</button><button class="btn" data-a="cdecide" data-c="글 고치기 요청">글 고치기 요청</button></div><p class="sub" style="margin:10px 0 0">운영자가 정하기 전에는 게시판에 올라가지 않습니다</p>'
        : `<div style="height:12px"></div><button class="btn p wide" data-a="cscan" id="sRun" ${o.scanRun ? 'disabled' : ''}>${o.scanRun ? '대조하는 중' : '금지선과 대조'}</button>`}`;
  }
  const tgSheet = () => `<h4>새 글과 문의 알림</h4><p class="sub">확인이 필요한 글 1건이 알림으로 갔습니다</p>
    <ul class="inc" style="margin:0 0 14px"><li><span>텔레그램 · 운영진 2명</span><span style="color:var(--acc)">바로 받음</span></li><li><span>카톡 · 운영자</span><span>채널을 연 뒤에 연결</span></li></ul>
    ${isDone('c_tg') ? closeBtn : '<button class="btn p wide" data-a="ctgok">확인</button>'}`;
  const VDONE = { '서류 요청': '서류 요청함', '확인 필요': '확인 요청함', '반려 · 금지선': '반려함' };
  function vCBiz() {
    const o = O(), v = CV[S.cv]; if (o.lv < 3) return lockPanel(3);
    const rd = isDone('c_reg'), md = isDone('c_match');
    let h = `<div class="pad"><div class="hd"><h2 class="title">업체</h2><span class="d">등록 신청 · 이번 주 5건</span></div>
      <div class="grp" id="vendBox">${v.vendors.map(([n, k, doc, fee, st, c]) => `<div class="row"><div class="m"><div class="t">${n} <span class="pill">${k}</span></div><div class="s">서류 ${doc} · 등록비 영수증 ${fee}</div></div><span class="pill ${rd && VDONE[st] ? 'wait' : c}">${rd && VDONE[st] ? VDONE[st] : st}</span></div>`).join('')}</div>
      ${rd ? '<p class="resp">심사 결과를 저장했습니다 · 게시 2곳 · 금지 업종은 걸러 냈습니다.</p>' : '<div class="acts"><button class="btn q wide" data-a="creg">심사 결과 저장</button></div>'}
      <div class="sec"><span>질문 글 옆 업체</span></div>
      <div class="grp"><button class="row" data-a="cmatch"><div class="m"><div class="t">${v.q}</div><div class="s">맞는 업체 3곳 · 이 글에서 간 문의 3건</div></div>${md ? '<span class="pill acc">확인</span>' : ''}${I.chev}</button></div>
      <div class="sec"><span>배너 자리</span><span>교체일 12월 1일</span></div>
      <div class="grp"><div class="row"><div class="m"><div class="t">첫 화면 위</div><div class="s">12월</div></div><span class="pill wait">비어 있음</span></div><div class="row"><div class="m"><div class="t">글 목록 사이 · 2자리</div><div class="s">1자리 예약</div></div><span class="pill acc">1 / 2</span></div></div>
      <p class="resp">등록비는 GCash 송금 안내와 영수증 확인으로 받습니다.</p>`;
    if (o.lv >= 5) {
      const rq = isDone('c_req');
      const R4 = v.reqs, REQ = [[...R4[0], '계약', '기록함', 'acc'], [...R4[1], '예약 완료', '청구 예정', ''], [...R4[2], rq ? '다른 업체로 넘김' : '응답 없음', '—', rq ? 'wait' : 'stop'], [...R4[3], '상담 중', '—', '']];
      h += `<div class="sec"><span>견적 요청과 업체 연결 · 11월</span></div>
        <div class="sumr"><div><small>견적 요청</small><b class="num">38건</b></div><div><small>업체 연결</small><b class="num">31건</b></div><div class="w2"><small>수수료 기록</small><b class="num" style="color:var(--acc)">19건</b></div></div>
        <div class="grp" id="reqBox">${REQ.map(([a, b, s2, fee, c]) => `<div class="row"><div class="m"><div class="t">${a}</div><div class="s">${b} · 수수료 ${fee}</div></div><span class="pill ${c}">${s2}</span></div>`).join('')}</div>
        <p class="resp">수수료율은 상담에서 정합니다.</p>
        <div class="grp" style="margin-top:10px"><button class="row" data-a="cen"><div class="m"><div class="t">영어 화면</div><div class="s">${v.enH}</div></div>${I.chev}</button></div>`;
    } else h += lockCard(5, '견적 요청과 업체 배정 · 수수료 건별 기록 · 영어 화면');
    return h + '</div>';
  }
  const matchSheet2 = () => { const v = CV[S.cv]; return `<h4>${v.q}</h4><p class="sub">${v.qSum}</p>
    <p class="sub" style="margin:0 0 6px">이 질문에 답할 수 있는 업체</p>
    <div class="grp" style="background:var(--surface2)">${v.match.map(([a, b, n]) => `<div class="row"><div class="m"><div class="t">${a}</div><div class="s">${b}${n ? ` · 이 글에서 간 문의 ${n}건` : ''}</div></div><span class="pill acc">문의</span></div>`).join('')}</div>
    <p class="sub" style="margin:10px 0 14px;text-align:center">문의는 업체와 운영자에게 함께 갑니다</p>
    ${isDone('c_match') ? closeBtn : '<button class="btn p wide" data-a="cmatchok">확인</button>'}`; };
  const enSheet = () => { const v = CV[S.cv]; return `<h4>영어 화면 · 필리핀 업체와 회원용</h4><p class="sub">한국어 · English</p>
    <div class="gcard"><p class="k">English</p><h5>${v.enH}</h5>
      ${v.en.map(([a, b]) => `<div class="qr"><span>${a}</span><span>${b}</span></div>`).join('')}
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px"><span class="pill acc">Ask for a quote</span><span class="pill">List your business</span></div></div>
    <div style="height:14px"></div>${closeBtn}`; };
  function vCSeo() {
    const o = O(), v = CV[S.cv]; if (o.lv < 4) return lockPanel(4);
    const wd = isDone('c_week'), nd = isDone('c_none');
    const dot = (x) => (x ? okc('나옴') : '<span style="color:var(--sub)">없음</span>');
    let h = `<div class="pad"><div class="hd"><h2 class="title">검색</h2><span class="d">매주 점검표 · 11월 4주</span></div>
      <div class="sumr"><div><small>검색에 등록된 답</small><b class="num">24 / 30</b></div><div><small>우리 답이 나온 곳</small><b class="num">31 / 80</b></div><div class="w2"><small>지난주보다</small><b class="num" style="color:var(--acc)">+3</b></div></div>
      <div id="chkBox">${atable(['질문 20개 중', '구글', '네이버', 'ChatGPT', 'Gemini'], v.checks.map(([q, a, b, c, d], i) => [`<b>${q}</b>${i === 3 && nd ? '<br><span style="color:var(--acc)">질문 페이지 목록에 넣음</span>' : ''}`, dot(a), dot(b), dot(c), dot(d)]), { c: 1 })}</div>
      ${wd ? '<p class="resp">확인했습니다 · 같은 질문으로 매주 다시 잽니다.</p>' : '<div class="acts"><button class="btn p wide" data-a="cweek">확인했습니다</button></div>'}
      <div class="sec"><span>정리된 답 · 확인일 ${v.faq[0][3]}</span></div>
      <div class="gcard"><p class="k">출처 · ${v.src}</p><h5>${v.a1}</h5>
        ${v.bullets.map(([a, b]) => `<div class="qr"><span>${a}</span><span${/^\d/.test(b) ? '' : ' style="font-family:var(--f)"'}>${b}</span></div>`).join('')}
        <p style="font-size:14px;color:var(--sub);margin:10px 0 0">검색과 AI가 읽는 정보 · 질문과 답 · 확인일과 출처 · 업체와 장소</p></div>
      <p class="resp"><b style="color:var(--ink)">약속하지 않는 것</b> · 검색 순위와 AI 답변 인용은 약속하지 않습니다. 같은 질문으로 매달 측정한 결과표를 드립니다.</p>`;
    h += o.lv >= 6 ? `<div class="sec"><span>확장 구상 · 06:00</span></div><div class="grp"><button class="row" data-a="cchg"><div class="m"><div class="t">공식 출처 변경 · ${v.chgSrc}</div><div class="s">바뀐 문장 2곳 · 정리된 답 3개의 수정안</div></div>${isDone('c_chg') ? '<span class="pill acc">승인함</span>' : ''}${I.chev}</button></div>` : lockCard(6, '공식 출처 변경 감지 · 수정안과 운영자 승인 · 읽은 회원에게 알림');
    return h + '</div>';
  }
  const rptSheet = () => { const v = CV[S.cv]; return `<h4>월 보고 한 장 · 12월 1일</h4><p class="sub">${v.room} · 11월</p>
    <ul class="inc" style="margin:0 0 14px"><li><span>새 회원</span><span class="num">${v.rpt[0]}명</span></li><li><span>질문 글</span><span class="num">${v.rpt[1]}건</span></li><li><span>업체 연결</span><span class="num">${v.rpt[2]}건</span></li><li><span>응답 없는 업체</span><span class="num" style="color:var(--stop)">${v.rpt[3]}곳</span></li></ul>
    ${isDone('c_rpt') ? closeBtn : '<button class="btn p wide" data-a="crptok">보고 확인</button>'}`; };
  const chgSheet = () => { const v = CV[S.cv]; return `<h4>공식 출처 변경 · ${v.chgSrc}</h4><p class="sub">06:00 · 바뀐 문장 2곳 · 운영자 승인 대기</p>
    <ul class="inc" style="margin:0 0 12px">${v.chg.map(([a, b]) => `<li><span>${a}</span><span style="color:var(--acc)">${b}</span></li>`).join('')}<li><span>바뀐 날</span><span>11월 30일</span></li></ul>
    <p class="sub" style="margin:0 0 6px">승인하시면 회원 휴대폰에 가는 알림</p>
    <div class="bubble"><small>회원 휴대폰</small>읽으신 답이 바뀌었습니다 · ${v.chgT}</div>
    <ul class="inc" style="margin:0 0 14px"><li><span>석 달 안에 이 답을 읽은 회원</span><span class="num">${v.readers}명</span></li><li><span>관련 업체</span><span>${v.vend2}</span></li></ul>
    ${isDone('c_chg') ? closeBtn : '<button class="btn p wide" data-a="cchgok">수정안 승인 · 회원에게 알리기</button><p class="sub" style="text-align:center;margin:10px 0 0">운영자가 승인한 것만 게시합니다</p>'}`; };

  // ---------- render ----------
  const OVIEWS = { mart: { today: vOToday, orders: vMOrders, stock: vMStock, settle: vMSettle, items: vMItems }, food: { today: vOToday, staff: vFStaff, cost: vFCost, settle: vFSettle, docs: vFDocs },
    golf: { today: vOToday, sched: vGSched, quote: vGQuote, money: vGMoney, rates: vGRates }, agent: { today: vOToday, guide: vRGuide, page: vRPage, clients: vRClients, book: vRBook },
    factory: { today: vOToday, orders: vPOrders, floor: vPFloor, stock: vPStock, close: vPClose }, community: { today: vOToday, faq: vCFaq, board: vCBoard, biz: vCBiz, seo: vCSeo } };
  function viewFn() { if (HOOK.views && HOOK.views[S.tab]) return HOOK.views[S.tab]; return S.mode === 'hq' ? { today: vToday, clients: vClients, orders: vOrders, post: vPost, files: vFiles }[S.tab] : OVIEWS[S.biz][S.tab]; }
  function render(anim) {
    const st0 = view.scrollTop;
    view.innerHTML = viewFn()();
    if (anim) { view.classList.remove('enter'); void view.offsetWidth; view.classList.add('enter'); view.scrollTop = 0; } else view.scrollTop = st0;
    renderTabs();
    const band = $('#band');
    band.hidden = !S.offline;
    if (S.offline) band.innerHTML = `<b>끊김</b><span>누른 것 ${S.queued}건을 폰에 모아 두었습니다. 연결되면 보냅니다.</span>`;
    if (!app.classList.contains('locked')) hint(S.tab);
    const f = $('#compose'); if (f) f.addEventListener('submit', sendMsg);
    const q = $('#q'); if (q) q.addEventListener('input', () => { S.q = q.value; const pos = q.selectionStart; render(); const q2 = $('#q'); q2.focus(); q2.setSelectionRange(pos, pos); });
    if (HOOK.after) HOOK.after();
  }
  function go(tab) { if (S.tab === tab && view.innerHTML) { view.scrollTo({ top: 0, behavior: 'smooth' }); return; } S.tab = tab; closeSheet(); render(true); }
  function bumpBig() { const b = $('#big'); if (b) { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); } }
  function flashEl(sel) { const e = $(sel); if (!e) return; e.classList.add('flash'); setTimeout(() => e.classList.remove('flash'), 900); }

  // 할 일 끝내기 (본부판 · 사장님판 같은 길). opt.undo === false 면 보내기를 마친 일이라 되돌리지 않는다.
  function finish(id, text, msg, opt = {}) {
    const own = S.mode !== 'hq';
    const list = own ? O().todo : S.todo, doneArr = own ? O().done : S.doneToday;
    const x = list.find((t) => t.id === id); if (!x || x.done) return;
    if (S.offline) S.queued++;
    const after = () => {
      x.leave = false; x.done = true;
      const d = { t: clock(), s: text, lv: x.lv }; doneArr.unshift(d);
      render(); bumpBig();
      if (opt.then) opt.then();
      if (msg) toast(msg, opt.undo === false ? null : () => {
        x.done = false; const i = doneArr.indexOf(d); if (i >= 0) doneArr.splice(i, 1);
        if (opt.revert) opt.revert(); render(); bumpBig(); toast('되돌렸습니다.');
      });
    };
    if (S.tab === 'today' && $('#row-' + id)) { x.leave = true; render(); setTimeout(after, 220); } else after();
  }

  // 승인 → PC → 카톡 → 사진 (본부판 · 넘을 것)
  function approve(id) {
    const p = S.posts.find((q) => q.id === id); if (!p || p.state !== 'wait') return;
    p.state = 'run'; p.step = 1; p.t0 = clock();
    if (S.offline) S.queued++;
    render(); toast(S.offline ? '승인을 폰에 모아 두었습니다. 연결되면 PC 본부로 갑니다.' : 'PC 본부로 보냈습니다.');
    advance(p);
  }
  function advance(p) {
    if (p.timer) return;
    const stepOnce = () => {
      p.timer = null;
      if (S.offline && p.step < 2) return;
      if (S.mode === 'hq') tick(1); else S.mins.hq++;
      p['t' + p.step] = `${Math.floor(S.mins.hq / 60)}:${String(S.mins.hq % 60).padStart(2, '0')}`; p.step++;
      if (p.step >= 4) {
        p.state = 'done';
        const t = S.todo.find((x) => x.post === p.id && !x.done);
        if (S.mode === 'hq') { render(); toast(`${p.room}에 올라갔습니다. 화면 사진이 도착했습니다.`); }
        if (t) setTimeout(() => { if (S.mode === 'hq') finish(t.id, `${p.room} 글 승인 · 올라간 화면 받음`); else { t.done = true; S.doneToday.unshift({ t: p.t3, s: `${p.room} 글 승인 · 올라간 화면 받음` }); } }, 1600);
        return;
      }
      if (S.mode === 'hq') render();
      p.timer = setTimeout(stepOnce, 1000);
    };
    p.timer = setTimeout(stepOnce, 1000);
  }
  function sendMsg(e) {
    e.preventDefault();
    const inp = $('#msg'); const text = inp.value.trim();
    if (!text) { inp.focus(); toast('지시 내용을 먼저 쓰십시오.'); return; }
    const m = { no: null, text, st: S.offline ? '폰에 보관' : '보내는 중', tm: clock(), isNew: true };
    S.talk.forEach((t) => (t.isNew = false)); S.talk.push(m);
    if (S.offline) S.queued++;
    render(); view.scrollTop = view.scrollHeight;
    const deliver = () => {
      m.no = S.inbox++; m.st = '받음'; m.isNew = false; if (S.mode === 'hq') { render(); view.scrollTop = view.scrollHeight; }
      setTimeout(() => { m.st = '진행'; m.wo = 'WO-022'; S.board.unshift({ wo: 'WO-022', t: text.slice(0, 18), st: '열림' }); if (S.mode === 'hq') { render(); view.scrollTop = view.scrollHeight; toast(`받은함 #${m.no}. 본부가 지시서를 열었습니다.`); } }, 1400);
    };
    if (S.offline) m.deliver = deliver; else setTimeout(deliver, 700);
  }
  function setOffline(v) {
    S.offline = v;
    if (!v) {
      S.queued = 0;
      S.talk.filter((m) => m.deliver).forEach((m) => { m.st = '보내는 중'; const d = m.deliver; delete m.deliver; setTimeout(d, 600); });
      S.posts.filter((p) => p.state === 'run').forEach(advance);
      toast('다시 연결됐습니다. 모아 둔 것을 보냈습니다.');
    } else toast('끊긴 모습입니다. 다시 누르면 연결됩니다.');
    render();
  }

  // 단계 바꾸기
  function renderLv() {
    const o = O(); if (!$('#lvs')) return;
    $('#lvs').innerHTML = B().steps.map((s, i) => `<button data-lv="${i + 1}" class="${i + 1 <= o.lv ? 'on' : ''}" aria-pressed="${i + 1 === o.lv}"><b>${i + 1}</b><span>${esc(s.name)}</span></button>`).join('');
  }
  function setLv(n) {
    const o = O(); const up = n > o.lv; o.lv = n; renderLv(); closeSheet();
    render(true);
    toast(`${n}단계 「${st(n).name}」까지 켰습니다.${up ? ' 새로 열린 기능이 더해졌습니다.' : ' 그다음 단계는 잠깁니다.'}`);
  }
  function setBiz(k) {
    S.biz = k; S.tab = 'today';
    document.querySelectorAll('[data-biz-set]').forEach((x) => x.setAttribute('aria-pressed', x.dataset.bizSet === k));
    $('#clock').textContent = clock(); $('#lockName').textContent = B().shop;
    const cc = $('#cvCtrl'); if (cc) cc.hidden = k !== 'community';
    hideToast(); closeSheet(); renderLv(); render(true);
  }
  // 커뮤니티 예시 바꾸기 (139): 단계는 그대로 두고 장면 속 예시만 바꾼다. 끝낸 일은 새 예시로 처음부터
  function setCv(i) {
    if (S.cv === i) return;
    S.cv = i; S.own.community = mkCommunity(i, S.own.community.lv);
    document.querySelectorAll('[data-cv-set]').forEach((x) => x.setAttribute('aria-pressed', +x.dataset.cvSet === i));
    if (S.mode !== 'hq' && S.biz === 'community') { if (S.tab !== 'set') S.tab = 'today'; $('#lockName').textContent = B().shop; hideToast(); closeSheet(); render(true); toast(`예시를 「${CV[i].label}」로 바꿨습니다. 단계와 값은 같습니다.`); }
  }
  function setMode(m) {
    S.mode = m; S.tab = 'today';
    document.querySelectorAll('[data-mode-set]').forEach((x) => x.setAttribute('aria-pressed', x.dataset.modeSet === m));
    const oc = $('#ownCtrl'); if (oc) oc.hidden = S.mode === 'hq';
    app.dataset.mode = S.mode; hideToast(); closeSheet();
    $('#clock').textContent = clock(); $('#lockName').textContent = S.mode === 'hq' ? '본부' : B().shop;
  }

  // ---------- actions ----------
  const A = {
    tab: (b) => go(b.dataset.t),
    pc: () => setOffline(!S.offline),
    // 본부판
    tact: (b) => {
      const x = S.todo.find((t) => t.id === b.dataset.id); if (!x) return;
      if (x.post) { approve(x.post); return; }
      if (x.id === 'q1') openSheet(`<h4>망고마트 문의</h4><p class="sub">쇼룸 문의 창 · 어젯밤 23:35</p>
        <p class="quote">“메신저로 오는 주문이 하루 50건쯤 됩니다. 적어 두다가 빠지는 게 있어요. 배달 앱 정산도 맞는지 모르겠습니다.”</p>
        <p class="sub" style="margin-bottom:6px">본부 초안</p><p class="quote">대표님, 문의 감사합니다. 메신저 주문을 한 줄씩 물건과 맞춰 보는 화면부터 보여 드리겠습니다. 편하신 시각을 알려 주시면 화면을 띄워 놓고 설명드리겠습니다.</p>
        <button class="btn p wide" data-a="draftok">초안 복사 · 「답함」으로</button>`);
    },
    draftok: () => { closeSheet(); finish('q1', '망고마트 문의 · 답함', '초안을 복사했습니다. 메일 앱에 붙여 넣으십시오.'); },
    choice: (b) => { const c = b.dataset.c; finish(b.dataset.id, `본부 질문 · ${c}`, `「${c}」로 답했습니다. 본부가 다음 확인 때 반영합니다.`); },
    report: () => openSheet(`<h4>아침 보고 · 07:40</h4><p class="sub">본부가 어젯밤에 한 일</p>
      <div class="grp" style="background:var(--surface2)"><div class="row"><div class="m"><div class="t">WO-018 마트 카톡 이미지 3장</div><div class="s">끝 · 점검 주소를 자료에 넣었습니다</div></div></div><div class="row"><div class="m"><div class="t">WO-020 업무 메일 주소 반영</div><div class="s">끝 · 쇼룸 바닥 줄까지</div></div></div><div class="row"><div class="m"><div class="t">WO-019 쇼룸 첫 화면 사진</div><div class="s">진행 · 밤 사진 두 장 중 고르는 중</div></div></div></div>
      <button class="btn wide" style="margin-top:14px" data-a="close">닫기</button>`),
    close: closeSheet,
    stage: (b) => { S.stageFilter = b.dataset.s; render(); },
    client: (b) => { const c = S.clients.find((x) => x.id === b.dataset.id); openSheet(clientSheet(c)); },
    move: (b) => {
      const c = S.clients.find((x) => x.id === b.dataset.id); if (!c) return;
      c.st++; const nx = STAGES[c.st];
      c.next = { '상담': '날짜 잡기', '시안': '방향 정하기', '견적': '한 장 보내기', '선금': '입금 확인', '제작': '시안대로 만드는 중', '납품': '점검표 돌리기', '잔금': '입금 확인', '후기': '후기 부탁' }[nx];
      if (nx === '제작' || nx === '후기') delete c.due;
      if (nx === '잔금' || nx === '선금') c.due = c.amt ? Math.round(c.amt / 2) : 0;
      if (S.offline) S.queued++;
      closeSheet(); if (S.stageFilter !== 'all') S.stageFilter = String(c.st);
      render(); const r = $('#cl-' + c.id); if (r) { flashEl('#cl-' + c.id); r.scrollIntoView({ block: 'nearest' }); }
      toast(`${c.n} → ${nx}. ${NEXT_WORK[nx] || ''}`.trim());
    },
    oseg: (b) => { S.orderSeg = b.dataset.s; render(); },
    photo: () => toast('사진 한 장을 붙여 지시할 수 있습니다. 시안에서는 고르기 창을 열지 않습니다.'),
    popen: (b) => { S.openPost = S.openPost === b.dataset.id ? null : b.dataset.id; render(); },
    approve: (b) => approve(b.dataset.id),
    pause: (b) => { const p = S.posts.find((q) => q.id === b.dataset.id); p.state = 'pause'; if (S.offline) S.queued++; render(); toast(`${p.room}의 오늘 글을 멈췄습니다. 내일은 그대로 올라갑니다.`); },
    fix: (b) => { const p = S.posts.find((q) => q.id === b.dataset.id); p.state = 'fix'; render(); toast('「지시」 탭에 고칠 점을 쓰시면 본부가 글을 바꿉니다.'); },
    shot: (b) => { const p = S.posts.find((q) => q.id === b.dataset.id);
      openSheet(`<h4>${esc(p.room)}에 올라간 화면</h4><p class="sub">${p.t2} 올림 · PC 본부가 찍어 보낸 사진</p>
        <div style="border:1px solid var(--line2);border-radius:14px;padding:14px;background:var(--surface2)"><div class="s" style="text-align:center;margin-bottom:10px;font-size:14px;color:var(--sub)">${esc(p.room)} · 오늘</div>
        <div style="background:var(--surface);border-radius:4px 14px 14px 14px;padding:10px 12px;font-size:14px;max-width:85%">${esc(p.text)}<div class="art" style="margin-top:8px;height:70px" aria-hidden="true"></div></div>
        <div style="font-size:12px;color:var(--sub);margin-top:6px">${p.t2} · 읽음 표시는 PC 화면 그대로</div></div>
        <p class="sub" style="margin-top:12px">경고 신호 없음 · 방 인원 그대로 · 같은 글 반복 없음</p>
        <button class="btn wide" data-a="close">닫기</button>`); },
    ffilter: (b) => { S.fileFilter = b.dataset.f; render(); },
    copy: (b) => { try { navigator.clipboard && navigator.clipboard.writeText('https://example.invalid/' + encodeURIComponent(b.dataset.t)).catch(() => {}); } catch (e) {} toast(`「${b.dataset.t}」 링크를 복사했습니다.`); },

    // 사장님판 공통
    lockinfo: (b) => openSheet(lockSheet(+b.dataset.n)),
    setlv: (b) => setLv(+b.dataset.n),
    oact: (b) => {
      const id = b.dataset.id, o = O();
      const F = {
        m_cnt: () => openSheet(countSheet()),
        m_item: () => { go('items'); setTimeout(() => flashEl('[data-a="fixlist"]'), 60); },
        m_set: () => { go('settle'); setTimeout(() => flashEl('#gap'), 60); },
        m_low: () => finish('m_low', '대파 · 배달K · 그랩 품절 표시', '배달K · 그랩에 대파 품절을 표시했습니다.'),
        m_match: () => openSheet(matchSheet()),
        m_close: () => openSheet(martClose()),
        m_po: () => finish('m_po', '대파 15단 발주서 승인 · 보냄', '대표님이 승인한 발주서만 거래처에 보냅니다. 보냈습니다.', { undo: false }),
        f_claim: () => openSheet(claimSheet()),
        f_pay: () => openSheet(paySheet()),
        f_wage: () => finish('f_wage', '임금 기준 ₱718 · 다음 급여에 반영', '조이 · 라몬 · 엘라 부족분 ₱4,368을 다음 급여에 넣었습니다.'),
        f_gap: () => openSheet(reasonSheet()),
        f_set: () => { go('settle'); setTimeout(() => flashEl('#gap'), 60); },
        f_out: () => finish('f_out', '해물파전 · 배달K · 그랩 품절 표시', '배달K · 그랩에서 해물파전을 껐습니다.'),
        f_close: () => openSheet(foodClose()),
        f_roster: () => finish('f_roster', '다음 주 근무표 승인 · 직원에게 보냄', '대표님이 승인한 근무표만 직원에게 보냅니다. 보냈습니다.', { undo: false }),
        g_ask: () => openSheet(askSheet()),
        g_rate: () => { go('rates'); setTimeout(() => flashEl('#rateBox'), 60); },
        g_quote: () => openSheet(quoteSheet()),
        g_pay: () => { go('money'); setTimeout(() => flashEl('#payBox'), 60); },
        g_dup: () => A.gdup(),
        g_drv: () => openSheet(driverSheet()),
        g_tee: () => openSheet(siteSheet()),
        g_delay: () => openSheet(delaySheet()),
        r_q: () => openSheet(mergeSheet()),
        r_q2: () => finish('r_q2', '입주할 때 처음 내는 돈 · 설명 3가지 → 안내 하나', '안내 카드 하나로 정리했습니다. 보증금 · 선납 월세 · 입주 청소가 한 장에 있습니다.'),
        r_lock: () => openSheet(recheckSheet()),
        r_old: () => finish('r_old', '관광비자 연장 새 안내 · 이수민 · 최은영 님께 보냄', '아직 모르시던 두 분께 새 안내를 보냈습니다.', { undo: false }),
        r_doc: () => openSheet(costSheet()),
        r_exp: () => finish('r_exp', '김지훈 님 체류 만료 안내 보냄', '김지훈 님께 12월 6일 만료 안내를 보냈습니다.', { undo: false }),
        r_fee: () => A.rfee(),
        r_draft: () => openSheet(draftSheet()),
        pl_diag: () => openSheet(diagSheet()),
        pl_code: () => finish('pl_code', '같은 품목 다른 이름 25개 · 코드 12개로 묶음', '같은 품목의 다른 이름을 코드로 묶었습니다. 배터리 커버는 BC-02 하나입니다.'),
        pl_late: () => openSheet(lateSheet()),
        pl_input: () => openSheet(workerSheet()),
        pl_card: () => openSheet(cardSheet()),
        pl_short: () => finish('pl_short', '포장 박스 B 450개 · 발주 승인', '포장 박스 B 450개 발주를 승인했습니다.'),
        pl_lot: () => openSheet(lotSheet()),
        pl_close: () => openSheet(plantClose()),
        pl_plan: () => openSheet(planSheet()),
        c_faq: () => openSheet(faqSheet()),
        c_ai: () => openSheet(aiSheet()),
        c_vend: () => finish('c_vend', '업체 연락처 37건 → 29곳 · 한 목록으로 저장', '업체 29곳을 한 목록에 모았습니다. 연락처가 없는 3곳은 따로 표시합니다.'),
        c_bad: () => openSheet(scanSheet()),
        c_tg: () => openSheet(tgSheet()),
        c_reg: () => { go('biz'); setTimeout(() => flashEl('#vendBox'), 60); },
        c_match: () => openSheet(matchSheet2()),
        c_week: () => { go('seo'); setTimeout(() => flashEl('#chkBox'), 60); },
        c_none: () => finish('c_none', '마카티 소아과 한국어 진료 · 질문 페이지 목록에 넣음', '질문 페이지 목록에 넣었습니다. 답은 확인할 수 있는 출처로 씁니다.'),
        c_req: () => { const r = CV[S.cv].reqs[2]; finish('c_req', `${r[0]} · 다른 업체로 넘김`, `응답이 없는 ${r[1]} 대신 다른 업체로 넘겼습니다.`); },
        c_rpt: () => openSheet(rptSheet()),
        c_chg: () => openSheet(chgSheet()),
      };
      if (F[id]) F[id]();
    },
    fold: (b) => { const id = b.dataset.id; S.open[id] = !S.open[id]; render(); },
    ochoice: (b) => {
      const id = b.dataset.id, c = b.dataset.c, o = O();
      if (id === 'g_pl') finish(id, `선밸리 상품 마진 3% · ${c}`, `선밸리 상품을 「${c}」(으)로 남겼습니다.`);
      if (id === 'r_book') finish(id, `박정우 님 15분 상담 · ${c}`, c === '예약 확정' ? '예약을 확정했습니다. 고객이 고른 조건이 상담 메모에 붙습니다.' : '다른 시간을 고르실 수 있게 남겼습니다.');
      if (id === 'f_card') { o.cardNote = c === '빠진 카드 촬영' ? '촬영함' : '찾을 수 없음'; finish(id, `2024년 3월 ~ 10월 타임카드 · ${o.cardNote}`, c === '빠진 카드 촬영' ? '촬영한 카드는 날짜순으로 보관합니다. 시안에서는 사진기를 열지 않습니다.' : '빠진 기간을 「찾을 수 없음」으로 남겼습니다.'); }
      if (id === 'pl_qty') { o.qtyNote = c === '고객사 확인' ? '고객사 확인 중' : '보류'; finish(id, `PO-2611-21 지시량 26,000 · ${c}`, c === '고객사 확인' ? '고객사 확인 전에는 생산 지시가 나가지 않습니다.' : '보류했습니다. 생산 지시는 잠긴 채입니다.'); }
      if (id === 'f_ot') finish(id, `조이 연장 1시간 · ${c}`, `조이 연장 1시간을 ${c === '승인' ? '승인했습니다. 직원 서명을 기다립니다' : '보류했습니다'}.`);
    },
    // 마트
    count: () => openSheet(countSheet()),
    clang: (b) => { O().countLang = b.dataset.l; $('#sheetBody').innerHTML = countSheet(); },
    reason: (b) => { O().reason = b.dataset.r; $('#sheetBody').innerHTML = countSheet(); },
    countsave: () => {
      const o = O(); closeSheet();
      if (o.reason) o.reasonAt = clock();
      if (isDone('m_cnt')) { toast('저장했습니다.'); render(); return; }
      finish('m_cnt', `냉장 2번 실사 저장${o.reason ? ' · 어묵 사유 ' + o.reason : ''}`, '저장했습니다. 다음 선반은 냉장 3번입니다.', { revert: () => { o.reason = null; } });
    },
    ifilter: (b) => { O().itemFilter = b.dataset.f; render(); },
    fixlist: () => finish('m_item', '값이 다른 품목 2개 · 고칠 목록', '고칠 목록을 만들었습니다. 대파는 그랩 등록, 계란은 배달K 값입니다.'),
    setdone: () => finish(S.biz === 'mart' ? 'm_set' : 'f_set', '그랩 정산 차액 · 확인 완료', '확인 완료로 표시했습니다.'),
    inq: () => openSheet(S.biz === 'mart'
      ? `<h4>그랩에 보낼 문의 글</h4><p class="sub">그랩 상담 창에 붙여 넣는 영어 글입니다</p><p class="quote">Hello, two orders from Nov 16–22 do not match our payout. #4471 was refunded twice (₱1,480). For #4502, please confirm who covered the discount (₱800). Thank you.</p><button class="btn p wide" data-a="inqcopy">복사</button>`
      : `<h4>그랩에 보낼 문의 글</h4><p class="sub">그랩 상담 창에 붙여 넣는 영어 글입니다</p><p class="quote">Hello, two orders from Nov 16–22 do not match our payout. #7731 was refunded twice (₱1,120). For #7758, please confirm who covered the discount (₱540). Thank you.</p><button class="btn p wide" data-a="inqcopy">복사</button>`),
    inqcopy: () => { closeSheet(); toast('문의 글을 복사했습니다.'); },
    hosu: () => openSheet(`<h4>메신저 · 이 대표님</h4><p class="sub">10:48 · 3품목 · ₱1,120</p><p class="quote">그린베이 콘도는 타워가 3곳입니다. 타워와 호수를 여쭙는 글이 준비됐습니다.</p>
      <div class="bubble"><small>보낼 글</small>대표님, 주문 감사합니다. 그린베이 몇 타워 몇 호인지 알려 주시면 바로 출발하겠습니다.</div>
      ${O().hosuSent ? '<button class="btn wide" data-a="close">닫기</button>' : '<button class="btn p wide" data-a="hosusend">요청 글 보내기</button>'}`),
    hosusend: () => { O().hosuSent = true; closeSheet(); render(); toast('이 대표님께 타워 · 호수를 여쭈었습니다.'); },
    mpick: (b) => { const l = O().lines[+b.dataset.i]; l.pick = l.pick === b.dataset.c ? null : b.dataset.c; $('#sheetBody').innerHTML = matchSheet(); },
    matchdone: () => { const o = O(); closeSheet(); finish('m_match', '최 사모님 메신저 주문 · 주문판에 올림', '주문판에 올렸습니다. 호수 회신이 오면 출발합니다.', { then: () => { o.matched = true; }, revert: () => { o.matched = false; } }); },
    mclose: () => openSheet(martClose()),
    closeday: () => { closeSheet(); finish(S.biz === 'mart' ? 'm_close' : 'f_close', `오늘 마감 · ${S.biz === 'mart' ? '순수익 ₱6,160' : '임대료 전 이익 ₱19,020'}`, '오늘 마감을 남겼습니다. 누가 언제 마감했는지 기록에 남습니다.'); },
    lowinfo: () => openSheet(`<h4>대파 · 채소 1번</h4><p class="sub">기준 3단보다 적습니다</p>
      <ul class="inc"><li><span>아침 재고</span><span class="num">24단</span></li><li><span>매장</span><span class="num">−9</span></li><li><span>배달K</span><span class="num">−8</span></li><li><span>그랩</span><span class="num">−4</span></li><li><span>메신저</span><span class="num">−1</span></li><li><span><b>남은 재고</b></span><span class="num" style="color:var(--stop)">2단</span></li></ul>
      <div style="height:12px"></div>${isDone('m_low') ? '<button class="btn wide" data-a="close">닫기</button>' : '<button class="btn p wide" data-a="lowdo">배달K · 그랩 품절 표시</button>'}`),
    lowdo: () => { closeSheet(); finish('m_low', '대파 · 배달K · 그랩 품절 표시', '배달K · 그랩에 대파 품절을 표시했습니다.'); },
    dlv: () => openSheet(`<h4>고객 앱 주문 · 배달 현황</h4><p class="sub">그린베이 타워 2 · 2914호 · 고객이 보는 화면과 같습니다</p>
      <ol class="tl"><li class="on"><span>10:05 주문 확인<em>8품목 · 대파는 쪽파로</em></span></li><li class="on"><span>10:32 포장 완료<em>담은 사진 1장</em></span></li><li class="on"><span>11:00 존 기사 출발<em>앞에 1곳</em></span></li><li class="now"><span>11:20 타워 2 로비<em>신분증 확인 뒤 올라갑니다</em></span></li></ol>
      <ul class="inc" style="margin-top:12px"><li><span>결제</span><span class="num">현금 ₱4,080</span></li><li><span>거스름돈</span><span class="num">₱920 준비됨</span></li></ul>
      <div style="height:12px"></div><button class="btn wide" data-a="close">닫기</button>`),
    // 식당
    claim: () => openSheet(claimSheet()),
    claimrun: () => {
      const o = O(); if (o.claimRun) return; o.claimRun = true;
      const btn = $('#claimRun'); if (btn) { btn.disabled = true; btn.textContent = '맞춰 보는 중'; }
      const items = [...document.querySelectorAll('#claims li')];
      items.forEach((li, i) => setTimeout(() => li.classList.add('on'), 180 * (i + 1)));
      setTimeout(() => { o.claimDone = true; $('#sheetBody').innerHTML = claimSheet(); flashEl('#claimSum'); }, 180 * (items.length + 1) + 200);
    },
    claimok: () => { closeSheet(); finish('f_claim', '마리아 청구 대조 · 지급 필요 ₱225 · 기록 보완 1건', '청구 대조를 끝냈습니다. 지급 필요 ₱225, 기록 보완 1건이 남습니다.', { revert: () => { const o = O(); o.claimDone = false; o.claimRun = false; } }); },
    pay: () => openSheet(paySheet()),
    payadv: () => {
      const o = O(); o.pay++;
      if (o.pay >= 3) { closeSheet(); finish('f_pay', '급여대장 11월 16일 ~ 30일 · 승인 · 명세서 발송', '승인했습니다. 명세서를 직원에게 보냈습니다.', { undo: false }); }
      else $('#sheetBody').innerHTML = paySheet();
    },
    phone: () => openSheet(phoneSheet()),
    reason2: () => openSheet(reasonSheet()),
    reasonsave: () => {
      const v = ($('#why').value || '').trim(); const o = O();
      if (!v) { $('#why').focus(); toast('차이 이유를 먼저 쓰십시오.'); return; }
      o.reasonText = v; closeSheet();
      if (isDone('f_gap')) { render(); toast('이유를 고쳤습니다.'); return; }
      finish('f_gap', `삼겹살 0.4kg 차이 · ${v}`, '이유를 남겼습니다. 다음 달 차이와 나란히 봅니다.');
    },
    fclose: () => openSheet(foodClose()),
    // 여행 · 골프
    gasksend: () => { closeSheet(); finish('g_ask', '박 대표님 문의 · 날짜 · 인원 · 항공편 여쭘', '보냈습니다. 답이 오면 담당자가 이어서 안내합니다.', { undo: false }); },
    grate: () => finish('g_rate', '요금표 · 블루힐 따로 항목 확인', '확인했습니다. 직원 4명이 같은 요금표를 봅니다.'),
    gquote: () => openSheet(quoteSheet()),
    qrun: () => {
      const o = O(); if (o.qRunning || o.q >= 1) return; o.qRunning = true;
      $('#sheetBody').innerHTML = quoteSheet();
      const items = [...document.querySelectorAll('#sheetBody [data-q]')];
      items.forEach((el, i) => setTimeout(() => el.classList.add('on'), 110 * (i + 1)));
      setTimeout(() => { o.qRunning = false; o.q = 1; $('#sheetBody').innerHTML = quoteSheet(); const r = $('#tipRow'), sb = $('#sheetBody'); if (r) sb.scrollTo({ top: Math.max(0, r.offsetTop - sb.clientHeight / 2), behavior: 'smooth' }); }, 110 * (items.length + 1) + 160);
    },
    qtip: (b) => { const o = O(); o.tip = b.dataset.c; $('#sheetBody').innerHTML = quoteSheet(); },
    qmake: () => { const o = O(); if (!o.tip) return; o.qView = 'doc'; $('#sheetBody').innerHTML = quoteSheet(); $('#sheetBody').scrollTop = 0; },
    qlang: (b) => { O().qLang = b.dataset.l; if (sheet.classList.contains('on')) $('#sheetBody').innerHTML = quoteSheet(); else render(); },
    qsend: () => { const o = O(); closeSheet(); finish('g_quote', `박 대표님 일행 견적서 ${qTotal(o)} · ${o.qLang === 'en' ? 'English' : '한글'} · 보냄`, '견적서 이미지를 보냈습니다. 상호와 유효 기한이 함께 갑니다.', { undo: false }); },
    grefresh: () => { const o = O(); o.paid = 1; o.paidAt = clock(); render(); flashEl('#payBox'); toast('새 입금 ₩194,000을 찾았습니다. 차액이 없어졌습니다.'); },
    gconfirm: () => finish('g_pay', '박 대표님 일행 · 전액 입금 · 예약 확정', '전액이 들어와 예약을 확정했습니다.'),
    gdup: () => { const o = O(); o.dupAt = clock(); finish('g_dup', '토요일 11:00 · 밴 A → 밴 B', '밴 B로 배정했습니다. 겹친 배정이 없어졌습니다.', { revert: () => { o.dupAt = null; } }); },
    gresend: () => { const o = O(); o.guideResent = clock(); render(); toast('미나 가이드에게 다시 보냈습니다. 확인하면 시각이 남습니다.'); },
    gdrvnext: () => { const o = O(); o.drv = Math.min(2, o.drv + 1); $('#sheetBody').innerHTML = driverSheet(); },
    gdrvok: () => { closeSheet(); finish('g_drv', '로델 기사 현장 지출 ₱520 확인', '현장 지출 ₱520을 확인했습니다.'); },
    gteeok: () => { closeSheet(); finish('g_tee', '블루힐 CC 빈 티업 3팀 확인', '확인했습니다. 예약 홈페이지에 총액으로 보입니다.'); },
    gdelayrun: () => {
      const o = O(); if (o.delayRunning || o.delayRun) return; o.delayRunning = true;
      $('#sheetBody').innerHTML = delaySheet();
      const items = [...document.querySelectorAll('#sheetBody [data-d]')];
      items.forEach((el, i) => setTimeout(() => el.classList.add('on'), 140 * (i + 1)));
      setTimeout(() => { o.delayRunning = false; o.delayRun = true; $('#sheetBody').innerHTML = delaySheet(); }, 140 * (items.length + 1) + 160);
    },
    gdelayok: () => { closeSheet(); finish('g_delay', '항공편 지연 · 안내문 3건 승인 · 보냄', '대표님이 승인한 안내문 3건만 보냈습니다.', { undo: false }); },
    // 부동산 · 비자
    rq: () => openSheet(mergeSheet()),
    rmerge: () => {
      const o = O(); if (o.mergeRun || o.merged) return; o.mergeRun = true;
      const btn = $('#mRun'); if (btn) { btn.disabled = true; btn.textContent = '정리하는 중'; }
      const olds = [...document.querySelectorAll('#olds li')];
      olds.forEach((li, i) => setTimeout(() => li.classList.add('gone'), 160 * (i + 1)));
      const t0 = 160 * (olds.length + 1);
      setTimeout(() => {
        const g = $('#gcard'); if (g) g.hidden = false;
        const rows = [...document.querySelectorAll('#gcard [data-c]')];
        rows.forEach((el, i) => setTimeout(() => el.classList.add('on'), 110 * (i + 1)));
        setTimeout(() => { o.mergeRun = false; o.merged = true; $('#sheetBody').innerHTML = mergeSheet(); }, 110 * (rows.length + 1) + 160);
      }, t0);
    },
    rcopy: () => { const o = O(); closeSheet(); finish('r_q', '비자 연장 · 설명 4가지 → 안내 하나 · 링크 복사', '안내 링크를 복사했습니다. 단톡방에도 그대로 올리실 수 있습니다.', { revert: () => { o.merged = false; o.mergeRun = false; } }); },
    rimg: () => toast('안내 카드를 이미지로 저장했습니다.'),
    plang: (b) => { O().pageLang = b.dataset.l; render(); },
    pans: (b) => { O().ans = +b.dataset.i; render(); flashEl('#ansRow'); },
    pbook: () => { const a = STAY[O().ans]; toast(`상담 예약이 들어오면 고른 조건 「${a[0]}」이 함께 옵니다.`); },
    rchk: (b) => { const o = O(); if (isDone('r_lock')) return; const i = +b.dataset.i; o.checks[i] = !o.checks[i]; $('#sheetBody').innerHTML = recheckSheet(); },
    rlocksave: () => { const o = O(); if (!o.checks.every(Boolean)) return; o.lockAt = clock(); closeSheet(); finish('r_lock', '연례 신고 준비물 · 다시 확인 · 저장', '저장했습니다. 이미 보낸 링크 41개도 새 내용으로 열립니다.', { revert: () => { o.checks = [false, false, false]; } }); },
    rcost: () => openSheet(costSheet()),
    rcostsend: () => { closeSheet(); finish('r_doc', '이수민 님 입주 첫 비용 ₱138,500 · 안내 링크 보냄', '이수민 님께 첫 비용과 남은 수표 장수를 보냈습니다.', { undo: false }); },
    rfee: () => finish('r_fee', '받을 돈 ₱35,000 · 이수민 · 박정우 님께 안내 링크 보냄', '두 분께 들어올 날과 금액을 담은 안내 링크를 보냈습니다.', { undo: false }),
    rdraft: () => openSheet(draftSheet()),
    // 공장
    plate: () => openSheet(lateSheet()),
    plrun: () => {
      const o = O(); if (o.lateRun || o.late) return; o.lateRun = true;
      $('#sheetBody').innerHTML = lateSheet();
      const items = [...document.querySelectorAll('#sheetBody [data-l]')];
      items.forEach((el, i) => setTimeout(() => el.classList.add('on'), 120 * (i + 1)));
      setTimeout(() => { o.lateRun = false; o.late = true; if (S.biz === 'factory' && sheet.classList.contains('on')) $('#sheetBody').innerHTML = lateSheet(); }, 120 * (items.length + 1) + 400);
    },
    papprove: () => { const o = O(); o.lateAt = clock(); closeSheet(); finish('pl_late', 'PO-2611-09 배정 7번 → 8번 승인 · 12월 2일 완료', '8번 사출기로 배정을 바꿨습니다. 12월 4일 출고 전에 끝납니다.', { revert: () => { o.lateAt = null; } }); },
    pdiagok: () => { closeSheet(); finish('pl_diag', '현장 진단 1쪽 · 새는 곳 다섯 · 받음', '진단서를 받았습니다. 정비할 것은 오더 양식 1개 · 품목 코드 12개 · 자재 코드 41개입니다.'); },
    pworker: () => openSheet(workerSheet()),
    pinputok: () => { closeSheet(); finish('pl_input', '사출 7번 · 정전 중 입력 · 확인', '정전 동안 보관한 입력을 확인했습니다. 현황판 숫자에 들어갔습니다.'); },
    pcard: () => openSheet(cardSheet()),
    pcardok: () => { closeSheet(); finish('pl_card', '7번 금형 교체 · 첫 제품 사진 확인 · 생산 시작', '첫 제품 사진을 확인했습니다. 카드의 조건대로 생산을 시작합니다.'); },
    plot: () => openSheet(lotSheet()),
    ptrace: () => {
      const o = O(); if (o.traceRun || o.traced) return; o.traceRun = true;
      $('#sheetBody').innerHTML = lotSheet();
      const items = [...document.querySelectorAll('#sheetBody [data-t]')];
      items.forEach((el, i) => setTimeout(() => el.classList.add('on'), 130 * (i + 1)));
      setTimeout(() => { o.traceRun = false; o.traced = true; if (S.biz === 'factory' && sheet.classList.contains('on')) $('#sheetBody').innerHTML = lotSheet(); }, 130 * (items.length + 1) + 200);
    },
    ptraceok: () => { closeSheet(); finish('pl_lot', '반품 120개 · LOT R-1108 · 오더 2건 출고 보류 · 검사 지시', '검사 지시를 보냈습니다. 같은 LOT를 쓴 PO-2611-09 · PO-2611-17은 출고 보류입니다.', { undo: false }); },
    pclose: () => openSheet(plantClose()),
    pcloseok: () => { closeSheet(); finish('pl_close', '오늘 마감 · 생산 42,620개 · 본사 보고 보냄', '마감하고 한국어 보고를 본사에 보냈습니다.', { undo: false }); },
    pplan: () => openSheet(planSheet()),
    pplanok: () => { closeSheet(); finish('pl_plan', '다음 주 계획 · 작업지시 9건 승인 · 현장에 보냄', '대표님이 승인한 작업지시 9건만 현장에 보냈습니다.', { undo: false }); },
    // 커뮤니티
    cfaq: () => openSheet(faqSheet()),
    cfaqok: () => { closeSheet(); finish('c_faq', `${CV[S.cv].askShort} 질문 · 정리된 답 링크로 답함`, '답 링크를 복사했습니다. 대화방에 붙여 넣으십시오.'); },
    caiok: () => { closeSheet(); finish('c_ai', 'AI 답변 진단표 · 질문 10개 · 받음', '진단표를 받았습니다. 4단계부터 같은 질문으로 매주 다시 잽니다.'); },
    cbad: () => openSheet(scanSheet()),
    cscan: () => {
      const o = O(); if (o.scanRun || o.scanned) return; o.scanRun = true;
      $('#sheetBody').innerHTML = scanSheet();
      const items = [...document.querySelectorAll('#sheetBody [data-s]')];
      items.forEach((el, i) => setTimeout(() => { el.classList.add('on'); if (i === 1) { const d = $('#dr'); if (d) d.classList.add('hit'); } }, 220 * (i + 1)));
      setTimeout(() => { o.scanRun = false; o.scanned = true; if (S.biz === 'community' && sheet.classList.contains('on')) $('#sheetBody').innerHTML = scanSheet(); }, 220 * (items.length + 1) + 200);
    },
    cdecide: (b) => { const o = O(), c = b.dataset.c; o.decided = c; closeSheet(); finish('c_bad', `선입금 요구 글 · ${c}`, c === '게시하지 않음' ? '게시하지 않았습니다. 게시판에는 올라가지 않습니다.' : '글쓴이에게 글을 고쳐 달라고 요청했습니다. 고친 글도 다시 대조합니다.', { revert: () => { o.decided = null; } }); },
    ctgok: () => { closeSheet(); finish('c_tg', '새 글 알림 · 텔레그램 운영진 2명 · 확인', '운영진 2명이 텔레그램으로 새 글 알림을 받습니다.'); },
    ccat: (b) => { O().cat = b.dataset.c; render(); },
    creg: () => finish('c_reg', '업체 신청 5건 · 게시 2 · 서류 요청 1 · 확인 요청 1 · 반려 1', '심사 결과를 저장했습니다. 금지 업종 1곳은 반려했습니다.'),
    cmatch: () => openSheet(matchSheet2()),
    cmatchok: () => { closeSheet(); finish('c_match', '질문 글 옆 업체 3곳 · 확인', '확인했습니다. 문의는 업체와 운영자에게 함께 갑니다.'); },
    cen: () => openSheet(enSheet()),
    cweek: () => finish('c_week', '11월 4주 점검표 · 확인', '확인했습니다. 같은 질문으로 매주 다시 잽니다.'),
    crptok: () => { closeSheet(); finish('c_rpt', '11월 월 보고 한 장 · 확인', '월 보고를 확인했습니다.'); },
    cchg: () => openSheet(chgSheet()),
    cchgok: () => { const v = CV[S.cv]; closeSheet(); finish('c_chg', `${v.chgSrc} 변경 · 수정안 3개 승인 · 회원 ${v.readers}명에게 알림`, `운영자가 승인한 수정안만 게시하고, 읽은 회원 ${v.readers}명에게 알렸습니다.`, { undo: false }); },
    rdraftok: () => { closeSheet(); finish('r_draft', '회신 초안 4건 승인 · 보냄', '대표님이 승인한 초안 4건만 보냈습니다. 근거 없는 1건과 직접 회신 1건은 남겨 두었습니다.', { undo: false }); },
  };

  if (HOOK.actions) Object.assign(A, HOOK.actions);
  app.addEventListener('click', (e) => {
    const b = e.target.closest('[data-a]'); if (!b || !app.contains(b)) return;
    const f = A[b.dataset.a]; if (f) f(b, e);
  });

  // ---------- lock ----------
  const dots = $('#dots');
  function pinDots() { [...dots.children].forEach((d, i) => d.classList.toggle('on', i < S.pin.length)); }
  function unlock() {
    dots.classList.add('ok'); $('#ask').textContent = '열었습니다';
    setTimeout(() => { $('#lock').classList.add('gone'); app.classList.remove('locked'); S.tab = 'today'; render(true); }, 200);
  }
  $('#keys').addEventListener('click', (e) => {
    const b = e.target.closest('[data-k]'); if (!b) return;
    const k = b.dataset.k;
    b.classList.add('hit'); setTimeout(() => b.classList.remove('hit'), 120);
    if (HOOK.key) { HOOK.key(k); return; }
    if (k === 'del') S.pin = S.pin.slice(0, -1);
    else if (k === 'bio') { S.pin = '0000'; pinDots(); unlock(); return; }
    else if (S.pin.length < 4) S.pin += k;
    pinDots(); if (S.pin.length === 4) unlock();
  });
  function lock() {
    S.pin = ''; pinDots(); dots.classList.remove('ok'); $('#ask').textContent = 'PIN 네 자리를 누르십시오';
    $('#lockName').textContent = S.mode === 'hq' ? '본부' : B().shop;
    hideToast(); closeSheet(); app.classList.add('locked'); $('#lock').classList.remove('gone'); hint('lock');
    if (HOOK.onLock) HOOK.onLock();
  }

  // ---------- outside controls ----------
  const rl = $('#relock'); if (rl) rl.addEventListener('click', lock);
  document.querySelectorAll('[data-mode-set]').forEach((b) => b.addEventListener('click', () => {
    setMode(b.dataset.modeSet);
    if (app.classList.contains('locked')) { $('#lock').classList.add('gone'); app.classList.remove('locked'); }
    render(true);
  }));
  document.querySelectorAll('[data-biz-set]').forEach((b) => b.addEventListener('click', () => {
    setBiz(b.dataset.bizSet);
    if (app.classList.contains('locked')) { $('#lock').classList.add('gone'); app.classList.remove('locked'); render(true); }
  }));
  document.querySelectorAll('[data-cv-set]').forEach((b) => b.addEventListener('click', () => {
    if (app.classList.contains('locked')) { $('#lock').classList.add('gone'); app.classList.remove('locked'); render(true); }
    setCv(+b.dataset.cvSet);
  }));
  if ($('#lvs')) $('#lvs').addEventListener('click', (e) => {
    const b = e.target.closest('[data-lv]'); if (!b) return;
    if (app.classList.contains('locked')) { $('#lock').classList.add('gone'); app.classList.remove('locked'); }
    setLv(+b.dataset.lv);
  });
  document.querySelectorAll('[data-theme-set]').forEach((b) => b.addEventListener('click', () => {
    const v = b.dataset.themeSet;
    if (v === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', v);
    document.querySelectorAll('[data-theme-set]').forEach((x) => x.setAttribute('aria-pressed', x === b));
    try { localStorage.setItem('bigc-app-theme', v); } catch (e) {}
  }));
  try { const v = localStorage.getItem('bigc-app-theme'); if (v && v !== 'auto') document.querySelector(`[data-theme-set="${v}"]`).click(); } catch (e) {}

  // 만들 수 있는지 · 사장님판 표 (단계 시안 그대로)
  const canOwnHTML = (keys) => keys.map((k) => {
    const b = BIZ[k], note = b.resp || b.foot;
    return `<table style="margin-bottom:${note ? 8 : 20}px"><thead><tr><th>${b.label} 단계</th><th>기능 · 가능 여부</th><th>값 · 정가 / 시범가</th><th>준비물</th></tr></thead><tbody>${b.steps.map((s, i) => `<tr><td>${i + 1} · ${esc(s.name)}</td>
      <td><div class="fl">${s.feats.map(([f, c]) => `<span><span class="pill ${CAN[c][1]}">${CAN[c][0]}</span>${esc(f)}</span>`).join('')}</div></td>
      <td class="num">${s.flat ? `${esc(s.list)} · 값 하나` : s.list ? `${esc(s.list)} / ${esc(s.pilot)}` : esc(s.label)}${s.inc ? `<br><span style="color:var(--sub)">${esc(s.inc)}</span>` : ''}${s.mo ? `<br><span style="color:var(--sub)">선택 월 관리 ${esc(s.mo)}</span>` : ''}${b.conf && s.list ? '<br><span style="color:var(--sub)">현장 상담 후 확정</span>' : ''}</td><td>${esc(s.prep)}</td></tr>`).join('')}</tbody></table>${note ? `<p class="cp" style="margin:0 0 20px">${esc(note)}</p>` : ''}`;
  }).join('');
  if ($('#canOwn')) $('#canOwn').innerHTML = canOwnHTML(['mart', 'food', 'golf', 'agent', 'factory', 'community']);

  if (HOOK.init) HOOK.init({ S, $, app, view, render, go, setBiz, setLv, setMode, setCv, lock, unlock, pinDots, toast, hideToast, openSheet, closeSheet, esc, I, B, O, st, BIZ, CAN, CV, mkCommunity, stepVal, canOwnHTML, advance, clock });
  renderLv(); $('#clock').textContent = clock();
  app.classList.add('locked'); render(); lock();
  window.__bigcApp = S;
})();

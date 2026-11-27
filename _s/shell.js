/* bigC showroom shell (173)(174)(182): one inquiry sheet on every page + brand link to the hub.
   (182) H3: no floating 「문의하기」 button any more — each page opens the sheet from its own header / phone bar / step buttons.
   Injected by build_site.py as  <script src="/_s/config.js"></script><script src="/_s/shell.js" data-trade="…" data-region="ph|vn" data-page="hub|golf|…" defer></script>
   - Shadow DOM: the approved drafts' CSS and ours never touch each other.
   - Every copy the page makes (its own 「문의 글 복사」, the bot's summary, MES 「글 복사」) opens this sheet with that text,
     so the customer only has to pick where to send it.  window.bigcAsk.open({...}) opens it from the hub.
   (WO-001) window.BIGC.intake = the intake Worker address -> a 「바로 보내기」 block on top of the sheet (owner's Telegram).
   Empty -> not one character of the sheet changes. */
(() => {
  const me = document.currentScript || document.querySelector('script[src*="_s/shell.js"]');
  const C = Object.assign({ contacts: {}, preview: true }, window.BIGC || {});
  C.hub = (me && me.dataset.root) || './';  // relative, so the same files work on github.io, a custom domain, an artifact and file://
  const PAGE = (me && me.dataset.page) || '';
  const TRADE = (me && me.dataset.trade) || '';
  const REGION = (me && me.dataset.region) || 'ph';
  const touch = matchMedia('(pointer:coarse)').matches;
  const digits = (s) => String(s || '').replace(/[^\d]/g, '');
  const IN = String(C.intake || '').trim();  // (WO-001) self intake; empty = the copy-and-paste sheet exactly as before

  // ---------- routes (174): one place for every way in. Empty ones are hidden (or shown as 「주소 대기」 in preview).
  const R = {
    kakao: { n: '카카오톡', b: 'K', c: '#FEE500', f: '#191600', v: (x) => x.url, href: (x) => x.url, copy: true },
    telegram: { n: '텔레그램', b: 'T', c: '#2AABEE', v: (x) => x.id, href: (x) => 'https://t.me/' + x.id.replace(/^@/, ''), copy: true },
    viber: { n: '바이버', b: 'V', c: '#7360F2', v: (x) => x.phone, href: (x) => 'viber://chat?number=%2B' + digits(x.phone), copy: true },
    messenger: { n: '메신저', b: 'M', c: '#0866FF', v: (x) => x.page, href: (x, t) => 'https://m.me/' + x.page + '?text=' + encodeURIComponent(t), copy: true },
    whatsapp: { n: '왓츠앱', b: 'W', c: '#25D366', v: (x) => x.phone, href: (x, t) => 'https://wa.me/' + digits(x.phone) + '?text=' + encodeURIComponent(t), fill: true },
    zalo: { n: '잘로', b: 'Z', c: '#0068FF', v: (x) => x.phone, href: (x) => 'https://zalo.me/' + digits(x.phone), copy: true },
    sms: { n: '문자', i: 'sms', v: (x) => (touch ? x.phone : ''), href: (x, t) => 'sms:+' + digits(x.phone) + '?&body=' + encodeURIComponent(t), fill: true },
    tel: { n: '전화', i: 'tel', v: (x) => x.phone, href: (x) => 'tel:+' + digits(x.phone), call: true },
    email: { n: '메일', i: 'mail', v: (x) => x.addr, href: (x, t) => 'mailto:' + x.addr + '?subject=' + encodeURIComponent('[bigC company 문의] ' + (st.trade || '프로그램')) + '&body=' + encodeURIComponent(t), fill: true },
  };
  const ORDER = REGION === 'vn'
    ? ['kakao', 'zalo', 'email', 'telegram', 'whatsapp', 'viber', 'tel', 'sms', 'messenger']
    : ['kakao', 'telegram', 'viber', 'messenger', 'whatsapp', 'sms', 'tel', 'email', 'zalo'];
  const TRADES = ['골프 여행사', '마트 · 배달', '식당', '부동산 · 비자 사무실', '공장 생산관리(MES)', '커뮤니티 · 검색 노출', '홈페이지', '그 밖의 업무'];  // (177) no 「한인」
  const WANTS = ['단계와 값 상담', '맞춤 시안 요청', '현장 방문 상담'];

  const st = { trade: TRADE, want: '', stage: '', price: '', text: '', from: '' };
  const ICON = {
    tel: '<path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z"/>',
    sms: '<path d="M4 4h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H8l-4 3.5V5a1 1 0 0 1 1-1z"/>',
    mail: '<path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm1 2.2V17h16V7.2l-8 5.3z"/>',
    chat: '<path d="M12 3c5 0 9 3.4 9 7.6S17 18.2 12 18.2c-.8 0-1.6-.1-2.4-.3L5 20.5l1.1-3.9C4.2 15.2 3 13 3 10.6 3 6.4 7 3 12 3z"/>',
  };
  const svg = (k, s = 20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${ICON[k]}</svg>`;

  const CSS = `
:host{all:initial;--bg:#FBFAF7;--fg:#1D1B18;--mu:#625C53;--ln:#E3DDD3;--cd:#fff;--ac:#0F6B5E;--acf:#fff;--sh:0 24px 64px rgba(20,16,10,.22);
  font:15px/1.6 "IBM Plex Sans KR",system-ui,-apple-system,"Apple SD Gothic Neo","Malgun Gothic",sans-serif;color:var(--fg);word-break:keep-all}
@media (prefers-color-scheme:dark){:host{--bg:#1A1917;--fg:#EEEAE3;--mu:#A69F95;--ln:#36332F;--cd:#23211F;--ac:#5CC2B0;--acf:#0B1F1C;--sh:0 24px 64px rgba(0,0,0,.6)}}
*{box-sizing:border-box}button,textarea,a{font:inherit;color:inherit}[hidden]{display:none!important}
.scrim{position:fixed;inset:0;z-index:2147483001;background:rgba(15,12,8,.42);opacity:0;pointer-events:none;transition:opacity .25s}
.sheet{position:fixed;z-index:2147483002;background:var(--bg);color:var(--fg);display:flex;flex-direction:column;box-shadow:var(--sh);
  right:0;top:0;bottom:0;width:min(440px,100%);transform:translateX(104%);transition:transform .32s cubic-bezier(.2,.8,.2,1)}
@media (max-width:640px){.sheet{left:0;right:0;top:auto;width:auto;max-height:92dvh;border-radius:18px 18px 0 0;transform:translateY(104%)}}
:host([open]) .scrim{opacity:1;pointer-events:auto}:host([open]) .sheet{transform:none}
.hd{display:flex;align-items:center;justify-content:space-between;padding:18px 20px 6px}
.hd h2{margin:0;font-size:20px;letter-spacing:-.01em}
.x{width:40px;height:40px;border:0;border-radius:10px;background:transparent;font-size:24px;line-height:1;cursor:pointer;color:var(--mu)}
.x:hover{background:var(--ln)}
.bd{padding:0 20px calc(20px + env(safe-area-inset-bottom,0px));overflow-y:auto;overscroll-behavior:contain}
.lead{margin:0 0 14px;color:var(--mu)}
.lb{display:flex;justify-content:space-between;align-items:baseline;margin:16px 0 8px;font-weight:600;font-size:14px}
.lb small{font-weight:400;color:var(--mu)}
.chips{display:flex;flex-wrap:wrap;gap:8px}
.chips button{padding:8px 13px;border:1px solid var(--ln);border-radius:999px;background:var(--cd);font-size:14px;cursor:pointer;transition:border-color .15s,background .15s}
.chips button:hover{border-color:var(--mu)}
.chips button[aria-pressed="true"]{background:var(--fg);color:var(--bg);border-color:var(--fg)}
.got{display:flex;gap:10px;align-items:center;padding:12px 14px;border-radius:12px;background:var(--cd);border:1px solid var(--ln);font-size:14px}
.got b{font-weight:600}.got i{font-style:normal;color:var(--ac);font-weight:700}
textarea{width:100%;min-height:132px;resize:vertical;padding:12px 14px;border:1px solid var(--ln);border-radius:12px;background:var(--cd);font-size:15px;line-height:1.6}
textarea:focus{outline:2px solid var(--ac);outline-offset:1px}
.routes{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.rt{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;min-height:84px;padding:12px 6px;border:1px solid var(--ln);border-radius:14px;background:var(--cd);
  text-decoration:none;font-size:14px;font-weight:600;cursor:pointer;transition:transform .15s,border-color .15s;text-align:center}
.rt:hover{transform:translateY(-2px);border-color:var(--mu)}.rt:focus-visible{outline:3px solid var(--ac);outline-offset:2px}
.rt .bg{display:grid;place-items:center;width:34px;height:34px;border-radius:11px;font-weight:700;font-size:16px}
.rt small{font-weight:400;font-size:12px;color:var(--mu);line-height:1.3}
.rt[aria-disabled="true"]{opacity:.5;cursor:default}.rt[aria-disabled="true"]:hover{transform:none;border-color:var(--ln)}
.sm .rt{min-height:0;flex-direction:row;justify-content:flex-start;padding:10px 12px;gap:10px}.sm .rt .bg{width:28px;height:28px;font-size:13px;border-radius:9px}
.sm{grid-template-columns:repeat(2,1fr);margin-top:8px}
details{margin-top:10px}summary{cursor:pointer;color:var(--mu);font-size:14px;padding:6px 0;list-style:none}summary::-webkit-details-marker{display:none}
summary:before{content:"+ "}details[open] summary:before{content:"− "}
.alt{display:block;margin-top:18px;padding:14px 16px;border-radius:12px;background:var(--cd);border:1px dashed var(--ln);text-decoration:none;font-size:14px}
.alt b{color:var(--ac)}
.fine{margin:16px 0 0;color:var(--mu);font-size:12.5px}
.toast{position:fixed;left:50%;bottom:calc(24px + env(safe-area-inset-bottom,0px));z-index:2147483003;transform:translate(-50%,20px);opacity:0;pointer-events:none;
  max-width:min(92vw,420px);padding:12px 16px;border-radius:12px;background:var(--fg);color:var(--bg);font-size:14px;text-align:center;transition:.25s}
.toast.on{opacity:1;transform:translate(-50%,0)}
@media (prefers-reduced-motion:reduce){.sheet,.scrim,.toast,.rt{transition:none}}
`;
  // (WO-001) only added when the intake address is set
  const CSS_IN = `
:host{--er:#B3261E}@media (prefers-color-scheme:dark){:host{--er:#F2B8B5}}
.in{position:relative;margin:0 0 4px;padding:14px;border-radius:14px;background:var(--cd);border:1px solid var(--ln)}
.in .lb{margin-top:0}.lb small{font-size:13px}
.in input{display:block;width:100%;height:48px;padding:0 14px;border:1px solid var(--ln);border-radius:12px;background:var(--bg);font:inherit;font-size:16px;color:inherit}
.in input:focus{outline:2px solid var(--ac);outline-offset:1px}.in input[aria-invalid="true"]{border-color:var(--er)}
.go{display:block;width:100%;min-height:52px;margin-top:10px;border:0;border-radius:12px;background:var(--ac);color:var(--acf);font-weight:700;font-size:16px;cursor:pointer;transition:filter .15s}
.go:hover{filter:brightness(1.08)}.go:disabled{opacity:.7;cursor:progress}.go:focus-visible{outline:3px solid var(--ac);outline-offset:2px}
.in .msg{margin:10px 0 0;font-size:14px;color:var(--mu)}.in .msg:empty{display:none}.in .msg.err{color:var(--er)}
.in.done>:not(.msg){display:none}.in.done .msg{margin:0;font-size:15px;font-weight:600;color:var(--fg)}.in.done .msg i{font-style:normal;color:var(--ac);margin-right:6px}
.hp{position:absolute;top:0;left:0;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);opacity:0;pointer-events:none}
`;
  const IN_HTML = `
    <div class="in">
      <label class="lb" for="bc-r">답을 받으실 연락처 <small>꼭 적어 주십시오</small></label>
      <input id="bc-r" type="text" maxlength="120" aria-required="true" placeholder="메신저 ID 또는 전화번호">
      <input class="hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
      <button class="go" type="button">바로 보내기</button>
      <p class="msg" role="status" aria-live="polite"></p>
    </div>`;

  const host = document.createElement('bigc-ask');
  const root = host.attachShadow({ mode: 'open' });
  root.innerHTML = `<style>${CSS}${IN ? CSS_IN : ''}</style>
<div class="scrim" part="scrim"></div>
<aside class="sheet" role="dialog" aria-modal="true" aria-labelledby="bc-t" aria-hidden="true">
  <div class="hd"><h2 id="bc-t">문의하기</h2><button class="x" type="button" aria-label="닫기">×</button></div>
  <div class="bd">
    <p class="lead">${IN ? '연락처를 적고 「바로 보내기」를 누르시면 아래 문의 글이 담당자에게 갑니다.' : '편하신 방법을 누르시면 아래 문의 글이 함께 복사됩니다. 붙여 넣고 보내 주십시오.'}</p>${IN ? IN_HTML : ''}
    <div class="got" hidden></div>
    <div class="pick">
      <p class="lb">업종</p><div class="chips" data-k="trade"></div>
      <p class="lb">먼저 원하시는 것</p><div class="chips" data-k="want"></div>
    </div>
    <label class="lb" for="bc-m">문의 글 <small>고치셔도 됩니다</small></label>
    <textarea id="bc-m" spellcheck="false"></textarea>
    <p class="lb">${IN ? '메신저로 보내셔도 됩니다' : '보낼 곳'}</p>
    <div class="routes big"></div>
    <details class="more"><summary></summary><div class="routes sm"></div></details>
    <a class="alt" href="${C.hub === './' ? '' : C.hub}bot/">어디서부터 시작할지 모르시겠다면 · <b>1분 질문으로 값 먼저 보기 →</b></a>
    <p class="fine">보내 주신 글은 담당자만 읽습니다. 화면과 금액은 예시이며, 값은 상담에서 맞춰 드립니다.</p>
  </div>
</aside>
<div class="toast" role="status" aria-live="polite"></div>`;
  const $ = (s) => root.querySelector(s);
  const sheet = $('.sheet'), ta = $('textarea'), toastEl = $('.toast');
  if (PAGE === 'bot') $('.alt').hidden = true;

  // chips
  const chipBox = (k, list) => {
    const box = $(`.chips[data-k="${k}"]`);
    box.innerHTML = list.map((t) => `<button type="button" aria-pressed="false">${t}</button>`).join('');
    box.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      const on = b.getAttribute('aria-pressed') !== 'true';
      box.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', 'false'));
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      st[k] = on ? b.textContent : '';
      if (!st.text) ta.value = compose();
    });
  };
  chipBox('trade', TRADES); chipBox('want', WANTS);
  const syncChips = () => root.querySelectorAll('.chips').forEach((box) => box.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', b.textContent === st[box.dataset.k] ? 'true' : 'false')));

  const compose = () => [
    '안녕하십니까. bigC company 쇼룸을 보고 문의드립니다.',
    st.trade && '업종: ' + st.trade,
    st.stage && '보고 온 단계: ' + st.stage + (st.price ? ' (' + st.price + ')' : ''),
    st.want && '원하는 것: ' + st.want,
    '상호: ',
    '연락 가능한 시간: ',
  ].filter(Boolean).join('\n');

  // routes
  const live = ORDER.filter((k) => C.contacts[k] && R[k].v(C.contacts[k]));
  const shown = C.preview ? ORDER.filter((k) => !(k === 'sms' && !touch)) : live;
  const btn = (k) => {
    const r = R[k], x = C.contacts[k] || {}, ok = live.includes(k);
    const badge = r.b ? `<span class="bg" style="background:${r.c};color:${r.f || '#fff'}">${r.b}</span>` : `<span class="bg" style="background:var(--ln)">${svg(r.i, 18)}</span>`;
    const sub = !ok ? '주소 대기' : r.call && !touch ? x.phone : r.fill ? '글이 채워져 열림' : '복사 후 열림';
    return `<a class="rt" data-k="${k}" href="${ok ? '#' : '#'}" role="button" ${ok ? '' : 'aria-disabled="true"'}>${badge}<span>${r.n}</span><small>${sub}</small></a>`;
  };
  const TOP = 3;
  $('.big').innerHTML = shown.slice(0, TOP).map(btn).join('');
  const rest = shown.slice(TOP);
  if (rest.length) { $('.sm').innerHTML = rest.map(btn).join(''); $('summary').textContent = `다른 방법 ${rest.length}가지 (${rest.map((k) => R[k].n).join(' · ')})`; }
  else $('.more').hidden = true;

  let selfCopy = false;
  const copy = async (t) => {
    selfCopy = true;
    try { await navigator.clipboard.writeText(t); return true; }
    catch (_) { ta.select(); try { return document.execCommand('copy'); } catch (__) { return false; } }
    finally { setTimeout(() => (selfCopy = false), 50); }
  };
  const toast = (m) => { toastEl.textContent = m; toastEl.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => toastEl.classList.remove('on'), 3600); };

  root.addEventListener('click', async (e) => {
    const a = e.target.closest('.rt'); if (!a) return;
    e.preventDefault();
    const k = a.dataset.k, r = R[k], x = C.contacts[k];
    if (a.getAttribute('aria-disabled') === 'true') { toast(`${r.n} 주소는 아직 준비 중입니다. 다른 방법을 골라 주십시오.`); return; }
    const t = ta.value.trim();
    if (r.call && !touch) { await copy(x.phone); toast('전화번호를 복사했습니다: ' + x.phone); return; }
    const done = await copy(t);
    const url = r.href(x, t);
    if (r.fill) toast('문의 글이 채워진 채로 열립니다.');
    else if (!r.call) toast(done ? `문의 글을 복사했습니다. ${r.n} 대화창에 붙여 넣어 보내 주십시오.` : `${r.n} 대화창에 아래 글을 붙여 넣어 주십시오.`);
    if (/^https?:/.test(url)) window.open(url, '_blank', 'noopener'); else location.href = url;
  });

  // ---------- (WO-001) 「바로 보내기」 -> intake Worker -> owner's Telegram. Any failure falls back to the copy routes below.
  let resetIn = () => {};
  if (IN) {
    const box = $('.in'), rIn = $('#bc-r'), hp = $('.hp'), go = $('.go'), msg = $('.in .msg');
    const say = (m, err) => { msg.textContent = m; msg.classList.toggle('err', !!err); };
    resetIn = () => { box.classList.remove('done'); go.disabled = false; go.textContent = '바로 보내기'; say(''); rIn.removeAttribute('aria-invalid'); };
    const send = async () => {
      if (go.disabled) return;
      const reply = rIn.value.trim(), text = ta.value.trim();
      rIn.setAttribute('aria-invalid', reply ? 'false' : 'true');
      if (!reply) { say('답을 받으실 연락처를 적어 주십시오.', true); rIn.focus(); return; }
      if (text.length > 2000) { say(`문의 글이 깁니다. 2000자 안으로 줄여 주십시오. 지금 ${text.length}자입니다.`, true); ta.focus(); return; }
      go.disabled = true; go.textContent = '보내는 중입니다'; say('');
      let ok = false;
      try {
        const ctl = new AbortController(), tm = setTimeout(() => ctl.abort(), 15000);
        const r = await fetch(IN, { method: 'POST', headers: { 'content-type': 'application/json' }, signal: ctl.signal,
          body: JSON.stringify({ text, reply, from: st.from, trade: st.trade, stage: st.stage, price: st.price, want: st.want, page: location.pathname, website: hp.value }) });
        clearTimeout(tm);
        ok = r.ok && (await r.json().catch(() => ({}))).ok === true;
      } catch (_) {}
      go.disabled = false;
      if (ok) {
        box.classList.add('done'); msg.classList.remove('err');
        msg.innerHTML = '<i>✓</i>보냈습니다. 확인 후 연락드리겠습니다.';
      } else {
        go.textContent = '다시 보내기';
        say('보내지 못했습니다. 아래에서 메신저를 고르시면 글이 복사됩니다.', true);
        toast('보내지 못했습니다. 아래에서 메신저를 고르시면 글이 복사됩니다.');
        $('.big').scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    };
    go.addEventListener('click', send);
    rIn.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); send(); } });
  }

  // open / close
  let last = null;
  const open = (o = {}) => {
    Object.assign(st, { stage: '', price: '', text: '' }, o);
    if (o.trade) st.trade = o.trade;
    resetIn();
    const got = $('.got'), pick = $('.pick');
    if (st.text) {
      ta.value = st.text; pick.hidden = true; got.hidden = false;
      got.innerHTML = `<i>✓</i><span><b>${st.from || '고르신 내용'}</b>이 문의 글에 담겼습니다.</span>`;
    } else { pick.hidden = false; got.hidden = true; syncChips(); ta.value = compose(); }
    last = document.activeElement;
    host.setAttribute('open', ''); sheet.setAttribute('aria-hidden', 'false');
    document.documentElement.style.overflow = 'hidden';
    setTimeout(() => $('.x').focus(), 60);
  };
  const close = () => {
    host.removeAttribute('open'); sheet.setAttribute('aria-hidden', 'true');
    document.documentElement.style.overflow = '';
    if (last && last.focus) last.focus();
  };
  $('.x').addEventListener('click', close);
  $('.scrim').addEventListener('click', close);
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && host.hasAttribute('open')) close(); });
  sheet.addEventListener('keydown', (e) => { // keep Tab inside the sheet
    if (e.key !== 'Tab') return;
    const f = [...sheet.querySelectorAll('button,a,textarea,summary,input:not(.hp)')].filter((n) => !n.closest('[hidden]') && n.offsetParent !== null);
    if (!f.length) return;
    const i = f.indexOf(root.activeElement);
    if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
  });

  // ---------- catch the page's own copy (approved drafts, bot, MES) and continue into the sheet
  const FROM = { bot: '1분 질문 결과', mes: '고르신 진단 내용' };
  // only right after the customer presses the page's own copy button — never for text they select and copy themselves
  let copyBtnAt = 0;
  document.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('#copy,#f-copy,[data-copy],button');
    if (b && (b.matches('#copy,#f-copy,[data-copy]') || /복사|문의하기/.test(b.textContent || ''))) copyBtnAt = Date.now();
  }, true);
  const caught = (t) => {
    if (selfCopy || !t || t.trim().length < 12 || Date.now() - copyBtnAt > 2000) return;
    setTimeout(() => open({ text: t.trim(), from: FROM[PAGE] || '고르신 단계와 취향' }), 700);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    const orig = navigator.clipboard.writeText.bind(navigator.clipboard);
    try { navigator.clipboard.writeText = (t) => { caught(t); return orig(t); }; } catch (_) {}
  }
  document.addEventListener('copy', () => { if (!selfCopy) caught(String(getSelection() || '')); });

  // ---------- the drafts' 「bigC company」 brand text becomes a way back to the hub
  // (keep the element as it is — swapping it for <a> changed the drafts' header layout)
  if (PAGE !== 'hub') document.querySelectorAll('.brand').forEach((b) => {
    if (b.closest('a')) return;
    const go = () => { location.href = C.hub; };
    b.setAttribute('role', 'link'); b.tabIndex = 0; b.title = '전체 업종 보기'; b.style.cursor = 'pointer';
    b.addEventListener('click', go);
    b.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
  });

  window.bigcAsk = { open, close };
  const mount = () => document.body.appendChild(host);
  document.body ? mount() : addEventListener('DOMContentLoaded', mount);
})();

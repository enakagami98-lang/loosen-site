// Loosen 紹介ページ v2 の動き
const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (s) => document.querySelector(s);
const fmt = (n, d = 0) => n.toLocaleString("ja-JP", { minimumFractionDigits: d, maximumFractionDigits: d });

// ---- 画面に入ったら出てくる ----
const io = new IntersectionObserver((es) => es.forEach((e) => {
  if (!e.isIntersecting) return;
  e.target.classList.add("in");
  io.unobserve(e.target);
}), { threshold: 0.2 });
document.querySelectorAll(".rv, #gap, .lane.bad").forEach((el) => io.observe(el));

// ---- 一生で失う時間の計算 ----
const LIFE = 80;
const hours = $("#hours"), age = $("#age");
const shown = {}; // 数字を「回して」変えるための今の値
function roll(id, to, digits = 0) {
  const el = $(id);
  const from = shown[id] ?? to;
  shown[id] = to;
  if (calm || from === to) { el.textContent = fmt(to, digits); return; }
  const t0 = performance.now(), dur = 600;
  const tick = (t) => {
    const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
    el.textContent = fmt(from + (to - from) * e, digits);
    if (k < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
function fill(input) {
  const p = (input.value - input.min) / (input.max - input.min) * 100;
  input.style.setProperty("--p", `${p}%`);
}
function calc() {
  const h = +hours.value, a = +age.value, left = LIFE - a;
  $("#hoursOut").firstChild.textContent = h % 1 ? h.toFixed(1) : h;
  $("#ageOut").firstChild.textContent = a;
  fill(hours); fill(age);
  const lossH = h * 365.25 * left;
  roll("#perYear", h * 365.25);
  roll("#lossH", lossH);
  roll("#lossD", lossH / 24);
  roll("#lossM", lossH / 24 / 30.44);
  roll("#lossY", lossH / 24 / 365.25, 1);
  $("#awake").textContent = Math.round(h / 16 * 100);
  // 人生の帯：過ごした年 ＋ これからのうちスマホに使う分（右端に寄せる）
  $("#lived").style.width = `${a / LIFE * 100}%`;
  $("#nowMark").style.left = `${Math.min(88, Math.max(12, a / LIFE * 100))}%`;
  $("#phoneBar").style.width = `${left * h / 24 / LIFE * 100}%`;
}
hours.addEventListener("input", calc);
age.addEventListener("input", calc);
calc();

// ---- 画面で見る機能：説明が真ん中に来たら、スマホの画面を切り替える ----
const states = [...document.querySelectorAll("[data-st]")];
let ringTimer = null;
function show(n) {
  states.forEach((s, i) => s.classList.toggle("on", i === n));
  clearInterval(ringTimer);
  if (n === 1) {
    let r = 10; $("#ringNum").textContent = r;
    if (!calm) ringTimer = setInterval(() => { r = Math.max(0, r - 1); $("#ringNum").textContent = r; }, 1000);
  }
  if (n === 4) [...$("#trend").children].forEach((b, i) => setTimeout(() => {
    b.style.height = `${TREND[i] * 10}%`;
    b.classList.toggle("good", TREND[i] >= 7);
  }, calm ? 0 : i * 60));
}
const stepIO = new IntersectionObserver((es) => es.forEach((e) => {
  if (e.isIntersecting) show(+e.target.dataset.step);
}), { rootMargin: "-45% 0px -45% 0px" });
document.querySelectorAll(".step").forEach((s) => stepIO.observe(s));

// 身体の調子の棒（表示の例）
const TREND = [6, 7.3, 5, 8, 8.3, 4.7, 7, 9, 6.3, 5.3, 8, 7.7, 9, 8];
TREND.forEach(() => $("#trend").appendChild(document.createElement("i")));

// 目標を達成したときの紙ふぶき
const COLORS = ["#1C2E5C", "#F2B84B", "#E5484D", "#8DBBE8", "#2E9E6B"];
for (let i = 0; i < 30; i++) {
  const c = document.createElement("i");
  c.style.left = `${Math.random() * 100}%`;
  c.style.background = COLORS[i % COLORS.length];
  c.style.animationDelay = `${1.4 + Math.random() * 0.7}s`;
  $("#conf").appendChild(c);
}

// テスターの席（20人）
const seats = $(".seats");
for (let i = 0; i < 20; i++) seats.appendChild(document.createElement("i"));

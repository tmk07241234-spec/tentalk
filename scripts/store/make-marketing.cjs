const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const SHOTS = '/home/user/tentalk/docs/store/screenshots', OUT = '/home/user/tentalk/docs/store/marketing';
// Usage: node scripts/store/make-marketing.cjs scripts/store/pip-wave.svg (after taking docs/store/screenshots)
const pip = fs.readFileSync(process.argv[2], 'utf8').replace(/width="130" height="130"/, 'width="100%" height="100%"');
const names = ['1-home', '2-match', '3-call', '4-find', '5-profile', '6-connections'];
const T = {
  ja: [['1日10分、話す練習。', '英語・韓国語・スペイン語・日本語を\n1対1の音声通話で'], ['話す前に、相手がわかる。', '練習の記録と声を見てから\n話すかどうか選べます'], ['お題があるから、続く。', '毎回のお題カードと\n困ったときのお助けフレーズ'], ['同じ言語を学ぶ人と。', '練習仲間とも、ネイティブとの\n言語交換とも話せます'], ['積み重ねが、見える。', '完走率と練習日数で\n練習の実績がわかります'], ['10分話した相手とだけ、\nつながる。', 'チャットもタイムラインもない\n話すための場所']],
  en: [['Speak a language,\n10 minutes a day', 'One-on-one voice calls in English,\nJapanese, Korean and Spanish'], ['Know who you’ll\ntalk to', 'See their practice record and hear\ntheir voice before you choose'], ['Questions keep\nit going', 'A question card every call,\nand phrases for when you’re stuck'], ['Practise with\nlearners like you', 'Practice buddies and native\nspeakers for language exchange'], ['Your practice,\non record', 'Completion rate and practice days\nshow real effort'], ['Connect only after\na real talk', 'No chat, no timeline.\nJust a place to speak']],
  ko: [['하루 10분,\n말하기 연습', '영어·일본어·한국어·스페인어를\n1대1 음성 통화로'], ['말하기 전에\n상대를 알 수 있어요', '연습 기록과 목소리를 확인하고\n대화할지 고르세요'], ['질문이 있어서\n대화가 이어져요', '매번 나오는 질문 카드와\n막힐 때 쓰는 표현'], ['같은 언어를\n배우는 사람과', '연습 파트너도,\n원어민과의 언어 교환도'], ['쌓아 온 연습이\n보여요', '완주율과 연습 일수로\n노력이 보여요'], ['10분 대화한 사람과만\n이어져요', '채팅도 타임라인도 없는\n말하기 위한 곳']],
  es: [['Habla un idioma,\n10 minutos al día', 'Llamadas de voz uno a uno en inglés,\njaponés, coreano y español'], ['Sabes con quién\nvas a hablar', 'Ve su historial de práctica y escucha\nsu voz antes de elegir'], ['Las preguntas\nmantienen la charla', 'Una pregunta en cada llamada\ny frases de ayuda'], ['Practica con gente\ncomo tú', 'Compañeros de práctica e\nintercambio con nativos'], ['Tu práctica,\na la vista', 'Llamadas completadas y días de\npráctica muestran tu esfuerzo'], ['Conecta solo tras\nhablar de verdad', 'Sin chat ni muro.\nSolo un lugar para hablar']],
};
const BG = ['#0E6E59', '#C9603F', '#1A35A0', '#B07A1E', '#5B4B6E', '#0E6E59'];
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\n/g, '<br>');
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 440, height: 956 }, deviceScaleFactor: 3 })).newPage();
  for (const [lang, lines] of Object.entries(T)) {
    const src = lang === 'ja' ? 'ja' : 'en';
    for (const [i, n] of names.entries()) {
      const img = 'data:image/png;base64,' + fs.readFileSync(`${SHOTS}/${src}-${n}.png`).toString('base64');
      const [h, sub] = lines[i];
      const html = `<html><head><link href="https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@500;800&family=Nunito:wght@600;800&display=block" rel="stylesheet"><style>
        html,body{margin:0;width:440px;height:956px;overflow:hidden;background:${BG[i]};font-family:'Nunito','M PLUS Rounded 1c',sans-serif;color:#fff}
        .bg{position:absolute;inset:0;background:radial-gradient(circle at 85% 10%,rgba(255,255,255,.22),transparent 45%),radial-gradient(circle at 0% 100%,rgba(0,0,0,.18),transparent 50%)}
        .dot{position:absolute;border-radius:50%;background:rgba(255,255,255,.10)}
        h1{position:absolute;top:62px;left:30px;right:30px;margin:0;font-size:${lang === 'ja' ? 30 : 33}px;line-height:1.22;font-weight:800;letter-spacing:${lang === 'ja' ? '.01em' : '-.01em'}}
        p{position:absolute;top:${h.includes('\n') ? 160 : 118}px;left:30px;right:30px;margin:0;font-size:16.5px;line-height:1.45;font-weight:600;opacity:.92}
        .phone{position:absolute;left:58px;right:58px;top:${h.includes('\n') ? 262 : 222}px;bottom:-160px;border-radius:44px;background:#0d0f17;padding:9px;box-shadow:0 30px 60px rgba(0,0,0,.35)}
        .phone img{width:100%;border-radius:36px;display:block}
        .pip{position:absolute;width:96px;height:96px;right:18px;top:${h.includes('\n') ? 186 : 146}px;filter:drop-shadow(0 8px 12px rgba(0,0,0,.25))}
      </style></head><body><div class="bg"></div><div class="dot" style="width:180px;height:180px;left:-60px;top:330px"></div><div class="dot" style="width:90px;height:90px;right:-20px;bottom:120px"></div>
      <h1>${esc(h)}</h1><p>${esc(sub)}</p><div class="phone"><img src="${img}"></div>${i === 0 || i === 4 ? `<div class="pip" style="background:#fff;border-radius:50%;padding:6px">${pip}</div>` : ''}</body></html>`;
      await p.setContent(html, { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
      // Lay out from the real text height, so a headline that wraps never runs into the line below it.
      await p.evaluate(() => {
        const h1 = document.querySelector('h1'), sub = document.querySelector('p'), phone = document.querySelector('.phone'), pip = document.querySelector('.pip');
        const subTop = h1.offsetTop + h1.offsetHeight + 12; sub.style.top = subTop + 'px';
        const end = subTop + sub.offsetHeight; phone.style.top = end + 40 + 'px'; if (pip) pip.style.top = end - 10 + 'px';
      });
      await p.screenshot({ path: `${OUT}/${lang}-${n}.png` });
    }
  }
  await b.close(); console.log('done');
})();

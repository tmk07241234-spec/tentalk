// Social ads from the store screenshots: square (1080x1080) and story (1080x1920) images,
// and a short vertical video, in Japanese and English.
// Usage: node scripts/store/make-ads.cjs   (after taking docs/store/screenshots)
const { chromium } = require('playwright');
const fs = require('fs'); const { execFileSync } = require('child_process');
const SHOTS = '/home/user/tentalk/docs/store/screenshots', OUT = '/home/user/tentalk/docs/marketing/ads';
const pip = fs.readFileSync('/home/user/tentalk/scripts/store/pip-wave.svg', 'utf8').replace(/width="130" height="130"/, 'width="100%" height="100%"');
const icon = 'data:image/png;base64,' + fs.readFileSync('/home/user/tentalk/assets/icon.png').toString('base64');
const T = {
  ja: { slides: [['1日10分、\n話す練習。', '英語・韓国語・スペイン語・日本語を\n1対1の音声通話で', '1-home', '#0E6E59'],
    ['チャットなし。\n出会い目的なし。', 'あるのは10分の会話だけ。\nフォローできるのは話しきった相手だけ', '2-match', '#C9603F'],
    ['お題があるから、\n初心者でも続く。', '毎回のお題カードと\n困ったときのお助けフレーズ', '3-call', '#1A35A0']],
    end: ['Tentalk', '10分話すだけの語学アプリ', 'App Store で無料'] },
  en: { slides: [['Speak a language,\n10 minutes a day', 'One-on-one voice calls in English,\nJapanese, Korean and Spanish', '1-home', '#0E6E59'],
    ['No chat.\nNo dating.', 'Just 10 minutes of real talk.\nFollow only people you\nfinished a call with', '2-match', '#C9603F'],
    ['Questions keep\nit going', 'A question card every call,\nand phrases for when you’re stuck', '3-call', '#1A35A0']],
    end: ['Tentalk', 'A language app for 10-minute talks', 'Free on the App Store'] },
};
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\n/g, '<br>');
const css = (w, h, bg) => `html,body{margin:0;width:${w}px;height:${h}px;overflow:hidden;background:${bg};font-family:'M PLUS Rounded 1c','Nunito',sans-serif;color:#fff;position:relative}
 .glow{position:absolute;inset:0;background:radial-gradient(circle at 85% 8%,rgba(255,255,255,.22),transparent 45%),radial-gradient(circle at 0% 100%,rgba(0,0,0,.2),transparent 55%)}
 h1{margin:0;font-weight:800;line-height:1.18}p{margin:0;font-weight:600;opacity:.92;line-height:1.5}
 .phone{border-radius:64px;background:#0d0f17;padding:14px;box-shadow:0 40px 80px rgba(0,0,0,.35)}.phone img{width:100%;display:block;border-radius:52px}
 .tag{display:inline-flex;align-items:center;gap:14px;background:rgba(255,255,255,.16);border-radius:99px;padding:10px 22px 10px 10px;font-weight:800}
 .tag img{width:54px;height:54px;border-radius:14px}`;
const FONTS = '<link href="https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@500;800&family=Nunito:wght@600;800&display=block" rel="stylesheet">';
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  const shot = async (html, w, h, path) => { await p.setViewportSize({ width: w, height: h }); await p.setContent(html, { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200); await p.screenshot({ path }); };
  for (const [lang, t] of Object.entries(T)) {
    const tag = `<div class="tag"><img src="${icon}">Tentalk · ${t.end[2]}</div>`;
    for (const [i, [h, sub, img, bg]] of t.slides.entries()) {
      const src = 'data:image/png;base64,' + fs.readFileSync(`${SHOTS}/${lang}-${img}.png`).toString('base64');
      // Square: text on the left, phone on the right.
      await shot(`<html><head>${FONTS}<style>${css(1080, 1080, bg)}
        .l{position:absolute;left:64px;top:110px;width:530px}.l h1{font-size:${lang === 'ja' ? 52 : 56}px}.l p{font-size:26px;margin-top:26px}
        .phone{position:absolute;right:60px;top:90px;width:380px}.tag{position:absolute;left:70px;bottom:80px;font-size:28px}</style></head>
        <body><div class="glow"></div><div class="l"><h1>${esc(h)}</h1><p>${esc(sub)}</p></div><div class="phone"><img src="${src}"></div>${tag}</body></html>`, 1080, 1080, `${OUT}/${lang}-square-${i + 1}.png`);
      // Story: text on top, phone below.
      await shot(`<html><head>${FONTS}<style>${css(1080, 1920, bg)}
        .t{position:absolute;left:80px;right:80px;top:170px}.t h1{font-size:${lang === 'ja' ? 88 : 92}px}.t p{font-size:38px;margin-top:30px}
        .phone{position:absolute;left:190px;right:190px;top:720px}.tag{position:absolute;left:80px;top:${1920 - 0}px}
        .pip{position:absolute;width:190px;height:190px;right:70px;top:560px;background:#fff;border-radius:50%;padding:12px;filter:drop-shadow(0 12px 18px rgba(0,0,0,.25))}</style></head>
        <body><div class="glow"></div><div class="t"><h1>${esc(h)}</h1><p>${esc(sub)}</p></div><div class="phone"><img src="${src}"></div>${i === 0 ? `<div class="pip">${pip}</div>` : ''}</body></html>`, 1080, 1920, `${OUT}/${lang}-story-${i + 1}.png`);
    }
    // End card for the video.
    await shot(`<html><head>${FONTS}<style>${css(1080, 1920, '#0E6E59')}
      .c{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:34px;text-align:center}
      .c img{width:260px;height:260px;border-radius:58px;box-shadow:0 30px 60px rgba(0,0,0,.3)}.c h1{font-size:110px}.c p{font-size:44px}
      .cta{margin-top:30px;background:#F4C76B;color:#2B2117;border-radius:99px;padding:26px 60px;font-size:46px;font-weight:800}
      .pip{width:200px;height:200px;margin-top:20px}</style></head>
      <body><div class="glow"></div><div class="c"><img src="${icon}"><h1>${t.end[0]}</h1><p>${t.end[1]}</p><div class="cta">${t.end[2]}</div><div class="pip">${pip}</div></div></body></html>`, 1080, 1920, `${OUT}/${lang}-story-end.png`);
    // About 13 seconds: three slides of 3.5 s and the end card, with short crossfades.
    const frames = [1, 2, 3].map((n) => `${OUT}/${lang}-story-${n}.png`).concat(`${OUT}/${lang}-story-end.png`);
    const inputs = frames.flatMap((f) => ['-loop', '1', '-t', '3.5', '-i', f]);
    const fade = '[0][1]xfade=transition=fade:duration=0.5:offset=3[a];[a][2]xfade=transition=fade:duration=0.5:offset=6[b];[b][3]xfade=transition=fade:duration=0.5:offset=9,format=yuv420p[v]';
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', fade, '-map', '[v]', '-r', '30', '-c:v', 'libx264', '-movflags', '+faststart', `${OUT}/${lang}-reel.mp4`]);
  }
  await b.close(); console.log('done');
})();

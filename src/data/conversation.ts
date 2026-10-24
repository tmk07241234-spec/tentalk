import type { Lang } from '@/domain/languages';

/** Topic cards are written in the language being spoken, with a pattern to try. */
export interface Topic {
  q: string;
  hint: string;
}

export const TOPICS: Partial<Record<Lang, Topic[]>> = {
  en: [
    { q: 'This week’s theme: What movie would you recommend?', hint: 'I’d recommend… because… / It’s about…' },
    { q: 'What did you do last weekend?', hint: 'I went… / I tried…' },
    { q: 'If you could live in any city, where would it be?', hint: 'I would… because…' },
    { q: 'Tell me about a food you can’t live without.', hint: 'It tastes… / It reminds me of…' },
  ],
  ja: [
    { q: '今週のテーマ: おすすめの映画は？', hint: '〜がおすすめです / 〜という話です' },
    { q: '最近ハマっていることは何ですか？', hint: '〜にハマっています' },
    { q: '子どもの頃、何になりたかったですか？', hint: '〜になりたかったです' },
    { q: '週末はたいてい何をしますか？', hint: 'たいてい / よく / ときどき' },
  ],
  ko: [
    { q: '이번 주 테마: 추천하고 싶은 영화는?', hint: '~를 추천해요 / ~에 대한 이야기예요' },
    { q: '주말에 보통 뭐 해요?', hint: '보통 / 자주 / 가끔' },
    { q: '요즘 빠져 있는 게 있어요?', hint: '~에 빠져 있어요' },
  ],
  es: [
    { q: 'Tema de la semana: ¿Qué película recomiendas?', hint: 'Te recomiendo… porque…' },
    { q: '¿Qué hiciste el fin de semana pasado?', hint: 'Fui… / Comí…' },
    { q: '¿Cuál es tu comida favorita?', hint: 'Me encanta… / Sabe a…' },
  ],
};

/** Shown when the call goes quiet for a minute. */
export const EXAMPLE_QUESTIONS: Partial<Record<Lang, string>> = {
  en: '“Where are you from?” “What do you do on weekends?”',
  ja: '「出身はどこですか？」「休みの日は何をしますか？」',
  ko: '「어디에서 왔어요?」「주말에 뭐 해요?」',
  es: '“¿De dónde eres?” “¿Qué haces los fines de semana?”',
};

/** Phrases to read out when stuck, in the language being spoken. */
export const HELP_PHRASES: Partial<Record<Lang, string[]>> = {
  en: ['Could you say that again more slowly?', 'How do you say “___” in English?', 'Sorry, I don’t understand.', 'Let me think for a moment.'],
  ja: ['もう一度ゆっくり言ってください', '〜は日本語で何と言いますか？', 'すみません、分かりません', 'ちょっと待ってください'],
  ko: ['다시 천천히 말해 주세요', '“___”는 한국어로 뭐예요?', '잘 모르겠어요', '잠깐만요'],
  es: ['¿Puedes repetirlo más despacio?', '¿Cómo se dice “___” en español?', 'Perdón, no entiendo.', 'Un momento, por favor.'],
};

/** How the language is named in itself, for the in-call language switch. */
export const ENDONYM: Partial<Record<Lang, string>> = { en: 'English', ja: '日本語', ko: '한국어', es: 'Español' };

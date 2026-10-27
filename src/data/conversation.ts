import type { Lang, UiLang } from '@/domain/languages';

/**
 * Question cards ("お題"): a question both people answer in turn, then talk about freely.
 * Each card is written in every interface language, so it can be shown in the language
 * being spoken and, on request, in the reader's own app language. The hint is a phrase
 * to start the answer. `deep` questions ask for reasons and opinions, so they show only
 * when the speaker of this language is level 3 or above. Politics, religion and romance
 * are left out on purpose: many people use the "language only" badge and talk with
 * strangers here.
 */
export interface QuestionText {
  q: string;
  /** Two sides to pick from, for "which do you prefer" questions. */
  options?: [string, string];
  hint: string;
}

export interface Question {
  id: string;
  deep?: boolean;
  text: Record<UiLang, QuestionText>;
}

export const QUESTIONS: Question[] = [
  { id: 'theme-movie', text: {
    en: { q: 'This week’s theme: one movie everyone should see. What is it?', hint: 'Everyone should see… because…' },
    ja: { q: '今週のテーマ: みんなに見てほしい映画を1本あげるなら？', hint: '〜をぜひ見てほしいです。なぜなら〜' },
    ko: { q: '이번 주 테마: 모두에게 추천하고 싶은 영화 한 편은?', hint: '~를 꼭 보세요. 왜냐하면~' },
    es: { q: 'Tema de la semana: una película que todos deberían ver. ¿Cuál?', hint: 'Todos deberían ver… porque…' },
  } },
  { id: 'morning-night', text: {
    en: { q: 'Morning person or night owl?', options: ['Morning', 'Night'], hint: 'I’m a… person. I usually…' },
    ja: { q: '朝型？夜型？', options: ['朝型', '夜型'], hint: 'わたしは〜型です。いつも〜' },
    ko: { q: '아침형이에요, 저녁형이에요?', options: ['아침형', '저녁형'], hint: '저는 ~형이에요. 보통~' },
    es: { q: '¿Eres de mañana o de noche?', options: ['Mañana', 'Noche'], hint: 'Soy de… Normalmente…' },
  } },
  { id: 'beach-mountain', text: {
    en: { q: 'Beach trip or mountain trip?', options: ['Beach', 'Mountains'], hint: 'I’d choose… because…' },
    ja: { q: '旅行するなら海？山？', options: ['海', '山'], hint: '〜がいいです。〜からです' },
    ko: { q: '여행은 바다? 산?', options: ['바다', '산'], hint: '~가 좋아요. ~때문이에요' },
    es: { q: '¿Viaje a la playa o a la montaña?', options: ['Playa', 'Montaña'], hint: 'Prefiero… porque…' },
  } },
  { id: 'everyday-food', text: {
    en: { q: 'What’s one food you could eat every day?', hint: 'I could eat… every day.' },
    ja: { q: '毎日食べてもいい食べ物は？', hint: '〜なら毎日食べられます' },
    ko: { q: '매일 먹어도 질리지 않는 음식은?', hint: '~는 매일 먹을 수 있어요' },
    es: { q: '¿Qué comida podrías comer todos los días?', hint: 'Podría comer… todos los días.' },
  } },
  { id: 'year-abroad', deep: true, text: {
    en: { q: 'If you could live in any country for a year, where would you go?', hint: 'I’d go to… because…' },
    ja: { q: '1年どこの国でも住めるなら、どこに行く？', hint: '〜に行きたいです。〜からです' },
    ko: { q: '1년 동안 어느 나라에서든 살 수 있다면 어디로 갈래요?', hint: '~에 가고 싶어요. 왜냐하면~' },
    es: { q: 'Si pudieras vivir un año en cualquier país, ¿adónde irías?', hint: 'Iría a… porque…' },
  } },
  { id: 'city-country', deep: true, text: {
    en: { q: 'Is it better to live in a big city or the countryside?', options: ['City', 'Countryside'], hint: 'I think… is better, because…' },
    ja: { q: '都会と田舎、住むならどっち？', options: ['都会', '田舎'], hint: 'わたしは〜のほうがいいと思います。理由は〜' },
    ko: { q: '도시와 시골, 산다면 어디가 좋아요?', options: ['도시', '시골'], hint: '저는 ~가 더 좋다고 생각해요. 왜냐하면~' },
    es: { q: '¿Es mejor vivir en una gran ciudad o en el campo?', options: ['Ciudad', 'Campo'], hint: 'Creo que es mejor… porque…' },
  } },
  { id: 'advice-15', deep: true, text: {
    en: { q: 'If you could give your 15-year-old self one piece of advice, what would it be?', hint: 'I would tell myself…' },
    ja: { q: '15歳の自分にひとことアドバイスするなら？', hint: '「〜」と言いたいです' },
    ko: { q: '15살의 나에게 한마디 한다면?', hint: '“~”라고 말하고 싶어요' },
    es: { q: 'Si pudieras darle un consejo a tu yo de 15 años, ¿cuál sería?', hint: 'Le diría…' },
  } },
  { id: 'love-or-pay', deep: true, text: {
    en: { q: 'Would you choose a job you love or one that pays a lot?', options: ['Love it', 'Pays a lot'], hint: 'I’d choose… because…' },
    ja: { q: '仕事は「好きなこと」と「給料が高いこと」、どっちを選ぶ？', options: ['好きなこと', '給料'], hint: 'わたしは〜を選びます。なぜなら〜' },
    ko: { q: '일은 “좋아하는 일”과 “월급이 많은 일” 중 어느 쪽?', options: ['좋아하는 일', '월급'], hint: '저는 ~를 고를 거예요. 왜냐하면~' },
    es: { q: '¿Elegirías un trabajo que te encanta o uno que paga mucho?', options: ['Me encanta', 'Paga mucho'], hint: 'Yo elegiría… porque…' },
  } },
];

/** The cards for this call: the weekly theme first, then easier ones before deeper ones. */
export function questionsFor(speakerLevel: number): Question[] {
  return speakerLevel >= 3 ? QUESTIONS : QUESTIONS.filter((q) => !q.deep);
}

/** A card in the given language; languages without cards yet fall back to English. */
export function questionIn(card: Question, lang: Lang): QuestionText {
  return (card.text as Partial<Record<Lang, QuestionText>>)[lang] ?? card.text.en;
}

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


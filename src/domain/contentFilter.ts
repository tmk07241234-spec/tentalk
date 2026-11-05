/**
 * A light filter for names and bios (App Store guideline 1.2 asks for "a method for
 * filtering objectionable material"). It catches common sexual and abusive words in the
 * four app languages, and contact details people use to move strangers off the app
 * (links, phone numbers, messenger IDs). Reports and blocking handle the rest.
 */

// Latin-script words are matched as whole words (so "Sussex" is fine) after joining
// spaced-out letters ("s e x"); words in Japanese and Korean, which have no spaces
// between words, are matched anywhere after normalising (katakana as hiragana).
const BLOCKED_WORDS = [
  // en
  'sex', 'sexy', 'porn', 'nude', 'nudes', 'fuck', 'fucking', 'pussy', 'dick', 'cock', 'boobs', 'horny', 'hookup', 'onlyfans', 'escort', 'nigger', 'faggot', 'retard', 'whore', 'slut', 'cunt',
  // es
  'sexo', 'puta', 'puto', 'verga', 'polla', 'coño', 'pendejo', 'maricon', 'maricón', 'follar', 'desnuda',
];
const BLOCKED_PARTS = [
  // ja (hiragana after normalisation)
  'せっくす', 'えっち', 'えろ', 'おなに', 'ちんこ', 'まんこ', 'おっぱい', 'ぱぱかつ', 'えんこう', 'えんじょこうさい', 'せふれ', 'やりもく', '援交', '援助交際', '風俗', '死ね', 'しね', '殺す',
  // ko
  '섹스', '야동', '보지', '자지', '씨발', '시발', '병신', '좆', '창녀', '조건만남',
];

/** Ways to hand out contact details, which pull people into unmoderated chats. */
const CONTACT = [
  /https?:|www\.|\.com\b|\.jp\b|\.me\b/i,
  /@[a-z0-9_.]{3,}/i,
  /\b(line|kakao|kakaotalk|insta|instagram|ig|snap|snapchat|telegram|whatsapp|wechat|discord|tiktok)\s*(id)?\s*[:：]?\s*[a-z0-9_.-]{3,}/i,
  /(ライン|らいん|インスタ|カカオ|카톡|라인|인스타)\s*(id|ＩＤ)?/i,
  /\d[\d\s-]{8,}\d/,
];

export function normalise(text: string): string {
  return text
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\u30a1-\u30f6]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60))
    .replace(/[\s\p{P}\p{S}_]/gu, '');
}

/** Lowercase words separated by single spaces, with spaced-out letters joined ("s e x" → "sex"). */
function latinWords(text: string): string {
  return ` ${text.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').replace(/\b(?:\p{L} ){2,}\p{L}\b/gu, (m) => m.replace(/ /g, ''))} `;
}

export type ContentProblem = 'inappropriate' | 'contact';

/** Why this name or bio cannot be used, or null when it is fine. */
export function contentProblem(text: string): ContentProblem | null {
  if (!text.trim()) return null;
  const words = latinWords(text);
  const joined = normalise(text);
  if (BLOCKED_WORDS.some((w) => words.includes(` ${w} `)) || BLOCKED_PARTS.some((w) => joined.includes(normalise(w)))) return 'inappropriate';
  if (CONTACT.some((re) => re.test(text.normalize('NFKC')))) return 'contact';
  return null;
}

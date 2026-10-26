import type { Person } from '@/domain/discovery';
import type { Candidate } from '@/domain/matching';
import type { HoursRange } from '@/domain/schedule';

/** Stand-in people until the server exists. Hours are in the person's own local time. */
export interface Partner extends Candidate, Person {
  name: string;
  country: string;
  color: string;
  calls: number;
  bio: string;
  hours: HoursRange;
  /** Minutes east of UTC. */
  utcOffset: number;
}

const p = (x: Partner) => x;

export const SAMPLE_PARTNERS: Partner[] = [
  p({ id: 'emma', name: 'Emma', country: 'US', color: '#3E63DD', native: 'en', learn: 'ja', level: 3, status: 'online', languageOnly: true, calls: 48,
    bio: 'Software engineer in Seattle. Anime, hiking, and coffee. 敬語を練習したいです。', hobbies: ['anime', 'travel', 'cafe'], hours: { start: '05:00', end: '08:00' }, utcOffset: -420 }),
  p({ id: 'liam', name: 'Liam', country: 'GB', color: '#1F8A5B', native: 'en', learn: 'ja', level: 2, status: 'online', languageOnly: false, calls: 12,
    bio: 'University student in Manchester. Football and J-rock. Planning a trip to Osaka next spring.', hobbies: ['music', 'sports', 'travel'], hours: { start: '12:00', end: '15:00' }, utcOffset: 0 }),
  p({ id: 'ava', name: 'Ava', country: 'AU', color: '#B7591F', native: 'en', learn: 'ja', level: 5, status: 'online', languageOnly: true, calls: 131,
    bio: 'Translator in Melbourne. I love cooking Japanese home food and visiting onsen.', hobbies: ['cooking', 'reading'], hours: { start: '21:00', end: '23:30' }, utcOffset: 660 }),
  p({ id: 'noah', name: 'Noah', country: 'CA', color: '#7B4BC9', native: 'en', learn: 'ja', level: 4, status: 'offline', languageOnly: true, calls: 210,
    bio: 'English teacher living in Fukuoka. Happy to help with pronunciation.', hobbies: ['games', 'travel'], hours: { start: '07:00', end: '08:30' }, utcOffset: 540 }),
  p({ id: 'mia', name: 'Mia', country: 'US', color: '#C2357A', native: 'en', learn: 'ja', level: 1, status: 'offline', languageOnly: true, calls: 3,
    bio: 'Nurse in Chicago. Just started Japanese! Please speak slowly.', hobbies: ['cooking', 'movies'], hours: { start: '18:00', end: '20:00' }, utcOffset: -300 }),
  p({ id: 'jack', name: 'Jack', country: 'US', color: '#2A7F8F', native: 'en', learn: 'ja', level: 3, status: 'in_call', languageOnly: true, calls: 40,
    bio: 'Game designer. Retro games and ramen.', hobbies: ['games', 'anime'], hours: { start: '19:00', end: '22:00' }, utcOffset: -420 }),
  p({ id: 'pedro', name: 'Pedro', country: 'BR', color: '#2A7F4F', native: 'pt', learn: 'en', level: 3, status: 'online', languageOnly: true, calls: 64,
    bio: 'Engineer in São Paulo. Learning English for work. Big fan of anime and football!', hobbies: ['anime', 'sports', 'music'], hours: { start: '08:00', end: '11:00' }, utcOffset: -180 }),
  p({ id: 'minji', name: 'Minji', country: 'KR', color: '#C2357A', native: 'ko', learn: 'en', level: 3, status: 'online', languageOnly: true, calls: 22,
    bio: 'Office worker in Seoul. K-drama, baking, and travel. Let’s practice English together.', hobbies: ['movies', 'cooking', 'travel'], hours: { start: '20:00', end: '23:00' }, utcOffset: 540 }),
  p({ id: 'lucia', name: 'Lucía', country: 'ES', color: '#C26A1F', native: 'es', learn: 'en', level: 4, status: 'online', languageOnly: false, calls: 9,
    bio: 'Photographer from Valencia. I want to travel around Asia next year.', hobbies: ['travel', 'photo'], hours: { start: '13:00', end: '16:00' }, utcOffset: 60 }),
  p({ id: 'thanh', name: 'Thanh', country: 'VN', color: '#6B5BD6', native: 'vi', learn: 'en', level: 2, status: 'offline', languageOnly: true, calls: 4,
    bio: 'University student in Hanoi. Beginner, but I try my best!', hobbies: ['music', 'games'], hours: { start: '19:00', end: '21:00' }, utcOffset: 420 }),
  p({ id: 'jisoo', name: 'Jisoo', country: 'KR', color: '#D0466F', native: 'ko', learn: 'ja', level: 3, status: 'online', languageOnly: true, calls: 57,
    bio: '부산에 살아요. 日本のドラマとカフェ巡りが好きです。', hobbies: ['cafe', 'movies', 'travel'], hours: { start: '20:00', end: '24:00' }, utcOffset: 540 }),
  p({ id: 'minho', name: 'Minho', country: 'KR', color: '#3B7DD8', native: 'ko', learn: 'ja', level: 2, status: 'offline', languageOnly: true, calls: 15,
    bio: '大学生です。日本のアニメで日本語を勉強しています。', hobbies: ['anime', 'games'], hours: { start: '22:00', end: '24:00' }, utcOffset: 540 }),
  p({ id: 'sarah', name: 'Sarah', country: 'US', color: '#8E5BD0', native: 'en', learn: 'ko', level: 3, status: 'online', languageOnly: true, calls: 33,
    bio: 'K-pop got me into Korean! Looking for study buddies.', hobbies: ['music', 'cooking'], hours: { start: '19:00', end: '23:00' }, utcOffset: -300 }),
  p({ id: 'lena', name: 'Lena', country: 'DE', color: '#4C8C6A', native: 'de', learn: 'ko', level: 2, status: 'online', languageOnly: true, calls: 7,
    bio: 'Ich lerne Koreanisch für meinen Austausch in Seoul.', hobbies: ['travel', 'photo'], hours: { start: '12:00', end: '16:00' }, utcOffset: 60 }),
  p({ id: 'carlos', name: 'Carlos', country: 'MX', color: '#C0612E', native: 'es', learn: 'ja', level: 3, status: 'online', languageOnly: true, calls: 28,
    bio: 'Diseñador en CDMX. 日本のゲームと料理が大好きです。', hobbies: ['games', 'cooking', 'art'], hours: { start: '20:00', end: '23:00' }, utcOffset: -360 }),
  p({ id: 'tom', name: 'Tom', country: 'GB', color: '#2E7FA0', native: 'en', learn: 'es', level: 4, status: 'online', languageOnly: false, calls: 41,
    bio: 'Learning Spanish to move to Madrid next year.', hobbies: ['sports', 'travel'], hours: { start: '18:00', end: '22:00' }, utcOffset: 0 }),
  p({ id: 'yuki', name: 'Yuki', country: 'JP', color: '#A0522D', native: 'ja', learn: 'ko', level: 2, status: 'online', languageOnly: true, calls: 18,
    bio: '韓国ドラマが好きで韓国語を勉強中です。', hobbies: ['movies', 'cafe'], hours: { start: '21:00', end: '23:00' }, utcOffset: 540 }),
  p({ id: 'haruka', name: 'Haruka', country: 'JP', color: '#B5477A', native: 'ja', learn: 'en', level: 3, status: 'online', languageOnly: true, calls: 75,
    bio: '大阪の看護師です。海外旅行のために英語を練習しています。', hobbies: ['travel', 'cooking'], hours: { start: '20:00', end: '23:00' }, utcOffset: 540 }),
  p({ id: 'sota', name: 'Sota', country: 'JP', color: '#3C7D6B', native: 'ja', learn: 'en', level: 2, status: 'online', languageOnly: true, calls: 14,
    bio: 'エンジニア志望の大学生。ゲームとアニメが好きです。', hobbies: ['games', 'anime', 'tech'], hours: { start: '21:00', end: '24:00' }, utcOffset: 540 }),
  p({ id: 'kenji', name: 'Kenji', country: 'JP', color: '#4A6FA5', native: 'ja', learn: 'es', level: 3, status: 'online', languageOnly: true, calls: 26,
    bio: 'サッカーが好きでスペイン語を勉強しています。', hobbies: ['sports', 'travel'], hours: { start: '20:00', end: '22:00' }, utcOffset: 540 }),
];

import type { Candidate } from '@/domain/matching';

/** Stand-in partners until the matchmaking server exists. */
export interface Partner extends Candidate {
  name: string;
  country: string;
  color: string;
  calls: number;
}

export const SAMPLE_PARTNERS: Partner[] = [
  { id: 'emma', name: 'Emma', country: 'US', color: '#3E63DD', native: 'en', learn: 'ja', level: 3, status: 'online', languageOnly: true, calls: 48 },
  { id: 'liam', name: 'Liam', country: 'GB', color: '#1F8A5B', native: 'en', learn: 'ja', level: 2, status: 'online', languageOnly: false, calls: 12 },
  { id: 'ava', name: 'Ava', country: 'AU', color: '#B7591F', native: 'en', learn: 'ja', level: 5, status: 'online', languageOnly: true, calls: 131 },
  { id: 'pedro', name: 'Pedro', country: 'BR', color: '#2A7F4F', native: 'pt', learn: 'en', level: 3, status: 'online', languageOnly: true, calls: 64 },
  { id: 'minji', name: 'Minji', country: 'KR', color: '#C2357A', native: 'ko', learn: 'en', level: 3, status: 'online', languageOnly: true, calls: 22 },
  { id: 'lucia', name: 'Lucía', country: 'ES', color: '#C26A1F', native: 'es', learn: 'en', level: 4, status: 'online', languageOnly: false, calls: 9 },
  { id: 'thanh', name: 'Thanh', country: 'VN', color: '#6B5BD6', native: 'vi', learn: 'en', level: 2, status: 'offline', languageOnly: true, calls: 4 },
  { id: 'jisoo', name: 'Jisoo', country: 'KR', color: '#D0466F', native: 'ko', learn: 'ja', level: 3, status: 'online', languageOnly: true, calls: 57 },
  { id: 'sarah', name: 'Sarah', country: 'US', color: '#8E5BD0', native: 'en', learn: 'ko', level: 3, status: 'online', languageOnly: true, calls: 33 },
  { id: 'lena', name: 'Lena', country: 'DE', color: '#4C8C6A', native: 'de', learn: 'ko', level: 2, status: 'online', languageOnly: true, calls: 7 },
  { id: 'carlos', name: 'Carlos', country: 'MX', color: '#C0612E', native: 'es', learn: 'ja', level: 3, status: 'online', languageOnly: true, calls: 28 },
  { id: 'tom', name: 'Tom', country: 'GB', color: '#2E7FA0', native: 'en', learn: 'es', level: 4, status: 'online', languageOnly: false, calls: 41 },
  { id: 'yuki', name: 'Yuki', country: 'JP', color: '#A0522D', native: 'ja', learn: 'ko', level: 2, status: 'online', languageOnly: true, calls: 18 },
  { id: 'haruka', name: 'Haruka', country: 'JP', color: '#B5477A', native: 'ja', learn: 'en', level: 3, status: 'online', languageOnly: true, calls: 75 },
  { id: 'sota', name: 'Sota', country: 'JP', color: '#3C7D6B', native: 'ja', learn: 'en', level: 2, status: 'online', languageOnly: true, calls: 14 },
  { id: 'kenji', name: 'Kenji', country: 'JP', color: '#4A6FA5', native: 'ja', learn: 'es', level: 3, status: 'online', languageOnly: true, calls: 26 },
];

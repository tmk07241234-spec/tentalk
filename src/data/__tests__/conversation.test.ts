import { QUESTIONS, questionsFor } from '../conversation';

describe('question cards', () => {
  it('exist for every interface language, starting with the weekly theme', () => {
    for (const lang of ['ja', 'en', 'ko', 'es'] as const) {
      const cards = QUESTIONS[lang]!;
      expect(cards.filter((c) => !c.deep).length).toBeGreaterThanOrEqual(4);
      expect(cards[0].deep).toBeFalsy();
    }
  });

  it('keep deep questions for level 3 and above', () => {
    expect(questionsFor('ja', 2).some((c) => c.deep)).toBe(false);
    expect(questionsFor('ja', 3).some((c) => c.deep)).toBe(true);
  });

  it('fall back to English for other languages', () => {
    expect(questionsFor('vi', 5)).toEqual(QUESTIONS.en);
  });
});

import { QUESTIONS, questionIn, questionsFor } from '../conversation';

describe('question cards', () => {
  it('start with the weekly theme and have enough easy cards', () => {
    expect(QUESTIONS[0].deep).toBeFalsy();
    expect(QUESTIONS.filter((c) => !c.deep).length).toBeGreaterThanOrEqual(4);
  });

  it('give two-sided options in every language or in none', () => {
    for (const card of QUESTIONS) {
      const sides = Object.values(card.text).map((x) => !!x.options);
      expect(new Set(sides).size).toBe(1);
    }
  });

  it('keep deep questions for level 3 and above', () => {
    expect(questionsFor(2).some((c) => c.deep)).toBe(false);
    expect(questionsFor(3).some((c) => c.deep)).toBe(true);
  });

  it('fall back to English for languages without cards', () => {
    expect(questionIn(QUESTIONS[1], 'vi')).toEqual(QUESTIONS[1].text.en);
    expect(questionIn(QUESTIONS[1], 'ko').q).toBe('아침형이에요, 저녁형이에요?');
  });
});

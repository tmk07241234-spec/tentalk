import { contentProblem } from '../contentFilter';

describe('content filter', () => {
  it('lets ordinary names and bios through', () => {
    for (const ok of ['Tomoki', 'さくら', '민지', 'Lucía', 'I love travel and cooking. Let’s talk!', '大阪の看護師です。海外旅行が好き。', 'Sussex is where I live']) {
      expect(contentProblem(ok)).toBeNull();
    }
  });

  it('catches sexual and abusive words, also when spaced out or in another width', () => {
    expect(contentProblem('looking for s e x')).toBe('inappropriate');
    expect(contentProblem('ＰＯＲＮ')).toBe('inappropriate');
    expect(contentProblem('エッチな話')).toBe('inappropriate');
    expect(contentProblem('씨발')).toBe('inappropriate');
  });

  it('catches contact details that move people off the app', () => {
    expect(contentProblem('add me on line: tomo_123')).toBe('contact');
    expect(contentProblem('insta @tomo.travel')).toBe('contact');
    expect(contentProblem('090-1234-5678')).toBe('contact');
    expect(contentProblem('https://example.com')).toBe('contact');
    expect(contentProblem('ラインID教えます')).toBe('contact');
  });
});

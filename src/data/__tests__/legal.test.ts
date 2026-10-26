import { legalDoc, type DocId } from '../legal';

const IDS: DocId[] = ['terms', 'privacy', 'guidelines', 'tokusho', 'faq'];

describe('legal documents', () => {
  it.each(['en', 'ko', 'es'])('%s has the same sections as the Japanese reference', (lang) => {
    for (const id of IDS) {
      const ref = legalDoc(id, 'ja').doc;
      const doc = legalDoc(id, lang).doc;
      expect(legalDoc(id, lang).fallback).toBe(false);
      expect(doc.sections.map((s) => s.p.length)).toEqual(ref.sections.map((s) => s.p.length));
    }
  });

  it('falls back to English for other languages', () => {
    expect(legalDoc('terms', 'fr')).toEqual({ doc: legalDoc('terms', 'en').doc, fallback: true });
  });
});

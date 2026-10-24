import ja from '../locales/ja';
import en from '../locales/en';
import ko from '../locales/ko';
import es from '../locales/es';

function keys(obj: object, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`],
  );
}

function placeholders(obj: object): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  const walk = (o: object, p: string) =>
    Object.entries(o).forEach(([k, v]) => {
      if (v && typeof v === 'object') walk(v, `${p}${k}.`);
      else out[`${p}${k}`] = (String(v).match(/{{\w+}}/g) ?? []).sort();
    });
  walk(obj, '');
  return out;
}

describe('locales', () => {
  const base = keys(ja).sort();

  it.each([['en', en], ['ko', ko], ['es', es]])('%s has the same keys as ja', (_, locale) => {
    expect(keys(locale).sort()).toEqual(base);
  });

  it.each([['en', en], ['ko', ko], ['es', es]])('%s keeps the same {{placeholders}}', (_, locale) => {
    expect(placeholders(locale)).toEqual(placeholders(ja));
  });

  it('has no empty strings', () => {
    for (const locale of [ja, en, ko, es]) expect(JSON.stringify(locale)).not.toMatch(/:""/);
  });
});

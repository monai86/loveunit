import { describe, it } from 'node:test';
import assert from 'node:assert';
import { TRANSLATIONS } from '../lib/i18n/translations';
import { MAHIDOL_FACULTIES, ACADEMIC_YEARS, getFacultyLabel, getYearLabel } from '../lib/constants/mahidol';

function validateLeafTranslations(obj: Record<string, unknown>, path = '') {
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = path ? `${path}.${key}` : key;
    if (value && typeof value === 'object') {
      if ('th' in value && 'en' in value) {
        const thVal = (value as { th: string }).th;
        const enVal = (value as { en: string }).en;
        assert.ok(typeof thVal === 'string' && thVal.trim().length > 0, `${currentPath}.th is empty`);
        assert.ok(typeof enVal === 'string' && enVal.trim().length > 0, `${currentPath}.en is empty`);
      } else {
        validateLeafTranslations(value as Record<string, unknown>, currentPath);
      }
    }
  }
}

describe('i18n Unified Translation Dictionary', () => {
  it('should have non-empty th and en strings for all nav keys', () => {
    validateLeafTranslations(TRANSLATIONS.nav, 'nav');
  });

  it('should have non-empty th and en strings for all register keys', () => {
    validateLeafTranslations(TRANSLATIONS.register, 'register');
  });

  it('should have non-empty th and en strings for all ticket keys', () => {
    validateLeafTranslations(TRANSLATIONS.ticket, 'ticket');
  });

  it('should have non-empty th and en strings for all footer keys', () => {
    validateLeafTranslations(TRANSLATIONS.footer, 'footer');
  });

  it('should have non-empty th and en strings for all common keys', () => {
    validateLeafTranslations(TRANSLATIONS.common, 'common');
  });

  it('should ensure all Mahidol faculties have code, name, label, and enLabel', () => {
    for (const fac of MAHIDOL_FACULTIES) {
      assert.ok(fac.code && fac.code.length > 0, 'Faculty code is missing');
      assert.ok(fac.name && fac.name.length > 0, `Faculty name missing for ${fac.code}`);
      assert.ok(fac.label && fac.label.length > 0, `Faculty label missing for ${fac.code}`);
      assert.ok(fac.enLabel && fac.enLabel.length > 0, `Faculty enLabel missing for ${fac.code}`);
    }
  });

  it('should resolve faculty and year labels in both languages correctly', () => {
    const medTechVal = 'คณะเทคนิคการแพทย์';
    assert.strictEqual(getFacultyLabel(medTechVal, 'th'), 'คณะเทคนิคการแพทย์');
    assert.strictEqual(getFacultyLabel(medTechVal, 'en'), 'Faculty of Medical Technology (MT)');

    const year1Val = 'ปี 1';
    assert.strictEqual(getYearLabel(year1Val, 'th'), 'ปี 1');
    assert.strictEqual(getYearLabel(year1Val, 'en'), 'Year 1 (Freshman)');
  });
});

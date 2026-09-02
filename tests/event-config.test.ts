import { describe, it } from 'node:test';
import assert from 'node:assert';
import { EVENT_CONFIG, getFormattedVenue } from '../lib/constants/event';
import { TRANSLATIONS } from '../lib/i18n/translations';

describe('EVENT_CONFIG Single Source of Truth', () => {
  it('should have exact verified event properties', () => {
    assert.strictEqual(EVENT_CONFIG.edition, 9);
    assert.strictEqual(EVENT_CONFIG.editionLabelTh, 'ครั้งที่ 9');
    assert.strictEqual(EVENT_CONFIG.dateIso, '2026-09-16');
    assert.strictEqual(EVENT_CONFIG.dateTh, 'วันพุธที่ 16 กันยายน 2569');
    assert.strictEqual(EVENT_CONFIG.startTime, '09:00');
    assert.strictEqual(EVENT_CONFIG.endTime, '14:00');
  });

  it('should have correct venue details with rooms 217 - 218 and Faculty of Liberal Arts', () => {
    assert.strictEqual(EVENT_CONFIG.venue.rooms, 'ห้องประชุม 217 - 218');
    assert.strictEqual(EVENT_CONFIG.venue.floor, 'ชั้น 2');
    assert.strictEqual(EVENT_CONFIG.venue.building, 'อาคารสิริวิทยา');
    assert.strictEqual(EVENT_CONFIG.venue.faculty, 'คณะศิลปศาสตร์');
    assert.strictEqual(EVENT_CONFIG.venue.university, 'มหาวิทยาลัยมหิดล');
    assert.strictEqual(EVENT_CONFIG.venue.campus, 'ศาลายา');

    const venueTh = getFormattedVenue('th');
    assert.ok(venueTh.includes('ห้องประชุม 217 - 218'));
    assert.ok(venueTh.includes('คณะศิลปศาสตร์'));
    assert.ok(venueTh.includes('อาคารสิริวิทยา'));

    const venueEn = getFormattedVenue('en');
    assert.ok(venueEn.includes('Meeting Room 217 - 218'));
    assert.ok(venueEn.includes('Faculty of Liberal Arts'));
  });

  it('should clearly separate main organizer from mobile unit partner', () => {
    assert.strictEqual(EVENT_CONFIG.organizers.length, 2);
    assert.strictEqual(EVENT_CONFIG.organizers[0].name, 'คณะเทคนิคการแพทย์ มหาวิทยาลัยมหิดล');
    assert.strictEqual(EVENT_CONFIG.organizers[1].name, 'ภาคบริการโลหิตแห่งชาติที่ 4 จังหวัดราชบุรี สภากาชาดไทย');
  });

  it('should contain verified public helpline contacts', () => {
    const contacts = EVENT_CONFIG.contacts;
    assert.strictEqual(contacts.length, 2);
    assert.strictEqual(contacts[0].name, 'เปา');
    assert.strictEqual(contacts[0].phone, '09-6986-6245');
    assert.strictEqual(contacts[1].name, 'แตงโม');
    assert.strictEqual(contacts[1].phone, '06-5627-4319');
    assert.strictEqual(EVENT_CONFIG.publicEmail, 'mumt68blooddonation@gmail.com');
  });

  it('should synchronize with i18n TRANSLATIONS', () => {
    assert.strictEqual(TRANSLATIONS.nav.eventBadge.th, 'ครั้งที่ 9');
    assert.strictEqual(TRANSLATIONS.home.venue.th, getFormattedVenue('th'));
    assert.strictEqual(TRANSLATIONS.home.date.th, EVENT_CONFIG.dateTh);
    assert.strictEqual(TRANSLATIONS.home.time.th, EVENT_CONFIG.timeLabelTh);
  });
});

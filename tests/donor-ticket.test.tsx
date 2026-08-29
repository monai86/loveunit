import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { DonorTicketPass } from '../components/ui/DonorTicketPass';
import { LanguageProvider } from '../lib/i18n/LanguageContext';

async function runDonorTicketTests() {
  console.log('Running donor ticket presentation tests...');

  // Default / Thai SSR render
  const markupTh = renderToStaticMarkup(
    <LanguageProvider defaultLanguage="th">
      <DonorTicketPass
        registrationCode="LVU26-008"
        name="สมชาย ใจดี"
        timeSlot="09:00–10:00 น."
        date="พุธที่ 16 กันยายน 2569"
        venue="ห้องประชุม 217 อาคารสิริวิทยา"
        qrToken="test-donor-pass-token"
      />
    </LanguageProvider>,
  );

  assert.match(markupTh, /data-testid="donor-ticket"/);
  assert.match(markupTh, /หมายเลขลงทะเบียน/);
  assert.match(markupTh, /รายละเอียดการนัดหมาย/);
  assert.match(markupTh, /อย่าลืมนำบัตรประชาชนมาด้วย/);
  assert.doesNotMatch(markupTh, /ลำดับคิวผู้ลงทะเบียน/);
  assert.doesNotMatch(markupTh, /Limited Edition/);

  // English render
  const markupEn = renderToStaticMarkup(
    <LanguageProvider defaultLanguage="en">
      <DonorTicketPass
        registrationCode="LVU26-008"
        name="Somchai Jaidee"
        timeSlot="09:00 - 10:00"
        venue="Room 217, Sirividhaya"
        qrToken="test-donor-pass-token"
      />
    </LanguageProvider>,
  );

  assert.match(markupEn, /data-testid="donor-ticket"/);
  assert.match(markupEn, /Registration Number/);
  assert.match(markupEn, /Appointment Details/);
  assert.match(markupEn, /Donor Preparation Tips/);

  console.log('Ticket presents a registration pass cleanly in active language.\n');
}

runDonorTicketTests().catch((error) => {
  console.error('Donor ticket presentation test failed:', error);
  process.exit(1);
});

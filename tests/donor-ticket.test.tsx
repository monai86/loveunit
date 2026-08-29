import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { DonorTicketPass } from '../components/ui/DonorTicketPass';

async function runDonorTicketTests() {
  console.log('Running donor ticket presentation tests...');

  const markup = renderToStaticMarkup(
    <DonorTicketPass
      registrationCode="LVU26-008"
      name="สมชาย ใจดี"
      timeSlot="09:00–10:00 น."
      date="พุธที่ 16 กันยายน 2569"
      venue="ห้องประชุม 217 อาคารสิริวิทยา"
      qrToken="test-donor-pass-token"
    />,
  );

  assert.match(markup, /data-testid="donor-ticket"/);
  assert.match(markup, /หมายเลขลงทะเบียน/);
  assert.match(markup, /รายละเอียดการนัดหมาย/);
  assert.doesNotMatch(markup, /ลำดับคิวผู้ลงทะเบียน/);
  assert.doesNotMatch(markup, /Limited Edition/);
  console.log('Ticket presents a registration pass, not a donor queue.\n');
}

runDonorTicketTests().catch((error) => {
  console.error('Donor ticket presentation test failed:', error);
  process.exit(1);
});

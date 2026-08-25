// Transactional Email Service (SMTP via nodemailer).
// Configure SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS / SMTP_FROM in .env.local.
// When SMTP is not configured (local dev), sending is a no-op so registration
// never fails because of email.

import nodemailer from 'nodemailer';
import { formatTimeRange } from '@/lib/utils/format';

interface ConfirmationInput {
  to: string;
  firstName: string;
  lastName: string;
  registrationCode: string;
  slot?: { startAt?: string; endAt?: string; start_at?: string; end_at?: string } | null;
  venueName?: string;
  eventDateLabel?: string;
}

function isSmtpConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function buildHtml(input: ConfirmationInput): string {
  const timeSlot = input.slot
    ? formatTimeRange(input.slot.startAt || input.slot.start_at || '', input.slot.endAt || input.slot.end_at || '')
    : '09:00 – 14:00 น.';

  const checklist = [
    'นอนหลับพักผ่อนให้เพียงพออย่างน้อย 6 ชั่วโมง',
    'ดื่มน้ำเปล่า 3-4 แก้วก่อนบริจาคประมาณ 30 นาที',
    'รับประทานอาหารมื้อหลักก่อนมา (งดอาหารไขมันสูง)',
    'เตรียมบัตรประชาชน หรือบัตรผู้บริจาคโลหิตสภากาชาดไทย',
    'นำ QR Code ในอีเมลนี้ (หรือหน้ายืนยันการลงทะเบียน) มาแสดง ณ จุดลงทะเบียน',
  ].map(item => `<li>${item}</li>`).join('');

  return `
  <div style="font-family:'Prompt','Kanit',sans-serif;background:#FFF9F9;padding:24px;">
    <div style="max-width:560px;margin:0 auto;background:#FFFFFF;border:2px dashed #7A1020;border-radius:14px;padding:28px;">
      <div style="text-align:center;border-bottom:2px solid #F0C4CC;padding-bottom:16px;margin-bottom:20px;">
        <div style="font-size:11px;letter-spacing:2px;color:#7A1020;font-weight:700;">MUMT BLOOD DONATION 2026 · ครั้งที่ 9</div>
        <div style="font-size:18px;font-weight:800;color:#29272A;">เติมรักให้เต็ม Unit ต่อชีวิตด้วยโลหิตคุณ</div>
      </div>
      <p style="font-size:14px;color:#29272A;">สวัสดีคุณ <strong>${input.firstName} ${input.lastName}</strong></p>
      <p style="font-size:13px;color:#6B6366;">ยืนยันการลงทะเบียนบริจาคโลหิตของคุณเรียบร้อยแล้ว</p>
      <div style="background:#FCE8EC;border:1px solid #F0C4CC;border-radius:10px;padding:14px;text-align:center;margin:18px 0;">
        <div style="font-size:10px;letter-spacing:2px;color:#6B6366;">REGISTRATION CODE</div>
        <div style="font-size:22px;font-weight:800;color:#7A1020;letter-spacing:1px;">${input.registrationCode}</div>
      </div>
      <table style="width:100%;font-size:13px;color:#29272A;">
        <tr><td style="padding:6px 0;color:#6B6366;">วันจัดงาน</td><td style="text-align:right;font-weight:700;">${input.eventDateLabel || 'พุธ 16 กันยายน 2569'}</td></tr>
        <tr><td style="padding:6px 0;color:#6B6366;">รอบเวลาเดินทางแนะนำ</td><td style="text-align:right;font-weight:700;color:#7A1020;">${timeSlot}</td></tr>
        <tr><td style="padding:6px 0;color:#6B6366;">สถานที่</td><td style="text-align:right;font-weight:700;">${input.venueName || 'ห้องประชุม 217 อาคารสิริวิทยา ศาลายา'}</td></tr>
      </table>
      <div style="margin:18px 0;border-top:2px dashed #7A1020;"></div>
      <div style="font-size:11px;letter-spacing:2px;color:#7A1020;font-weight:700;">ข้อปฏิบัติก่อนบริจาค</div>
      <ul style="font-size:13px;color:#29272A;padding-left:20px;line-height:1.9;">${checklist}</ul>
      <div style="text-align:center;margin-top:20px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/registration/${input.registrationCode}"
           style="display:inline-block;background:#7A1020;color:#FFFFFF;text-decoration:none;padding:12px 24px;border-radius:10px;font-size:13px;font-weight:700;">
          ดู QR Code ของฉัน
        </a>
      </div>
      <p style="font-size:11px;color:#6B6366;text-align:center;margin-top:20px;">หากไม่ได้ลงทะเบียนด้วยอีเมลนี้ กรุณาเพิกเฉยอีเมลฉบับนี้</p>
    </div>
  </div>`;
}

/**
 * Sends the registration confirmation email. Resolves silently when SMTP is
 * not configured or sending fails — never blocks the registration itself.
 */
export async function sendRegistrationConfirmation(input: ConfirmationInput): Promise<void> {
  if (!input.to) return;

  if (!isSmtpConfigured()) {
    console.log(`[email] SMTP not configured — skipping confirmation email to ${input.to}`);
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'MUMT Blood Donation 2026 <noreply@loveunit.local>',
      to: input.to,
      subject: `ยืนยันการลงทะเบียน MUMT Blood Donation 2026 · ${input.registrationCode}`,
      html: buildHtml(input),
    });
  } catch (error) {
    console.error('[email] Failed to send confirmation email:', error);
  }
}

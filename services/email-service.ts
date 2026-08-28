// Transactional Email Service (SMTP via nodemailer).
// Configure SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS / SMTP_FROM in .env.local.
// When SMTP is not configured (local dev), sending is a no-op so registration
// never fails because of email.

import nodemailer from 'nodemailer';
import QRCode from 'qrcode';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { formatTimeRange } from '@/lib/utils/format';

export interface ConfirmationInput {
  to: string;
  firstName: string;
  lastName: string;
  registrationCode: string;
  qrToken?: string;
  slot?: { startAt?: string; endAt?: string; start_at?: string; end_at?: string } | null;
  venueName?: string;
  eventDateLabel?: string;
}

export type EmailDeliveryResult =
  | { status: 'sent' }
  | { status: 'skipped'; reason: 'missing-recipient' | 'smtp-not-configured' }
  | { status: 'failed'; error: string };

function isSmtpConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

export async function sendStaffInvitation(input: { to: string; displayName: string; token: string }): Promise<void> {
  if (!isSmtpConfigured()) {
    throw new Error('SMTP is not configured. Configure SMTP before sending staff invitations.');
  }

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || 'http://localhost:3000').replace(/\/$/, '');
  const invitationUrl = `${appUrl}/staff/invite/${encodeURIComponent(input.token)}`;
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'MUMT Blood Donation 2026 <noreply@loveunit.local>',
    to: input.to,
    subject: 'คำเชิญเข้าใช้งานระบบเจ้าหน้าที่ MUMT LoveUnit',
    html: `<p>สวัสดีคุณ ${input.displayName}</p><p>คุณได้รับคำเชิญให้เข้าใช้งานระบบเจ้าหน้าที่ MUMT LoveUnit</p><p><a href="${invitationUrl}">ตั้งรหัสผ่านและเปิดใช้งานบัญชี</a></p><p>ลิงก์นี้ใช้ได้ครั้งเดียวภายใน 72 ชั่วโมง หากไม่ได้คาดหวังอีเมลนี้ โปรดเพิกเฉย</p>`,
  });
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] || char);
}

function buildHtml(input: ConfirmationInput, hasQrCode: boolean): string {
  const timeSlot = input.slot
    ? formatTimeRange(input.slot.startAt || input.slot.start_at || '', input.slot.endAt || input.slot.end_at || '')
    : '09:00 – 14:00 น.';

  const checklist = [
    ['นอนหลับพักผ่อนให้เพียงพออย่างน้อย 6 ชั่วโมง', 'Get at least 6 hours of sleep.'],
    ['ดื่มน้ำเปล่า 3-4 แก้วก่อนบริจาคประมาณ 30 นาที', 'Drink 3–4 glasses of water about 30 minutes before donation.'],
    ['รับประทานอาหารมื้อหลักก่อนมา (งดอาหารไขมันสูง)', 'Have a proper meal and avoid high-fat foods.'],
    ['เตรียมบัตรประชาชน หรือบัตรผู้บริจาคโลหิตสภากาชาดไทย', 'Bring your national ID or Red Cross donor card.'],
    ['นำ QR Code ในอีเมลนี้ (หรือหน้ายืนยันการลงทะเบียน) มาแสดง ณ จุดลงทะเบียน', 'Show this QR code at registration.'],
  ].map(([thai, english]) => `<li><span class="checklist-th" style="display:block;">${thai}</span><span class="checklist-en" style="display:block;color:#6B6366;">${english}</span></li>`).join('');

  return `
  <div style="font-family:'Prompt','Kanit',sans-serif;background:#FFF9F9;padding:24px;">
    <div style="max-width:600px;margin:0 auto;background:#FFFFFF;border:2px dashed #7A1020;border-radius:14px;padding:clamp(18px,5vw,28px);">
      <div style="text-align:center;border-bottom:2px solid #F0C4CC;padding-bottom:16px;margin-bottom:20px;">
        <div style="font-size:11px;letter-spacing:2px;color:#7A1020;font-weight:700;">MUMT BLOOD DONATION 2026 · ครั้งที่ 9</div>
        <div style="font-size:18px;font-weight:800;color:#29272A;">เติมรักให้เต็ม Unit ต่อชีวิตด้วยโลหิตคุณ</div>
        <div style="font-size:13px;color:#6B6366;margin-top:4px;">Fill a Unit with Love, Save a Life with Your Blood</div>
      </div>
      <p style="font-size:14px;color:#29272A;">สวัสดีคุณ / Dear <strong>${escapeHtml(input.firstName)} ${escapeHtml(input.lastName)}</strong></p>
      <p style="font-size:13px;color:#6B6366;">ขอบคุณที่ร่วมลงทะเบียนบริจาคโลหิตกับเรา การลงทะเบียนของคุณเรียบร้อยแล้ว<br/>Thank you for registering to donate blood with us. Your registration is confirmed.</p>
      <div style="background:#FCE8EC;border:1px solid #F0C4CC;border-radius:10px;padding:14px;text-align:center;margin:18px 0;">
        <div style="font-size:10px;letter-spacing:2px;color:#6B6366;">REGISTRATION CODE</div>
        <div style="font-size:22px;font-weight:800;color:#7A1020;letter-spacing:1px;">${escapeHtml(input.registrationCode)}</div>
      </div>
      <table style="width:100%;table-layout:fixed;font-size:13px;color:#29272A;">
        <tr><td style="width:36%;padding:6px 10px 6px 0;color:#6B6366;vertical-align:top;">วันจัดงาน / Event date</td><td style="width:64%;padding:6px 0;text-align:right;font-weight:700;word-break:break-word;">${escapeHtml(input.eventDateLabel || 'พุธ 16 กันยายน 2569')}</td></tr>
        <tr><td style="width:36%;padding:6px 10px 6px 0;color:#6B6366;vertical-align:top;">รอบเวลา / Arrival time</td><td style="width:64%;padding:6px 0;text-align:right;font-weight:700;color:#7A1020;word-break:break-word;">${timeSlot}</td></tr>
        <tr><td style="width:36%;padding:6px 10px 6px 0;color:#6B6366;vertical-align:top;">สถานที่ / Venue</td><td style="width:64%;padding:6px 0;text-align:right;font-weight:700;word-break:break-word;">${escapeHtml(input.venueName || 'ห้องประชุม 217 อาคารสิริวิทยา ศาลายา')}</td></tr>
      </table>
      <div style="text-align:center;margin:22px 0 8px;"><img src="cid:event-poster" width="280" alt="MUMT LoveUnit event poster" style="display:inline-block;max-width:100%;height:auto;border-radius:10px;" /></div>
      ${hasQrCode ? `<div style="text-align:center;margin:22px 0 8px;"><img src="cid:donor-qr-code" width="200" height="200" alt="QR Code for check-in" style="display:inline-block;border:1px solid #F0C4CC;padding:8px;border-radius:10px;background:#fff;" /><p style="font-size:12px;color:#6B6366;margin:8px 0 0;">แสดง QR Code นี้ ณ จุดลงทะเบียน<br/>Show this QR code at registration.</p></div>` : ''}
      <div style="margin:18px 0;border-top:2px dashed #7A1020;"></div>
      <div style="font-size:11px;letter-spacing:2px;color:#7A1020;font-weight:700;">ข้อปฏิบัติก่อนบริจาค / PRE-DONATION CHECKLIST</div>
      <ul style="font-size:13px;color:#29272A;padding-left:20px;line-height:1.65;">${checklist}</ul>
      <div style="text-align:center;margin-top:20px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/registration/${input.registrationCode}"
           style="display:inline-block;background:#7A1020;color:#FFFFFF;text-decoration:none;padding:12px 24px;border-radius:10px;font-size:13px;font-weight:700;">
          <span style="display:block;white-space:nowrap;">ดู QR Code ของฉัน</span><span style="display:block;white-space:nowrap;font-size:12px;margin-top:2px;">View my QR Code</span>
        </a>
      </div>
      <p style="font-size:11px;color:#6B6366;text-align:center;margin-top:20px;">หากไม่ได้ลงทะเบียนด้วยอีเมลนี้ กรุณาเพิกเฉยอีเมลฉบับนี้<br/>If you did not register with this email address, please disregard this message.</p>
    </div>
  </div>`;
}

export async function buildDonorConfirmationEmail(input: ConfirmationInput) {
  const qrImage = input.qrToken
    ? await QRCode.toBuffer(input.qrToken, { type: 'png', width: 400, margin: 2, errorCorrectionLevel: 'M' })
    : null;
  const posterImage = await readFile(path.join(process.cwd(), 'public/images/poster-a4-th.jpg'));
  return {
    subject: `ยืนยันการลงทะเบียน / Registration Confirmation · MUMT LoveUnit · ${input.registrationCode}`,
    html: buildHtml(input, Boolean(qrImage)),
    attachments: [
      ...(qrImage ? [{ filename: `MUMT-QR-${input.registrationCode}.png`, content: qrImage, cid: 'donor-qr-code', contentType: 'image/png' }] : []),
      { filename: 'MUMT-LoveUnit-poster.jpg', content: posterImage, cid: 'event-poster', contentType: 'image/jpeg' },
    ],
  };
}

/**
 * Sends the registration confirmation email. A delivery error is reported to
 * the caller but never prevents a successful registration from being saved.
 */
export async function sendRegistrationConfirmation(input: ConfirmationInput): Promise<EmailDeliveryResult> {
  if (!input.to) return { status: 'skipped', reason: 'missing-recipient' };

  if (!isSmtpConfigured()) {
    console.log(`[email] SMTP not configured — skipping confirmation email to ${input.to}`);
    return { status: 'skipped', reason: 'smtp-not-configured' };
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

    const email = await buildDonorConfirmationEmail(input);
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'MUMT Blood Donation 2026 <noreply@loveunit.local>',
      to: input.to,
      ...email,
    });
    return { status: 'sent' };
  } catch (error) {
    console.error('[email] Failed to send confirmation email:', error);
    return {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown SMTP error',
    };
  }
}

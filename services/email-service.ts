// Transactional Email Service (SMTP via nodemailer).
// Configure SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS / SMTP_FROM in .env.local.
// When SMTP is not configured (local dev), sending is a no-op so registration
// never fails because of email.

import nodemailer from 'nodemailer';
import QRCode from 'qrcode';
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

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || 'http://localhost:3000').replace(/\/$/, '');
  const eventDate = escapeHtml(input.eventDateLabel || 'พุธ 16 กันยายน 2569');
  const venue = escapeHtml(input.venueName || 'ห้องประชุม 217 อาคารสิริวิทยา ศาลายา');
  const recipient = escapeHtml(`${input.firstName} ${input.lastName}`);

  return `
  <div style="margin:0;padding:0;background:#F6F4F4;font-family:'Noto Sans Thai','Segoe UI',Arial,sans-serif;color:#241B1D;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;table-layout:fixed;background:#F6F4F4;"><tr><td align="center" style="padding:28px 14px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#FFFFFF;border:1px solid #E8DCD8;">
        <tr><td style="background:#560D19;padding:24px 28px;color:#FDF6F1;">
          <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:.04em;">MUMT LoveUnit ครั้งที่ 9</p>
          <p style="margin:8px 0 0;font-size:22px;line-height:1.35;font-weight:800;">ยืนยันการลงทะเบียนบริจาคโลหิต</p>
          <p style="margin:6px 0 0;font-size:13px;line-height:1.55;color:#EFDCD6;">Registration confirmed · กรุณาเก็บอีเมลนี้ไว้สำหรับวันงาน</p>
        </td></tr>
        <tr><td style="padding:28px;">
          <p style="margin:0;font-size:16px;line-height:1.6;">สวัสดีคุณ <strong>${recipient}</strong></p>
          <p style="margin:8px 0 24px;font-size:14px;line-height:1.7;color:#5F5558;">การลงทะเบียนของคุณเรียบร้อยแล้ว โปรดมาถึงตามรอบเวลาที่เลือกและแสดง QR Code นี้ต่อเจ้าหน้าที่</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;table-layout:fixed;border:1px solid #E8DCD8;"><tr><td style="padding:16px 18px;background:#FBE9EC;">
            <p style="margin:0;font-size:11px;font-weight:800;letter-spacing:.08em;color:#6E101E;">หมายเลขลงทะเบียน</p>
            <p style="margin:5px 0 0;font-family:monospace;font-size:24px;font-weight:800;letter-spacing:.04em;color:#560D19;">${escapeHtml(input.registrationCode)}</p>
          </td></tr></table>
          <p style="margin:26px 0 10px;font-size:15px;font-weight:800;">ข้อมูลการนัดหมาย</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;table-layout:fixed;border-top:1px solid #E8DCD8;font-size:14px;line-height:1.55;">
            <tr><td style="width:32%;padding:11px 12px 11px 0;border-bottom:1px solid #E8DCD8;color:#5F5558;vertical-align:top;">วันจัดงาน</td><td style="padding:11px 0;border-bottom:1px solid #E8DCD8;font-weight:700;word-break:break-word;">${eventDate}</td></tr>
            <tr><td style="width:32%;padding:11px 12px 11px 0;border-bottom:1px solid #E8DCD8;color:#5F5558;vertical-align:top;">เวลามาถึง</td><td style="padding:11px 0;border-bottom:1px solid #E8DCD8;font-weight:800;color:#6E101E;word-break:break-word;">${timeSlot}</td></tr>
            <tr><td style="width:32%;padding:11px 12px 11px 0;border-bottom:1px solid #E8DCD8;color:#5F5558;vertical-align:top;">สถานที่</td><td style="padding:11px 0;border-bottom:1px solid #E8DCD8;font-weight:700;word-break:break-word;">${venue}</td></tr>
          </table>
          ${hasQrCode ? `<div style="margin:26px 0 0;text-align:center;"><img src="cid:donor-qr-code" width="190" height="190" alt="QR Code สำหรับยืนยันการลงทะเบียน" style="display:inline-block;background:#FFFFFF;border:8px solid #FBE9EC;" /><p style="margin:12px 0 0;font-size:13px;line-height:1.6;font-weight:700;color:#241B1D;">แสดง QR Code นี้เมื่อมาถึงจุดลงทะเบียน</p><p style="margin:4px 0 0;font-size:12px;line-height:1.55;color:#5F5558;">หากเปิดภาพไม่ได้ ใช้หมายเลขลงทะเบียนด้านบนได้</p></div>` : ''}
          <div style="margin:28px 0 0;text-align:center;"><a href="${appUrl}/registration/${encodeURIComponent(input.registrationCode)}" style="display:inline-block;background:#6E101E;color:#FFFFFF;text-decoration:none;padding:13px 20px;font-size:14px;font-weight:800;">เปิดตั๋วลงทะเบียนของฉัน</a></div>
          <p style="margin:28px 0 0;padding-top:16px;border-top:1px solid #E8DCD8;font-size:12px;line-height:1.65;color:#5F5558;">เตรียมบัตรประชาชนหรือบัตรผู้บริจาคโลหิต และพักผ่อนให้เพียงพอก่อนมาร่วมกิจกรรม</p>
        </td></tr>
      </table>
      <p style="max-width:600px;margin:14px 0 0;font-size:11px;line-height:1.6;color:#6F6668;">หากไม่ได้ลงทะเบียนด้วยอีเมลนี้ กรุณาเพิกเฉยอีเมลฉบับนี้</p>
    </td></tr></table>
  </div>`;
}

export async function buildDonorConfirmationEmail(input: ConfirmationInput) {
  const qrImage = input.qrToken
    ? await QRCode.toBuffer(input.qrToken, { type: 'png', width: 400, margin: 2, errorCorrectionLevel: 'M' })
    : null;
  return {
    subject: `ยืนยันการลงทะเบียน / Registration Confirmation · MUMT LoveUnit · ${input.registrationCode}`,
    html: buildHtml(input, Boolean(qrImage)),
    attachments: [
      ...(qrImage ? [{ filename: `MUMT-QR-${input.registrationCode}.png`, content: qrImage, cid: 'donor-qr-code', contentType: 'image/png' }] : []),
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

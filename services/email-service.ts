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
  phone?: string;
  faculty?: string | null;
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

function getPublicAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes('localhost')) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }
  if (process.env.BETTER_AUTH_URL && !process.env.BETTER_AUTH_URL.includes('localhost')) {
    return process.env.BETTER_AUTH_URL.replace(/\/$/, '');
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/$/, '')}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, '')}`;
  }
  return (process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || 'https://mumt-loveunit.vercel.app').replace(/\/$/, '');
}

export async function sendStaffInvitation(input: { to: string; displayName: string; token: string }): Promise<void> {
  if (!isSmtpConfigured()) {
    throw new Error('SMTP is not configured. Configure SMTP before sending staff invitations.');
  }

  const appUrl = getPublicAppUrl();
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
    subject: 'คำเชิญเข้าใช้งานระบบเจ้าหน้าที่ MUMT LoveUnit (Staff Invitation)',
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

  const appUrl = getPublicAppUrl();
  const eventDate = escapeHtml(input.eventDateLabel || 'พุธ 16 กันยายน 2569');
  const venue = escapeHtml(input.venueName || 'ห้องประชุม 217 อาคารสิริวิทยา คณะเทคนิคการแพทย์ ม.มหิดล ศาลายา');
  const recipient = escapeHtml(`${input.firstName} ${input.lastName}`);
  const phone = escapeHtml(input.phone || '—');
  const faculty = escapeHtml(input.faculty || 'บุคคลทั่วไป (General Public)');

  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ตั๋วลงทะเบียนบริจาคโลหิต MUMT LoveUnit</title>
  <style type="text/css">
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Prompt:wght@300;400;500;600;700;800;900&display=swap');
    body, table, td, p, a, span, h1, h2, h3 {
      font-family: 'Prompt', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Sukhumvit Set', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
    }
    .code-font {
      font-family: 'SF Mono', 'Roboto Mono', Menlo, Consolas, Monaco, monospace !important;
    }
    @media only screen and (max-width: 480px) {
      .card-content { padding: 20px 16px !important; }
      .header-title { font-size: 21px !important; }
      .tile-col { display: block !important; width: 100% !important; box-sizing: border-box !important; margin-bottom: 8px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#F8F6F6;font-family:'Prompt','Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0F172A;-webkit-font-smoothing:antialiased;">
  <div style="margin:0;padding:0;background:#F8F6F6;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;table-layout:fixed;background:#F8F6F6;">
      <tr>
        <td align="center" style="padding:28px 12px;">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#FFFFFF;border-radius:24px;overflow:hidden;border:1px solid #E8DCD8;box-shadow:0 12px 36px rgba(15,23,42,0.06);">
            
            <!-- Rich Crimson Gradient Header -->
            <tr>
              <td style="background:linear-gradient(135deg, #C5222F 0%, #A6192E 50%, #7A1222 100%);background-color:#A6192E;padding:28px 24px;color:#FFFFFF;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="vertical-align:middle;">
                      <p style="margin:0;font-size:11px;font-weight:800;letter-spacing:.08em;color:#FDE8EA;text-transform:uppercase;">
                        MUMT LOVEUNIT ครั้งที่ 9 &middot; คณะเทคนิคการแพทย์ ม.มหิดล
                      </p>
                      <p style="margin:2px 0 0;font-size:11px;color:#FDE8EA;font-weight:500;opacity:0.9;">
                        Faculty of Medical Technology, Mahidol University
                      </p>
                    </td>
                    <td align="right" style="vertical-align:middle;">
                      <span style="display:inline-block;background:rgba(16,185,129,0.2);border:1px solid rgba(110,231,183,0.7);border-radius:9999px;padding:5px 12px;font-size:11px;font-weight:800;color:#FFFFFF;white-space:nowrap;letter-spacing:0.02em;">
                        &#10003; ยืนยันสิทธิ์แล้ว / Confirmed
                      </span>
                    </td>
                  </tr>
                </table>
                <h1 class="header-title" style="margin:16px 0 0;font-size:24px;line-height:1.35;font-weight:800;color:#FFFFFF;letter-spacing:-0.01em;">
                  ตั๋วลงทะเบียนบริจาคโลหิต
                </h1>
                <p style="margin:4px 0 0;font-size:11.5px;line-height:1.4;color:#FEE2E2;font-weight:600;letter-spacing:.05em;text-transform:uppercase;">
                  Official Blood Donation Pass &middot; Registration confirmed
                </p>
              </td>
            </tr>

            <!-- Ticket Notch / Divider -->
            <tr>
              <td style="background:#FFFFFF;height:12px;border-bottom:2px dashed #F5C2C7;font-size:0;line-height:0;">&nbsp;</td>
            </tr>

            <!-- Content Area -->
            <tr>
              <td class="card-content" style="padding:26px 24px 20px;">
                
                <!-- Greeting -->
                <p style="margin:0;font-size:15.5px;line-height:1.6;color:#0F172A;">
                  สวัสดีคุณ / Dear <strong style="color:#7A1222;font-size:16px;">${recipient}</strong>
                </p>
                <p style="margin:8px 0 22px;font-size:13.5px;line-height:1.7;color:#334155;">
                  การลงทะเบียนของคุณเรียบร้อยแล้ว ข้อมูลการนัดหมายและตั๋วดิจิทัลของคุณพร้อมใช้งาน โปรดแสดง QR Code หรือหมายเลขลงทะเบียนนี้เมื่อมาถึงจุดลงทะเบียนในวันงาน
                  <br><span style="font-size:12px;color:#64748B;font-weight:500;">(Your registration is confirmed. Please present this QR Code or registration number at the registration desk on the event date.)</span>
                </p>

                <!-- Registration Code Highlight Box (Boarding Pass Style) -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;table-layout:fixed;background:#FFF5F5;border:1.5px dashed #FCA5A5;border-radius:16px;margin-bottom:24px;">
                  <tr>
                    <td style="padding:18px 20px;text-align:center;">
                      <p style="margin:0;font-size:11px;font-weight:800;letter-spacing:.1em;color:#991B1B;text-transform:uppercase;">
                        หมายเลขลงทะเบียน / REGISTRATION CODE
                      </p>
                      <p class="code-font" style="margin:6px 0 0;font-family:'SF Mono','Roboto Mono',Menlo,Consolas,monospace;font-size:30px;font-weight:900;letter-spacing:.08em;color:#7A1222;">
                        ${escapeHtml(input.registrationCode)}
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- 2-Column Symmetrical Appointment Details Table -->
                <p style="margin:0 0 12px;font-size:14.5px;font-weight:800;color:#0F172A;letter-spacing:-0.01em;">
                  ข้อมูลการนัดหมาย / Appointment Details
                </p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;table-layout:fixed;border-collapse:separate;border-spacing:8px 8px;margin-bottom:18px;">
                  <!-- Row 1: Donor Name & Event Date -->
                  <tr>
                    <td style="width:50%;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:12px 14px;vertical-align:top;">
                      <p style="margin:0;font-size:11px;font-weight:700;color:#64748B;">👤 ผู้ลงทะเบียน / Donor Name</p>
                      <p style="margin:4px 0 0;font-size:13.5px;font-weight:800;color:#0F172A;">${recipient}</p>
                    </td>
                    <td style="width:50%;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:12px 14px;vertical-align:top;">
                      <p style="margin:0;font-size:11px;font-weight:700;color:#64748B;">📅 วันจัดกิจกรรม / Event Date</p>
                      <p style="margin:4px 0 0;font-size:13.5px;font-weight:800;color:#0F172A;">${eventDate}</p>
                    </td>
                  </tr>
                  <!-- Row 2: Time Slot & Venue -->
                  <tr>
                    <td style="width:50%;background:#FDF2F3;border:1px solid #FECDD3;border-radius:12px;padding:12px 14px;vertical-align:top;">
                      <p style="margin:0;font-size:11px;font-weight:700;color:#991B1B;">🕒 รอบเวลาเดินทาง / Arrival Slot</p>
                      <p style="margin:4px 0 0;font-size:15px;font-weight:900;color:#7A1222;">${timeSlot}</p>
                    </td>
                    <td style="width:50%;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:12px 14px;vertical-align:top;">
                      <p style="margin:0;font-size:11px;font-weight:700;color:#64748B;">📍 สถานที่จัดกิจกรรม / Venue</p>
                      <p style="margin:4px 0 0;font-size:12px;font-weight:700;color:#0F172A;line-height:1.45;">${venue}</p>
                    </td>
                  </tr>
                  <!-- Row 3: Phone & Faculty -->
                  <tr>
                    <td style="width:50%;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:12px 14px;vertical-align:top;">
                      <p style="margin:0;font-size:11px;font-weight:700;color:#64748B;">📞 เบอร์โทรศัพท์ / Phone</p>
                      <p style="margin:4px 0 0;font-size:13px;font-weight:800;color:#0F172A;">${phone}</p>
                    </td>
                    <td style="width:50%;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:12px 14px;vertical-align:top;">
                      <p style="margin:0;font-size:11px;font-weight:700;color:#64748B;">🏛️ คณะ / สังกัด / Faculty or Org</p>
                      <p style="margin:4px 0 0;font-size:12px;font-weight:700;color:#0F172A;line-height:1.45;">${faculty}</p>
                    </td>
                  </tr>
                </table>

                <!-- QR Code Section (Centered & Symmetrical) -->
                ${hasQrCode ? `
                <div style="margin:22px 0 0;text-align:center;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:16px;padding:22px;">
                  <p style="margin:0;font-size:14px;line-height:1.5;font-weight:800;color:#0F172A;">
                    QR Code สำหรับเช็คอิน / Check-in QR Code
                  </p>
                  <p style="margin:4px 0 16px;font-size:12px;line-height:1.5;color:#64748B;">
                    แสดง QR Code นี้เมื่อมาถึงจุดลงทะเบียน (Please present this QR Code at the registration desk)
                  </p>
                  <img src="cid:donor-qr-code" width="176" height="176" alt="QR Code สำหรับเช็กอิน" style="display:inline-block;background:#FFFFFF;border:4px solid #FFFFFF;border-radius:12px;box-shadow:0 4px 14px rgba(0,0,0,0.06);" />
                </div>` : ''}

                <!-- Preparation Tips Grid -->
                <div style="margin:26px 0 0;">
                  <p style="margin:0 0 10px;font-size:14.5px;font-weight:800;color:#0F172A;letter-spacing:-0.01em;">
                    🛡️ ข้อแนะนำการเตรียมความพร้อม / Preparation Tips
                  </p>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;table-layout:fixed;border-collapse:separate;border-spacing:8px 8px;">
                    <tr>
                      <td style="width:50%;background:#FDF2F3;border:1px solid #FECDD3;border-radius:12px;padding:13px 14px;vertical-align:top;font-size:12px;line-height:1.55;">
                        <strong style="color:#7A1222;font-size:12.5px;">🪪 1. อย่าลืมนำบัตรประชาชนมาด้วย</strong><br>
                        <span style="color:#64748B;font-size:11px;">(National ID Required) หรือบัตรผู้บริจาคตัวจริง</span>
                      </td>
                      <td style="width:50%;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:13px 14px;vertical-align:top;font-size:12px;line-height:1.55;">
                        <strong style="color:#0369A1;font-size:12.5px;">💧 2. ดื่มน้ำ 3–4 แก้วก่อนมา</strong><br>
                        <span style="color:#64748B;font-size:11px;">(Drink Plenty of Water) ช่วยระบบไหลเวียนโลหิต</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="width:50%;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:13px 14px;vertical-align:top;font-size:12px;line-height:1.55;">
                        <strong style="color:#4338CA;font-size:12.5px;">🌙 3. พักผ่อนให้พอ 6–8 ชม.</strong><br>
                        <span style="color:#64748B;font-size:11px;">(Good Sleep) ไม่อดนอนในคืนก่อนวันบริจาค</span>
                      </td>
                      <td style="width:50%;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:13px 14px;vertical-align:top;font-size:12px;line-height:1.55;">
                        <strong style="color:#B45309;font-size:12.5px;">🍲 4. ทานอาหารมื้อหลักล่วงหน้า</strong><br>
                        <span style="color:#64748B;font-size:11px;">(Healthy Meal) เลี่ยงอาหารมันจัดและแอลกอฮอล์</span>
                      </td>
                    </tr>
                  </table>
                </div>

                <!-- Event Poster Section -->
                <div style="margin:26px 0 0;">
                  <p style="margin:0 0 10px;font-size:14.5px;font-weight:800;color:#0F172A;letter-spacing:-0.01em;">
                    📢 โปสเตอร์ประชาสัมพันธ์ / Event Poster
                  </p>
                  <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:16px;overflow:hidden;padding:14px;text-align:center;">
                    <a href="${appUrl}/poster" target="_blank" rel="noopener noreferrer" style="display:block;text-decoration:none;">
                      <img src="${appUrl}/images/poster-th.jpg" alt="MUMT LoveUnit ครั้งที่ 9 โปสเตอร์กิจกรรมบริจาคโลหิต" width="500" style="width:100%;max-width:500px;height:auto;border-radius:12px;display:block;margin:0 auto;box-shadow:0 4px 14px rgba(0,0,0,0.06);border:1px solid #E2E8F0;" />
                    </a>
                    <p style="margin:10px 0 2px;font-size:11.5px;color:#64748B;font-weight:600;">
                      <a href="${appUrl}/poster" target="_blank" rel="noopener noreferrer" style="color:#7A1222;text-decoration:none;font-weight:700;">
                        🔍 ดูโปสเตอร์ฉบับเต็ม / View Full Poster &rarr;
                      </a>
                    </p>
                  </div>
                </div>

                <!-- Action Button -->
                <div style="margin:28px 0 6px;text-align:center;">
                  <a href="${appUrl}/registration/${encodeURIComponent(input.registrationCode)}" style="display:inline-block;background:linear-gradient(135deg, #C5222F 0%, #A6192E 100%);background-color:#A6192E;color:#FFFFFF;text-decoration:none;padding:14px 32px;border-radius:9999px;font-size:14px;font-weight:700;letter-spacing:.02em;box-shadow:0 4px 14px rgba(166,25,46,0.25);">
                    เปิดตั๋วลงทะเบียนออนไลน์ / View Digital Pass &rarr;
                  </a>
                </div>

              </td>
            </tr>

            <!-- Symmetrical Footer -->
            <tr>
              <td style="background:#F8FAFC;border-top:1px solid #E2E8F0;padding:20px 24px;text-align:center;">
                <p style="margin:0;font-size:12px;font-weight:700;color:#64748B;">
                  MUMT LoveUnit ครั้งที่ 9 &middot; คณะเทคนิคการแพทย์ มหาวิทยาลัยมหิดล
                </p>
                <p style="margin:4px 0 0;font-size:11px;line-height:1.5;color:#94A3B8;">
                  Faculty of Medical Technology, Mahidol University &middot; แล้วพบกันในวันงาน
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
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

function buildReminderHtml(input: ConfirmationInput, hasQrCode: boolean): string {
  const timeSlot = input.slot
    ? formatTimeRange(input.slot.startAt || input.slot.start_at || '', input.slot.endAt || input.slot.end_at || '')
    : '09:00 – 14:00 น.';
  const appUrl = getPublicAppUrl();
  const eventDate = escapeHtml(input.eventDateLabel || 'พุธ 16 กันยายน 2569');
  const venue = escapeHtml(input.venueName || 'ห้องประชุม 217 อาคารสิริวิทยา คณะเทคนิคการแพทย์ ม.มหิดล ศาลายา');
  const recipient = escapeHtml(`${input.firstName} ${input.lastName}`);
  const phone = escapeHtml(input.phone || '—');
  const faculty = escapeHtml(input.faculty || 'บุคคลทั่วไป (General Public)');

  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>เตือนความพร้อมก่อนวันบริจาคโลหิต MUMT LoveUnit</title>
  <style type="text/css">
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Prompt:wght@300;400;500;600;700;800;900&display=swap');
    body, table, td, p, a, span, h1, h2, h3 {
      font-family: 'Prompt', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Sukhumvit Set', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
    }
    .code-font {
      font-family: 'SF Mono', 'Roboto Mono', Menlo, Consolas, Monaco, monospace !important;
    }
    @media only screen and (max-width: 480px) {
      .card-content { padding: 20px 16px !important; }
      .header-title { font-size: 21px !important; }
      .tile-col { display: block !important; width: 100% !important; box-sizing: border-box !important; margin-bottom: 8px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#F8F6F6;font-family:'Prompt','Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0F172A;-webkit-font-smoothing:antialiased;">
  <div style="margin:0;padding:0;background:#F8F6F6;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;table-layout:fixed;background:#F8F6F6;">
      <tr>
        <td align="center" style="padding:28px 12px;">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#FFFFFF;border-radius:24px;overflow:hidden;border:1px solid #E8DCD8;box-shadow:0 12px 36px rgba(15,23,42,0.06);">
            
            <!-- Rich Crimson Gradient Hero Header -->
            <tr>
              <td style="background:linear-gradient(135deg, #C5222F 0%, #A6192E 50%, #7A1222 100%);background-color:#A6192E;padding:28px 24px;color:#FFFFFF;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="vertical-align:middle;">
                      <p style="margin:0;font-size:11px;font-weight:800;letter-spacing:.08em;color:#FDE8EA;text-transform:uppercase;">
                        MUMT LOVEUNIT 2026 &middot; 2 Days to Go!
                      </p>
                      <h1 class="header-title" style="margin:8px 0 0;font-size:23px;line-height:1.35;font-weight:800;color:#FFFFFF;letter-spacing:-0.01em;">
                        เตือนความพร้อมก่อนวันบริจาคโลหิต
                      </h1>
                      <p style="margin:4px 0 0;font-size:11.5px;line-height:1.4;color:#FEE2E2;font-weight:600;">
                        Preparation Reminder &middot; อีก 2 วันพบกันที่จุดลงทะเบียน
                      </p>
                    </td>
                    <td align="right" style="vertical-align:middle;">
                      <span style="display:inline-block;background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.4);border-radius:9999px;padding:5px 12px;font-size:11px;font-weight:800;color:#FFFFFF;white-space:nowrap;">
                        🔔 แจ้งเตือนนัดหมาย
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Content Area -->
            <tr>
              <td class="card-content" style="padding:26px 24px 20px;">
                
                <!-- Greeting -->
                <p style="margin:0;font-size:15.5px;line-height:1.6;color:#0F172A;">
                  สวัสดีคุณ / Dear <strong style="color:#7A1222;font-size:16px;">${recipient}</strong>
                </p>
                <p style="margin:8px 0 22px;font-size:13.5px;line-height:1.7;color:#334155;">
                  ขอเตือนรายละเอียดการนัดหมายของคุณ อีกเพียง 2 วันเท่านั้น! เตรียมร่างกายให้พร้อมแล้วมาพบกันตามรอบเวลาที่ท่านได้เลือกไว้
                  <br><span style="font-size:12px;color:#64748B;font-weight:500;">(Your blood donation appointment is in 2 days. Please review your schedule and preparation guidelines.)</span>
                </p>

                <!-- Appointment Details Table -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;table-layout:fixed;border-collapse:separate;border-spacing:8px 8px;margin-bottom:18px;">
                  <tr>
                    <td style="width:50%;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:12px 14px;vertical-align:top;">
                      <p style="margin:0;font-size:11px;font-weight:700;color:#64748B;">📅 วันจัดงาน / Event Date</p>
                      <p style="margin:4px 0 0;font-size:13.5px;font-weight:800;color:#0F172A;">${eventDate}</p>
                    </td>
                    <td style="width:50%;background:#FDF2F3;border:1px solid #FECDD3;border-radius:12px;padding:12px 14px;vertical-align:top;">
                      <p style="margin:0;font-size:11px;font-weight:700;color:#991B1B;">🕒 เวลามาถึง / Time Slot</p>
                      <p style="margin:4px 0 0;font-size:15px;font-weight:900;color:#7A1222;">${timeSlot}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="width:50%;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:12px 14px;vertical-align:top;">
                      <p style="margin:0;font-size:11px;font-weight:700;color:#64748B;">📍 สถานที่ / Venue</p>
                      <p style="margin:4px 0 0;font-size:12px;font-weight:700;color:#0F172A;line-height:1.45;">${venue}</p>
                    </td>
                    <td style="width:50%;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:12px 14px;vertical-align:top;">
                      <p style="margin:0;font-size:11px;font-weight:700;color:#64748B;">🏷️ หมายเลขลงทะเบียน / Code</p>
                      <p class="code-font" style="margin:4px 0 0;font-family:'SF Mono','Roboto Mono',Menlo,Consolas,monospace;font-size:15px;font-weight:900;color:#7A1222;">${escapeHtml(input.registrationCode)}</p>
                    </td>
                  </tr>
                </table>

                <!-- 4-Step Checklist Cards -->
                <div style="margin:24px 0 0;">
                  <p style="margin:0 0 10px;font-size:14.5px;font-weight:800;color:#0F172A;letter-spacing:-0.01em;">
                    🛡️ เช็กลิสต์เตรียมความพร้อม 4 ข้อ / 4-Step Readiness Checklist
                  </p>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;table-layout:fixed;border-collapse:separate;border-spacing:8px 8px;">
                    <tr>
                      <td style="width:50%;background:#FDF2F3;border:1px solid #FECDD3;border-radius:12px;padding:13px 14px;vertical-align:top;font-size:12px;line-height:1.55;">
                        <strong style="color:#7A1222;font-size:12.5px;">🪪 1. อย่าลืมนำบัตรประชาชนมาด้วย</strong><br>
                        <span style="color:#64748B;font-size:11px;">(National ID Required) หรือบัตรผู้บริจาคตัวจริง</span>
                      </td>
                      <td style="width:50%;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:13px 14px;vertical-align:top;font-size:12px;line-height:1.55;">
                        <strong style="color:#0369A1;font-size:12.5px;">💧 2. ดื่มน้ำ 3–4 แก้วก่อนมาถึง</strong><br>
                        <span style="color:#64748B;font-size:11px;">(Drink Plenty of Water) ช่วยระบบไหลเวียนโลหิต</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="width:50%;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:13px 14px;vertical-align:top;font-size:12px;line-height:1.55;">
                        <strong style="color:#4338CA;font-size:12.5px;">🌙 3. นอนหลับพักผ่อน 6–8 ชั่วโมง</strong><br>
                        <span style="color:#64748B;font-size:11px;">(Good Sleep) ไม่อดนอนในคืนก่อนวันบริจาค</span>
                      </td>
                      <td style="width:50%;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:13px 14px;vertical-align:top;font-size:12px;line-height:1.55;">
                        <strong style="color:#B45309;font-size:12.5px;">🍲 4. รับประทานอาหารมื้อหลัก</strong><br>
                        <span style="color:#64748B;font-size:11px;">(Healthy Meal) เลี่ยงอาหารมันจัดและแอลกอฮอล์</span>
                      </td>
                    </tr>
                  </table>
                </div>

                <!-- Event Poster Section -->
                <div style="margin:26px 0 0;">
                  <p style="margin:0 0 10px;font-size:14.5px;font-weight:800;color:#0F172A;letter-spacing:-0.01em;">
                    📢 โปสเตอร์กิจกรรม / Event Poster
                  </p>
                  <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:16px;overflow:hidden;padding:14px;text-align:center;">
                    <a href="${appUrl}/poster" target="_blank" rel="noopener noreferrer" style="display:block;text-decoration:none;">
                      <img src="${appUrl}/images/poster-th.jpg" alt="MUMT LoveUnit ครั้งที่ 9 โปสเตอร์กิจกรรมบริจาคโลหิต" width="500" style="width:100%;max-width:500px;height:auto;border-radius:12px;display:block;margin:0 auto;box-shadow:0 4px 14px rgba(0,0,0,0.06);border:1px solid #E2E8F0;" />
                    </a>
                    <p style="margin:10px 0 2px;font-size:11.5px;color:#64748B;font-weight:600;">
                      <a href="${appUrl}/poster" target="_blank" rel="noopener noreferrer" style="color:#7A1222;text-decoration:none;font-weight:700;">
                        🔍 ดูโปสเตอร์ฉบับเต็ม / View Full Poster &rarr;
                      </a>
                    </p>
                  </div>
                </div>

                <!-- QR Code Preview -->
                ${hasQrCode ? `
                <div style="margin:22px 0 0;text-align:center;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:16px;padding:22px;">
                  <p style="margin:0;font-size:14px;line-height:1.5;font-weight:800;color:#0F172A;">
                    แสดง QR Code นี้เมื่อมาถึงจุดลงทะเบียน
                  </p>
                  <p style="margin:4px 0 16px;font-size:12px;line-height:1.5;color:#64748B;">
                    Present this QR Code to staff upon arrival
                  </p>
                  <img src="cid:donor-reminder-qr-code" width="176" height="176" alt="QR Code สำหรับเช็กอิน" style="display:inline-block;background:#FFFFFF;border:4px solid #FFFFFF;border-radius:12px;box-shadow:0 4px 14px rgba(0,0,0,0.06);" />
                </div>` : ''}

                <!-- Action Button -->
                <div style="margin:28px 0 6px;text-align:center;">
                  <a href="${appUrl}/registration/${encodeURIComponent(input.registrationCode)}" style="display:inline-block;background:linear-gradient(135deg, #C5222F 0%, #A6192E 100%);background-color:#A6192E;color:#FFFFFF;text-decoration:none;padding:14px 32px;border-radius:9999px;font-size:14px;font-weight:700;letter-spacing:.02em;box-shadow:0 4px 14px rgba(166,25,46,0.25);">
                    เปิดตั๋วลงทะเบียนของฉัน / Open My Pass &rarr;
                  </a>
                </div>

              </td>
            </tr>

            <!-- Symmetrical Footer -->
            <tr>
              <td style="background:#F8FAFC;border-top:1px solid #E2E8F0;padding:20px 24px;text-align:center;">
                <p style="margin:0;font-size:12px;font-weight:700;color:#64748B;">
                  MUMT LoveUnit ครั้งที่ 9 &middot; คณะเทคนิคการแพทย์ มหาวิทยาลัยมหิดล
                </p>
                <p style="margin:4px 0 0;font-size:11px;line-height:1.5;color:#94A3B8;">
                  Faculty of Medical Technology, Mahidol University &middot; แล้วพบกันในวันงาน
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
}

export async function buildDonorPreparationReminderEmail(input: ConfirmationInput) {
  const qrImage = input.qrToken
    ? await QRCode.toBuffer(input.qrToken, { type: 'png', width: 400, margin: 2, errorCorrectionLevel: 'M' })
    : null;
  return {
    subject: `เตือนความพร้อมก่อนวันบริจาคโลหิต · MUMT LoveUnit · ${input.registrationCode}`,
    html: buildReminderHtml(input, Boolean(qrImage)),
    attachments: [
      ...(qrImage ? [{ filename: `MUMT-REMINDER-QR-${input.registrationCode}.png`, content: qrImage, cid: 'donor-reminder-qr-code', contentType: 'image/png' }] : []),
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

/**
 * Sends the 2-day donor preparation reminder email.
 */
export async function sendDonorPreparationReminder(input: ConfirmationInput): Promise<EmailDeliveryResult> {
  if (!input.to) return { status: 'skipped', reason: 'missing-recipient' };

  if (!isSmtpConfigured()) {
    console.log(`[email] SMTP not configured — skipping reminder email to ${input.to}`);
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

    const email = await buildDonorPreparationReminderEmail(input);
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'MUMT Blood Donation 2026 <noreply@loveunit.local>',
      to: input.to,
      ...email,
    });
    return { status: 'sent' };
  } catch (error) {
    console.error('[email] Failed to send reminder email:', error);
    return {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown SMTP error',
    };
  }
}

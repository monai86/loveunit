// Transactional Email Service (SMTP via nodemailer).
// Configure SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS / SMTP_FROM in .env.local.
// When SMTP is not configured (local dev), sending is a no-op so registration
// never fails because of email.

import nodemailer from 'nodemailer';
import QRCode from 'qrcode';
import { formatTimeRange, formatBangkokTime, isWalkInRecord } from '@/lib/utils/format';

export interface ConfirmationInput {
  to: string;
  firstName: string;
  lastName: string;
  phone?: string;
  faculty?: string | null;
  registrationCode: string;
  qrToken?: string;
  registeredAt?: string;
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

let sharedTransporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!sharedTransporter) {
    sharedTransporter = nodemailer.createTransport({
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return sharedTransporter;
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
  const transporter = getTransporter();
  const fromAddress = process.env.SMTP_FROM || 'MUMT Blood Donation 2026 <mumt68blooddonation@gmail.com>';
  const replyToAddress = process.env.SMTP_USER || 'mumt68blooddonation@gmail.com';

  await transporter.sendMail({
    from: fromAddress,
    to: input.to,
    replyTo: replyToAddress,
    subject: 'คำเชิญเข้าใช้งานระบบเจ้าหน้าที่ MUMT LoveUnit (Staff Invitation)',
    text: `สวัสดีคุณ ${input.displayName}\n\nคุณได้รับคำเชิญให้เข้าใช้งานระบบเจ้าหน้าที่ MUMT LoveUnit\n\nเปิดใช้งานบัญชีและตั้งรหัสผ่านได้ที่:\n${invitationUrl}\n\n(ลิงก์นี้ใช้ได้ครั้งเดียวภายใน 72 ชั่วโมง หากไม่ได้คาดหวังอีเมลนี้ โปรดเพิกเฉย)\n\nคณะเทคนิคการแพทย์ มหาวิทยาลัยมหิดล\n999 ถ.พุทธมณฑลสาย 4 ต.ศาลายา อ.พุทธมณฑล จ.นครปฐม 73170`,
    html: `<p>สวัสดีคุณ ${input.displayName}</p><p>คุณได้รับคำเชิญให้เข้าใช้งานระบบเจ้าหน้าที่ MUMT LoveUnit</p><p><a href="${invitationUrl}">ตั้งรหัสผ่านและเปิดใช้งานบัญชี</a></p><p>ลิงก์นี้ใช้ได้ครั้งเดียวภายใน 72 ชั่วโมง หากไม่ได้คาดหวังอีเมลนี้ โปรดเพิกเฉย</p><hr><p style="font-size:11px;color:#64748B;">คณะเทคนิคการแพทย์ มหาวิทยาลัยมหิดล 999 ถ.พุทธมณฑลสาย 4 ต.ศาลายา อ.พุทธมณฑล จ.นครปฐม 73170</p>`,
    headers: {
      'X-Auto-Response-Suppress': 'OOF, AutoReply',
      'Precedence': 'bulk',
    },
  });
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] || char);
}

function buildHtml(input: ConfirmationInput, hasQrCode: boolean): string {
  const isWalkIn = isWalkInRecord(input.registrationCode);
  const timeSlot = isWalkIn
    ? (input.registeredAt ? formatBangkokTime(input.registeredAt) : formatBangkokTime(new Date()))
    : (input.slot ? formatTimeRange(input.slot.startAt || input.slot.start_at || '', input.slot.endAt || input.slot.end_at || '') : '09:00 – 14:00 น.');
  const detailsHeading = isWalkIn
    ? 'ข้อมูลการลงทะเบียน Walk-in / Walk-in Registration Details'
    : 'ข้อมูลการนัดหมาย / Appointment Details';
  const timeLabel = isWalkIn
    ? 'เวลาลงทะเบียน'
    : 'รอบเวลาเดินทาง';

  const appUrl = getPublicAppUrl();
  const eventDate = escapeHtml(input.eventDateLabel || 'พุธ 16 กันยายน 2569');
  const venue = escapeHtml(input.venueName || 'ห้องประชุม 217 อาคารสิริวิทยา คณะเทคนิคการแพทย์ ม.มหิดล ศาลายา');
  const recipient = escapeHtml(`${input.firstName} ${input.lastName}`);
  const phone = escapeHtml(input.phone || '—');
  const faculty = escapeHtml(input.faculty || 'บุคคลทั่วไป');

  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ตั๋วลงทะเบียนบริจาคโลหิต MUMT LoveUnit</title>
  <style type="text/css">
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Prompt:wght@300;400;500;600;700;800;900&family=Sarabun:wght@300;400;500;600;700&display=swap');
    body, table, td, p, a, span, h1, h2, h3 {
      font-family: 'Prompt', 'Sarabun', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Sukhumvit Set', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
      -webkit-font-smoothing: antialiased;
    }
    .body-font {
      font-family: 'Sarabun', 'Prompt', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Sukhumvit Set', sans-serif !important;
    }
    .code-font {
      font-family: 'SF Mono', 'JetBrains Mono', 'Roboto Mono', Menlo, Consolas, Monaco, monospace !important;
    }
    @media only screen and (max-width: 480px) {
      .card-content { padding: 22px 16px !important; }
      .header-title { font-size: 22px !important; }
      .detail-cell-label { width: 34% !important; padding: 11px 8px !important; font-size: 12px !important; }
      .detail-cell-value { padding: 11px 8px !important; font-size: 13px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#F8F9FA;color:#0F172A;-webkit-font-smoothing:antialiased;">
  <div style="margin:0;padding:0;background:#F8F9FA;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;table-layout:fixed;background:#F8F9FA;">
      <tr>
        <td align="center" style="padding:28px 12px;">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#FFFFFF;border-radius:24px;overflow:hidden;border:1px solid #E2E8F0;box-shadow:0 12px 36px rgba(15,23,42,0.06);">
            
            <!-- Luxurious Crimson Red Gradient Header -->
            <tr>
              <td style="background:linear-gradient(135deg, #DC2626 0%, #B91C1C 40%, #991B1B 75%, #7F1D1D 100%);background-color:#B91C1C;padding:28px 24px 26px;color:#FFFFFF;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;">
                  <tr>
                    <td style="vertical-align:middle;">
                      <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:.05em;color:#FEE2E2;">
                        MUMT LOVEUNIT ครั้งที่ 9 &middot; คณะเทคนิคการแพทย์ ม.มหิดล
                      </p>
                      <p style="margin:2px 0 0;font-size:11px;color:#FECDD3;opacity:0.9;">
                        Faculty of Medical Technology, Mahidol University
                      </p>
                    </td>
                    <td align="right" style="vertical-align:middle;">
                      <span style="display:inline-block;background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.35);border-radius:9999px;padding:4px 12px;font-size:11px;font-weight:700;color:#FFFFFF;white-space:nowrap;">
                        &#10003; ยืนยันสิทธิ์แล้ว
                      </span>
                    </td>
                  </tr>
                </table>
                <h1 class="header-title" style="margin:16px 0 0;font-size:25px;line-height:1.25;font-weight:800;color:#FFFFFF;letter-spacing:-0.01em;">
                  ตั๋วลงทะเบียนบริจาคโลหิต
                </h1>
                <p style="margin:4px 0 0;font-size:12px;color:#FEE2E2;font-weight:500;">
                  Official Blood Donation Pass &middot; Registration confirmed
                </p>
              </td>
            </tr>

            <!-- Content Area -->
            <tr>
              <td class="card-content" style="padding:28px 24px 22px;">
                
                <!-- Greeting & Summary -->
                <p class="body-font" style="margin:0;font-size:16px;line-height:1.6;color:#0F172A;">
                  สวัสดีคุณ <strong style="color:#B91C1C;font-size:16.5px;font-weight:700;">${recipient}</strong>
                </p>
                <p class="body-font" style="margin:8px 0 20px;font-size:14px;line-height:1.7;color:#334155;">
                  การลงทะเบียนของคุณเรียบร้อยแล้ว (Registration confirmed) สามารถแสดง QR Code หรือแจ้งหมายเลขลงทะเบียนด้านล่างนี้ ณ จุดรับบริจาคโลหิตในวันงาน
                </p>

                <!-- Boarding Pass Style Code Box with Soft Red Gradient -->
                <div style="background:linear-gradient(180deg, #FFF5F5 0%, #FEF2F2 100%);border:1.5px solid #FECDD3;border-radius:16px;padding:18px 20px;text-align:center;margin-bottom:24px;">
                  <p style="margin:0;font-size:11px;font-weight:800;letter-spacing:.08em;color:#991B1B;text-transform:uppercase;">
                    หมายเลขลงทะเบียนของคุณ / REGISTRATION CODE
                  </p>
                  <p class="code-font" style="margin:6px 0 0;font-family:'SF Mono','JetBrains Mono','Roboto Mono',Menlo,Consolas,monospace;font-size:34px;font-weight:900;letter-spacing:.12em;color:#B91C1C;line-height:1.1;">
                    ${escapeHtml(input.registrationCode)}
                  </p>
                </div>

                <!-- Structured Appointment Details Card (No Emojis) -->
                <p style="margin:0 0 10px;font-size:14.5px;font-weight:800;color:#0F172A;letter-spacing:-0.01em;">
                  ${detailsHeading}
                </p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;table-layout:fixed;border:1px solid #E2E8F0;border-radius:14px;overflow:hidden;background:#FFFFFF;margin-bottom:24px;">
                  <tr style="border-bottom:1px solid #F1F5F9;background:#FEF2F2;">
                    <td class="detail-cell-label" style="padding:12px 16px;font-size:13px;font-weight:700;color:#991B1B;width:32%;vertical-align:middle;">
                      ${timeLabel}
                    </td>
                    <td class="detail-cell-value" style="padding:12px 16px;font-size:15px;font-weight:800;color:#B91C1C;text-align:right;white-space:nowrap;vertical-align:middle;">
                      ${timeSlot}
                    </td>
                  </tr>
                  <tr style="border-bottom:1px solid #F1F5F9;">
                    <td class="detail-cell-label" style="padding:12px 16px;font-size:12.5px;font-weight:600;color:#64748B;width:32%;vertical-align:middle;">
                      วันจัดกิจกรรม
                    </td>
                    <td class="detail-cell-value" style="padding:12px 16px;font-size:13.5px;font-weight:700;color:#0F172A;text-align:right;vertical-align:middle;">
                      ${eventDate}
                    </td>
                  </tr>
                  <tr style="border-bottom:1px solid #F1F5F9;">
                    <td class="detail-cell-label" style="padding:12px 16px;font-size:12.5px;font-weight:600;color:#64748B;width:32%;vertical-align:top;">
                      สถานที่จัดงาน
                    </td>
                    <td class="detail-cell-value" style="padding:12px 16px;font-size:13px;font-weight:600;color:#0F172A;line-height:1.5;text-align:right;vertical-align:top;">
                      ${venue}
                    </td>
                  </tr>
                  <tr style="border-bottom:1px solid #F1F5F9;">
                    <td class="detail-cell-label" style="padding:12px 16px;font-size:12.5px;font-weight:600;color:#64748B;width:32%;vertical-align:middle;">
                      ผู้ลงทะเบียน
                    </td>
                    <td class="detail-cell-value" style="padding:12px 16px;font-size:13px;font-weight:700;color:#0F172A;text-align:right;vertical-align:middle;">
                      ${recipient} <span style="font-size:12px;font-weight:500;color:#64748B;margin-left:4px;white-space:nowrap;">(โทร ${phone})</span>
                    </td>
                  </tr>
                  <tr>
                    <td class="detail-cell-label" style="padding:12px 16px;font-size:12.5px;font-weight:600;color:#64748B;width:32%;vertical-align:middle;">
                      คณะ / สังกัด
                    </td>
                    <td class="detail-cell-value" style="padding:12px 16px;font-size:13px;font-weight:600;color:#0F172A;text-align:right;vertical-align:middle;">
                      ${faculty}
                    </td>
                  </tr>
                </table>

                <!-- Check-in QR Code Card (No Emojis, Clean Border) -->
                ${hasQrCode ? `
                <div style="margin:22px 0 0;text-align:center;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:16px;padding:22px 16px;">
                  <p style="margin:0;font-size:14.5px;line-height:1.4;font-weight:800;color:#0F172A;">
                    QR Code สำหรับเช็คอิน
                  </p>
                  <p style="margin:4px 0 16px;font-size:12px;color:#64748B;">
                    แสดง QR Code นี้เมื่อมาถึงจุดลงทะเบียน
                  </p>
                  <div style="display:inline-block;background:#FFFFFF;padding:12px;border-radius:16px;border:1px solid #E2E8F0;box-shadow:0 4px 12px rgba(15,23,42,0.04);">
                    <img src="cid:donor-qr-code" width="180" height="180" alt="QR Code สำหรับเช็กอิน" style="display:block;border-radius:8px;" />
                  </div>
                </div>` : ''}

                <!-- Preparation Tips (Clean Numbered List, No Emojis) -->
                <div style="margin:24px 0 0;">
                  <p style="margin:0 0 12px;font-size:14.5px;font-weight:800;color:#0F172A;">
                    ข้อแนะนำการเตรียมความพร้อม / Preparation Tips
                  </p>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;table-layout:fixed;border-collapse:separate;border-spacing:0 8px;">
                    <tr>
                      <td style="background:#FEF2F2;border:1px solid #FECDD3;border-radius:12px;padding:12px 16px;font-size:13px;line-height:1.55;color:#0F172A;">
                        <strong style="color:#991B1B;">1. อย่าลืมนำบัตรประชาชนมาด้วย</strong>
                        <span style="color:#64748B;font-size:12px;display:block;margin-top:2px;">(National ID Required) หรือบัตรประจำตัวผู้บริจาคโลหิตตัวจริง</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:12px 16px;font-size:13px;line-height:1.55;color:#0F172A;">
                        <strong style="color:#0369A1;">2. ดื่มน้ำ 3–4 แก้วก่อนมาถึง</strong>
                        <span style="color:#64748B;font-size:12px;display:block;margin-top:2px;">ช่วยให้ระบบไหลเวียนโลหิตดีขึ้นและลดอาการหน้ามืด</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:12px 16px;font-size:13px;line-height:1.55;color:#0F172A;">
                        <strong style="color:#4338CA;">3. นอนหลับพักผ่อน 6–8 ชั่วโมง</strong>
                        <span style="color:#64748B;font-size:12px;display:block;margin-top:2px;">ไม่อดนอนในคืนก่อนวันบริจาคเพื่อให้ร่างกายสดชื่นพร้อมบริจาค</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:12px 16px;font-size:13px;line-height:1.55;color:#0F172A;">
                        <strong style="color:#B45309;">4. รับประทานอาหารมื้อหลักล่วงหน้า</strong>
                        <span style="color:#64748B;font-size:12px;display:block;margin-top:2px;">หลีกเลี่ยงอาหารที่มีไขมันสูงและงดเครื่องดื่มแอลกอฮอล์</span>
                      </td>
                    </tr>
                  </table>
                </div>

                <!-- Action CTA Button with Crimson Red Gradient -->
                <div style="margin:28px 0 8px;text-align:center;">
                  <a href="${appUrl}/registration/${encodeURIComponent(input.registrationCode)}" style="display:inline-block;background:linear-gradient(135deg, #DC2626 0%, #B91C1C 50%, #991B1B 100%);background-color:#B91C1C;color:#FFFFFF;text-decoration:none;padding:14px 34px;border-radius:9999px;font-size:14.5px;font-weight:700;letter-spacing:.02em;box-shadow:0 4px 16px rgba(185,28,28,0.28);white-space:nowrap;">
                    เปิดดูตั๋วลงทะเบียนออนไลน์ &rarr;
                  </a>
                </div>

              </td>
            </tr>

            <!-- Symmetrical Footer with Organization & Deliverability Info -->
            <tr>
              <td style="background:#F8FAFC;border-top:1px solid #E2E8F0;padding:22px 24px 20px;text-align:center;">
                <p style="margin:0;font-size:12.5px;font-weight:700;color:#334155;">
                  MUMT LoveUnit ครั้งที่ 9 &middot; คณะเทคนิคการแพทย์ มหาวิทยาลัยมหิดล
                </p>
                <p style="margin:4px 0 0;font-size:11px;line-height:1.6;color:#64748B;">
                  999 ถ.พุทธมณฑลสาย 4 ต.ศาลายา อ.พุทธมณฑล จ.นครปฐม 73170 &middot; Faculty of Medical Technology, Mahidol University
                </p>
                <p style="margin:8px 0 0;font-size:10.5px;line-height:1.5;color:#94A3B8;">
                  อีเมลนี้เป็นการแจ้งเตือนอัตโนมัติจากการลงทะเบียนเข้าร่วมกิจกรรมบริจาคโลหิต &middot; <a href="${appUrl}/lookup" style="color:#B91C1C;text-decoration:underline;">ตรวจสอบหรือยกเลิกการลงทะเบียน</a>
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

function buildText(input: ConfirmationInput): string {
  const isWalkIn = isWalkInRecord(input.registrationCode);
  const timeSlot = isWalkIn
    ? (input.registeredAt ? formatBangkokTime(input.registeredAt) : formatBangkokTime(new Date()))
    : (input.slot ? formatTimeRange(input.slot.startAt || input.slot.start_at || '', input.slot.endAt || input.slot.end_at || '') : '09:00 – 14:00 น.');
  const appUrl = getPublicAppUrl();
  const eventDate = input.eventDateLabel || 'พุธ 16 กันยายน 2569';
  const venue = input.venueName || 'ห้องประชุม 217 อาคารสิริวิทยา คณะเทคนิคการแพทย์ ม.มหิดล ศาลายา';
  const recipient = `${input.firstName} ${input.lastName}`;
  const phone = input.phone || '—';
  const faculty = input.faculty || 'บุคคลทั่วไป (General Public)';

  return `MUMT LoveUnit ครั้งที่ 9 · คณะเทคนิคการแพทย์ มหาวิทยาลัยมหิดล
ยืนยันการลงทะเบียนบริจาคโลหิต / Registration Confirmation

สวัสดีคุณ ${recipient}

การลงทะเบียนของคุณเรียบร้อยแล้ว / Registration confirmed
ขอขอบคุณที่ร่วมเป็นส่วนหนึ่งในการต่อชีวิตให้กับผู้ป่วยผ่านกิจกรรมบริจาคโลหิต MUMT LoveUnit ครั้งที่ 9

============================================================
ข้อมูลการนัดหมาย / Appointment Details
============================================================
• หมายเลขลงทะเบียน (Registration Code): ${input.registrationCode}
• รอบเวลาเดินทาง (Time Slot): ${timeSlot}
• วันจัดกิจกรรม (Event Date): ${eventDate}
• สถานที่จัดงาน (Venue): ${venue}
• ผู้ลงทะเบียน (Name): ${recipient} (โทร ${phone})
• คณะ หรือ สังกัด (Faculty): ${faculty}

============================================================
ข้อแนะนำการเตรียมความพร้อม / Preparation Tips
============================================================
1. อย่าลืมนำบัตรประชาชนมาด้วย (National ID Required) หรือบัตรประจำตัวผู้บริจาคตัวจริง
2. ดื่มน้ำ 3–4 แก้วก่อนมาถึงจุดรับบริจาค
3. พักผ่อนให้เพียงพอ 6–8 ชั่วโมง ไม่อดนอนในคืนก่อนวันบริจาค
4. รับประทานอาหารมื้อหลักล่วงหน้า (เลี่ยงอาหารมันจัดและแอลกอฮอล์)

เปิดดูตั๋วลงทะเบียนออนไลน์และ QR Code ของคุณ:
${appUrl}/registration/${encodeURIComponent(input.registrationCode)}

ตรวจสอบหรือยกเลิกการลงทะเบียน:
${appUrl}/lookup

------------------------------------------------------------
คณะเทคนิคการแพทย์ มหาวิทยาลัยมหิดล (Faculty of Medical Technology, Mahidol University)
999 ถ.พุทธมณฑลสาย 4 ต.ศาลายา อ.พุทธมณฑล จ.นครปฐม 73170
อีเมลนี้เป็นการแจ้งเตือนอัตโนมัติจากการลงทะเบียนเข้าร่วมกิจกรรมบริจาคโลหิต MUMT LoveUnit 2026`;
}

export async function buildDonorConfirmationEmail(input: ConfirmationInput) {
  const qrImage = input.qrToken
    ? await QRCode.toBuffer(input.qrToken, { type: 'png', width: 400, margin: 2, errorCorrectionLevel: 'M' })
    : null;
  return {
    subject: `ยืนยันการลงทะเบียน / Registration Confirmation · MUMT LoveUnit · ${input.registrationCode}`,
    text: buildText(input),
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
  const timeLabel = 'รอบเวลาเดินทาง';
  const appUrl = getPublicAppUrl();
  const eventDate = escapeHtml(input.eventDateLabel || 'พุธ 16 กันยายน 2569');
  const venue = escapeHtml(input.venueName || 'ห้องประชุม 217 อาคารสิริวิทยา คณะเทคนิคการแพทย์ ม.มหิดล ศาลายา');
  const recipient = escapeHtml(`${input.firstName} ${input.lastName}`);

  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>เตือนความพร้อมก่อนวันบริจาคโลหิต MUMT LoveUnit</title>
  <style type="text/css">
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Prompt:wght@300;400;500;600;700;800;900&family=Sarabun:wght@300;400;500;600;700&display=swap');
    body, table, td, p, a, span, h1, h2, h3 {
      font-family: 'Prompt', 'Sarabun', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Sukhumvit Set', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
      -webkit-font-smoothing: antialiased;
    }
    .body-font {
      font-family: 'Sarabun', 'Prompt', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Sukhumvit Set', sans-serif !important;
    }
    .code-font {
      font-family: 'SF Mono', 'JetBrains Mono', 'Roboto Mono', Menlo, Consolas, Monaco, monospace !important;
    }
    @media only screen and (max-width: 480px) {
      .card-content { padding: 22px 16px !important; }
      .header-title { font-size: 22px !important; }
      .detail-cell-label { width: 34% !important; padding: 11px 8px !important; font-size: 12px !important; }
      .detail-cell-value { padding: 11px 8px !important; font-size: 13px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#F8F9FA;color:#0F172A;-webkit-font-smoothing:antialiased;">
  <div style="margin:0;padding:0;background:#F8F9FA;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;table-layout:fixed;background:#F8F9FA;">
      <tr>
        <td align="center" style="padding:28px 12px;">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#FFFFFF;border-radius:24px;overflow:hidden;border:1px solid #E2E8F0;box-shadow:0 12px 36px rgba(15,23,42,0.06);">
            
            <!-- Luxurious Crimson Red Gradient Header -->
            <tr>
              <td style="background:linear-gradient(135deg, #DC2626 0%, #B91C1C 40%, #991B1B 75%, #7F1D1D 100%);background-color:#B91C1C;padding:28px 24px 26px;color:#FFFFFF;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;">
                  <tr>
                    <td style="vertical-align:middle;">
                      <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:.05em;color:#FEE2E2;">
                        MUMT LOVEUNIT 2026 &middot; 2 Days to Go!
                      </p>
                      <p style="margin:2px 0 0;font-size:11px;color:#FECDD3;opacity:0.9;">
                        Faculty of Medical Technology, Mahidol University
                      </p>
                    </td>
                    <td align="right" style="vertical-align:middle;">
                      <span style="display:inline-block;background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.35);border-radius:9999px;padding:4px 12px;font-size:11px;font-weight:700;color:#FFFFFF;white-space:nowrap;">
                        แจ้งเตือนนัดหมาย
                      </span>
                    </td>
                  </tr>
                </table>
                <h1 class="header-title" style="margin:16px 0 0;font-size:25px;line-height:1.25;font-weight:800;color:#FFFFFF;letter-spacing:-0.01em;">
                  เตือนความพร้อมก่อนวันบริจาคโลหิต
                </h1>
                <p style="margin:4px 0 0;font-size:12px;color:#FEE2E2;font-weight:500;">
                  Preparation Reminder &middot; อีก 2 วันพบกันที่จุดรับบริจาค
                </p>
              </td>
            </tr>

            <!-- Content Area -->
            <tr>
              <td class="card-content" style="padding:28px 24px 22px;">
                
                <!-- Greeting & Summary -->
                <p class="body-font" style="margin:0;font-size:16px;line-height:1.6;color:#0F172A;">
                  สวัสดีคุณ <strong style="color:#B91C1C;font-size:16.5px;font-weight:700;">${recipient}</strong>
                </p>
                <p class="body-font" style="margin:8px 0 20px;font-size:14px;line-height:1.7;color:#334155;">
                  ขอเตือนรายละเอียดการนัดหมายของคุณ อีกเพียง 2 วันเท่านั้น! เตรียมร่างกายให้พร้อมแล้วมาพบกันตามรอบเวลาที่ท่านได้เลือกไว้
                </p>

                <!-- Boarding Pass Style Code Box -->
                <div style="background:linear-gradient(180deg, #FFF5F5 0%, #FEF2F2 100%);border:1.5px solid #FECDD3;border-radius:16px;padding:18px 20px;text-align:center;margin-bottom:24px;">
                  <p style="margin:0;font-size:11px;font-weight:800;letter-spacing:.08em;color:#991B1B;text-transform:uppercase;">
                    หมายเลขลงทะเบียนของคุณ / REGISTRATION CODE
                  </p>
                  <p class="code-font" style="margin:6px 0 0;font-family:'SF Mono','JetBrains Mono','Roboto Mono',Menlo,Consolas,monospace;font-size:34px;font-weight:900;letter-spacing:.12em;color:#B91C1C;line-height:1.1;">
                    ${escapeHtml(input.registrationCode)}
                  </p>
                </div>

                <!-- Structured Appointment Details Card -->
                <p style="margin:0 0 10px;font-size:14.5px;font-weight:800;color:#0F172A;letter-spacing:-0.01em;">
                  ข้อมูลการนัดหมาย / Appointment Details
                </p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;table-layout:fixed;border:1px solid #E2E8F0;border-radius:14px;overflow:hidden;background:#FFFFFF;margin-bottom:24px;">
                  <tr style="border-bottom:1px solid #F1F5F9;background:#FEF2F2;">
                    <td class="detail-cell-label" style="padding:12px 16px;font-size:13px;font-weight:700;color:#991B1B;width:32%;vertical-align:middle;">
                      ${timeLabel}
                    </td>
                    <td class="detail-cell-value" style="padding:12px 16px;font-size:15px;font-weight:800;color:#B91C1C;text-align:right;white-space:nowrap;vertical-align:middle;">
                      ${timeSlot}
                    </td>
                  </tr>
                  <tr style="border-bottom:1px solid #F1F5F9;">
                    <td class="detail-cell-label" style="padding:12px 16px;font-size:12.5px;font-weight:600;color:#64748B;width:32%;vertical-align:middle;">
                      วันจัดกิจกรรม
                    </td>
                    <td class="detail-cell-value" style="padding:12px 16px;font-size:13.5px;font-weight:700;color:#0F172A;text-align:right;vertical-align:middle;">
                      ${eventDate}
                    </td>
                  </tr>
                  <tr>
                    <td class="detail-cell-label" style="padding:12px 16px;font-size:12.5px;font-weight:600;color:#64748B;width:32%;vertical-align:top;">
                      สถานที่จัดงาน
                    </td>
                    <td class="detail-cell-value" style="padding:12px 16px;font-size:13px;font-weight:600;color:#0F172A;line-height:1.5;text-align:right;vertical-align:top;">
                      ${venue}
                    </td>
                  </tr>
                </table>

                <!-- Check-in QR Code Card (if available) -->
                ${hasQrCode ? `
                <div style="margin:22px 0 0;text-align:center;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:16px;padding:22px 16px;">
                  <p style="margin:0;font-size:14.5px;line-height:1.4;font-weight:800;color:#0F172A;">
                    QR Code สำหรับเช็คอิน
                  </p>
                  <p style="margin:4px 0 16px;font-size:12px;color:#64748B;">
                    แสดง QR Code นี้เมื่อมาถึงจุดลงทะเบียน
                  </p>
                  <div style="display:inline-block;background:#FFFFFF;padding:12px;border-radius:16px;border:1px solid #E2E8F0;box-shadow:0 4px 12px rgba(15,23,42,0.04);">
                    <img src="cid:donor-reminder-qr-code" width="180" height="180" alt="QR Code สำหรับเช็กอิน" style="display:block;border-radius:8px;" />
                  </div>
                </div>` : ''}

                <!-- 4-Step Readiness Checklist (Clean Numbered List) -->
                <div style="margin:24px 0 0;">
                  <p style="margin:0 0 12px;font-size:14.5px;font-weight:800;color:#0F172A;">
                    เช็กลิสต์เตรียมความพร้อม 4 ข้อ / 4-Step Readiness Checklist
                  </p>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;table-layout:fixed;border-collapse:separate;border-spacing:0 8px;">
                    <tr>
                      <td style="background:#FEF2F2;border:1px solid #FECDD3;border-radius:12px;padding:12px 16px;font-size:13px;line-height:1.55;color:#0F172A;">
                        <strong style="color:#991B1B;">1. อย่าลืมนำบัตรประชาชนมาด้วย</strong>
                        <span style="color:#64748B;font-size:12px;display:block;margin-top:2px;">(National ID Required) หรือบัตรประจำตัวผู้บริจาคโลหิตตัวจริง</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:12px 16px;font-size:13px;line-height:1.55;color:#0F172A;">
                        <strong style="color:#0369A1;">2. ดื่มน้ำ 3–4 แก้วก่อนมาถึง</strong>
                        <span style="color:#64748B;font-size:12px;display:block;margin-top:2px;">ช่วยให้ระบบไหลเวียนโลหิตดีขึ้นและลดอาการหน้ามืด</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:12px 16px;font-size:13px;line-height:1.55;color:#0F172A;">
                        <strong style="color:#4338CA;">3. นอนหลับพักผ่อน 6–8 ชั่วโมง</strong>
                        <span style="color:#64748B;font-size:12px;display:block;margin-top:2px;">ไม่อดนอนในคืนก่อนวันบริจาคเพื่อให้ร่างกายสดชื่นพร้อมบริจาค</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:12px 16px;font-size:13px;line-height:1.55;color:#0F172A;">
                        <strong style="color:#B45309;">4. รับประทานอาหารมื้อหลักล่วงหน้า</strong>
                        <span style="color:#64748B;font-size:12px;display:block;margin-top:2px;">หลีกเลี่ยงอาหารที่มีไขมันสูงและงดเครื่องดื่มแอลกอฮอล์</span>
                      </td>
                    </tr>
                  </table>
                </div>

                <!-- Action CTA Button with Crimson Red Gradient -->
                <div style="margin:28px 0 8px;text-align:center;">
                  <a href="${appUrl}/registration/${encodeURIComponent(input.registrationCode)}" style="display:inline-block;background:linear-gradient(135deg, #DC2626 0%, #B91C1C 50%, #991B1B 100%);background-color:#B91C1C;color:#FFFFFF;text-decoration:none;padding:14px 34px;border-radius:9999px;font-size:14.5px;font-weight:700;letter-spacing:.02em;box-shadow:0 4px 16px rgba(185,28,28,0.28);white-space:nowrap;">
                    เปิดดูตั๋วลงทะเบียนออนไลน์ &rarr;
                  </a>
                </div>

              </td>
            </tr>

            <!-- Symmetrical Footer with Organization & Deliverability Info -->
            <tr>
              <td style="background:#F8FAFC;border-top:1px solid #E2E8F0;padding:22px 24px 20px;text-align:center;">
                <p style="margin:0;font-size:12.5px;font-weight:700;color:#334155;">
                  MUMT LoveUnit ครั้งที่ 9 &middot; คณะเทคนิคการแพทย์ มหาวิทยาลัยมหิดล
                </p>
                <p style="margin:4px 0 0;font-size:11px;line-height:1.6;color:#64748B;">
                  999 ถ.พุทธมณฑลสาย 4 ต.ศาลายา อ.พุทธมณฑล จ.นครปฐม 73170 &middot; Faculty of Medical Technology, Mahidol University
                </p>
                <p style="margin:8px 0 0;font-size:10.5px;line-height:1.5;color:#94A3B8;">
                  อีเมลนี้เป็นการแจ้งเตือนอัตโนมัติจากการลงทะเบียนเข้าร่วมกิจกรรมบริจาคโลหิต &middot; <a href="${appUrl}/lookup" style="color:#B91C1C;text-decoration:underline;">ตรวจสอบหรือยกเลิกการลงทะเบียน</a>
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

function buildReminderText(input: ConfirmationInput): string {
  const timeSlot = input.slot
    ? formatTimeRange(input.slot.startAt || input.slot.start_at || '', input.slot.endAt || input.slot.end_at || '')
    : '09:00 – 14:00 น.';
  const appUrl = getPublicAppUrl();
  const eventDate = input.eventDateLabel || 'พุธ 16 กันยายน 2569';
  const venue = input.venueName || 'ห้องประชุม 217 อาคารสิริวิทยา คณะเทคนิคการแพทย์ ม.มหิดล ศาลายา';
  const recipient = `${input.firstName} ${input.lastName}`;

  return `MUMT LoveUnit 2026 · เตือนความพร้อมก่อนวันบริจาคโลหิต (2 Days to Go!)
Faculty of Medical Technology, Mahidol University

สวัสดีคุณ ${recipient}

ขอเตือนรายละเอียดการนัดหมายของคุณ อีกเพียง 2 วันเท่านั้น! เตรียมร่างกายให้พร้อมแล้วมาพบกันตามรอบเวลาที่ท่านได้เลือกไว้

============================================================
ข้อมูลการนัดหมาย / Appointment Details
============================================================
• หมายเลขลงทะเบียน (Registration Code): ${input.registrationCode}
• รอบเวลาเดินทาง (Time Slot): ${timeSlot}
• วันจัดกิจกรรม (Event Date): ${eventDate}
• สถานที่จัดงาน (Venue): ${venue}

============================================================
เช็กลิสต์เตรียมความพร้อม 4 ข้อ / 4-Step Readiness Checklist
============================================================
1. อย่าลืมนำบัตรประชาชนมาด้วย (National ID Required) หรือบัตรผู้บริจาคตัวจริง
2. ดื่มน้ำ 3–4 แก้วก่อนมาถึงจุดรับบริจาค
3. พักผ่อนให้เพียงพอ 6–8 ชั่วโมง ไม่อดนอนในคืนก่อนวันบริจาค
4. รับประทานอาหารมื้อหลักล่วงหน้า (เลี่ยงอาหารมันจัดและแอลกอฮอล์)

เปิดดูตั๋วลงทะเบียนออนไลน์ของฉัน:
${appUrl}/registration/${encodeURIComponent(input.registrationCode)}

------------------------------------------------------------
คณะเทคนิคการแพทย์ มหาวิทยาลัยมหิดล
999 ถ.พุทธมณฑลสาย 4 ต.ศาลายา อ.พุทธมณฑล จ.นครปฐม 73170`;
}

export async function buildDonorPreparationReminderEmail(input: ConfirmationInput) {
  const qrImage = input.qrToken
    ? await QRCode.toBuffer(input.qrToken, { type: 'png', width: 400, margin: 2, errorCorrectionLevel: 'M' })
    : null;
  return {
    subject: `เตือนความพร้อมก่อนวันบริจาคโลหิต · MUMT LoveUnit · ${input.registrationCode}`,
    text: buildReminderText(input),
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
    const transporter = getTransporter();
    const email = await buildDonorConfirmationEmail(input);
    const appUrl = getPublicAppUrl();
    const fromAddress = process.env.SMTP_FROM || `MUMT Blood Donation 2026 <${process.env.SMTP_USER || 'mumt68blooddonation@gmail.com'}>`;
    const replyToAddress = process.env.SMTP_USER || 'mumt68blooddonation@gmail.com';

    await transporter.sendMail({
      from: fromAddress,
      to: input.to,
      replyTo: replyToAddress,
      headers: {
        'X-Auto-Response-Suppress': 'OOF, AutoReply',
        'Precedence': 'bulk',
        'List-Unsubscribe': `<${appUrl}/lookup>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
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
    const transporter = getTransporter();
    const email = await buildDonorPreparationReminderEmail(input);
    const appUrl = getPublicAppUrl();
    const fromAddress = process.env.SMTP_FROM || `MUMT Blood Donation 2026 <${process.env.SMTP_USER || 'mumt68blooddonation@gmail.com'}>`;
    const replyToAddress = process.env.SMTP_USER || 'mumt68blooddonation@gmail.com';

    await transporter.sendMail({
      from: fromAddress,
      to: input.to,
      replyTo: replyToAddress,
      headers: {
        'X-Auto-Response-Suppress': 'OOF, AutoReply',
        'Precedence': 'bulk',
        'List-Unsubscribe': `<${appUrl}/lookup>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
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

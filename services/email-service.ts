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

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || 'http://localhost:3000').replace(/\/$/, '');
  const eventDate = escapeHtml(input.eventDateLabel || 'พุธ 16 กันยายน 2569');
  const venue = escapeHtml(input.venueName || 'ห้องประชุม 217 อาคารสิริวิทยา คณะศิลปศาสตร์ ม.มหิดล ศาลายา');
  const recipient = escapeHtml(`${input.firstName} ${input.lastName}`);

  return `
  <div style="margin:0;padding:0;background:#F8F6F6;font-family:'Noto Sans Thai','Prompt','Segoe UI',Helvetica,Arial,sans-serif;color:#241B1D;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;table-layout:fixed;background:#F8F6F6;">
      <tr>
        <td align="center" style="padding:28px 12px;">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#FFFFFF;border-radius:18px;overflow:hidden;border:1px solid #E8DCD8;box-shadow:0 6px 20px rgba(56,6,15,0.06);">
            
            <!-- Red Gradient Hero Header (Symmetrical & Editorial) -->
            <tr>
              <td style="background:linear-gradient(135deg, #7E0E1D 0%, #6E101E 50%, #560D19 100%);background-color:#6E101E;padding:32px 28px;color:#FDF6F1;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td>
                      <p style="margin:0;font-size:11px;font-weight:800;letter-spacing:.08em;color:#EFDCD6;text-transform:uppercase;">
                        MUMT BLOOD DONATION 2026 &middot; คณะเทคนิคการแพทย์ ม.มหิดล
                      </p>
                      <h1 style="margin:8px 0 0;font-size:24px;line-height:1.3;font-weight:900;color:#FFFFFF;">
                        ยืนยันการลงทะเบียนบริจาคโลหิต
                      </h1>
                      <p style="margin:6px 0 0;font-size:13px;line-height:1.5;color:#FBE9EC;font-weight:600;">
                        Registration confirmed &middot; MUMT LoveUnit ครั้งที่ 9 (9th Edition)
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Content Area -->
            <tr>
              <td style="padding:28px 28px 24px;">
                
                <!-- Greeting -->
                <p style="margin:0;font-size:16px;line-height:1.6;color:#241B1D;">
                  สวัสดีคุณ <strong>${recipient}</strong>
                </p>
                <p style="margin:8px 0 22px;font-size:14px;line-height:1.65;color:#5F5558;">
                  การลงทะเบียนของคุณเรียบร้อยแล้ว! ข้อมูลการนัดหมายและบัตรดิจิทัลของคุณพร้อมใช้งาน โปรดแสดง QR Code หรือหมายเลขลงทะเบียนนี้เมื่อมาถึงจุดลงทะเบียนในวันงาน
                </p>

                <!-- Registration Code Highlight Box -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;table-layout:fixed;background:#FFF8F9;border:1px solid #F1D3D9;border-radius:14px;margin-bottom:24px;">
                  <tr>
                    <td style="padding:18px 20px;text-align:center;">
                      <p style="margin:0;font-size:11px;font-weight:800;letter-spacing:.08em;color:#6E101E;text-transform:uppercase;">
                        หมายเลขลงทะเบียน / Registration Code
                      </p>
                      <p style="margin:6px 0 0;font-family:monospace,'Courier New',Courier;font-size:28px;font-weight:900;letter-spacing:.06em;color:#560D19;">
                        ${escapeHtml(input.registrationCode)}
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- Symmetrical Appointment Details Table -->
                <p style="margin:0 0 10px;font-size:15px;font-weight:800;color:#241B1D;">
                  ข้อมูลการนัดหมาย / Appointment Details
                </p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;table-layout:fixed;border-top:1px solid #E8DCD8;font-size:14px;line-height:1.55;">
                  <tr>
                    <td style="width:36%;padding:11px 12px 11px 0;border-bottom:1px solid #E8DCD8;color:#5F5558;font-weight:700;vertical-align:top;">
                      วันจัดงาน <span style="font-size:11px;font-weight:normal;color:#7A6E71;">(Date)</span>
                    </td>
                    <td style="padding:11px 0;border-bottom:1px solid #E8DCD8;font-weight:800;color:#241B1D;word-break:break-word;">
                      ${eventDate}
                    </td>
                  </tr>
                  <tr>
                    <td style="width:36%;padding:11px 12px 11px 0;border-bottom:1px solid #E8DCD8;color:#5F5558;font-weight:700;vertical-align:top;">
                      เวลามาถึง <span style="font-size:11px;font-weight:normal;color:#7A6E71;">(Time Slot)</span>
                    </td>
                    <td style="padding:11px 0;border-bottom:1px solid #E8DCD8;font-weight:900;color:#6E101E;word-break:break-word;font-size:15px;">
                      ${timeSlot}
                    </td>
                  </tr>
                  <tr>
                    <td style="width:36%;padding:11px 12px 11px 0;border-bottom:1px solid #E8DCD8;color:#5F5558;font-weight:700;vertical-align:top;">
                      สถานที่ <span style="font-size:11px;font-weight:normal;color:#7A6E71;">(Venue)</span>
                    </td>
                    <td style="padding:11px 0;border-bottom:1px solid #E8DCD8;font-weight:700;color:#241B1D;word-break:break-word;">
                      ${venue}
                    </td>
                  </tr>
                </table>

                <!-- QR Code Section (Centered & Symmetrical) -->
                ${hasQrCode ? `
                <div style="margin:26px 0 0;text-align:center;background:#FBF8F8;border:1px solid #E8DCD8;border-radius:14px;padding:24px;">
                  <img src="cid:donor-qr-code" width="176" height="176" alt="QR Code สำหรับเช็กอิน" style="display:inline-block;background:#FFFFFF;border:4px solid #FFFFFF;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,0.06);" />
                  <p style="margin:14px 0 0;font-size:14px;line-height:1.5;font-weight:800;color:#241B1D;">
                    แสดง QR Code นี้เมื่อมาถึงจุดลงทะเบียน
                  </p>
                  <p style="margin:4px 0 0;font-size:12px;line-height:1.5;color:#5F5558;">
                    Present this QR Code to staff upon arrival
                  </p>
                </div>` : ''}

                <!-- Symmetrical 2x2 Preparation Tips Grid -->
                <div style="margin:26px 0 0;">
                  <p style="margin:0 0 10px;font-size:14px;font-weight:800;color:#241B1D;">
                    ข้อแนะนำการเตรียมตัว / Preparation Tips
                  </p>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;table-layout:fixed;border-collapse:separate;border-spacing:0 8px;">
                    <tr>
                      <td style="background:#FDF6F7;border:1px solid #F8DFE3;border-radius:10px;padding:12px 14px;font-size:13px;line-height:1.55;">
                        <strong style="color:#560D19;">🪪 1. อย่าลืมนำบัตรประชาชนมาด้วย (National ID)</strong><br />
                        <span style="color:#5F5558;font-size:12px;">หรือใช้บัตรผู้บริจาคโลหิตตัวจริง เพื่อยืนยันตัวตนหน้างาน</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="background:#FDF6F7;border:1px solid #F8DFE3;border-radius:10px;padding:12px 14px;font-size:13px;line-height:1.55;">
                        <strong style="color:#560D19;">💧 2. ดื่มน้ำล่วงหน้า 3–4 แก้ว (Hydration)</strong><br />
                        <span style="color:#5F5558;font-size:12px;">ช่วยระบบไหลเวียนโลหิตพร้อมและลดอาการวิงเวียน</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="background:#FDF6F7;border:1px solid #F8DFE3;border-radius:10px;padding:12px 14px;font-size:13px;line-height:1.55;">
                        <strong style="color:#560D19;">😴 3. นอนหลับพักผ่อนให้พอ 6–8 ชม. (Sound Sleep)</strong><br />
                        <span style="color:#5F5558;font-size:12px;">ไม่อดนอนในคืนก่อนวันบริจาค และงดแอลกอฮอล์</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="background:#FDF6F7;border:1px solid #F8DFE3;border-radius:10px;padding:12px 14px;font-size:13px;line-height:1.55;">
                        <strong style="color:#560D19;">🥗 4. รับประทานอาหารมื้อหลัก (Healthy Meal)</strong><br />
                        <span style="color:#5F5558;font-size:12px;">ทานอาหารล่วงหน้า 1–2 ชม. หลีกเลี่ยงอาหารไขมันสูง</span>
                      </td>
                    </tr>
                  </table>
                </div>

                <!-- Action Button -->
                <div style="margin:28px 0 0;text-align:center;">
                  <a href="${appUrl}/registration/${encodeURIComponent(input.registrationCode)}" style="display:inline-block;background:linear-gradient(135deg, #6E101E 0%, #560D19 100%);background-color:#6E101E;color:#FFFFFF;text-decoration:none;padding:14px 28px;border-radius:12px;font-size:14px;font-weight:800;letter-spacing:.02em;box-shadow:0 4px 12px rgba(110,16,30,0.25);">
                    เปิดตั๋วลงทะเบียนออนไลน์ / View Digital Pass &rarr;
                  </a>
                </div>

              </td>
            </tr>

            <!-- Symmetrical Footer -->
            <tr>
              <td style="background:#FAF7F7;border-top:1px solid #E8DCD8;padding:18px 28px;text-align:center;">
                <p style="margin:0;font-size:12px;font-weight:700;color:#5F5558;">
                  MUMT LoveUnit ครั้งที่ 9 &middot; คณะเทคนิคการแพทย์ มหาวิทยาลัยมหิดล
                </p>
                <p style="margin:4px 0 0;font-size:11px;line-height:1.5;color:#7A6E71;">
                  Faculty of Medical Technology, Mahidol University &middot; หากไม่ได้ลงทะเบียนด้วยอีเมลนี้ กรุณาเพิกเฉยอีเมลฉบับนี้
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
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

function buildReminderHtml(input: ConfirmationInput, hasQrCode: boolean): string {
  const timeSlot = input.slot
    ? formatTimeRange(input.slot.startAt || input.slot.start_at || '', input.slot.endAt || input.slot.end_at || '')
    : '09:00 – 14:00 น.';
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || 'http://localhost:3000').replace(/\/$/, '');
  const eventDate = escapeHtml(input.eventDateLabel || 'พุธ 16 กันยายน 2569');
  const venue = escapeHtml(input.venueName || 'ห้องประชุม 217 อาคารสิริวิทยา คณะศิลปศาสตร์ ม.มหิดล ศาลายา');
  const recipient = escapeHtml(`${input.firstName} ${input.lastName}`);

  return `
  <div style="margin:0;padding:0;background:#F8F6F6;font-family:'Noto Sans Thai','Prompt','Segoe UI',Helvetica,Arial,sans-serif;color:#241B1D;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;table-layout:fixed;background:#F8F6F6;">
      <tr>
        <td align="center" style="padding:28px 12px;">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#FFFFFF;border-radius:18px;overflow:hidden;border:1px solid #E8DCD8;box-shadow:0 6px 20px rgba(56,6,15,0.06);">
            
            <!-- Red Gradient Hero Header -->
            <tr>
              <td style="background:linear-gradient(135deg, #7E0E1D 0%, #6E101E 50%, #560D19 100%);background-color:#6E101E;padding:32px 28px;color:#FDF6F1;">
                <p style="margin:0;font-size:11px;font-weight:800;letter-spacing:.08em;color:#EFDCD6;text-transform:uppercase;">
                  MUMT BLOOD DONATION 2026 &middot; 2 Days to Go!
                </p>
                <h1 style="margin:8px 0 0;font-size:24px;line-height:1.3;font-weight:900;color:#FFFFFF;">
                  เตือนความพร้อมก่อนวันบริจาคโลหิต
                </h1>
                <p style="margin:6px 0 0;font-size:13px;line-height:1.5;color:#FBE9EC;font-weight:600;">
                  Preparation Reminder &middot; อีก 2 วันพบกันที่จุดลงทะเบียน
                </p>
              </td>
            </tr>

            <!-- Content Area -->
            <tr>
              <td style="padding:28px 28px 24px;">
                
                <!-- Greeting -->
                <p style="margin:0;font-size:16px;line-height:1.6;color:#241B1D;">
                  สวัสดีคุณ <strong>${recipient}</strong>
                </p>
                <p style="margin:8px 0 22px;font-size:14px;line-height:1.65;color:#5F5558;">
                  ขอเตือนรายละเอียดการนัดหมายของคุณ อีกเพียง 2 วันเท่านั้น! เตรียมร่างกายให้พร้อมแล้วมาพบกันตามรอบเวลาที่ท่านได้เลือกไว้
                </p>

                <!-- Appointment Details Table -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;table-layout:fixed;border-top:1px solid #E8DCD8;font-size:14px;line-height:1.55;margin-bottom:24px;">
                  <tr>
                    <td style="width:36%;padding:11px 12px 11px 0;border-bottom:1px solid #E8DCD8;color:#5F5558;font-weight:700;vertical-align:top;">
                      วันจัดงาน <span style="font-size:11px;font-weight:normal;color:#7A6E71;">(Date)</span>
                    </td>
                    <td style="padding:11px 0;border-bottom:1px solid #E8DCD8;font-weight:800;color:#241B1D;word-break:break-word;">
                      ${eventDate}
                    </td>
                  </tr>
                  <tr>
                    <td style="width:36%;padding:11px 12px 11px 0;border-bottom:1px solid #E8DCD8;color:#5F5558;font-weight:700;vertical-align:top;">
                      เวลามาถึง <span style="font-size:11px;font-weight:normal;color:#7A6E71;">(Time Slot)</span>
                    </td>
                    <td style="padding:11px 0;border-bottom:1px solid #E8DCD8;font-weight:900;color:#6E101E;word-break:break-word;font-size:15px;">
                      ${timeSlot}
                    </td>
                  </tr>
                  <tr>
                    <td style="width:36%;padding:11px 12px 11px 0;border-bottom:1px solid #E8DCD8;color:#5F5558;font-weight:700;vertical-align:top;">
                      สถานที่ <span style="font-size:11px;font-weight:normal;color:#7A6E71;">(Venue)</span>
                    </td>
                    <td style="padding:11px 0;border-bottom:1px solid #E8DCD8;font-weight:700;color:#241B1D;word-break:break-word;">
                      ${venue}
                    </td>
                  </tr>
                  <tr>
                    <td style="width:36%;padding:11px 12px 11px 0;border-bottom:1px solid #E8DCD8;color:#5F5558;font-weight:700;vertical-align:top;">
                      หมายเลขลงทะเบียน <span style="font-size:11px;font-weight:normal;color:#7A6E71;">(Code)</span>
                    </td>
                    <td style="padding:11px 0;border-bottom:1px solid #E8DCD8;font-family:monospace,'Courier New',Courier;font-weight:900;color:#560D19;font-size:16px;word-break:break-word;">
                      ${escapeHtml(input.registrationCode)}
                    </td>
                  </tr>
                </table>

                <!-- 4-Step Checklist Cards -->
                <div style="margin:20px 0 0;">
                  <p style="margin:0 0 10px;font-size:15px;font-weight:800;color:#241B1D;">
                    เช็กลิสต์เตรียมความพร้อม 4 ข้อ / 4-Step Readiness Checklist
                  </p>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;table-layout:fixed;border-collapse:separate;border-spacing:0 8px;">
                    <tr>
                      <td style="background:#FFF5F6;border-left:4px solid #6E101E;border-top:1px solid #F8DFE3;border-right:1px solid #F8DFE3;border-bottom:1px solid #F8DFE3;border-radius:0 10px 10px 0;padding:12px 16px;font-size:13px;line-height:1.55;">
                        <strong style="color:#560D19;">🪪 1. อย่าลืมนำบัตรประชาชนมาด้วย (ID Card Required)</strong><br />
                        <span style="color:#5F5558;font-size:12px;">หรือใช้บัตรผู้บริจาคโลหิต จำเป็นต้องใช้ยืนยันตัวตน</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="background:#FFF5F6;border-left:4px solid #6E101E;border-top:1px solid #F8DFE3;border-right:1px solid #F8DFE3;border-bottom:1px solid #F8DFE3;border-radius:0 10px 10px 0;padding:12px 16px;font-size:13px;line-height:1.55;">
                        <strong style="color:#560D19;">😴 2. นอนหลับพักผ่อน 6–8 ชั่วโมง (Good Sleep)</strong><br />
                        <span style="color:#5F5558;font-size:12px;">ไม่อดนอนในคืนก่อนวันบริจาค เพื่อความพร้อมของร่างกาย</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="background:#FFF5F6;border-left:4px solid #6E101E;border-top:1px solid #F8DFE3;border-right:1px solid #F8DFE3;border-bottom:1px solid #F8DFE3;border-radius:0 10px 10px 0;padding:12px 16px;font-size:13px;line-height:1.55;">
                        <strong style="color:#560D19;">🍳 3. ทานอาหารมื้อหลักก่อนมา (Eat a Healthy Meal)</strong><br />
                        <span style="color:#5F5558;font-size:12px;">รับประทานอาหารล่วงหน้า 1–2 ชม. หลีกเลี่ยงอาหารมันจัดและหวานจัด</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="background:#FFF5F6;border-left:4px solid #6E101E;border-top:1px solid #F8DFE3;border-right:1px solid #F8DFE3;border-bottom:1px solid #F8DFE3;border-radius:0 10px 10px 0;padding:12px 16px;font-size:13px;line-height:1.55;">
                        <strong style="color:#560D19;">💧 4. ดื่มน้ำ 3–4 แก้วก่อนมาถึง (Drink Plenty of Water)</strong><br />
                        <span style="color:#5F5558;font-size:12px;">ช่วยให้ระบบไหลเวียนโลหิตดีขึ้นและลดอาการอ่อนเพลีย</span>
                      </td>
                    </tr>
                  </table>
                </div>

                <!-- QR Code Preview -->
                ${hasQrCode ? `
                <div style="margin:26px 0 0;text-align:center;background:#FBF8F8;border:1px solid #E8DCD8;border-radius:14px;padding:24px;">
                  <img src="cid:donor-reminder-qr-code" width="176" height="176" alt="QR Code สำหรับเช็กอิน" style="display:inline-block;background:#FFFFFF;border:4px solid #FFFFFF;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,0.06);" />
                  <p style="margin:14px 0 0;font-size:14px;line-height:1.5;font-weight:800;color:#241B1D;">
                    แสดง QR Code นี้เมื่อมาถึงจุดลงทะเบียน
                  </p>
                  <p style="margin:4px 0 0;font-size:12px;line-height:1.5;color:#5F5558;">
                    Present this QR Code to staff upon arrival
                  </p>
                </div>` : ''}

                <!-- Action Button -->
                <div style="margin:28px 0 0;text-align:center;">
                  <a href="${appUrl}/registration/${encodeURIComponent(input.registrationCode)}" style="display:inline-block;background:linear-gradient(135deg, #6E101E 0%, #560D19 100%);background-color:#6E101E;color:#FFFFFF;text-decoration:none;padding:14px 28px;border-radius:12px;font-size:14px;font-weight:800;letter-spacing:.02em;box-shadow:0 4px 12px rgba(110,16,30,0.25);">
                    เปิดตั๋วลงทะเบียนของฉัน / Open My Pass &rarr;
                  </a>
                </div>

              </td>
            </tr>

            <!-- Symmetrical Footer -->
            <tr>
              <td style="background:#FAF7F7;border-top:1px solid #E8DCD8;padding:18px 28px;text-align:center;">
                <p style="margin:0;font-size:12px;font-weight:700;color:#5F5558;">
                  MUMT LoveUnit ครั้งที่ 9 &middot; คณะเทคนิคการแพทย์ มหาวิทยาลัยมหิดล
                </p>
                <p style="margin:4px 0 0;font-size:11px;line-height:1.5;color:#7A6E71;">
                  Faculty of Medical Technology, Mahidol University &middot; แล้วพบกันในวันงาน
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </div>`;
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

/** Sends the scheduled preparation reminder without affecting donor registration state. */
export async function sendDonorPreparationReminder(input: ConfirmationInput): Promise<EmailDeliveryResult> {
  if (!input.to) return { status: 'skipped', reason: 'missing-recipient' };

  if (!isSmtpConfigured()) {
    console.log(`[email] SMTP not configured — skipping preparation reminder to ${input.to}`);
    return { status: 'skipped', reason: 'smtp-not-configured' };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    const email = await buildDonorPreparationReminderEmail(input);
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'MUMT Blood Donation 2026 <noreply@loveunit.local>',
      to: input.to,
      ...email,
    });
    return { status: 'sent' };
  } catch (error) {
    console.error('[email] Failed to send preparation reminder:', error);
    return { status: 'failed', error: error instanceof Error ? error.message : 'Unknown SMTP error' };
  }
}

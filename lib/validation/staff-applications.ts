import { z } from 'zod';

export const DEFAULT_STAFF_PASSWORD = 'loveunit2026';

export const staffApplicationSubmissionSchema = z.object({
  email: z.string().trim().email('กรุณากรอกอีเมลให้ถูกต้อง').max(255),
  displayName: z.string().trim().min(2, 'Username ต้องมีอย่างน้อย 2 ตัวอักษร').max(160, 'Username ยาวเกินไป'),
  team: z.string().trim().min(2, 'กรุณากรอกหน่วยงาน').max(160, 'ชื่อหน่วยงานยาวเกินไป'),
});

export const staffApplicationApprovalSchema = z.object({
  initialPassword: z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร').max(128).optional(),
});

export const staffApplicationRejectionSchema = z.object({
  reason: z.string().trim().min(1, 'กรุณาระบุเหตุผลการปฏิเสธ').max(500, 'เหตุผลยาวเกินไป'),
});

export type StaffApplicationSubmissionInput = z.infer<typeof staffApplicationSubmissionSchema>;



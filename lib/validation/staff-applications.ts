import { z } from 'zod';

export const staffApplicationSubmissionSchema = z.object({
  email: z.string().trim().email('กรุณากรอกอีเมลให้ถูกต้อง').max(255),
  displayName: z.string().trim().min(2, 'กรุณากรอกชื่อ-นามสกุล').max(160, 'ชื่อยาวเกินไป'),
  team: z.string().trim().min(2, 'กรุณากรอกหน่วยงาน').max(160, 'ชื่อหน่วยงานยาวเกินไป'),
});

export const staffApplicationApprovalSchema = z.object({
  initialPassword: z.string().min(8, 'รหัสผ่านเริ่มต้นต้องมีอย่างน้อย 8 ตัวอักษร').max(128),
});

export const staffApplicationRejectionSchema = z.object({
  reason: z.string().trim().min(1, 'กรุณาระบุเหตุผลการปฏิเสธ').max(500, 'เหตุผลยาวเกินไป'),
});

export type StaffApplicationSubmissionInput = z.infer<typeof staffApplicationSubmissionSchema>;

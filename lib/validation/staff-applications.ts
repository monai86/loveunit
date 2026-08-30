import { z } from 'zod';

export const staffApplicationSubmissionSchema = z.object({
  email: z.string().trim().email('กรุณากรอกอีเมลให้ถูกต้อง').max(255),
  displayName: z.string().trim().min(2, 'Username ต้องมีอย่างน้อย 2 ตัวอักษร').max(160, 'Username ยาวเกินไป'),
  team: z.string().trim().min(2, 'กรุณากรอกหน่วยงาน').max(160, 'ชื่อหน่วยงานยาวเกินไป'),
  password: z.string()
    .min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')
    .max(128, 'รหัสผ่านยาวเกินไป')
    .regex(/[A-Z]/, 'รหัสผ่านต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว (A-Z)')
    .regex(/[a-z]/, 'รหัสผ่านต้องมีตัวพิมพ์เล็กอย่างน้อย 1 ตัว (a-z)')
    .regex(/[0-9]/, 'รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว (0-9)'),
});

export const staffApplicationApprovalSchema = z.object({
  initialPassword: z.string().min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร').max(128).optional(),
});

export const staffApplicationRejectionSchema = z.object({
  reason: z.string().trim().min(1, 'กรุณาระบุเหตุผลการปฏิเสธ').max(500, 'เหตุผลยาวเกินไป'),
});

export type StaffApplicationSubmissionInput = z.infer<typeof staffApplicationSubmissionSchema>;


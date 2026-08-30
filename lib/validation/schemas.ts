// Zod Validation Schemas

import { z } from 'zod';

export const publicRegistrationSchema = z.object({
  firstName: z.string().min(1, 'กรุณากรอกชื่อจริง').max(100, 'ชื่อยาวเกินไป'),
  lastName: z.string().min(1, 'กรุณากรอกนามสกุล').max(100, 'นามสกุลยาวเกินไป'),
  phone: z.string().min(9, 'กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง').max(15).refine((val) => {
    const cleaned = val.replace(/\D/g, '');
    return cleaned.length === 10 && cleaned.startsWith('0');
  }, 'กรุณากรอกเบอร์โทรศัพท์มือถือ 10 หลัก (เช่น 0812345678)'),
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง').optional().or(z.literal('')),
  participantType: z.enum(['STUDENT', 'STAFF', 'GENERAL_PUBLIC'], {
    message: 'กรุณาเลือกประเภทผู้เข้าร่วม',
  }),
  faculty: z.string().optional(),
  academicYear: z.string().optional(),
  donationExperience: z.enum(['FIRST_TIME', 'RETURNING'], {
    message: 'กรุณาเลือกประสบการณ์การบริจาค',
  }),
  slotId: z.string().optional(),
  source: z.enum(['ONLINE', 'WALK_IN']).optional(),
  privacyAccepted: z.literal(true, {
    message: 'กรุณายอมรับประกาศความเป็นส่วนตัวเพื่อดำเนินการต่อ',
  }),
});

export type PublicRegistrationInput = z.infer<typeof publicRegistrationSchema>;

// Admins may correct donor profile data, but cannot change queue state or slot
// assignment through this endpoint (those flows affect capacity and waitlists).
export const adminRegistrationUpdateSchema = publicRegistrationSchema
  .omit({ slotId: true, privacyAccepted: true })
  .extend({ email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง').nullable().optional() });

export type AdminRegistrationUpdateInput = z.infer<typeof adminRegistrationUpdateSchema>;

export const walkInRegistrationSchema = z.object({
  firstName: z.string().min(1, 'กรุณากรอกชื่อจริง'),
  lastName: z.string().min(1, 'กรุณากรอกนามสกุล'),
  phone: z.string().min(9, 'กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง'),
  participantType: z.enum(['STUDENT', 'STAFF', 'GENERAL_PUBLIC']),
  faculty: z.string().optional(),
  academicYear: z.string().optional(),
  donationExperience: z.enum(['FIRST_TIME', 'RETURNING']),
});

export type WalkInRegistrationInput = z.infer<typeof walkInRegistrationSchema>;

export const eventContentBlockSchema = z.object({
  title: z.string().min(1, 'กรุณากรอกหัวข้อ'),
  description: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  altText: z.string().nullable().optional(),
  displayOrder: z.number().int().default(0),
  isVisible: z.boolean().default(true),
});

export type EventContentBlockInput = z.infer<typeof eventContentBlockSchema>;

export const timeSlotSchema = z.object({
  startAt: z.string().min(1, 'กรุณาเลือกเวลาเริ่มต้น'),
  endAt: z.string().min(1, 'กรุณาเลือกเวลาสิ้นสุด'),
  capacity: z.number().int().min(1, 'จำนวนความจุต้องอย่างน้อย 1 คน'),
  isActive: z.boolean().default(true),
});

export type TimeSlotInput = z.infer<typeof timeSlotSchema>;

export const staffLoginSchema = z.object({
  email: z.string().email('กรุณากรอกอีเมลให้ถูกต้อง'),
  password: z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
});

export type StaffLoginInput = z.infer<typeof staffLoginSchema>;

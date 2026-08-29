# [Redesign] Donor Ticket Pass & Transactional Email Templates

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the donor registration ticket pass component and both donor emails (Registration Confirmation & September 14 Preparation Reminder) with a delightful playful yet orderly aesthetic, rich red gradient surfaces, bilingual Thai & English typography, and clear health preparation checklists.

**Architecture:** 
- `DonorTicketPass.tsx`: Upgraded with a premium ticket-stub aesthetic, playful badge chips (`❤️ Blood Hero / ฮีโร่ผู้ให้`, `✨ ครั้งที่ 9 / 9th Edition`), dual-language labels, clear icons, and a Canvas exporter with gradient styling.
- `services/email-service.ts`: Upgraded with bulletproof, responsive, 600px table-based email layouts with inline red gradients (`linear-gradient(135deg, #8E1424, #6E101E, #460A14)`), friendly emoji accents, bilingual appointment grids, and visual 3-step & 4-step prep cards.
- Test suites: Updated to assert bilingual content, accessibility compliance, and structural email safety.

**Tech Stack:** React 19, Next.js 16, Tailwind CSS, Canvas API, Nodemailer / HTML Email, TypeScript, Node.js Test Runner.

---

### Task 1: Redesign Donor Ticket Pass Component (`DonorTicketPass.tsx`)

**Files:**
- Modify: `components/ui/DonorTicketPass.tsx`
- Test: `tests/donor-ticket.test.tsx`

- [ ] **Step 1: Update donor ticket unit test to verify bilingual & playful elements**
- [ ] **Step 2: Implement playful red gradient header, bilingual labels, and preparation cards in `DonorTicketPass.tsx`**
- [ ] **Step 3: Run `npx tsx tests/donor-ticket.test.tsx` to verify test passes**
- [ ] **Step 4: Commit ticket pass changes**

### Task 2: Redesign Confirmation Email Template (`services/email-service.ts`)

**Files:**
- Modify: `services/email-service.ts`
- Test: `tests/email.test.ts`

- [ ] **Step 1: Update confirmation email assertions in `tests/email.test.ts`**
- [ ] **Step 2: Implement bilingual red-gradient confirmation email in `services/email-service.ts`**
- [ ] **Step 3: Run `npx tsx tests/email.test.ts` to verify confirmation email passes**
- [ ] **Step 4: Commit confirmation email template**

### Task 3: Redesign Preparation Reminder Email Template (`services/email-service.ts`)

**Files:**
- Modify: `services/email-service.ts`
- Test: `tests/email.test.ts`

- [ ] **Step 1: Update reminder email assertions in `tests/email.test.ts`**
- [ ] **Step 2: Implement playful 2-day reminder email with 4-step health checklist in `services/email-service.ts`**
- [ ] **Step 3: Run `npx tsx tests/email.test.ts` to verify reminder email passes**
- [ ] **Step 4: Commit reminder email template**

### Task 4: Verification & Regression Testing

**Files:**
- Test: All unit test suites, db integration, TypeScript compile, build check.

- [ ] **Step 1: Run `npm test`**
- [ ] **Step 2: Run `npm run test:db`**
- [ ] **Step 3: Run `npx tsc --noEmit`**
- [ ] **Step 4: Run `npm run build`**
- [ ] **Step 5: Git push to `main` and check GitHub Actions status**

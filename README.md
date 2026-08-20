# Prescripto — Online Prescription Platform

A full-stack platform where patients can consult doctors online and doctors can review consultations and issue digital prescriptions (with PDF generation).

- **Frontend:** Next.js (App Router, TypeScript), TanStack Query, Axios, Zod, React Hook Form, shadcn/ui, Sonner (toasts)
- **Backend:** Express (running on Bun), Mongoose (MongoDB), Zod, JWT auth, Multer (uploads), PDFKit, `qrcode`, `express-rate-limit`
- **Database:** MongoDB
- **Storage:** Cloudinary (profile images and generated prescription PDFs)

---

## 1. Project Structure

```
idea-magix/
├── backend/                 # Express API (Bun runtime)
│   ├── src/
│   │   ├── config/          # env, db connection, cloudinary client
│   │   ├── constants/        # shared constants (cookie opts, regexes, OTP/consultation limits)
│   │   ├── models/          # Mongoose schemas (Doctor, Patient, Consultation, Prescription)
│   │   ├── schemas/         # Zod request-validation schemas (incl. shared pagination schema)
│   │   ├── controllers/     # Route handlers (thin, call services)
│   │   ├── services/        # Business logic (auth, cloudinary, email, consultation, prescription, doctor)
│   │   ├── middleware/      # auth, requireVerified, upload (multer), rate limiters, error handler
│   │   ├── routes/          # Express routers
│   │   ├── utils/           # jwt, password hashing, PDF generator, QR generator, OTP
│   │   ├── types/           # shared backend types
│   │   ├── app.ts           # Express app wiring
│   │   └── server.ts        # entry point
│   └── uploads/              # unused at runtime now (Cloudinary holds everything); kept for local dev scratch space
│
└── frontend/                # Next.js App Router app
    └── src/
        ├── app/              # routes (see section 3), incl. doctor/patient verify-otp pages
        ├── components/
        │   ├── ui/           # shadcn/ui primitives
        │   ├── shared/       # navbar, profile-image-upload, illness-tag-input, button-link, otp-verification-form, pdf-preview-dialog
        │   ├── doctor/       # doctor-only components
        │   └── patient/      # patient-only components
        ├── hooks/            # TanStack Query hooks (use-auth, use-doctors, use-consultations, use-prescriptions, use-upload, use-require-role)
        ├── services/         # Axios API-call wrappers (one per resource)
        ├── providers/        # QueryClientProvider, SessionProvider (auth state)
        ├── lib/
        │   ├── validation/   # Zod schemas for client-side form validation
        │   └── constants/    # e.g. doctor specialties list
        └── types/            # shared frontend types
```

---

## 2. Running locally

### Prerequisites
- [Bun](https://bun.sh) installed
- A MongoDB instance (local or Atlas)

### Backend

```bash
cd backend
bun install
cp .env.example .env   # edit MONGODB_URI etc. if needed
bun run dev             # http://localhost:5000
```

### Frontend

```bash
cd frontend
bun install
cp .env.example .env.local
bun run dev              # http://localhost:3000
```

The frontend expects the API at `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:5000/api`). All uploaded/generated assets (profile images, prescription PDFs, payment QR codes) are served directly from Cloudinary or embedded inline — there's no local asset URL to configure anymore.

The backend requires Cloudinary credentials (`CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`) to boot — see `backend/.env.example`. `RESEND_API_KEY` is optional in development (OTP emails fall back to a Nodemailer Ethereal sandbox with a preview link printed to the console) but required in production.

---

## 3. Routes / Pages

### Frontend (Next.js)

| Route | Description |
|---|---|
| `/` | Landing page — choose Doctor or Patient |
| `/doctor/signup` | Doctor sign-up (profile picture, name, specialty picked from a fixed list + "Other", email, phone, years of experience) |
| `/doctor/signin` | Doctor sign-in |
| `/doctor/verify-otp` | Enter the 6-digit code emailed on signup; required before sensitive actions are unlocked |
| `/doctor/profile` | Doctor's profile + link to prescriptions |
| `/doctor/prescriptions` | Paginated list of consultations submitted by patients |
| `/doctor/prescriptions/[consultationId]` | Consultation details + write/edit/send prescription (generates & regenerates PDF, preview/download via Cloudinary) |
| `/patient/signup` | Patient sign-up (profile picture, name, age, email, phone, surgery history, illness history) |
| `/patient/signin` | Patient sign-in |
| `/patient/verify-otp` | Enter the 6-digit code emailed on signup; required before sensitive actions are unlocked |
| `/patient/doctors` | Paginated grid of doctor cards → Consult |
| `/patient/consult/[doctorId]` | 3-step consultation form (illness/surgery → family history → QR payment, QR rendered inline as a base64 image) |
| `/patient/prescriptions` | Prescriptions sent to the patient (preview/download PDF) |

### Backend (Express, prefixed with `/api`)

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/auth/doctor/signup` | — | Create doctor account |
| POST | `/auth/doctor/signin` | — | Doctor login |
| POST | `/auth/patient/signup` | — | Create patient account |
| POST | `/auth/patient/signin` | — | Patient login |
| POST | `/auth/logout` | — | Clear session cookie |
| GET | `/auth/me` | any | Get current logged-in doctor/patient |
| POST | `/auth/verify-otp` | any | Verify the emailed 6-digit OTP, sets `isVerified` |
| POST | `/auth/resend-otp` | any | Resend the OTP (rate-limited, cooldown enforced) |
| GET | `/doctors` | patient + verified | Paginated doctor list (`?page`, `?limit`) |
| GET | `/doctors/:id` | patient + verified | Get one doctor |
| GET | `/consultations/payment-qr/:doctorId` | patient + verified | Get a payment QR code for a consultation (inline base64, not persisted) |
| POST | `/consultations` | patient + verified | Submit a consultation |
| GET | `/consultations/mine` | patient | Patient's own consultations |
| GET | `/consultations/doctor/mine` | doctor | Doctor's received consultations |
| GET | `/consultations/:id` | doctor/patient | Consultation details |
| POST | `/prescriptions` | doctor + verified | Create prescription (generates PDF, uploads to Cloudinary) |
| PUT | `/prescriptions/:id` | doctor + verified | Edit prescription (regenerates PDF, replaces the Cloudinary asset, resets "sent") |
| POST | `/prescriptions/:id/send` | doctor + verified | Send/resend prescription to patient |
| GET | `/prescriptions/mine` | patient | Prescriptions sent to the patient |
| GET | `/prescriptions/consultation/:consultationId` | doctor/patient | Prescription for one consultation |
| GET | `/prescriptions/:id` | doctor/patient | Prescription details |
| POST | `/uploads/profile-image` | — | Upload a profile image to Cloudinary (multipart, JPEG/PNG/WebP only, 5MB max) |
| DELETE | `/uploads/profile-image` | — | Delete a profile image from Cloudinary by `publicId` |

Routes marked "+ verified" also run `requireVerified()`, which blocks unverified accounts (see OTP notes below). Profile images and generated prescription PDFs both live in Cloudinary; nothing is served from local disk anymore — payment QR codes are generated on the fly and returned inline as base64 data URLs. Every route sits behind a `generalLimiter`, plus tighter per-route limiters (`authLimiter`, `otpLimiter`, `uploadLimiter`, `paymentQrLimiter`, `createConsultationLimiter`) defined in `backend/src/middleware/rateLimit.ts`.

---

## 4. Notes on implementation

- **Auth**: JWT issued on signup/signin, stored in an httpOnly cookie and also returned in the response body (used by the frontend as a `Bearer` fallback / for cross-origin dev setups). Auth/OTP endpoints are additionally rate-limited (`authLimiter`, `otpLimiter`).
- **Validation**: Zod schemas exist on both sides — the backend re-validates everything server-side (`src/schemas/*`) regardless of client-side validation, since the client cannot be trusted. Route params expected to be Mongo ObjectIds are validated before hitting the database. Pagination query params (`page`, `limit`) share one `paginationQuerySchema` (`backend/src/schemas/shared.schema.ts`), used by the doctors list and other listing endpoints.
- **Illness history**: stored as a `string[]` in MongoDB, entered as a comma-separated field in the UI and rendered as badges in a panel.
- **Payment**: no real payment gateway is integrated — a QR code encoding a mock UPI payment string is generated per doctor/consultation and returned as an inline base64 data URL (`backend/src/utils/qrCode.ts`, `qrcode` package) so nothing is written to disk; the patient records the transaction ID they used.
- **Prescription PDF**: generated with PDFKit as an in-memory buffer (`backend/src/utils/pdfGenerator.ts`) on prescription create/update and uploaded straight to Cloudinary (`cloudinaryFolders.prescriptions`, resource type `raw`) via `cloudinaryService.addPrescriptionPdf`. The doctor can preview/download it, send/resend it to the patient (flips `sentToPatient` + `sentAt`), or edit it (which regenerates the PDF, replaces the Cloudinary asset, and resets the "sent" flag until resent). The frontend's `PdfPreviewDialog` component opens the Cloudinary URL in a new tab for preview and forces a download under a meaningful filename instead of Cloudinary's random public ID.
- **Profile images**: uploaded via Multer (buffered in memory, never written to disk), validated server-side for MIME type (JPEG/PNG/WebP only) and a 5MB size cap, then streamed to Cloudinary through `backend/src/services/cloudinary.service.ts` (`addProfileImage` / `deleteProfileImage`). All uploads live under a dedicated `CLOUDINARY_FOLDER/profiles` folder (configured in `backend/src/config/cloudinary.ts`) so they stay isolated from anything else in the same Cloudinary account. When a user swaps their photo before submitting a form, the previous upload is deleted from Cloudinary in the background.
- **OTP email verification**: a 6-digit code is emailed after signup (via Resend in production, a Nodemailer Ethereal sandbox in development — see `backend/src/services/email.service.ts`). The frontend's `/doctor/verify-otp` and `/patient/verify-otp` pages (shared `OtpVerificationForm` component) collect the code, with a resend button gated by a cooldown anchored to a wall-clock deadline in `localStorage` so a refresh doesn't reset the timer. Sensitive actions (listing/viewing doctors, submitting a consultation, requesting a payment QR, creating/editing/sending a prescription) are gated server-side behind `isVerified` via the `requireVerified()` middleware, and client-side via the `use-require-role` hook.
- **Pagination**: doctors (`GET /doctors`), consultations (`/consultations/mine`, `/consultations/doctor/mine`), and prescriptions (`/prescriptions/mine`) are all paginated with `page`/`limit` query params, returning `{ data, pagination: { page, limit, total, totalPages } }`.
- **Rate limiting**: `express-rate-limit` is applied globally (`generalLimiter`, 300 req/15min) plus tighter limiters on auth, OTP, uploads, payment-QR generation, and consultation creation (`backend/src/middleware/rateLimit.ts`), each returning a `429` with a consistent JSON error body.
- **Error handling**: controllers throw plain `Error`s (no more custom `ApiError` class) and rely on the centralized `errorHandler` middleware to shape the response.

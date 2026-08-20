# Prescripto — Online Prescription Platform

A full-stack platform where patients can consult doctors online and doctors can review consultations and issue digital prescriptions (with PDF generation).

- **Frontend:** Next.js (App Router, TypeScript), TanStack Query, Axios, Zod, React Hook Form, shadcn/ui, Sonner (toasts)
- **Backend:** Express (running on Bun), Mongoose (MongoDB), Zod, JWT auth, Multer (uploads), PDFKit, `qrcode`, `express-rate-limit`
- **Database:** MongoDB
- **Storage:** pluggable — local disk (used in production, on Render) or an S3-compatible bucket (MinIO via Docker Compose, for local/self-hosted setups). See [Storage](#storage) below.

---

## 1. Project Structure

```
idea-magix/
├── docker-compose.yml        # mongodb + minio + backend, for local/self-hosted use (see Storage section)
├── backend/                 # Express API (Bun runtime)
│   ├── src/
│   │   ├── config/          # env, db connection
│   │   ├── constants/        # shared constants (cookie opts, regexes, OTP/consultation limits)
│   │   ├── models/          # Mongoose schemas (Doctor, Patient, Consultation, Prescription)
│   │   ├── schemas/         # Zod request-validation schemas (incl. shared pagination schema)
│   │   ├── controllers/     # Route handlers (thin, call services)
│   │   ├── services/        # Business logic (auth, storage, email, consultation, prescription, doctor)
│   │   ├── middleware/      # auth, requireVerified, upload (multer), rate limiters, error handler
│   │   ├── routes/          # Express routers
│   │   ├── utils/           # jwt, password hashing, PDF generator, QR generator, OTP
│   │   ├── types/           # shared backend types
│   │   ├── app.ts           # Express app wiring
│   │   └── server.ts        # entry point
│   ├── Dockerfile            # backend container image (Bun runtime)
│   └── uploads/               # written to when STORAGE_DRIVER=local, served at /uploads
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

The frontend expects the API at `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:5000/api`). Payment QR codes are generated on the fly and embedded inline as base64 data URLs. Profile images and prescription PDFs are served from wherever `STORAGE_DRIVER` points — see [Storage](#storage) below.

`RESEND_API_KEY` is optional in development (OTP emails fall back to a Nodemailer Ethereal sandbox with a preview link printed to the console) but required in production.

### Running with Docker (backend + MongoDB + MinIO)

For local/self-hosted use, `docker-compose.yml` at the repo root spins up MongoDB, [MinIO](https://min.io) (S3-compatible object storage), and the backend, wired together automatically:

```bash
cd backend && cp .env.example .env   # fill in JWT_SECRET at least
cd ..
docker compose up --build
```

This starts the backend on `http://localhost:5000` with `STORAGE_DRIVER=s3` pointed at the local MinIO instance (bucket `prescripto`, console at `http://localhost:9001`, login `minioadmin` / `minioadmin`). `MONGODB_URI` and the `S3_*` vars are overridden by `docker-compose.yml` to target the containerized services; everything else (`JWT_SECRET`, `RESEND_API_KEY`, etc.) comes from `backend/.env`.

> Whenever you start the project via Docker (either method below), the backend container reads its config from `backend/.env` — not `.env.local` or anything else. **Copy `backend/.env.example` to `backend/.env` and fill it in before running `docker compose up` or `docker build`/`docker run`.**

### Running just the backend container (plain Docker, no Compose)

If you already have MongoDB (and, if using S3 storage, a bucket) running elsewhere and just want the backend in a container:

```bash
cd backend
cp .env.example .env   # fill in MONGODB_URI, JWT_SECRET, and storage vars for your setup
docker build -t prescripto-backend .
docker run --rm -p 5000:5000 --env-file .env prescripto-backend
```

Unlike `docker-compose.yml`, this doesn't override any env vars for you — `backend/.env` needs to point `MONGODB_URI` (and `S3_*`, if `STORAGE_DRIVER=s3`) at services reachable from inside the container (e.g. `host.docker.internal` instead of `localhost` if they're running on your host machine).

### Restoring the database dump

A dump of the `prescripto` database (produced with `mongodump`) is included with this submission. To load it into your own MongoDB instance, install [MongoDB Database Tools](https://www.mongodb.com/try/download/database-tools) (adds `mongorestore`) and run:

```bash
mongorestore --uri="<your-mongodb-uri>" dump/
```

This recreates the `doctors`, `patients`, `consultations`, and `prescriptions` collections with the same data used while testing this submission.

---

## Storage

Where profile images and generated prescription PDFs are written is controlled by `STORAGE_DRIVER` (`backend/src/services/storage.service.ts`, `backend/src/config/env.ts`):

- **`local`** (default) — writes to disk under `STORAGE_LOCAL_DIR` (default `uploads/`), served back at `/uploads/...`. This is what runs in production on [Render](https://render.com), since the project isn't deployed via `docker-compose` there.
- **`s3`** — writes to an S3-compatible bucket via `@aws-sdk/client-s3` (`S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`, `S3_PUBLIC_URL`, `S3_FORCE_PATH_STYLE`). Used with MinIO in `docker-compose.yml` for local/self-hosted setups; also works against real S3-compatible providers.

The project previously used Cloudinary for both. It was dropped because the free-tier credits ran out; local disk / MinIO don't have that limitation and keep the deployment self-contained.

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
| `/doctor/prescriptions/[consultationId]` | Consultation details + write/edit/send prescription (generates & regenerates PDF, preview/download via storage) |
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
| POST | `/prescriptions` | doctor + verified | Create prescription (generates PDF, uploads to storage) |
| PUT | `/prescriptions/:id` | doctor + verified | Edit prescription (regenerates PDF, replaces the stored asset, resets "sent") |
| POST | `/prescriptions/:id/send` | doctor + verified | Send/resend prescription to patient |
| GET | `/prescriptions/mine` | patient | Prescriptions sent to the patient |
| GET | `/prescriptions/consultation/:consultationId` | doctor/patient | Prescription for one consultation |
| GET | `/prescriptions/:id` | doctor/patient | Prescription details |
| POST | `/uploads/profile-image` | — | Upload a profile image to storage (multipart, JPEG/PNG/WebP only, 5MB max) |
| DELETE | `/uploads/profile-image` | — | Delete a profile image from storage by `publicId` |

Routes marked "+ verified" also run `requireVerified()`, which blocks unverified accounts (see OTP notes below). Profile images and generated prescription PDFs are written through the storage service — see [Storage](#storage); payment QR codes are generated on the fly and returned inline as base64 data URLs. Every route sits behind a `generalLimiter`, plus tighter per-route limiters (`authLimiter`, `otpLimiter`, `uploadLimiter`, `paymentQrLimiter`, `createConsultationLimiter`) defined in `backend/src/middleware/rateLimit.ts`.

---

## 4. Notes on implementation

- **Auth**: JWT issued on signup/signin, stored in an httpOnly cookie and also returned in the response body (used by the frontend as a `Bearer` fallback / for cross-origin dev setups). Auth/OTP endpoints are additionally rate-limited (`authLimiter`, `otpLimiter`).
- **Validation**: Zod schemas exist on both sides — the backend re-validates everything server-side (`src/schemas/*`) regardless of client-side validation, since the client cannot be trusted. Route params expected to be Mongo ObjectIds are validated before hitting the database. Pagination query params (`page`, `limit`) share one `paginationQuerySchema` (`backend/src/schemas/shared.schema.ts`), used by the doctors list and other listing endpoints.
- **Illness history**: stored as a `string[]` in MongoDB, entered as a comma-separated field in the UI and rendered as badges in a panel.
- **Payment**: no real payment gateway is integrated — a QR code encoding a mock UPI payment string is generated per doctor/consultation and returned as an inline base64 data URL (`backend/src/utils/qrCode.ts`, `qrcode` package) so nothing is written to disk; the patient records the transaction ID they used.
- **Prescription PDF**: generated with PDFKit as an in-memory buffer (`backend/src/utils/pdfGenerator.ts`) on prescription create/update and uploaded straight to storage (`prescriptions/` key prefix) via `storageService.addPrescriptionPdf`. The doctor can preview/download it, send/resend it to the patient (flips `sentToPatient` + `sentAt`), or edit it (which regenerates the PDF, replaces the stored asset, and resets the "sent" flag until resent). The frontend's `PdfPreviewDialog` component opens the returned URL in a new tab for preview and forces a download under a meaningful filename instead of the storage backend's random key.
- **Profile images**: uploaded via Multer (buffered in memory, never written to disk by Multer itself), validated server-side for MIME type (JPEG/PNG/WebP only) and a 5MB size cap, then handed to `backend/src/services/storage.service.ts` (`addProfileImage` / `deleteProfileImage`), which writes them under a `profiles/` key prefix — to local disk or an S3-compatible bucket depending on `STORAGE_DRIVER` (see [Storage](#storage)). When a user swaps their photo before submitting a form, the previous upload is deleted in the background.
- **OTP email verification**: a 6-digit code is emailed after signup (via Resend in production, a Nodemailer Ethereal sandbox in development — see `backend/src/services/email.service.ts`). The frontend's `/doctor/verify-otp` and `/patient/verify-otp` pages (shared `OtpVerificationForm` component) collect the code, with a resend button gated by a cooldown anchored to a wall-clock deadline in `localStorage` so a refresh doesn't reset the timer. Sensitive actions (listing/viewing doctors, submitting a consultation, requesting a payment QR, creating/editing/sending a prescription) are gated server-side behind `isVerified` via the `requireVerified()` middleware, and client-side via the `use-require-role` hook.
- **Pagination**: doctors (`GET /doctors`), consultations (`/consultations/mine`, `/consultations/doctor/mine`), and prescriptions (`/prescriptions/mine`) are all paginated with `page`/`limit` query params, returning `{ data, pagination: { page, limit, total, totalPages } }`.
- **Rate limiting**: `express-rate-limit` is applied globally (`generalLimiter`, 300 req/15min) plus tighter limiters on auth, OTP, uploads, payment-QR generation, and consultation creation (`backend/src/middleware/rateLimit.ts`), each returning a `429` with a consistent JSON error body.
- **Error handling**: controllers throw plain `Error`s (no more custom `ApiError` class) and rely on the centralized `errorHandler` middleware to shape the response.

---

## 5. Known limitations / possible improvements

Things that would be worth doing with more time, left out due to time constraints (and, for the storage change, Cloudinary's free-tier credits running out):

- **Local disk storage isn't persistent on Render.** Render's filesystem is ephemeral outside of a paid persistent-disk add-on, so files written under `STORAGE_DRIVER=local` (profile images, prescription PDFs) can be lost on redeploy/restart. Proper production fix: either provision a Render persistent disk, or point `STORAGE_DRIVER=s3` at a real S3-compatible bucket (AWS S3, Cloudflare R2, Backblaze B2, etc. all work through the same `@aws-sdk/client-s3` client used for MinIO).
- **No image processing/CDN.** Cloudinary used to auto-transform/resize/optimize images; the current storage service stores whatever is uploaded as-is. Resizing/compressing profile images before storing would cut bandwidth and storage costs.
- **No presigned uploads.** Uploads go through the backend (buffered in memory, then written to storage), rather than the client uploading directly to S3/MinIO via a presigned URL. Fine at this scale, but direct-to-storage uploads would reduce backend load for larger files.
- **No automated tests** for the storage service (local vs. s3 driver) or for the API more generally.
- **No virus/malware scanning** on uploaded images or generated PDFs.
- **Local storage cleanup isn't atomic.** Deleting the previous PDF/profile image after a new one is saved is a best-effort follow-up call, not a transaction — a crash between "save new" and "delete old" can leave an orphaned file (same tradeoff Cloudinary usage had).

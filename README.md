# Prescripto — Online Prescription Platform

A full-stack platform where patients can consult doctors online and doctors can review consultations and issue digital prescriptions (with PDF generation).

- **Frontend:** Next.js (App Router, TypeScript), TanStack Query, Axios, Zod, React Hook Form, shadcn/ui, Sonner (toasts)
- **Backend:** Express (running on Bun), Mongoose (MongoDB), Zod, JWT auth, Multer (uploads), PDFKit, `qrcode`
- **Database:** MongoDB

---

## 1. Project Structure

```
idea-magix/
├── backend/                 # Express API (Bun runtime)
│   ├── src/
│   │   ├── config/          # env, db connection
│   │   ├── models/          # Mongoose schemas (Doctor, Patient, Consultation, Prescription)
│   │   ├── schemas/         # Zod request-validation schemas
│   │   ├── controllers/     # Route handlers (thin, call services)
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # auth, upload (multer), error handler
│   │   ├── routes/          # Express routers
│   │   ├── utils/           # jwt, password hashing, PDF generator, QR generator, ApiError
│   │   ├── types/           # shared backend types
│   │   ├── app.ts           # Express app wiring
│   │   └── server.ts        # entry point
│   └── uploads/              # profile images, QR codes, generated prescription PDFs
│
└── frontend/                # Next.js App Router app
    └── src/
        ├── app/              # routes (see section 3)
        ├── components/
        │   ├── ui/           # shadcn/ui primitives
        │   ├── shared/       # navbar, profile-image-upload, illness-tag-input, button-link
        │   ├── doctor/       # doctor-only components
        │   └── patient/      # patient-only components
        ├── hooks/            # TanStack Query hooks (use-auth, use-doctors, use-consultations, use-prescriptions, use-upload)
        ├── services/         # Axios API-call wrappers (one per resource)
        ├── providers/        # QueryClientProvider, SessionProvider (auth state)
        ├── lib/validation/   # Zod schemas for client-side form validation
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

The frontend expects the API at `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:5000/api`) and static assets (profile images, QR codes, PDFs) at `NEXT_PUBLIC_ASSET_URL` (defaults to `http://localhost:5000`).

---

## 3. Routes / Pages

### Frontend (Next.js)

| Route | Description |
|---|---|
| `/` | Landing page — choose Doctor or Patient |
| `/doctor/signup` | Doctor sign-up (profile picture, name, specialty, email, phone, years of experience) |
| `/doctor/signin` | Doctor sign-in |
| `/doctor/profile` | Doctor's profile + link to prescriptions |
| `/doctor/prescriptions` | List of consultations submitted by patients |
| `/doctor/prescriptions/[consultationId]` | Consultation details + write/edit/send prescription (generates & regenerates PDF) |
| `/patient/signup` | Patient sign-up (profile picture, name, age, email, phone, surgery history, illness history) |
| `/patient/signin` | Patient sign-in |
| `/patient/doctors` | Grid of doctor cards → Consult |
| `/patient/consult/[doctorId]` | 3-step consultation form (illness/surgery → family history → QR payment) |
| `/patient/prescriptions` | Prescriptions sent to the patient (download PDF) |

### Backend (Express, prefixed with `/api`)

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/auth/doctor/signup` | — | Create doctor account |
| POST | `/auth/doctor/signin` | — | Doctor login |
| POST | `/auth/patient/signup` | — | Create patient account |
| POST | `/auth/patient/signin` | — | Patient login |
| POST | `/auth/logout` | — | Clear session cookie |
| GET | `/auth/me` | any | Get current logged-in doctor/patient |
| GET | `/doctors` | — | List all doctors |
| GET | `/doctors/:id` | — | Get one doctor |
| GET | `/consultations/payment-qr/:doctorId` | patient | Get a payment QR code for a consultation |
| POST | `/consultations` | patient | Submit a consultation |
| GET | `/consultations/mine` | patient | Patient's own consultations |
| GET | `/consultations/doctor/mine` | doctor | Doctor's received consultations |
| GET | `/consultations/:id` | doctor/patient | Consultation details |
| POST | `/prescriptions` | doctor | Create prescription (generates PDF) |
| PUT | `/prescriptions/:id` | doctor | Edit prescription (regenerates PDF, resets "sent") |
| POST | `/prescriptions/:id/send` | doctor | Send/resend prescription to patient |
| GET | `/prescriptions/mine` | patient | Prescriptions sent to the patient |
| GET | `/prescriptions/consultation/:consultationId` | doctor/patient | Prescription for one consultation |
| GET | `/prescriptions/:id` | doctor/patient | Prescription details |
| POST | `/uploads/profile-image` | — | Upload a profile image to Cloudinary (multipart) |
| DELETE | `/uploads/profile-image` | — | Delete a profile image from Cloudinary by `publicId` |

Profile images live in Cloudinary (see below). QR codes and generated prescription PDFs are still served locally from `/uploads/*`.

---

## 4. Notes on implementation

- **Auth**: JWT issued on signup/signin, stored in an httpOnly cookie and also returned in the response body (used by the frontend as a `Bearer` fallback / for cross-origin dev setups).
- **Validation**: Zod schemas exist on both sides — the backend re-validates everything server-side (`src/schemas/*`) regardless of client-side validation, since the client cannot be trusted.
- **Illness history**: stored as a `string[]` in MongoDB, entered as a comma-separated field in the UI and rendered as badges in a panel.
- **Payment**: no real payment gateway is integrated — a QR code encoding a mock UPI payment string is generated per doctor/consultation, and the patient records the transaction ID they used.
- **Prescription PDF**: generated with PDFKit on prescription create/update and stored under `backend/uploads/prescriptions`. The doctor can download it, send/resend it to the patient (flips `sentToPatient` + `sentAt`), or edit it (which regenerates the PDF and resets the "sent" flag until resent).
- **Profile images**: uploaded via Multer (buffered in memory, never written to disk) and streamed straight to Cloudinary through `backend/src/services/cloudinary.service.ts` (`addProfileImage` / `deleteProfileImage`). All uploads live under a dedicated `CLOUDINARY_FOLDER/profiles` folder (configured in `backend/src/config/cloudinary.ts`) so they stay isolated from anything else in the same Cloudinary account. When a user swaps their photo before submitting a form, the previous upload is deleted from Cloudinary in the background.
- **OTP email verification**: a 6-digit code is emailed after signup (via Resend in production, a Nodemailer Ethereal sandbox in development — see `backend/src/services/email.service.ts`). Sensitive actions (submitting a consultation, creating/editing/sending a prescription) are gated behind `isVerified` on the account.

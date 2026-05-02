# Sponsor-a-Student — Spec (v0.1)

> Status: design only. Build target: after admin user-mgmt is live and stable.

## Why this exists

Many students in Tamil Nadu drop out of school each year because their family can't cover small recurring costs — tuition fees, books, uniforms, exam fees, hostel charges. The `needyHelp` Sponsor-a-Student module lets a verified teacher/warden post a student need, and lets one or more donors fund it directly with full transparency.

This is the first concrete vertical we ship after auth + admin.

## Personas

| Role        | Can do                                                                            |
| ----------- | --------------------------------------------------------------------------------- |
| `student`   | View own posts (created by teacher) + add a thank-you note after fulfilment.       |
| `teacher`   | Create / edit / withdraw a sponsorship post on behalf of a student. Must be `verified` by admin first. |
| `donor`     | Browse open posts, contribute, see proof of delivery, get a tax-receipt.          |
| `admin`     | Verify teachers, moderate posts, resolve disputes, mark refunds.                  |

## Lifecycle of a `SponsorshipPost`

```
draft  →  pending_review  →  open  →  partially_funded  →  fully_funded  →  delivered  →  closed
                              ↘  rejected (admin)            ↘  cancelled (poster / admin)
```

State transitions:

- `draft → pending_review`: poster (teacher) submits.
- `pending_review → open` or `rejected`: admin decision.
- `open → partially_funded`: first donation lands.
- `partially_funded → fully_funded`: target amount reached.
- `fully_funded → delivered`: poster uploads delivery proof (receipt photo, school stamp, etc.).
- `delivered → closed`: admin verifies proof; donors get a thank-you note + receipt.

## Data model

### `SponsorshipPost`

```js
{
  _id,
  postedBy: ObjectId(User),   // role must be 'teacher', verified=true
  studentRef: ObjectId(User), // optional — only if student has account
  studentName: String,        // required (always — for students without account)
  studentClass: String,       // e.g. "Class 9, Govt HSS Oddanchatram"
  category: enum['tuition_fee','books','uniform','hostel','exam_fee','other'],
  title: String,              // 80 chars
  story: String,              // 800 chars; what's the situation
  amountTarget: Number,       // INR, integer
  amountRaised: Number,       // denormalised; updated atomically on each donation
  district: String,           // TN district (denormalised from poster for filtering)
  pincode: String,
  documents: [String],        // signed S3/Cloudinary URLs (admission letter, fee challan)
  status: enum[lifecycle],
  reviewNotes: String,        // admin notes on rejection
  deadline: Date,             // optional — fee due date
  createdAt, updatedAt,
}
```

### `Donation`

```js
{
  _id,
  postId: ObjectId(SponsorshipPost),
  donor: ObjectId(User),
  amount: Number,             // INR
  paymentRef: String,         // Razorpay/UPI ref id
  paymentStatus: enum['initiated','captured','failed','refunded'],
  message: String,            // optional public message
  anonymous: Boolean,
  createdAt,
}
```

Indexes: `{ postId: 1, paymentStatus: 1 }`, `{ donor: 1, createdAt: -1 }`.

### `DeliveryProof` (sub-doc on Post)

```js
{
  uploadedBy, uploadedAt,
  files: [String],            // photos of receipt, signed acknowledgment
  notes: String,
  verifiedByAdmin: Boolean,
  verifiedAt,
}
```

## API surface (`/v1/sponsorship/...`)

All routes use `verifyJWT`; role gates as noted.

| Method | Path                              | Auth                | Purpose |
| ------ | --------------------------------- | ------------------- | ------- |
| `GET`  | `/posts`                          | public              | List `open` + `partially_funded` posts. Filters: `district`, `category`, `min`, `max`, `q`, `page`. |
| `GET`  | `/posts/:id`                      | public              | Single post (sanitised — no documents to non-donors). |
| `POST` | `/posts`                          | `teacher` verified  | Create draft. |
| `PATCH`| `/posts/:id`                      | poster or `admin`   | Edit while `draft` / `pending_review`. |
| `POST` | `/posts/:id/submit`               | poster              | `draft → pending_review`. |
| `POST` | `/posts/:id/review`               | `admin`             | `{ decision: 'open' \| 'rejected', notes }`. |
| `POST` | `/posts/:id/donate`               | any logged-in       | Initiate payment intent, returns Razorpay order. |
| `POST` | `/posts/:id/donate/confirm`       | any logged-in       | Webhook-style: marks `Donation.paymentStatus='captured'`, atomically increments `amountRaised`, transitions post status. |
| `POST` | `/posts/:id/proof`                | poster              | Upload delivery proof (signed URL upload then save). |
| `POST` | `/posts/:id/close`                | `admin`             | Verifies proof and closes the post. |
| `GET`  | `/posts/mine`                     | poster              | All posts I created. |
| `GET`  | `/donations/mine`                 | any                 | All donations I made (for tax receipt). |

## Frontend pages

| Path                        | Page                | Guard                       |
| --------------------------- | ------------------- | --------------------------- |
| `/sponsor`                  | Browse + filter list (public) | none                |
| `/sponsor/:id`              | Post detail + donate flow     | none for view, login for donate |
| `/sponsor/new`              | Create post wizard            | `RoleRoute roles=['teacher']` + verified |
| `/sponsor/mine`             | My posts (teacher)            | `RoleRoute roles=['teacher']`           |
| `/sponsor/donations`        | My donations + receipts       | `ProtectedRoute`            |
| `/admin/sponsorships`       | Review queue                  | `RoleRoute roles=['admin']` |

Reusable components (`src/components/sponsor/`): `PostCard`, `PostFilters`, `DonationModal` (Razorpay), `ProgressBar`, `StatusPill`, `PostWizard` (3 steps: details → story → docs).

## Trust & safety rules

1. **No teacher posts publicly until `verified=true`.** Admin verifies after offline conversation/document check.
2. **Documents are private.** Only admin and donors who contributed can view. Public page shows category + story only.
3. **Money never touches the platform.** Direct payments to a registered school/NGO bank account preferred; UPI to teacher only as fallback with admin pre-approval.
4. **Refund path.** If proof isn't filed within 30 days of `fully_funded`, post auto-flags admin → admin can refund all donors via Razorpay refund API.
5. **PII minimisation.** Student's full name + age visible only to donors who contributed. Public sees first name + class.
6. **Rate limit posts.** 1 active post per teacher at a time during beta.

## Open questions (decide before build)

- Payment provider: Razorpay (₹) or Cashfree? — Razorpay first, easier KYC.
- Tax receipt: do we need 80G? Out of scope for v1; show as "personal gift" not tax-deductible.
- Anonymous donations: allowed, but audit-logged for fraud detection.
- Recurring sponsorships (e.g. monthly tuition): out of scope for v1. Flag for v2.

## Build order (incremental)

1. ✅ Auth + roles (done).
2. ✅ Admin user mgmt (just added).
3. 🔜 `SponsorshipPost` model + create/list/detail endpoints. Mock payments (no real ₹).
4. 🔜 `/sponsor` browse + `/sponsor/:id` detail (read-only).
5. 🔜 Teacher create-post wizard + `/admin/sponsorships` review queue.
6. 🔜 Real payments (Razorpay sandbox first).
7. 🔜 Delivery proof + admin close + donor receipts.

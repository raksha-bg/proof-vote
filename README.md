# BlockVote — Online Blockchain Voting System

Secure, transparent, tamper-proof voting powered by Ethereum smart contracts. React + TypeScript frontend that talks to a Django REST Framework backend via JWT.

## Stack

- **Frontend:** React 19 + TypeScript + Tailwind CSS v4 (this repo, TanStack Start)
- **Backend:** Django REST Framework + PostgreSQL (separate service — see API contract below)
- **Blockchain:** Solidity smart contract (`contracts/BlockVote.sol`) on Ethereum / any EVM chain
- **Auth:** JWT (SimpleJWT) with refresh rotation, role-based access
- **Web3:** MetaMask + ethers.js (planned integration on the client)

## Configure the Django API URL

Create `.env` in the project root:

```
VITE_API_BASE_URL=http://localhost:8000/api
```

Restart the dev server after changing it.

## Django REST endpoints this frontend expects

All endpoints are relative to `VITE_API_BASE_URL`.

### Auth
| Method | Path | Body / Notes |
| --- | --- | --- |
| POST | `/auth/register/` | `{ full_name, email, password }` |
| POST | `/auth/login/` | `{ email, password }` → `{ access, refresh }` |
| POST | `/auth/refresh/` | `{ refresh }` → `{ access }` |
| POST | `/auth/password/reset/` | `{ email }` |
| GET  | `/auth/me/` | Returns current `User` |
| PATCH | `/auth/me/` | Partial update (name/email/wallet_address) |

### Elections
| Method | Path | Notes |
| --- | --- | --- |
| GET | `/elections/` | List (optional `?status=active`) |
| POST | `/elections/` | Admin: create |
| GET | `/elections/:id/` | Detail |
| PATCH | `/elections/:id/` | Admin: update / change status |
| DELETE | `/elections/:id/` | Admin |
| GET | `/elections/:id/candidates/` | Candidate list |
| POST | `/elections/:id/candidates/` | Admin: add candidate |
| GET | `/elections/:id/my-vote/` | `{ voted, transaction_hash?, block_number? }` |
| POST | `/elections/:id/vote/` | `{ candidate }` → `{ transaction_hash, block_number }` |

### Admin
| Method | Path | Notes |
| --- | --- | --- |
| GET | `/admin/voters/` | List all voters |
| PATCH | `/admin/voters/:id/` | Verify / revoke voter |

### Dashboard & Blockchain
| Method | Path | Notes |
| --- | --- | --- |
| GET | `/dashboard/stats/` | Aggregate counters |
| GET | `/blockchain/transactions/` | Recent on-chain votes |

## Data models (matches Django expectations)

```
User             { id, full_name, email, role: 'admin'|'voter', verified, wallet_address }
Election         { id, title, description, start_date, end_date, status: 'draft'|'active'|'ended' }
Candidate        { id, election, name, party, symbol, photo, manifesto, votes }
Vote             { id, voter, candidate, transaction_hash, block_number, timestamp }
```

## Smart contract

`contracts/BlockVote.sol` enforces:
- One vote per approved voter per election
- Voting only within `startTime`–`endTime` window
- Owner-only election / candidate / voter management
- Public tally reads (`getCandidate`, `candidateCount`)

Deploy with Hardhat/Foundry; wire the deployed address + ABI into the Django backend, which submits transactions on the user's behalf (or expose the contract for direct MetaMask calls from `_app.elections.$id.tsx`).

## Frontend folders

```
src/
  components/     — UI building blocks (Navbar, Footer, PageShell, StatCard)
  components/ui/  — shadcn primitives
  lib/            — api client, auth context, theme, types
  routes/         — TanStack Start file-based routes
```

## Route map

Public: `/`, `/features`, `/about`, `/faq`, `/contact`, `/login`, `/register`, `/forgot-password`

Authenticated (`_app` layout, JWT required):
- `/dashboard` — stats + charts
- `/elections` — list & search
- `/elections/:id` — candidate list & cast vote
- `/results` — live tallies + PDF export
- `/blockchain` — on-chain transaction explorer
- `/profile` — account & wallet
- `/admin` — admin-only: elections + voter approvals

## Security

- JWT bearer + automatic refresh on 401
- Client-side Zod validation on every form
- RBAC checks on `/admin`
- On-chain contract prevents duplicate voting cryptographically
- Never logs sensitive data; secrets stay on the Django side

## Notes

Mock data is shown when the Django API isn't reachable so the UI always renders in dev. Real data replaces the placeholders as soon as your backend responds.

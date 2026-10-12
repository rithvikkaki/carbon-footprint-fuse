# Carbon Footprint Fuse: Full-Stack Architecture & Setup Guide

This document details the transition of **Carbon Footprint Fuse** from a client-only localStorage prototype into a full-stack, tested application powered by **FastAPI**, **SQLAlchemy**, and **PostgreSQL**, with a **React + TypeScript + Vite** frontend.

---

## 1. System Architecture Overview

```
┌────────────────────────────────────────────────────────┐
│               Frontend (React + Vite)                  │
│       • Multi-step Footprint Calculator               │
│       • 5-Tab Marketplace Ecosystem                    │
│       • Resilient API Client with Local Fallback       │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP / JSON (JWT Auth)
                           ▼
┌────────────────────────────────────────────────────────┐
│               Backend (FastAPI + Pydantic)             │
│  /api/v1/auth          → JWT & bcrypt authentication   │
│  /api/v1/calculator    → Server calculation engine     │
│  /api/v1/marketplace   → Escrow & atomic purchase lock │
│  /api/v1/products      → Stock & order validation      │
│  /api/v1/rewards       → Balance check & unique codes  │
│  /api/v1/collaborations→ Tiered supplier ESG proposals │
└──────────────────────────┬─────────────────────────────┘
                           │ SQLAlchemy ORM
                           ▼
┌────────────────────────────────────────────────────────┐
│             Database (PostgreSQL / SQLite)             │
│  Users, Activities, Listings, Transactions, Products,  │
│  Orders, Rewards, Redemptions, Partners, Proposals    │
└────────────────────────────────────────────────────────┘
```

---

## 2. Server-Enforced Security & Business Logic

1. **Authoritative Credit Balances:**
   - Client-provided credit balances are never trusted.
   - All balance changes (rewards, calculator audits, listing sales, product orders) execute server-side in ACID database transactions.
2. **Escrow on Listing Creation:**
   - When a user lists credits for sale, the backend checks `credit_balance >= amount` and deducts the amount into escrow. Credits cannot be double-spent.
3. **Atomic Purchase & Row Locking:**
   - `buy_credits_from_listing` uses SQLAlchemy `.with_for_update()` row locks to prevent race conditions and duplicate purchase attempts.
4. **JWT Authentication & Passwords:**
   - Passwords hashed using standard `bcrypt`.
   - Stateless authentication via HS256 signed JWT bearer tokens.
5. **Server-Side Emission Math:**
   - Calculation formula matches international grid multipliers and emission factors on the server, awarding authenticated tokens upon audit completion.

---

## 3. Local Development Setup

### A. Python Backend (Standalone)

```bash
# 1. Create and activate virtual environment
python -m venv backend/venv
.\backend\venv\Scripts\activate   # Windows PowerShell
# source backend/venv/bin/activate  # Linux/macOS

# 2. Install dependencies
pip install -r backend/requirements.txt
pip install "email-validator>=2.0.0" "bcrypt==4.0.1"

# 3. Run database migrations
python -m alembic -c backend/alembic.ini upgrade head

# 4. Start FastAPI server
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be available at: `http://localhost:8000/docs`

### B. Frontend Development Server

```bash
# In the root folder:
npm install
npm run dev
```
Frontend runs on: `http://localhost:5173`

---

## 4. Docker & Production Compose Setup

Run the entire full-stack application (PostgreSQL 16 + FastAPI + Nginx React Frontend):

```bash
docker compose up --build
```

- **Frontend:** `http://localhost` (Port 80)
- **API Backend:** `http://localhost:8000` (Port 8000)
- **PostgreSQL:** `localhost:5432`

---

## 5. Automated Test Suite Execution

Run the backend test suite verifying calculations, permissions, listings, purchases, and race conditions:

```bash
$env:PYTHONPATH="."; .\backend\venv\Scripts\python -m pytest backend/tests -v
```

### Verified Test Cases (16/16 Passed):
- `test_user_registration`: Successful account creation & JWT issuance.
- `test_duplicate_email_registration_fails`: Rejection of duplicate emails.
- `test_user_login_success` & `test_user_login_invalid_password`: Bcrypt verification.
- `test_get_current_user_profile`: Authorization header verification.
- `test_calculation_engine_math`: Verifies emission formula and tier ratings.
- `test_calculator_api_endpoint`: Server-side audit and balance increment.
- `test_create_listing_insufficient_balance`: Prevents listing without balance.
- `test_create_listing_success_and_escrow`: Deducts credits into escrow.
- `test_purchase_listing_and_prevent_duplicate_buy`: Atomic purchase & duplicate buy rejection.
- `test_list_products`: Browsing catalog including sustainable watches.
- `test_order_product_with_cct_deduction`: CCT deduction & stock decrement.
- `test_order_product_insufficient_cct`: Rejects orders with low balance.
- `test_list_rewards` & `test_redeem_reward_success`: Unique voucher generation.
- `test_redeem_reward_insufficient_credits`: Rejects redemption when CCT is low.

---

## 6. Current Implementation Status & Next Milestones

| Component | Status | Implementation Details |
| :--- | :--- | :--- |
| **Backend API** | ✅ Completed | FastAPI with 6 routers covering all features. |
| **Database** | ✅ Completed | Relational schema with SQLAlchemy + Alembic migrations. |
| **Authentication** | ✅ Completed | JWT bearer tokens + bcrypt password hashing. |
| **Carbon Calculation** | ✅ Completed | Authoritative server-side emission math engine. |
| **Marketplace Escrow** | ✅ Completed | Atomic purchase locks preventing duplicate buys. |
| **Product Store** | ✅ Completed | Sustainable watches & goods with stock tracking. |
| **Rewards & Vouchers**| ✅ Completed | Server balance verification & unique code generation. |
| **Docker Compose** | ✅ Completed | Multi-container setup (PostgreSQL, Backend, Frontend). |
| **Smart Contracts** | ⚠️ Sandbox Spec | Solidity interface mock; testnet contract deployment planned for next phase. |
| **Payment Gateways** | ⚠️ Demo Mode | Card and Web3 ETH payments simulated in sandbox mode. |
| **Email Service** | ⚠️ Pending | Vouchers generated locally; SMTP integration planned. |

# Carbon Footprint Fuse (EcoFuse)

[![Live Frontend](https://img.shields.io/badge/Live%20Frontend-carbon--footprint--fuse.onrender.com-success?style=for-the-badge&logo=render)](https://carbon-footprint-fuse.onrender.com)
[![API Status](https://img.shields.io/badge/API%20Status-Online%20(24%2F7)-brightgreen?style=for-the-badge&logo=fastapi)](https://carbon-footprint-fuse-api.onrender.com/health)
[![License](https://img.shields.io/badge/License-Strict%20Proprietary-red?style=for-the-badge)](./LICENSE)
[![Stack](https://img.shields.io/badge/Stack-React%2018%20%7C%20FastAPI%20%7C%20PostgreSQL%2016-blue?style=for-the-badge)](https://github.com/rithvikkaki/carbon-footprint-fuse)

An enterprise-grade climate commerce and carbon accounting platform that transforms personal and corporate greenhouse gas (GHG) accounting into verified, auditable, and liquid Carbon Credit Tokens (CCT). Built with an end-to-end full-stack architecture featuring tamper-evident batch provenance, strict credit reconciliation, simulated spot trading, permanent retirement certificates, and ESG facility reporting.

---

## 🌐 Live Deployments & Repository Links

| Resource | Target URL | Description |
| :--- | :--- | :--- |
| **GitHub Repository** | [https://github.com/rithvikkaki/carbon-footprint-fuse](https://github.com/rithvikkaki/carbon-footprint-fuse) | Official authoritative source code repository |
| **Live Web Application** | [https://carbon-footprint-fuse.onrender.com](https://carbon-footprint-fuse.onrender.com) | Production frontend client (Render Static Site + Global Edge CDN) |
| **Live Backend API** | [https://carbon-footprint-fuse-api.onrender.com](https://carbon-footprint-fuse-api.onrender.com) | Production REST API (FastAPI + Python 3.10) |
| **Interactive API Docs** | [https://carbon-footprint-fuse-api.onrender.com/docs](https://carbon-footprint-fuse-api.onrender.com/docs) | Live Swagger / OpenAPI documentation & schema explorer |
| **System Health Check** | [https://carbon-footprint-fuse-api.onrender.com/health](https://carbon-footprint-fuse-api.onrender.com/health) | 24/7 live health probe confirming database connectivity |

---

## ⚡ Architecture & Technology Stack

### Cloud Infrastructure (Zero-Cost, 24/7 Lifelong Pipeline)
- **Frontend Hosting**: Render Static Site with SPA client rewrites and Cloudflare edge acceleration.
- **Backend Service**: Render Cloud Web Service running Uvicorn and FastAPI.
- **Database**: Neon Serverless PostgreSQL 16 (AWS `us-east-2`) with connection pooling, automated backups, and ACID isolation.
- **24/7 Keep-Alive Automation**: GitHub Actions scheduled cron job (`.github/workflows/keep_alive.yml`) pinging the health endpoint every 10 minutes to guarantee zero cold-start delays for recruiters and visitors.

### Application Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite, Radix UI Primitives (`shadcn/ui`), Lucide React, React Router DOM v6.
- **Backend**: FastAPI (Python 3.10), SQLAlchemy ORM, Pydantic v2 validation schemas, Alembic migrations, Uvicorn ASGI.
- **Security & Cryptography**: JWT bearer tokens with SHA-256 signatures, PBKDF2/bcrypt password hashing, rate limiting, and SHA-256 evidence hashing for provenance audit trails.

---

## 🚀 Key Functional Modules

1. **Multi-Scope Carbon Calculator & Intelligence**
   - Personal and enterprise carbon footprint accounting spanning Scope 1, Scope 2, and Scope 3 emissions.
   - Sector-specific emission coefficient modeling (Transportation, Energy, Dietary choices, Waste).
   - Real-time analytics dashboard with dynamic reduction recommendations and benchmark comparisons.

2. **Traceable Registry Batches & Ownership Provenance**
   - Immutable batch tracking linked to verified registries (Verra, Gold Standard, Climate Action Reserve).
   - Normalized `credit_batch_holdings` model ensuring absolute conservation of carbon credit quantities.
   - Tamper-evident cryptographic SHA-256 hashes linking supporting audit evidence documents.

3. **Decentralized Spot Marketplace**
   - Simulated order book supporting partial lot sales, resales, cancellations, and escrow locks.
   - ACID-compliant transaction settlement guaranteeing buyer and seller balances reconcile exactly once.

4. **Permanent Credit Retirement & Tamper-Evident Certificates**
   - Irreversible burning mechanism for verified credit batches to prevent double-claiming.
   - Generation of official, unique digital retirement certificates (`RET-XXXXXXXX-YYYY`) declaring legal beneficiaries and offset claims.

5. **Sustainability Rewards Catalog**
   - Real-time redemption of earned carbon credits for partner perks, EV charging passes, and conservation vouchers.
   - Atomic credit deduction synchronized with authoritative database user profiles.

---

## 💻 Local Development Setup

### Prerequisites
- Node.js (v18+) & npm
- Python 3.10+
- PostgreSQL 15+

### 1. Clone the Repository
```bash
git clone https://github.com/rithvikkaki/carbon-footprint-fuse.git
cd carbon-footprint-fuse
```

### 2. Frontend Setup
```bash
npm install
npm run dev
```
The client will start locally at `http://localhost:5173`.

### 3. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```
API docs available locally at `http://localhost:8000/docs`.

### 4. Running Backend Automated Tests
```bash
pytest backend/tests/ -v
```
All 52 unit, integration, and security regression tests execute against the test database suite.

---

## 📄 License & Proprietary Rights

This project is governed by a **Strict Proprietary & Source-Available License**.

### ⚠️ Strict Prohibition of Commercial & Unattributed Use
- **No Commercial Use**: Under no circumstances may this Software or any part thereof be copied, monetized, sold, sublicensed, or integrated into commercial applications without prior written authorization from the Author.
- **No Plagiarism or Academic Misconduct**: Re-hosting, cloning, or distributing this codebase under another name or submitting this project for academic evaluations, coursework, or competitive submissions without attribution is strictly prohibited.
- **All Rights Reserved**: All copyrights, architectures, brand names, and original code are exclusively owned by **Rithvik Kaki**.

### ✅ Recruiter & Employment Evaluation Grant
- Hiring managers, recruiters, and prospective employers are expressly granted permission to inspect, review, clone, and run this application solely for evaluating the candidate (**Rithvik Kaki**) for technical roles.

For complete legal terms, refer to the authoritative [`LICENSE`](./LICENSE) file.

---

**Author**: [Rithvik Kaki](https://github.com/rithvikkaki)  
**Inquiries**: rithvikkaki@gmail.com

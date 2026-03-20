# Hally Automation — Royal Edition 👑

A workflow automation engine with a regal violet/gold UI design.

---

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
```

Copy `.env.example` to `.env` and fill in your MySQL credentials:
```bash
cp .env.example .env
# Edit .env:
#   DB_HOST=localhost
#   DB_USER=root
#   DB_PASS=your_password
#   DB_NAME=workflow_engine
#   PORT=5001
```

Start the backend:
```bash
npm run dev
```

Backend runs at: **http://localhost:5001**

---

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check (DB + server) |
| GET | `/api/workflows` | List all workflows |
| POST | `/api/workflows` | Create workflow |
| GET | `/api/workflows/:id` | Get single workflow |
| PUT | `/api/workflows/:id` | Update workflow |
| DELETE | `/api/workflows/:id` | Delete workflow |
| GET | `/api/workflows/:id/steps` | List steps |
| POST | `/api/workflows/:id/steps` | Create step |
| PUT | `/api/workflows/:id/steps/:sid` | Update step |
| DELETE | `/api/workflows/:id/steps/:sid` | Delete step |
| GET | `/api/workflows/:id/rules` | List rules |
| POST | `/api/workflows/:id/rules` | Create rule |
| PUT | `/api/workflows/:id/rules/:rid` | Update rule |
| DELETE | `/api/workflows/:id/rules/:rid` | Delete rule |
| POST | `/api/workflows/:id/execute` | Execute workflow |
| GET | `/api/executions` | Execution logs |
| GET | `/api/workflows/stats` | Dashboard stats |
| GET | `/api/workflows/analytics` | Analytics data |

---

## 🎨 Royal Design System

- **Primary:** Royal Violet `#8B5CF6`
- **Accent:** Ceremonial Gold `#F5C842`
- **Background:** Deep Obsidian `#0D0A1A`
- **Typography:** Cinzel (headings) + Crimson Pro (body) + JetBrains Mono (code)

---

## 🗄️ Database

MySQL + Sequelize ORM. The schema auto-syncs on startup.

---

*Built by Sriram & Vijayzz · Royal Edition*

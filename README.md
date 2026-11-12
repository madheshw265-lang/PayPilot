# PayPilot AI

## Verified Lovable hackathon demo

The completed, tested Lovable implementation lives in [`lovable-demo/`](lovable-demo/). It is the current visual hackathon demo and includes the message-to-invoice-to-payment simulation, seller approval guardrail, dashboard, landing page, and tests.

```bash
cd lovable-demo
npm install
npm run dev
```

The original FastAPI + React starter remains in `backend/` and `frontend/` for the server-side Gemini and PayPal Sandbox integration track.

An AI-assisted seller workspace that turns natural-language order messages into editable invoices and PayPal Sandbox checkout orders.

## MVP features

- Gemini structured extraction of customer, line items, quantities and unit prices.
- Editable invoice preview before payment creation.
- PayPal Orders v2 Sandbox order creation and buyer approval redirect.
- Server-side capture endpoint and transaction history.
- React + Tailwind dashboard; FastAPI backend; SQLAlchemy persistence.

> This is a hackathon MVP scaffold. It is sandbox-only by default. Do not use it to collect live payments without completing production security, merchant onboarding, webhook verification, authentication, authorization, and compliance work.

## Architecture

```text
React + Vite + Tailwind
        | HTTP / JSON
        v
FastAPI API
  |        |             |
  v        v             v
Gemini   PayPal REST   SQLAlchemy
  |        |             |
  v        v             v
Extract  Orders v2     SQLite / MySQL
order    create/capture transaction log
```

## Requirements

- Python 3.11+
- Node.js 20+
- MySQL 8+ (optional for local quick start; SQLite is the default)
- Google AI Studio Gemini API key
- PayPal Developer account and Sandbox REST app credentials

## 1. Configure backend

```bash
cd backend
python -m venv .venv
# Windows PowerShell:
.venv\Scripts\Activate.ps1
# macOS/Linux:
# source .venv/bin/activate
pip install -r requirements.txt
copy .env.example .env
```

Edit `backend/.env` and set `GEMINI_API_KEY`, `PAYPAL_CLIENT_ID`, and `PAYPAL_CLIENT_SECRET`.

For MySQL, create a database and set:

```env
DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost:3306/paypilot_ai?charset=utf8mb4
```

For the fastest first run, keep the default SQLite URL. The tables are created automatically on startup.

Start the API:

```bash
uvicorn app.main:app --reload --port 8000
```

Open API docs at http://localhost:8000/docs.

## 2. Configure frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173.

Optional: create `frontend/.env` and set `VITE_API_URL=http://localhost:8000/api`.

## 3. PayPal Sandbox setup

1. Sign in at https://developer.paypal.com/.
2. Open Apps & Credentials and select Sandbox.
3. Create a REST app and copy its Client ID and Secret into `backend/.env`.
4. Create/use a Sandbox personal buyer account under Sandbox Accounts.
5. Use the buyer account to approve the checkout opened by PayPilot.
6. Return to PayPilot and select **Verify / capture payment**.

The API creates an order with `intent: CAPTURE`. The buyer must approve it before the server capture endpoint is called. Never expose the PayPal secret in frontend code.

## 4. Gemini setup

Create an API key in Google AI Studio and set `GEMINI_API_KEY`. The extraction service uses the Google Gen AI Python SDK with a Pydantic response schema. If the configured model is unavailable for your API key, change `GEMINI_MODEL` to a currently enabled Flash model in your Google AI Studio project.

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/ai/parse-order` | Extract order from text using Gemini |
| POST | `/api/payments/create-order` | Create PayPal Sandbox order |
| POST | `/api/payments/capture` | Capture approved PayPal order |
| GET | `/api/payments/transactions` | List recent transactions |

## Example AI request

```json
{
  "message": "Alex ordered 2 headphones at 45 dollars each and 1 cable at 12 dollars."
}
```

## MVP safety notes / next improvements

- Treat AI output as a draft. Seller must review and edit all items and prices before payment creation.
- Backend recalculates the total from the reviewed line items; it does not trust a model-generated total.
- Add PayPal webhook signature verification before relying on asynchronous payment status notifications.
- Add seller authentication, tenant-scoped records, rate limiting, idempotency keys, audit logs, and server-side validation before production.
- Add refund API only with explicit seller confirmation and verified capture IDs.
- Check PayPal-supported currencies and country-specific merchant eligibility before choosing a production currency. The starter defaults to USD for Sandbox demonstration.

## License

MIT. See `LICENSE`.

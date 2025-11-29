# Password Strength Checker

A full-featured password strength checker built with React, TypeScript, and Tailwind CSS. It scores passwords locally, estimates entropy and cracking time, surfaces patterns/dictionary hits, and can optionally check breach status via Have I Been Pwned using a small Express proxy.

## Features
- Real-time password evaluation with 0–100 score and strength categories.
- Entropy calculation, offline cracking time estimate, and detailed warnings/suggestions.
- Detection for length, character variety, keyboard sequences, repeats, predictable sequences, and dictionary/leetspeak matches.
- Optional breach lookup using the k-anonymity range API (first 5 SHA1 characters only).
- Dark/light mode, breach toggle, sample passwords, masked/unmasked entry, progress bar, entropy tooltip note, and local history (last 10 checks in `localStorage`).
- Ready-to-run Dockerfiles and docker-compose; deployable to Cloud Run.

## Project Structure
- `frontend/`: React + Vite app with Tailwind styling and Vitest unit tests for scoring utilities.
- `backend/`: Express proxy for Have I Been Pwned range lookups (optional for breach toggle).
- `Dockerfile.frontend` / `Dockerfile.backend`: container builds for each service.
- `docker-compose.yml`: multi-service orchestration for local use.

## Local Development
1. Ensure Node.js 20+ is available.
2. Install dependencies:
   ```bash
   cd frontend
   npm install
   cd ../backend
   npm install
   ```
3. Run the frontend:
   ```bash
   cd frontend
   npm run dev -- --host
   ```
4. (Optional) Run the backend breach proxy:
   ```bash
   cd backend
   npm run start
   ```
5. Open http://localhost:5173.

> Note: In restricted environments without registry access, dependency installation may require adjusting proxy settings or using an internal mirror.

## Tests
Unit tests cover entropy calculation, pattern detection, dictionary detection, and suggestion logic.
```bash
cd frontend
npm test
```

## Docker Usage
Build and run both services with Docker Compose:
```bash
docker-compose up --build
```
Frontend will be available on port 5173 (served from `serve` on 4173 inside the container) and will call the backend at `http://backend:4000`.

### Cloud Run Deployment
1. Build container images:
   ```bash
   gcloud builds submit --tag gcr.io/PROJECT_ID/psc-frontend -f Dockerfile.frontend .
   gcloud builds submit --tag gcr.io/PROJECT_ID/psc-backend -f Dockerfile.backend .
   ```
2. Deploy to Cloud Run (unauthenticated for demo):
   ```bash
   gcloud run deploy psc-frontend --image gcr.io/PROJECT_ID/psc-frontend --platform managed --allow-unauthenticated --port 4173
   gcloud run deploy psc-backend --image gcr.io/PROJECT_ID/psc-backend --platform managed --allow-unauthenticated --port 4000
   ```
3. Set `VITE_API_BASE` env for the frontend to the backend URL, then redeploy/rebuild as needed.

## Example Passwords & Expected Notes
- `password123` → Very weak; dictionary word + sequence warnings.
- `P@ssw0rd!` → Weak/Medium; leetspeak dictionary detection flags it.
- `CorrectHorseBatteryStaple!` → Strong; high entropy, minimal warnings.
- `S0phisticated_$ecret2024` → Very strong; broad character set and length.
- `qwerty2024` → Weak; keyboard pattern penalty.

## Security Notes
- Breach checking only sends the first 5 SHA1 characters to the backend.
- No passwords are stored server-side; history is saved locally with masked display.

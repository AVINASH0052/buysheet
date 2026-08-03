# BuySheet SwaVid take-home (Scenario C)

**Live demo:** https://buysheet.vercel.app  
**Demo video:** https://drive.google.com/file/d/1iAx1VsoWdxEQoY8X2ZFoDDf7PUXc8pKd/view?usp=sharing

## Scenario
**C. Second-hand electronics market.**

## Problem I chose
Staff inspect devices differently, so the shop **buys inconsistently** and cannot explain why two identical models sit at different prices. The costly failure is at **purchase**, not listing.

## Primary user
Counter staff (and the owner reviewing what they bought), on a laptop/desktop browser in the shop. No native app.

## Deliberately not solved
- Marketplace sync / dynamic comps
- Repair workflow and parts costing
- Customer-facing storefront or warranty claims portal
- Photo damage detection
- Seller KYC / stolen-device police APIs

Those expand from the same grade + condition card, without rewriting the intake.

## Assumptions
- Staff share one shop browser; no auth for the demo
- Street-ask prices are a **mocked catalog mid** (labelled as such)
- IMEI/serial is stored for the demo sheet; treat as sensitive in production
- One intake about 15 minutes if they only fail what they saw
- Optional `NVIDIA_API_KEY` (Vercel env) powers customer pitch / owner brief
- Demo sheets persist in **browser localStorage** (works on Vercel serverless; shared shop browser assumption)

## How it works
1. Staff open **New sheet**, pick model, enter IMEI/serial.
2. Run the checklist + risk flags (liquid, lock, blacklist suspicion).
3. Live **grade + max buy** updates from explicit deductions.
4. Save sheet → **buy** (at or under ceiling) or **pass**.
5. Bought units get list price + warranty; shelf card answers why this price.
6. Owner desk shows capital, list value, paper margin, staff buys.
7. NVIDIA copy desk writes customer pitch / owner brief (local fallback if NIM chat is blocked).

```
seller + device → checklist/flags → grade engine → max buy → buy/pass → list + warranty → ledger / owner desk
```

## Run locally
```bash
npm install && npm run dev
```
Open http://localhost:3000  
API routes are served under `/api/*` (single Vercel/Next app).

Optional NVIDIA: put `NVIDIA_API_KEY` in `.env.local`.

## Deploy (Vercel only)
1. Framework Preset: **Next.js** (Root Directory `./`)
2. Env (optional): `NVIDIA_API_KEY`
3. Redeploy from the `main` branch

Or from CLI: `vercel --prod`

If NVIDIA chat times out, the app still returns a local pitch/brief.

## Five more hours
1. Live comps feed (replace static `streetAsk`)
2. Repair-cost toggle before buy
3. Durable shared DB (Postgres) if multiple counters need one ledger
4. Soft auth + staff initials audit trail
5. Compress checklist by category (phone vs laptop)

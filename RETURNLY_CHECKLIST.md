# Returnly Roadmap – Status

## Phase 1 — Foundation (Replit first)
- [x] 1. Branding locked (logo, palette, tokens)
- [x] 2. Dev env ready (Expo + RN Web in Replit, Expo Go on phone)
- [ ] 3. Style kit added (`tokens.js`, `styleKit.js`) and verified

## Phase 2 — Core App UI (Customer)
- [x] 4. Base navigation (Welcome, Login, Book Pickup, Order Status, Driver Portal)
- [x] 5. Screen shells in place with shared styles

### 5.1 Order Intake (Customer) — REQUIRED FIELDS
- [x] Name
- [ ] Phone (E.164)
- [x] Pickup address (addr, apt, city, state, zip)
- [x] Retailer / store name
- [ ] Return method (store | UPS | FedEx | USPS)
- [ ] Item description
- [ ] Package size (S | M | L)
- [ ] Pickup window (ASAP | time slot)
- [ ] Payment method (stub)
- [ ] Validation for required fields

### 5.2 Order Intake — OPTIONAL
- [ ] Upload receipt image/PDF
- [ ] Upload return label
- [ ] Package photo
- [ ] Special instructions (gate code, fragile)
- [ ] Tip
- [ ] Promo code

## Phase 3 — Refine Design (Figma)
- [ ] 6. Rebuild pixel-perfect screens in Figma with tokens
- [ ] 7. Match code to Figma (spacing/typography polish)

## Phase 4 — Core Logic
- [x] 8. Zustand store for users & orders
- [x] 9. Mock flows (create → assign → picked_up → dropped_off → completed/failed)
- [ ] 10. Payments stub (Stripe test mode)

## Phase 5 — Website (same design system)
- [ ] 11. Next.js site using shared tokens
- [ ] 12. "Become a Driver" page + waitlist form

## Phase 6 — Driver App (same brand, different workflow)
- [ ] 13. Screens: Job Queue, Job Detail (actions), Earnings, Profile
- [ ] 14. Big action buttons, photo proof, nav-to-store link

## Phase 7 — Backend & Launch
- [ ] 15. Supabase/Firebase: auth, orders, realtime
- [ ] 16. Push notifications; small-city beta; iterate
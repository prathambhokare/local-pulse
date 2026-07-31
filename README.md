# LocalPulse

A hyperlocal availability platform that connects **sellers** (fish/vegetable vendors,
salons, home-based grocers, etc.) directly with nearby **buyers** — no delivery, no
payments, no middleman. Buyers browse what's available nearby (or search wider);
sellers post availability that auto-expires so the feed always stays fresh.

- **Buyers**: no login needed. Browse/search listings near you (adjustable radius or
  "all areas"), then contact the seller directly by phone call or WhatsApp.
- **Sellers**: mobile OTP login, then post "availability" listings (item, price,
  quantity, description). Listings auto-expire in 24h by default (configurable per
  listing), keeping the feed trustworthy.

## Stack

| Layer    | Tech |
|----------|------|
| Backend  | Spring Boot 4.1 (Java 17), Spring Data JPA, Spring Security (JWT), H2 (file-based) |
| Frontend | React Native (Expo, TypeScript), React Navigation |

## Project layout

```
backend/   Spring Boot API (H2 database, JWT auth, REST endpoints)
mobile/    Expo React Native app (buyer discover screen + seller auth/dashboard)
```

## Running the backend

```bash
cd backend
./mvnw spring-boot:run
```

- Runs on `http://localhost:8080`.
- H2 console: `http://localhost:8080/h2-console` (JDBC URL `jdbc:h2:file:./data/localpulse`, user `sa`, blank password).
- Data persists in `backend/data/` between restarts (delete that folder to reset).
- **Local OTP**: `POST /api/auth/otp/request` returns the generated
  OTP in the response (`devOtp`) and logs it for local testing.
  Plain Indian 10-digit numbers are normalized to E.164 with `+91`; international
  numbers should include their country code.

### Key API endpoints

| Method | Path | Auth | Description |
|--------|------|------|--------------|
| POST | `/api/auth/otp/request` | - | `{phone}` -> sends/returns OTP |
| POST | `/api/auth/otp/verify` | - | `{phone, otp}` -> `{token, sellerId, profileComplete}` |
| GET/PUT | `/api/sellers/me` | Bearer | seller profile (business name, category, location) |
| GET | `/api/listings/nearby` | - | `?lat&lng&radiusKm&noRadius&query&category` buyer search |
| GET | `/api/listings/mine` | Bearer | seller's own listings |
| POST | `/api/listings` | Bearer | create a listing |
| PATCH | `/api/listings/{id}` | Bearer | edit / extend expiry / mark sold out |
| DELETE | `/api/listings/{id}` | Bearer | delete a listing |
| GET | `/api/meta/categories` | - | suggested category list |

## Running the mobile app

```bash
cd mobile
npm install   # if you haven't already
npx expo start
```

Scan the QR code with **Expo Go** (or run `npx expo start --android` / `--ios`).

The app auto-detects your machine's LAN IP from the Expo dev server, so it talks to
the backend at `http://<your-machine-ip>:8080` automatically — just make sure your
phone/emulator and the machine running the backend are on the same network, and that
the backend (`./mvnw spring-boot:run`) is already running. If you need to point at a
different host/port, edit `mobile/src/config.ts`.

### App structure

```
mobile/src/
  api/          axios client + typed endpoint wrappers
  components/   ListingCard, SellerListingCard, CategoryChips, RadiusSelector, PrimaryButton
  context/      AuthContext (JWT persisted in AsyncStorage, seller profile state)
  hooks/        useLocation (expo-location permission + current position)
  navigation/   RootNavigator (bottom tabs: Discover / Sell), SellerNavigator (auth-aware stack)
  screens/
    buyer/      HomeScreen - nearby/search feed, radius + category filters
    seller/     PhoneEntry -> OtpVerify -> ProfileSetup -> Dashboard -> AddListing
```

## Notes / things to harden before production

- Local OTP is intended for development and does not deliver an SMS.
- CORS is wide-open (`app.cors.allowed-origins: "*"`) for easy local dev - restrict it.
- H2 is great for local development; swap to Postgres/MySQL for production scale.
- Geo search uses in-app Haversine distance (fine at local/regional scale); a real
  geospatial index (e.g. Postgres + PostGIS) would be worth it at larger scale.
  
## Architechture Diagram
  <img width="1024" height="644" alt="image" src="https://github.com/user-attachments/assets/7a83e79e-dba5-4d46-a373-1299ee3ef6c7" />


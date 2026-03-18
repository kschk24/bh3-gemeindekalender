# Gemeindekalender

Ein barrierefreier Veranstaltungskalender für Gemeinden mit Fokus auf **WCAG 2.1 AA Konformität** und **Green IT**.

## Projektübersicht

Diese Web-Applikation ermöglicht es Bürger:innen einer Kommune, lokale Veranstaltungen zu entdecken, zu filtern und sich anzumelden.

### Kernfunktionen

- Veranstaltungen durchsuchen und filtern (Datum, Kategorie, Ort, Barrierefreiheit)
- Detailansicht mit Beschreibung, Ort, Uhrzeit und Anfahrt
- Anmeldefunktion (mit oder ohne Benutzerkonto)
- Kalenderansicht (Listen-, Wochen-, Monatsansicht)
- Merkzettel / Favoriten
- Admin-Bereich zum Verwalten von Veranstaltungen

### Barrierefreiheit (WCAG 2.1 AA)

- Vollständige Tastaturnavigation
- Screenreader-optimiert (ARIA-Labels, Landmarks, Live-Regions)
- Kontrastmodus / High-Contrast-Theme
- Skalierbare Schriftgrößen (100% - 150%)
- Skip-Links und Focus-Management
- Alternativtexte für alle Bilder

### Green IT

- Dark Mode (reduziert Energieverbrauch bei OLED-Displays)
- Lazy Loading für Bilder und Routen
- Effizientes Caching mit React Query
- Minimaler Bundle-Size durch Code-Splitting
- Serverseitige Paginierung

## Tech Stack

| Bereich | Technologie |
|---------|-------------|
| Frontend | React 18, TypeScript, Vite, TailwindCSS |
| Backend | Node.js, Express, TypeScript |
| ORM | Prisma |
| Datenbank | PostgreSQL |
| API | REST (JSON) |
| Deployment | Docker, GitHub Actions |

## Projektstruktur

```
bh3-gemeindekalender/
├── frontend/                 # React + TypeScript Frontend
│   ├── src/
│   │   ├── components/      # React Komponenten
│   │   ├── pages/           # Seiten
│   │   ├── context/         # React Context (Auth, Theme, A11y)
│   │   ├── services/        # API Client
│   │   ├── hooks/           # Custom Hooks
│   │   └── types/           # TypeScript Types
│   └── public/
├── backend/                  # Node.js + Express Backend
│   ├── src/
│   │   ├── routes/          # API Routen
│   │   ├── controllers/     # Request Handler
│   │   ├── services/        # Business Logik
│   │   ├── middleware/      # Auth, Validation, Error Handling
│   │   └── validators/      # Zod Schemas
│   └── prisma/
│       ├── schema.prisma    # Datenbank Schema
│       └── seed.ts          # Test-Daten
├── shared/                   # Gemeinsame Types
├── docker-compose.yml        # PostgreSQL Setup
└── .github/workflows/        # CI/CD Pipelines
```

## Voraussetzungen

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker & Docker Compose (für PostgreSQL)

## Installation

### 1. Repository klonen

```bash
git clone <repository-url>
cd bh3-gemeindekalender
```

### 2. Dependencies installieren

```bash
npm install
```

### 3. Umgebungsvariablen konfigurieren

```bash
cp .env.example .env
```

Bearbeite die `.env` Datei nach Bedarf:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gemeindekalender?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=3001
```

### 4. Datenbank starten

```bash
docker-compose up -d
```

### 5. Prisma Setup

```bash
# Prisma Client generieren
npm run db:generate --workspace=backend

# Datenbank-Migration ausführen
npm run db:migrate --workspace=backend

# (Optional) Test-Daten einfügen
npm run db:seed --workspace=backend
```

### 6. Entwicklungsserver starten

```bash
# Beide Server gleichzeitig starten
npm run dev

# Oder einzeln:
npm run dev:backend   # Backend auf http://localhost:3001
npm run dev:frontend  # Frontend auf http://localhost:5173
```

## Verfügbare Scripts

| Script | Beschreibung |
|--------|--------------|
| `npm run dev` | Startet Frontend und Backend im Entwicklungsmodus |
| `npm run dev:frontend` | Startet nur das Frontend |
| `npm run dev:backend` | Startet nur das Backend |
| `npm run build` | Baut alle Pakete für Produktion |
| `npm run lint` | Führt ESLint auf allen Paketen aus |
| `npm run db:migrate` | Führt Prisma Migrationen aus |
| `npm run db:seed` | Fügt Test-Daten ein |
| `npm run db:studio` | Öffnet Prisma Studio (DB GUI) |

## API Endpoints

### Öffentlich

| Methode | Endpoint | Beschreibung |
|---------|----------|--------------|
| GET | `/api/events` | Alle Veranstaltungen (mit Filter & Pagination) |
| GET | `/api/events/:id` | Veranstaltungs-Details |
| GET | `/api/categories` | Alle Kategorien |
| POST | `/api/auth/register` | Benutzer registrieren |
| POST | `/api/auth/login` | Anmelden |

### Authentifiziert (User)

| Methode | Endpoint | Beschreibung |
|---------|----------|--------------|
| GET | `/api/users/me/favorites` | Favoriten abrufen |
| POST | `/api/users/me/favorites/:eventId` | Favorit hinzufügen |
| DELETE | `/api/users/me/favorites/:eventId` | Favorit entfernen |
| POST | `/api/events/:id/register` | Für Event anmelden |

### Event Manager (eigene Events)

| Methode | Endpoint | Beschreibung |
|---------|----------|--------------|
| GET | `/api/events/mine` | Eigene Veranstaltungen abrufen |
| POST | `/api/events` | Veranstaltung erstellen |
| PUT | `/api/events/:id` | Eigene Veranstaltung bearbeiten |
| DELETE | `/api/events/:id` | Eigene Veranstaltung löschen |

### Admin

| Methode | Endpoint | Beschreibung |
|---------|----------|--------------|
| GET | `/api/admin/users` | Alle Nutzer abrufen |
| PATCH | `/api/admin/users/:id/role` | Nutzer-Rolle ändern |
| DELETE | `/api/admin/users/:id` | Nutzer löschen |
| GET | `/api/admin/events` | Alle Events (Admin-Ansicht) |
| DELETE | `/api/admin/events/:id` | Beliebiges Event löschen |
| GET | `/api/events/:id/registrations` | Anmeldungen einsehen |

## Test-Accounts (nach Seed)

| E-Mail | Passwort | Rolle | Zugang |
|--------|----------|-------|--------|
| `admin@gemeinde.de` | `admin123` | Admin | Admin-Dashboard, alle Events bearbeiten/löschen, Nutzerverwaltung |
| `event@manager.de` | `event123` | Event Manager | Eigene Events erstellen/bearbeiten/löschen (unter „Meine Events") |
| `user@example.de` | `user123` | User | Favoriten, Anmeldungen, Kommentare |

## Green IT & Barrierefreiheit testen

Eine ausführliche Dokumentation aller umgesetzten Maßnahmen und Schritt-für-Schritt-Testanleitungen findet sich in:

**[docs/GREEN_IT_AND_INCLUSION.md](docs/GREEN_IT_AND_INCLUSION.md)**

Kurzübersicht:
- **Dark Mode**: Mond-Symbol oben rechts
- **Schriftgröße / Kontrast**: Aa-Symbol oben rechts
- **Tastaturnavigation**: Nur `Tab`, `Enter`, `Escape` verwenden
- **Screenreader**: VoiceOver (`Cmd + F5` auf Mac) oder NVDA (Windows)
- **Lighthouse Audit**: Chrome DevTools → Lighthouse → nur Accessibility → Ziel ≥ 90 Punkte
- **axe DevTools**: [Browser-Extension](https://www.deque.com/axe/devtools/) für automatisierte Tests

## Aufgabenverteilung (Team)

| Person | Verantwortungsbereich |
|--------|----------------------|
| Person A | Backend: API, Prisma, Auth, Datenbank |
| Person B | Frontend: Kalender, Events, Routing |
| Person C | Frontend: Barrierefreiheit, Styling, UI |

Gemeinsam: CI/CD, Code-Reviews, Integration

## Lizenz

MIT

---

Entwickelt als Schulprojekt mit Fokus auf Digital Inclusion und Green IT.

<!-- Test PR: CI/CD and test pipeline verification -->
<!-- Test-Push main 2026-02-16 -->

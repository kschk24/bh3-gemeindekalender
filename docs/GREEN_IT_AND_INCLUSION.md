# Green IT & Digital Inclusion

Dieses Dokument beschreibt alle umgesetzten Maßnahmen für Nachhaltigkeit (Green IT) und digitale Barrierefreiheit (Inclusion) sowie konkrete Anleitungen, wie diese getestet werden können.

---

## Green IT

### Umgesetzte Maßnahmen

#### 1. Dark Mode
Aktiviert über das Mond-Symbol oben rechts in der Navigation. Auf OLED- und AMOLED-Displays verbrauchen dunkle Pixel deutlich weniger Strom als helle.

#### 2. Lazy Loading
- **Bilder**: Alle Bilder haben `loading="lazy"` – sie werden erst geladen, wenn sie in den sichtbaren Bereich scrollen.
- **Routen**: Alle Seiten (Events, Favoriten, Admin, ...) werden per `React.lazy()` erst beim ersten Aufruf geladen (Code Splitting), was den initialen Bundle-Download reduziert.

#### 3. Effizientes Caching mit React Query
- `staleTime: 5 Minuten` – identische API-Anfragen werden 5 Minuten lang aus dem Cache bedient, ohne erneuten Netzwerk-Request.
- Auf der Startseite werden Favoritendaten einmalig abgefragt und an alle Event-Cards weitergegeben, statt pro Card eine eigene Anfrage zu stellen (*Query Hoisting*).

#### 4. Responsive Images (`sizes`-Attribut)
Event-Bilder liefern dem Browser die Information, wie groß das Bild auf dem Bildschirm erscheint (`33vw`, `50vw`, `100vw`), damit er automatisch die passende Auflösung wählt und keine unnötig großen Bilddateien lädt.

#### 5. Serverseitige Paginierung
Events werden immer seitenweise (Standard: 12) vom Backend geliefert. Es werden nie alle Datensätze auf einmal übertragen.

#### 6. Code Splitting & Tree Shaking
Lucide-React-Icons werden einzeln importiert (z. B. `import { Pencil } from 'lucide-react'`), sodass nur tatsächlich verwendete Icons im Bundle landen.

---

### Green IT testen

#### Dark Mode (Energieverbrauch OLED)
1. Öffne die App unter `http://localhost:5173`
2. Klicke auf das **Mond-Symbol** oben rechts
3. Die gesamte Oberfläche wechselt zu dunklen Farbtönen
4. Klicke erneut zum Wechsel zurück in den Hell-Modus

#### Lazy Loading (Bilder)
1. Öffne Chrome DevTools → **Network** → Filter: **Img**
2. Lade die Startseite – nur sichtbare Bilder werden sofort geladen
3. Scrolle nach unten → weitere Bilder laden erst dann nach

#### Lazy Loading (Routen / Code Splitting)
1. Öffne Chrome DevTools → **Network** → Filter: **JS**
2. Lade die Startseite – es wird nur der initiale Bundle geladen
3. Navigiere zu `/events` → ein weiterer kleiner Chunk lädt nach
4. Navigiere zu `/admin` → Admin-Bundle lädt erst jetzt

#### React Query Caching
1. Öffne Chrome DevTools → **Network**
2. Navigiere zur Startseite – Kategorien und Events werden geladen
3. Navigiere zu `/events` und zurück zur Startseite
4. Beobachte: **keine neuen Netzwerk-Requests** für Kategorien (Cache greift)

#### Paginierung
1. Navigiere zu `/events`
2. In der unteren Pagination-Leiste sind nur 12 Events pro Seite zu sehen
3. Im DevTools Network-Tab: jeder Seiten-Request holt nur die aktuell sichtbare Seite

---

## Digital Inclusion / Barrierefreiheit (WCAG 2.1 AA)

### Umgesetzte Maßnahmen

#### 1. Vollständige Tastaturnavigation
Alle interaktiven Elemente (Links, Buttons, Formulare, Modals) sind per `Tab`-Taste erreichbar und mit `Enter` / `Space` bedienbar.

#### 2. Focus Trap in Modals
Wenn ein Modal (Eventdetails, Anmeldeformular, Login) geöffnet ist, bleibt der Tastaturfokus innerhalb des Modals (`focus-trap-react`). Nach dem Schließen kehrt der Fokus zum auslösenden Element zurück.

#### 3. Skip Link
Ein versteckter „Zum Hauptinhalt springen"-Link erscheint beim ersten `Tab`-Druck und ermöglicht es Tastatur- und Screenreader-Nutzern, die Navigation zu überspringen.

#### 4. ARIA Live Regions
Dynamische Statusmeldungen (z. B. Seitenwechsel, Favorit gespeichert) werden über `aria-live="polite"` an Screenreader ausgegeben, ohne den Fokus zu unterbrechen.

#### 5. Barrierefreiheits-Badges auf Events
Events können mit vier Accessibility-Merkmalen versehen werden:
- **Rollstuhlgerecht** – barrierefreier Zugang zum Veranstaltungsort
- **Induktionsschleife** – Hörgeräte-Unterstützung
- **Gebärdensprache** – Gebärdensprachdolmetscher vorhanden
- **Leichte Sprache** – Beschreibung in leicht verständlicher Sprache

Diese Icons erscheinen auf Event-Cards und in der Detailansicht.

#### 6. Filterung nach Barrierefreiheit
In der Filterpanel unter `/events` lassen sich Events gezielt nach Accessibility-Merkmalen filtern.

#### 7. Skalierbare Schriftgröße
Im Accessibility-Menü (Aa-Symbol oben rechts) kann die Schriftgröße auf 110%, 125% oder 150% erhöht werden. Das Layout bleibt funktionsfähig.

#### 8. Kontrast-Modus
Das Accessibility-Menü bietet einen Hochkontrast-Modus mit verstärkten Farbkontrasten (Mindestanforderung: WCAG AA = 4,5:1 für Text).

#### 9. Inline-Bestätigungen statt `window.confirm()`
Lösch-Aktionen (z. B. Kommentar löschen) verwenden keine Browser-Dialoge mehr, sondern zeigen direkt im UI ein „Ja / Nein"-Paar an – damit sind sie screenreaderkompatibel und keyboard-bedienbar.

#### 10. ARIA-Labels und semantisches HTML
- Alle Icons haben `aria-hidden="true"` da ihr Kontext über umgebenden Text oder `aria-label` erklärt wird
- Tabellenköpfe, Navigationsbereiche (`<nav>`), Hauptinhalt (`<main>`) und Abschnitte (`<section aria-labelledby="...">`) sind korrekt ausgezeichnet
- Alle Formularfelder haben zugehörige `<label>`-Elemente mit `htmlFor`

---

### Inclusion-Features testen

#### Tastaturnavigation
1. Lade `http://localhost:5173`
2. Drücke `Tab` – der Skip-Link erscheint oben links
3. Drücke nochmals `Tab` – Navigation, dann Inhalte werden fokussiert
4. Öffne ein Event mit `Enter` → Modal öffnet sich
5. Navigiere innerhalb des Modals nur per `Tab`
6. Drücke `Escape` → Modal schließt, Fokus kehrt zum Event-Button zurück

#### Focus Trap
1. Öffne ein Event-Modal
2. Drücke mehrfach `Tab` → Fokus bleibt im Modal, springt nicht in den Hintergrund
3. Schließe das Modal → Fokus kehrt zum auslösenden Button zurück

#### Skip Link
1. Lade die Seite neu
2. Drücke einmal `Tab` – ein blauer „Zum Hauptinhalt springen"-Button erscheint oben links
3. Drücke `Enter` → Fokus springt direkt zum Hauptinhalt, Navigation wird übersprungen

#### Screenreader (VoiceOver auf macOS)
1. Aktiviere VoiceOver: `Cmd + F5`
2. Navigiere durch die Seite mit `Control + Option + Pfeiltasten`
3. Prüfe:
   - Modalüberschriften werden als Überschrift angekündigt
   - Barrierefreiheits-Badges werden mit ihrem Bedeutungstext vorgelesen
   - Favoriten-Buttons werden mit „Zu Favoriten hinzufügen" / „Aus Favoriten entfernen" angekündigt
   - Live-Regions: Bei Seitenwechsel in der Pagination wird die neue Seite angekündigt

#### Schriftgröße erhöhen
1. Klicke auf das **Aa-Symbol** in der Navigation
2. Wähle „150%"
3. Prüfe: Text ist größer, Layout bleibt nutzbar, keine Überlappungen

#### Kontrast-Modus
1. Öffne das Accessibility-Menü (Aa-Symbol)
2. Aktiviere den **Kontrast-Modus**
3. Prüfe mit Chrome DevTools → Lighthouse → Accessibility Audit:
   - Alle Texte müssen mindestens Kontrastverhältnis 4,5:1 haben

#### Barrierefreiheits-Filter
1. Navigiere zu `/events`
2. Öffne das Filterpanel
3. Aktiviere „Rollstuhlgerecht"
4. Nur Events mit diesem Merkmal werden angezeigt
5. Kombiniere mehrere Filter (z. B. + „Leichte Sprache")

#### Accessibility Audit mit Lighthouse
1. Öffne Chrome DevTools (`F12`)
2. Wechsle zum Tab **Lighthouse**
3. Aktiviere nur „Accessibility"
4. Klicke **Analyze page load**
5. Zielwert: **≥ 90 Punkte**

#### Automatisierte Tests mit axe DevTools
1. Installiere die Browser-Extension [axe DevTools](https://www.deque.com/axe/devtools/)
2. Öffne DevTools → Tab **axe DevTools**
3. Klicke **Scan ALL of my page**
4. Alle kritischen Verstöße prüfen und beheben

---

## Zusammenfassung: Checkliste

| Feature | Kategorie | Testbar mit |
|---------|-----------|-------------|
| Dark Mode | Green IT | Manuell (Mond-Icon) |
| Lazy Loading Bilder | Green IT | DevTools → Network → Img |
| Code Splitting | Green IT | DevTools → Network → JS |
| React Query Cache | Green IT | DevTools → Network (kein Re-Fetch) |
| Paginierung | Green IT | DevTools → Network |
| Tastaturnavigation | Inclusion | Tastatur (Tab/Enter/Escape) |
| Focus Trap | Inclusion | Tastatur im Modal |
| Skip Link | Inclusion | Tab beim Seitenstart |
| Screenreader | Inclusion | VoiceOver / NVDA |
| Schriftgröße skalierbar | Inclusion | Aa-Menü |
| Hochkontrast-Modus | Inclusion | Aa-Menü + Lighthouse |
| Barrierefreiheits-Filter | Inclusion | Events-Seite → Filter |
| ARIA Live Regions | Inclusion | VoiceOver + Pagination |
| Inline-Bestätigungen | Inclusion | Kommentar löschen per Tastatur |
| Lighthouse Audit ≥ 90 | Inclusion | Chrome DevTools → Lighthouse |

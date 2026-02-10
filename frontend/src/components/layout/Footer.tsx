export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="bg-primary-600 text-white py-8"
      role="contentinfo"
    >
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Logo & Description */}
          <div>
            <h3 className="text-lg font-bold mb-2">Gemeindekalender</h3>
            <p className="text-primary-100 text-sm">
              Ihr Portal für lokale Veranstaltungen.
              Barrierefrei und für alle zugänglich.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-2">Kontakt</h4>
            <address className="text-primary-100 text-sm not-italic">
              <p>Musterstraße 1</p>
              <p>12345 Musterstadt</p>
              <p className="mt-2">
                Tel.: <a href="tel:+4912345678" className="hover:text-white">+49 123 456-78</a>
              </p>
              <p>
                E-Mail: <a href="mailto:info@gemeinde.de" className="hover:text-white">info@gemeinde.de</a>
              </p>
            </address>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-2">Rechtliches</h4>
            <nav aria-label="Footer-Navigation">
              <ul className="text-sm space-y-1">
                <li>
                  <a href="#" className="text-primary-100 hover:text-white transition-colors">
                    Impressum
                  </a>
                </li>
                <li>
                  <a href="#" className="text-primary-100 hover:text-white transition-colors">
                    Datenschutz
                  </a>
                </li>
                <li>
                  <a href="#" className="text-primary-100 hover:text-white transition-colors">
                    Barrierefreiheit
                  </a>
                </li>
                <li>
                  <a href="#" className="text-primary-100 hover:text-white transition-colors">
                    Barriere melden
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-primary-500 text-center text-sm text-primary-200">
          &copy; {currentYear} Gemeindekalender. Alle Rechte vorbehalten.
        </div>
      </div>
    </footer>
  );
}

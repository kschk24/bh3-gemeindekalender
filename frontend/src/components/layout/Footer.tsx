import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();
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
            <h3 className="text-lg font-bold mb-2">{t('footer.title')}</h3>
            <p className="text-primary-100 text-sm">
              {t('footer.description')}
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-2">{t('footer.contact.title')}</h4>
            <address className="text-primary-100 text-sm not-italic">
              <p>{t('footer.contact.street')}</p>
              <p>{t('footer.contact.city')}</p>
              <p className="mt-2">
                {t('footer.contact.phone')}: <a href="tel:+4912345678" className="hover:text-white">+49 123 456-78</a>
              </p>
              <p>
                {t('footer.contact.email')}: <a href="mailto:info@gemeinde.de" className="hover:text-white">info@gemeinde.de</a>
              </p>
            </address>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-2">{t('footer.legal.title')}</h4>
            <nav aria-label={t('footer.legal.ariaLabel')}>
              <ul className="text-sm space-y-1">
                <li>
                  <a href="#" className="text-primary-100 hover:text-white transition-colors">
                    {t('footer.legal.imprint')}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-primary-100 hover:text-white transition-colors">
                    {t('footer.legal.privacy')}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-primary-100 hover:text-white transition-colors">
                    {t('footer.legal.accessibility')}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-primary-100 hover:text-white transition-colors">
                    {t('footer.legal.reportBarrier')}
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-primary-500 text-center text-sm text-white">
          {t('footer.copyright', { year: currentYear })}
        </div>
      </div>
    </footer>
  );
}

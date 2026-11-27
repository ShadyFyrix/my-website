import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { PROFILE } from '../data/profile';
import { ScrollProgressRail } from './SpatialFX';
import { useSpatial } from './SpatialContext';

const NAV_ITEMS = [
  { href: '#live', label: { vi: 'Live', en: 'Live' } },
  { href: '#products', label: { vi: 'Sản phẩm', en: 'Products' } },
  { href: '#about', label: { vi: 'Giới thiệu', en: 'About' } },
  { href: '#achievements', label: { vi: 'Thành tựu', en: 'Achievements' } },
  { href: '#connect', label: { vi: 'Kết nối', en: 'Connect' } },
];

export function Navbar() {
  const { locale, toggleLocale, t } = useLanguage();
  const { triggerShockwave } = useSpatial();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <a className="skip" href="#main">
        {locale === 'vi' ? 'Bỏ qua điều hướng' : 'Skip to content'}
      </a>
      <header className="site-nav" id="top">
        <div className="container">
          <div className="site-nav__inner">
            <a
              className="site-nav__brand"
              href="#top"
              aria-label={t(PROFILE.name)}
              onClick={() => triggerShockwave(0.55, 0)}
            >
              <img
                src="/brand-logo.png"
                width={38}
                height={38}
                alt="ShadyFyrix Logo"
                className="site-nav__logo"
              />
              <span>{PROFILE.handle}</span>
            </a>

            <nav
              className="site-nav__desktop"
              aria-label={locale === 'vi' ? 'Điều hướng chính' : 'Primary navigation'}
            >
              <ul className="site-nav__links">
                {NAV_ITEMS.map((item) => (
                  <li key={item.href}>
                    <a
                      className="site-nav__link"
                      href={item.href}
                      onClick={() => triggerShockwave(0.35, 0)}
                    >
                      {t(item.label)}
                    </a>
                  </li>
                ))}
              </ul>

              <div className="site-nav__tools">
                <button
                  type="button"
                  className="site-nav__lang"
                  onClick={() => {
                    toggleLocale();
                    triggerShockwave(0.45, 2);
                  }}
                  aria-label={
                    locale === 'vi' ? 'Chuyển sang tiếng Anh' : 'Switch to Vietnamese'
                  }
                >
                  {locale === 'vi' ? 'EN' : 'VI'}
                </button>
              </div>
            </nav>

            <div className="site-nav__mobile-controls">
              <button
                type="button"
                className="site-nav__lang"
                onClick={toggleLocale}
                aria-label={
                  locale === 'vi' ? 'Chuyển sang tiếng Anh' : 'Switch to Vietnamese'
                }
              >
                {locale === 'vi' ? 'EN' : 'VI'}
              </button>
              <button
                type="button"
                className="site-nav__toggle"
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-expanded={menuOpen}
                aria-controls="mobile-drawer"
                aria-label={
                  menuOpen
                    ? locale === 'vi'
                      ? 'Đóng menu'
                      : 'Close menu'
                    : locale === 'vi'
                      ? 'Mở menu'
                      : 'Open menu'
                }
              >
                {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
              </button>
            </div>
          </div>
        </div>

        {menuOpen && (
          <nav
            id="mobile-drawer"
            className="site-nav__drawer"
            aria-label={locale === 'vi' ? 'Menu di động' : 'Mobile navigation'}
          >
            <div className="container">
              <ul className="site-nav__drawer-list">
                {NAV_ITEMS.map((item) => (
                  <li key={item.href}>
                    <a
                      className="site-nav__drawer-link"
                      href={item.href}
                      onClick={() => {
                        setMenuOpen(false);
                        triggerShockwave(0.4, 0);
                      }}
                    >
                      {t(item.label)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        )}

        <ScrollProgressRail />
      </header>
    </>
  );
}

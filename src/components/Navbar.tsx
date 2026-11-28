import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { PROFILE } from '../data/profile';
import { ScrollProgressRail } from './SpatialFX';
import { useSpatial } from './SpatialContext';

const NAV_ITEMS = [
  { id: 'live', href: '#live', label: { vi: 'Hoạt động', en: 'Live' } },
  { id: 'products', href: '#products', label: { vi: 'Dự án', en: 'Projects' } },
  { id: 'about', href: '#about', label: { vi: 'Giới thiệu', en: 'About' } },
  { id: 'achievements', href: '#achievements', label: { vi: 'Thành tựu', en: 'Achievements' } },
  { id: 'connect', href: '#connect', label: { vi: 'Liên hệ', en: 'Contact' } },
];

export function Navbar() {
  const { locale, setLocale, t } = useLanguage();
  const { triggerShockwave } = useSpatial();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>('');
  const [scrolled, setScrolled] = useState(false);

  // Lightweight zero-jank scroll-spy tracking active section + compact scrolled state
  useEffect(() => {
    let lastScrolled = window.scrollY > 36;
    setScrolled(lastScrolled);

    const onScroll = () => {
      const next = window.scrollY > 36;
      if (next !== lastScrolled) {
        lastScrolled = next;
        setScrolled(next);
      }
      if (window.scrollY < 260) {
        setActiveId('');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const sections = NAV_ITEMS.map((item) => document.getElementById(item.id)).filter(
      (el): el is HTMLElement => Boolean(el)
    );
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-32% 0px -52% 0px', threshold: 0 }
    );
    for (const sec of sections) io.observe(sec);

    return () => {
      window.removeEventListener('scroll', onScroll);
      io.disconnect();
    };
  }, []);

  const switchLang = (next: 'vi' | 'en') => {
    if (locale === next) return;
    setLocale(next);
    triggerShockwave(0.42, 2);
  };

  return (
    <>
      <a className="skip" href="#main">
        {locale === 'vi' ? 'Bỏ qua điều hướng' : 'Skip to content'}
      </a>
      <header className={`site-nav ${scrolled ? 'site-nav--scrolled' : ''}`} id="top">
        <div className="site-nav__bar">
          {/* Zone 1: Brand Signature */}
          <a
            className="site-nav__brand"
            href="#top"
            aria-label={t(PROFILE.name)}
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setActiveId('');
              triggerShockwave(0.55, 0);
            }}
          >
            <span className="site-nav__avatar-wrap">
              <img
                src="/brand-logo.png"
                width={32}
                height={32}
                alt="ShadyFyrix Logo"
                className="site-nav__logo"
              />
              <span className="site-nav__status-dot" aria-hidden="true" />
            </span>
            <span className="site-nav__brand-text">
              <span className="site-nav__handle">{PROFILE.handle}</span>
              <span className="site-nav__sub mono-num">BETTERCALLSHADY</span>
            </span>
          </a>

          {/* Zone 2: Centered Floating Pill Navigation with Active Scroll-Spy Indicator */}
          <nav
            className="site-nav__desktop"
            aria-label={locale === 'vi' ? 'Điều hướng chính' : 'Primary navigation'}
          >
            <ul className="site-nav__links">
              {NAV_ITEMS.map((item) => {
                const isActive = activeId === item.id;
                return (
                  <li key={item.href} className="site-nav__item">
                    <a
                      className={`site-nav__link ${isActive ? 'is-active' : ''}`}
                      href={item.href}
                      aria-current={isActive ? 'location' : undefined}
                      onClick={() => {
                        setActiveId(item.id);
                        triggerShockwave(0.35, 0);
                      }}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="site-nav-active-pill"
                          className="site-nav__active-bg"
                          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                          aria-hidden="true"
                        />
                      )}
                      <span className="site-nav__link-label">{t(item.label)}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Zone 3: Segmented VI / EN Switcher + Mobile Menu Trigger */}
          <div className="site-nav__right">
            <div
              className="site-nav__lang-seg"
              role="group"
              aria-label={locale === 'vi' ? 'Chọn ngôn ngữ' : 'Language switcher'}
            >
              <button
                type="button"
                className={`site-nav__seg-btn ${locale === 'vi' ? 'is-active' : ''}`}
                aria-pressed={locale === 'vi'}
                onClick={() => switchLang('vi')}
              >
                VI
              </button>
              <button
                type="button"
                className={`site-nav__seg-btn ${locale === 'en' ? 'is-active' : ''}`}
                aria-pressed={locale === 'en'}
                onClick={() => switchLang('en')}
              >
                EN
              </button>
            </div>

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
              {menuOpen ? <X size={19} aria-hidden="true" /> : <Menu size={19} aria-hidden="true" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav
            id="mobile-drawer"
            className="site-nav__drawer"
            aria-label={locale === 'vi' ? 'Menu di động' : 'Mobile navigation'}
          >
            <ul className="site-nav__drawer-list">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <a
                    className={`site-nav__drawer-link ${activeId === item.id ? 'is-active' : ''}`}
                    href={item.href}
                    onClick={() => {
                      setMenuOpen(false);
                      setActiveId(item.id);
                      triggerShockwave(0.4, 0);
                    }}
                  >
                    <span>{t(item.label)}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <ScrollProgressRail />
      </header>
    </>
  );
}

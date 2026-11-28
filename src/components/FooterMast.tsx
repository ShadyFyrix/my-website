import { ArrowUp, Globe } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { PROFILE } from '../data/profile';
import { SOCIAL_LINKS } from '../data/socials';

export function FooterMast() {
  const { locale, setLocale, t } = useLanguage();
  const activeSocials = SOCIAL_LINKS.filter((s) => s.enabled);

  return (
    <footer className="site-footer">
      <div className="container">
        <p className="site-footer__mast" aria-hidden="true">
          {PROFILE.handle}
        </p>

        <div className="site-footer__bar">
          <ul className="site-footer__links">
            <li>
              <a className="site-footer__link" href="#live">
                {locale === 'vi' ? 'Hoạt động' : 'Live'}
              </a>
            </li>
            <li>
              <a className="site-footer__link" href="#products">
                {locale === 'vi' ? 'Dự án' : 'Projects'}
              </a>
            </li>
            <li>
              <a className="site-footer__link" href="#about">
                {locale === 'vi' ? 'Giới thiệu' : 'About'}
              </a>
            </li>
            <li>
              <a className="site-footer__link" href="#achievements">
                {locale === 'vi' ? 'Thành tựu' : 'Achievements'}
              </a>
            </li>
            <li>
              <a className="site-footer__link" href="#connect">
                {locale === 'vi' ? 'Liên hệ' : 'Contact'}
              </a>
            </li>
            {activeSocials.map((s) => (
              <li key={s.id}>
                <a
                  className="site-footer__link"
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {s.name}
                </a>
              </li>
            ))}
          </ul>

          <div className="site-footer__controls">
            <div
              className="site-footer__lang-seg"
              role="group"
              aria-label={locale === 'vi' ? 'Chọn ngôn ngữ' : 'Language switcher'}
            >
              <Globe size={14} className="site-footer__lang-icon" aria-hidden="true" />
              <button
                type="button"
                className={`site-footer__seg-btn ${locale === 'vi' ? 'is-active' : ''}`}
                aria-pressed={locale === 'vi'}
                onClick={() => setLocale('vi')}
              >
                Tiếng Việt
              </button>
              <button
                type="button"
                className={`site-footer__seg-btn ${locale === 'en' ? 'is-active' : ''}`}
                aria-pressed={locale === 'en'}
                onClick={() => setLocale('en')}
              >
                English
              </button>
            </div>

            <button
              type="button"
              className="site-footer__top-btn"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label={locale === 'vi' ? 'Lên đầu trang' : 'Back to top'}
            >
              <ArrowUp size={15} aria-hidden="true" />
              <span>{locale === 'vi' ? 'Đầu trang' : 'Top'}</span>
            </button>
          </div>
        </div>

        <div className="site-footer__meta">
          <p>
            {t(PROFILE.name)} ({PROFILE.handle}) · {t(PROFILE.location)}
          </p>
          <p className="mono-num">React 19 · TypeScript · Three.js GLSL · Cloudflare Workers</p>
        </div>
      </div>
    </footer>
  );
}

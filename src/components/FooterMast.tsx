import { useLanguage } from '../i18n/LanguageContext';
import { PROFILE } from '../data/profile';
import { SOCIAL_LINKS } from '../data/socials';

export function FooterMast() {
  const { locale, toggleLocale, t } = useLanguage();
  const activeSocials = SOCIAL_LINKS.filter((s) => s.enabled);

  return (
    <footer className="site-footer">
      <div className="container">
        <p className="site-footer__mast">{t(PROFILE.name)}</p>

        <div className="site-footer__bar">
          <ul className="site-footer__links">
            <li>
              <a className="site-footer__link" href="#live">
                Live
              </a>
            </li>
            <li>
              <a className="site-footer__link" href="#about">
                {locale === 'vi' ? 'Giới thiệu' : 'About'}
              </a>
            </li>
            <li>
              <a className="site-footer__link" href="#products">
                {locale === 'vi' ? 'Sản phẩm' : 'Products'}
              </a>
            </li>
            <li>
              <a className="site-footer__link" href="#achievements">
                {locale === 'vi' ? 'Thành tựu' : 'Achievements'}
              </a>
            </li>
            <li>
              <a className="site-footer__link" href="#connect">
                {locale === 'vi' ? 'Kết nối' : 'Connect'}
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

          <button type="button" className="site-nav__lang" onClick={toggleLocale}>
            {locale === 'vi' ? 'English' : 'Tiếng Việt'}
          </button>
        </div>

        <div className="site-footer__meta">
          <p>
            {locale === 'vi'
              ? 'Lục Văn Sơn (ShadyFyrix), Thanh Hóa và Hà Nội.'
              : 'Luc Van Son (ShadyFyrix), Thanh Hoa and Hanoi.'}
          </p>
          <p>React 19 · TypeScript · Three.js</p>
        </div>
      </div>
    </footer>
  );
}

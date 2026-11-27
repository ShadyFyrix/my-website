import { useLanguage } from '../i18n/LanguageContext';
import { PROFILE } from '../data/profile';
import { AnimatedRule, DepthSurface, ParallaxFrame, RevealBlock } from './SpatialFX';

export function AboutSection() {
  const { locale, t } = useLanguage();

  return (
    <section className="section section--band-a" id="about" aria-labelledby="about-heading">
      <div className="container">
        <AnimatedRule
          sectionIndex="03"
          sectionLabel={locale === 'vi' ? 'GIỚI THIỆU' : 'ABOUT'}
        />
        <div className="about__grid">
          <RevealBlock className="about__content">
            <h2 id="about-heading">{t(PROFILE.aboutHeading)}</h2>
            <p className="lead about__lead">{t(PROFILE.aboutLead)}</p>
            <p className="about__bio">{t(PROFILE.aboutBio)}</p>

            <dl className="spec-list">
              {PROFILE.specs.map((spec) => (
                <div className="spec-list__row" key={spec.label.en}>
                  <dt className="spec-list__dt">{t(spec.label)}</dt>
                  <dd className="spec-list__dd">{t(spec.value)}</dd>
                </div>
              ))}
            </dl>
          </RevealBlock>

          <RevealBlock delay={0.1}>
            <figure className="about__figure">
              <DepthSurface className="portrait-plate" maxTilt={4.5} beamAlwaysOn>
                <ParallaxFrame className="portrait-slot" offset={22}>
                  <img
                    src={PROFILE.portraitSrc}
                    width={PROFILE.portraitWidth}
                    height={PROFILE.portraitHeight}
                    alt={t(PROFILE.portraitAlt)}
                  />
                </ParallaxFrame>
              </DepthSurface>
              <figcaption className="figure-caption">{t(PROFILE.portraitCaption)}</figcaption>
            </figure>
          </RevealBlock>
        </div>
      </div>
    </section>
  );
}

import { useLanguage } from '../i18n/LanguageContext';
import { PROFILE } from '../data/profile';
import { RevealBlock, TiltPlate } from './MotionPrimitives';

export function AboutSection() {
  const { t } = useLanguage();

  return (
    <section className="section" id="about" aria-labelledby="about-heading">
      <div className="container">
        <div className="about__grid">
          <RevealBlock className="about__content">
            <h2 id="about-heading">{t(PROFILE.aboutHeading)}</h2>
            <p className="lead">{t(PROFILE.aboutLead)}</p>
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

          <RevealBlock delay={0.12}>
            <figure className="about__figure">
              <TiltPlate className="portrait-plate" maxTilt={4}>
                <div
                  className="portrait-slot portrait-slot--avatar"
                  data-slot="portrait"
                  data-kind="product"
                  data-alt={t(PROFILE.portraitAlt)}
                >
                  <img
                    src={PROFILE.portraitSrc}
                    width={PROFILE.portraitWidth}
                    height={PROFILE.portraitHeight}
                    loading="lazy"
                    alt={t(PROFILE.portraitAlt)}
                  />
                </div>
              </TiltPlate>
              <figcaption className="figure-caption">{t(PROFILE.portraitCaption)}</figcaption>
            </figure>
          </RevealBlock>
        </div>
      </div>
    </section>
  );
}

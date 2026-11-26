import { Suspense, lazy, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../i18n/LanguageContext';
import { PROFILE } from '../data/profile';
import { PRODUCTS } from '../data/products';
import { MagneticWrap, TiltPlate } from './MotionPrimitives';

const NotGunGun3DViewer = lazy(() =>
  import('./NotGunGun3DViewer').then((m) => ({ default: m.NotGunGun3DViewer }))
);

type ShowcaseKey = 'vibe-gif-studio' | 'notgungun-3d' | 'examguard-ai';

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export function HeroStage() {
  const { locale, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<ShowcaseKey>('vibe-gif-studio');
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const vibeProduct = PRODUCTS.find((p) => p.id === 'vibe-gif-studio')!;
  const notGunProduct = PRODUCTS.find((p) => p.id === 'notgungun-ultimatum')!;
  const examguardProduct = PRODUCTS.find((p) => p.id === 'examguard-ai')!;

  const headlineLines =
    locale === 'vi'
      ? ['LỤC VĂN SƠN,', 'KỸ SƯ AI VÀ WEB']
      : ['LUC VAN SON,', 'AI & WEB ENGINEER'];

  const tabs: Array<{ key: ShowcaseKey; label: string }> = [
    { key: 'vibe-gif-studio', label: 'Vibe GIF Studio' },
    { key: 'notgungun-3d', label: 'NotGunGun 3D' },
    { key: 'examguard-ai', label: 'ExamGuard AI' },
  ];

  const handleTabKeyDown = (index: number, event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const nextIndex =
      event.key === 'ArrowRight'
        ? (index + 1) % tabs.length
        : (index - 1 + tabs.length) % tabs.length;
    setActiveTab(tabs[nextIndex].key);
    tabRefs.current[nextIndex]?.focus();
  };

  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div className="hero__grid-bg" aria-hidden="true" />
      <div className="container">
        <div className="hero__grid">
          <div className="hero__copy">
            <h1 className="hero__headline" id="hero-heading">
              {headlineLines.map((line, i) => (
                <span className="hero__line-mask" key={line}>
                  <motion.span
                    className="hero__line-inner"
                    initial={{ y: '105%', opacity: 0 }}
                    animate={{ y: '0%', opacity: 1 }}
                    transition={{ duration: 0.55, delay: i * 0.1, ease: EASE_OUT }}
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.p
              className="lead hero__lead"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.48, delay: 0.22, ease: EASE_OUT }}
            >
              {t(PROFILE.heroLead)}
            </motion.p>

            <motion.div
              className="hero__actions"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.48, delay: 0.32, ease: EASE_OUT }}
            >
              <MagneticWrap>
                <a className="btn btn--primary" href="#products">
                  {locale === 'vi' ? 'Xem sản phẩm' : 'View products'}
                </a>
              </MagneticWrap>
              <MagneticWrap>
                <a className="btn btn--secondary" href="#live">
                  {locale === 'vi' ? 'Dữ liệu thực' : 'Live feed'}
                </a>
              </MagneticWrap>
            </motion.div>
          </div>

          <motion.div
            className="hero__visual"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.56, delay: 0.16, ease: EASE_OUT }}
          >
            <TiltPlate className="hero__frame" maxTilt={3.2}>
              <div
                id="hero-panel-vibe"
                role="tabpanel"
                aria-labelledby="hero-tab-vibe"
                hidden={activeTab !== 'vibe-gif-studio'}
                className="hero__panel"
              >
                <div
                  className="hero__slot hero__slot--color"
                  data-slot="hero-showcase"
                  data-kind="product"
                  data-alt={t(vibeProduct.imageAlt)}
                >
                  <img
                    src={vibeProduct.image}
                    width={vibeProduct.imageWidth}
                    height={vibeProduct.imageHeight}
                    alt={t(vibeProduct.imageAlt)}
                    fetchPriority="high"
                  />
                </div>
              </div>

              <div
                id="hero-panel-notgungun"
                role="tabpanel"
                aria-labelledby="hero-tab-notgungun"
                hidden={activeTab !== 'notgungun-3d'}
                className="hero__panel"
              >
                <div className="hero__slot hero__slot--3d">
                  {activeTab === 'notgungun-3d' && (
                    <Suspense
                      fallback={
                        <img
                          src={notGunProduct.image}
                          width={notGunProduct.imageWidth}
                          height={notGunProduct.imageHeight}
                          alt={t(notGunProduct.imageAlt)}
                          className="viewer3d__fallback-img"
                        />
                      }
                    >
                      <NotGunGun3DViewer compact />
                    </Suspense>
                  )}
                </div>
              </div>

              <div
                id="hero-panel-examguard"
                role="tabpanel"
                aria-labelledby="hero-tab-examguard"
                hidden={activeTab !== 'examguard-ai'}
                className="hero__panel"
              >
                <div
                  className="hero__slot"
                  data-slot="hero-examguard"
                  data-kind="product"
                  data-alt={t(examguardProduct.imageAlt)}
                >
                  <div className="arch-preview">
                    <div className="arch-preview__head">
                      <span className="arch-preview__title">{examguardProduct.title}</span>
                      <span className="num-year arch-preview__year">{examguardProduct.year}</span>
                    </div>
                    <dl className="arch-preview__rows">
                      {examguardProduct.architectureSpecs.map((spec) => (
                        <div className="arch-preview__cell" key={spec.label.en}>
                          <dt className="arch-preview__dt">{t(spec.label)}</dt>
                          <dd className="arch-preview__dd">{t(spec.value)}</dd>
                        </div>
                      ))}
                    </dl>
                    <div className="arch-preview__foot">
                      <span>{t(examguardProduct.role)}</span>
                      <span>Zero-Trust Proctoring</span>
                    </div>
                  </div>
                </div>
              </div>
            </TiltPlate>

            <div className="hero__switcher">
              <div
                className="tablist"
                role="tablist"
                aria-label={locale === 'vi' ? 'Sản phẩm tiêu biểu' : 'Featured showcase'}
              >
                {tabs.map((tab, index) => {
                  const isActive = activeTab === tab.key;
                  const id =
                    tab.key === 'vibe-gif-studio'
                      ? 'hero-tab-vibe'
                      : tab.key === 'notgungun-3d'
                        ? 'hero-tab-notgungun'
                        : 'hero-tab-examguard';
                  const controls =
                    tab.key === 'vibe-gif-studio'
                      ? 'hero-panel-vibe'
                      : tab.key === 'notgungun-3d'
                        ? 'hero-panel-notgungun'
                        : 'hero-panel-examguard';
                  return (
                    <button
                      key={tab.key}
                      ref={(el) => {
                        tabRefs.current[index] = el;
                      }}
                      id={id}
                      type="button"
                      role="tab"
                      className="tab-btn tab-btn--motion"
                      aria-selected={isActive}
                      aria-controls={controls}
                      tabIndex={isActive ? 0 : -1}
                      onClick={() => setActiveTab(tab.key)}
                      onKeyDown={(e) => handleTabKeyDown(index, e)}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="hero-tab-bg"
                          className="tab-btn__bg"
                          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                          aria-hidden="true"
                        />
                      )}
                      <span className="tab-btn__text">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              <p className="hero__caption">
                {activeTab === 'vibe-gif-studio'
                  ? locale === 'vi'
                    ? 'Ảnh màn hình thật: WASAPI FFT & ONNX'
                    : 'Live capture: WASAPI FFT & ONNX'
                  : activeTab === 'notgungun-3d'
                    ? locale === 'vi'
                      ? 'Xoay 3D & nghe âm thanh .ogg trực tiếp'
                      : 'Drag to orbit 3D & play .ogg SFX'
                    : locale === 'vi'
                      ? 'Đồ án Tốt nghiệp: Face KYC & 3D Proctoring'
                      : 'Graduation thesis: Face KYC & 3D Proctoring'}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

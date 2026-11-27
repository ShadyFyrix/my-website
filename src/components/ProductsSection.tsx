import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, Box } from 'lucide-react';
import { motion, useMotionValueEvent, useScroll, useTransform } from 'motion/react';
import { useLanguage } from '../i18n/LanguageContext';
import { PRODUCTS } from '../data/products';
import type { BilingualText, ProductCategory, ProductItem } from '../data/types';
import { useSpatial } from './SpatialContext';
import { AnimatedRule, DepthSurface } from './SpatialFX';
import { ProductModal } from './ProductModal';

type FilterValue = 'all' | ProductCategory;

const FILTERS: Array<{ value: FilterValue; label: BilingualText }> = [
  { value: 'all', label: { vi: 'Tất cả', en: 'All' } },
  { value: 'ai', label: { vi: 'AI & Thị giác', en: 'AI & Vision' } },
  { value: 'systems', label: { vi: 'Web & Hệ thống', en: 'Web & Systems' } },
  { value: 'creative', label: { vi: 'Sáng tạo & 3D', en: 'Creative & 3D' } },
];

export function ProductsSection() {
  const { locale, t } = useLanguage();
  const { triggerShockwave, setHoveredProject } = useSpatial();
  const [activeFilter, setActiveFilter] = useState<FilterValue>('all');
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [maxShift, setMaxShift] = useState(0);
  const [isDesktop, setIsDesktop] = useState(true);
  const [activeIndex, setActiveIndex] = useState(1);

  const runwayRef = useRef<HTMLElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const visibleProducts = useMemo(
    () =>
      PRODUCTS.filter(
        (item) => item.visible && (activeFilter === 'all' || item.category === activeFilter)
      ),
    [activeFilter]
  );

  useEffect(() => {
    const measure = () => {
      const desktop = window.innerWidth >= 960;
      setIsDesktop(desktop);
      if (!desktop || !viewportRef.current || !trackRef.current) {
        setMaxShift(0);
        return;
      }
      const overflow = Math.max(0, trackRef.current.scrollWidth - viewportRef.current.clientWidth);
      setMaxShift(overflow);
    };

    measure();
    const ro = new ResizeObserver(measure);
    if (viewportRef.current) ro.observe(viewportRef.current);
    if (trackRef.current) ro.observe(trackRef.current);
    window.addEventListener('resize', measure);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [visibleProducts.length]);

  const { scrollYProgress } = useScroll({
    target: runwayRef,
    offset: ['start start', 'end end'],
  });

  const x = useTransform(scrollYProgress, [0, 1], [0, -maxShift]);
  const progressScale = useTransform(scrollYProgress, [0, 1], [0.08, 1]);

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const count = Math.max(1, visibleProducts.length);
    const idx = Math.min(count, Math.max(1, Math.round(latest * (count - 1)) + 1));
    setActiveIndex(idx);
  });

  const runwayHeight =
    isDesktop && maxShift > 40 ? `calc(100dvh + ${Math.round(maxShift * 0.92)}px)` : 'auto';

  return (
    <section
      ref={runwayRef}
      className="hscroll-runway"
      id="products"
      aria-labelledby="products-heading"
      style={{ height: runwayHeight }}
    >
      <div className="hscroll-sticky">
        <div className="container hscroll-header">
          <AnimatedRule
            sectionIndex="02"
            sectionLabel={locale === 'vi' ? 'SẢN PHẨM · CUỘN NGANG' : 'PRODUCTS · HORIZONTAL'}
          />

          <div className="hscroll-head-row">
            <div>
              <h2 id="products-heading">
                {locale === 'vi' ? 'SẢN PHẨM ĐÃ XÂY DỰNG' : 'SHIPPED PRODUCTS'}
              </h2>
            </div>

            <div className="hscroll-hint">
              <span>
                {isDesktop
                  ? locale === 'vi'
                    ? 'Cuộn chuột để trượt ngang qua từng sản phẩm'
                    : 'Scroll vertically to glide horizontally through builds'
                  : locale === 'vi'
                    ? 'Vuốt ngang để xem sản phẩm'
                    : 'Swipe horizontally to explore'}
              </span>
              <ArrowRight size={14} aria-hidden="true" />
            </div>
          </div>

          <div className="hscroll-controls">
            <div
              className="filter-row"
              role="group"
              aria-label={locale === 'vi' ? 'Lọc nhóm sản phẩm' : 'Filter product categories'}
            >
              {FILTERS.map((filter) => {
                const isPressed = activeFilter === filter.value;
                return (
                  <button
                    key={filter.value}
                    type="button"
                    className="dock-tab"
                    aria-pressed={isPressed}
                    onClick={() => {
                      setActiveFilter(filter.value);
                      setActiveIndex(1);
                      triggerShockwave(0.45, 0);
                    }}
                  >
                    {isPressed && (
                      <motion.span
                        layoutId="spatial-filter-bg"
                        className="dock-tab__bg"
                        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                        aria-hidden="true"
                      />
                    )}
                    <span className="dock-tab__label">{t(filter.label)}</span>
                  </button>
                );
              })}
            </div>

            {isDesktop && maxShift > 40 && (
              <div className="hscroll-progress-wrap" aria-hidden="true">
                <div className="hscroll-progress-bar">
                  <motion.div
                    className="hscroll-progress-fill"
                    style={{ scaleX: progressScale }}
                  />
                </div>
                <span className="hscroll-counter mono-num">
                  {String(activeIndex).padStart(2, '0')} /{' '}
                  {String(visibleProducts.length).padStart(2, '0')}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="hscroll-viewport" ref={viewportRef}>
          <motion.div
            ref={trackRef}
            className="hscroll-track"
            style={isDesktop && maxShift > 40 ? { x } : undefined}
          >
            {visibleProducts.map((product, idx) => (
              <div className="hscroll-card-wrap" key={product.id}>
                <DepthSurface
                  className="hscroll-card"
                  maxTilt={3.6}
                  cursorMode="inspect"
                  beamAlwaysOn={product.featured}
                  onMouseEnter={() => setHoveredProject(idx)}
                  onMouseLeave={() => setHoveredProject(-1)}
                >
                  {product.image ? (
                    <div className="hscroll-card__media">
                      <img
                        src={product.image}
                        width={product.imageWidth}
                        height={product.imageHeight}
                        alt={t(product.imageAlt)}
                      />
                      <span className="hscroll-card__num mono-num">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                    </div>
                  ) : (
                    <div className="hscroll-card__specs">
                      {product.architectureSpecs.slice(0, 3).map((spec) => (
                        <div className="hscroll-card__spec-item" key={spec.label.en}>
                          <span>{t(spec.label)}</span>
                          <strong>{t(spec.value)}</strong>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="hscroll-card__body">
                    <div className="hscroll-card__top">
                      <h3 className="hscroll-card__title">{product.title}</h3>
                      <span className="mono-num hscroll-card__year">{product.year}</span>
                    </div>
                    <p className="hscroll-card__summary">{t(product.summary)}</p>
                    <div className="hscroll-card__stack">
                      {product.stack.slice(0, 3).map((tech) => (
                        <span className="hscroll-card__tag" key={tech}>
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="hscroll-card__actions">
                    <button
                      type="button"
                      className="btn btn--ghost btn--compact"
                      onClick={() => {
                        triggerShockwave(0.6, product.has3DViewer ? 0 : 2);
                        setSelectedProduct(product);
                      }}
                    >
                      {product.has3DViewer && <Box size={15} aria-hidden="true" />}
                      <span>
                        {product.has3DViewer
                          ? locale === 'vi'
                            ? 'Xem 3D & Chi tiết'
                            : 'Inspect 3D'
                          : locale === 'vi'
                            ? 'Xem chi tiết'
                            : 'Case study'}
                      </span>
                    </button>
                    {product.repoUrl && (
                      <a
                        className="inline-link"
                        href={product.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span>GitHub</span>
                        <ArrowUpRight size={15} aria-hidden="true" />
                      </a>
                    )}
                  </div>
                </DepthSurface>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </section>
  );
}

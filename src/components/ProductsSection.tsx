import { useMemo, useState } from 'react';
import { ArrowUpRight, Box } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useLanguage } from '../i18n/LanguageContext';
import { PRODUCTS } from '../data/products';
import type { BilingualText, ProductCategory, ProductItem } from '../data/types';
import { AnimatedRule, RevealBlock, TiltPlate } from './MotionPrimitives';
import { ProductModal } from './ProductModal';

type FilterValue = 'all' | ProductCategory;

const FILTERS: Array<{ value: FilterValue; label: BilingualText }> = [
  { value: 'all', label: { vi: 'Tất cả', en: 'All' } },
  { value: 'ai', label: { vi: 'AI và Thị giác', en: 'AI and Vision' } },
  { value: 'systems', label: { vi: 'Web và Hệ thống', en: 'Web and Systems' } },
  { value: 'creative', label: { vi: 'Sáng tạo & 3D', en: 'Creative & 3D' } },
];

export function ProductsSection() {
  const { locale, t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<FilterValue>('all');
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);

  const visibleProducts = useMemo(
    () =>
      PRODUCTS.filter(
        (item) => item.visible && (activeFilter === 'all' || item.category === activeFilter)
      ),
    [activeFilter]
  );

  // Pair top 2 featured items in the asymmetric 7:5 row, then place any 3rd featured + rest in the index
  const featuredPair = useMemo(
    () => visibleProducts.filter((item) => item.featured).slice(0, 2),
    [visibleProducts]
  );

  const featuredPairIds = useMemo(
    () => new Set(featuredPair.map((p) => p.id)),
    [featuredPair]
  );

  const indexProducts = useMemo(
    () => visibleProducts.filter((item) => !featuredPairIds.has(item.id)),
    [visibleProducts, featuredPairIds]
  );

  return (
    <section
      className="section section--wide"
      id="products"
      aria-labelledby="products-heading"
    >
      <div className="container">
        <AnimatedRule />
        <div className="section__head section__head--plain">
          <h2 id="products-heading">
            {locale === 'vi' ? 'SẢN PHẨM ĐÃ XÂY DỰNG' : 'SHIPPED PRODUCTS'}
          </h2>
          <p className="section__lead">
            {locale === 'vi'
              ? 'Từ phần mềm AI thị giác, xử lý âm thanh đến game 2D và mô hình vũ khí 3D.'
              : 'From applied vision AI and audio tools to 2D indie games and 3D voxel mods.'}
          </p>
        </div>

        <div
          className="filter-row"
          role="group"
          aria-label={locale === 'vi' ? 'Lọc theo lĩnh vực' : 'Filter by category'}
        >
          {FILTERS.map((filter) => {
            const isPressed = activeFilter === filter.value;
            return (
              <button
                key={filter.value}
                type="button"
                className="tab-btn tab-btn--motion"
                aria-pressed={isPressed}
                onClick={() => setActiveFilter(filter.value)}
              >
                {isPressed && (
                  <motion.span
                    layoutId="filter-tab-bg"
                    className="tab-btn__bg"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    aria-hidden="true"
                  />
                )}
                <span className="tab-btn__text">{t(filter.label)}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="popLayout">
          {featuredPair.length > 0 && (
            <motion.div
              layout
              key={`featured-${activeFilter}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className={
                featuredPair.length === 1
                  ? 'featured-grid featured-grid--single'
                  : 'featured-grid'
              }
            >
              {featuredPair.map((product) => (
                <TiltPlate className="product-card" key={product.id} maxTilt={3.2}>
                  {product.image ? (
                    <div
                      className="product-card__media hero__slot--color"
                      data-slot={`product-${product.id}`}
                      data-kind="product"
                      data-alt={t(product.imageAlt)}
                    >
                      <img
                        src={product.image}
                        width={product.imageWidth}
                        height={product.imageHeight}
                        sizes="(min-width: 60rem) 45vw, 100vw"
                        loading="lazy"
                        alt={t(product.imageAlt)}
                      />
                    </div>
                  ) : (
                    <div className="product-card__spec-box">
                      {product.architectureSpecs.slice(0, 3).map((spec) => (
                        <div className="product-card__spec-row" key={spec.label.en}>
                          <span>{t(spec.label)}</span>
                          <strong>{t(spec.value)}</strong>
                        </div>
                      ))}
                    </div>
                  )}

                  <div>
                    <div className="product-card__top">
                      <h3 className="product-card__title">{product.title}</h3>
                      <span className="num-year product-card__meta">{product.year}</span>
                    </div>
                    <p className="product-card__meta">{t(product.role)}</p>
                  </div>

                  <p className="product-card__summary">{t(product.summary)}</p>

                  <div className="product-card__actions">
                    <button
                      type="button"
                      className="btn btn--secondary btn--compact"
                      onClick={() => setSelectedProduct(product)}
                    >
                      {product.has3DViewer && <Box size={16} aria-hidden="true" />}
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
                        <ArrowUpRight size={16} aria-hidden="true" />
                      </a>
                    )}
                  </div>
                </TiltPlate>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {indexProducts.length > 0 && (
          <RevealBlock>
            <ul className="product-index">
              {indexProducts.map((product) => (
                <li className="product-index__row" key={product.id}>
                  <span className="num-year product-card__meta">{product.year}</span>
                  <div>
                    <h3 className="product-index__title">{product.title}</h3>
                    <p className="stack-text">{product.stack.slice(0, 3).join(', ')}</p>
                  </div>
                  <p className="product-index__summary">{t(product.summary)}</p>
                  <div className="product-index__actions">
                    <button
                      type="button"
                      className="btn btn--secondary btn--compact"
                      onClick={() => setSelectedProduct(product)}
                    >
                      {locale === 'vi' ? 'Chi tiết' : 'Details'}
                    </button>
                    {product.repoUrl && (
                      <a
                        className="inline-link"
                        href={product.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${product.title} GitHub`}
                      >
                        <span>GitHub</span>
                        <ArrowUpRight size={16} aria-hidden="true" />
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </RevealBlock>
        )}
      </div>

      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </section>
  );
}

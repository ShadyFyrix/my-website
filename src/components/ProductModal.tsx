import { Suspense, lazy, useEffect, useRef } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import type { ProductItem } from '../data/types';

const NotGunGun3DViewer = lazy(() =>
  import('./NotGunGun3DViewer').then((m) => ({ default: m.NotGunGun3DViewer }))
);

interface ProductModalProps {
  product: ProductItem | null;
  onClose: () => void;
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  const { locale, t } = useLanguage();
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (product) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [product]);

  return (
    <dialog
      ref={dialogRef}
      className="case-dialog"
      aria-labelledby="case-dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          onClose();
        }
      }}
    >
      {product && (
        <>
          <header className="case-dialog__header">
            <div>
              <h3 className="case-dialog__title" id="case-dialog-title">
                {product.title}
              </h3>
              <p className="case-dialog__meta">
                <span className="mono-num">{product.year}</span> · {t(product.role)}
              </p>
            </div>
            <button
              type="button"
              className="case-dialog__close"
              onClick={onClose}
              aria-label={locale === 'vi' ? 'Đóng chi tiết sản phẩm' : 'Close product case study'}
            >
              <X size={20} aria-hidden="true" />
            </button>
          </header>

          <div className="case-dialog__body">
            {product.has3DViewer ? (
              <div className="case-dialog__viewer">
                <Suspense
                  fallback={
                    product.image ? (
                      <img
                        className="case-dialog__image"
                        src={product.image}
                        width={product.imageWidth}
                        height={product.imageHeight}
                        alt={t(product.imageAlt)}
                      />
                    ) : null
                  }
                >
                  <NotGunGun3DViewer />
                </Suspense>
              </div>
            ) : (
              product.image && (
                <img
                  className="case-dialog__image"
                  src={product.image}
                  width={product.imageWidth}
                  height={product.imageHeight}
                  alt={t(product.imageAlt)}
                />
              )
            )}

            <div className="case-dialog__grid">
              <div>
                <h4 className="case-dialog__section-title">
                  {locale === 'vi' ? 'BÀI TOÁN ĐẶT RA' : 'PROBLEM STATEMENT'}
                </h4>
                <p>{t(product.problem)}</p>
              </div>
              <div>
                <h4 className="case-dialog__section-title">
                  {locale === 'vi' ? 'KIẾN TRÚC GIẢI PHÁP' : 'SOLUTION ARCHITECTURE'}
                </h4>
                <p>{t(product.solution)}</p>
              </div>
            </div>

            {product.highlights.length > 0 && (
              <div>
                <h4 className="case-dialog__section-title">
                  {locale === 'vi' ? 'ĐIỂM NỔI BẬT KỸ THUẬT' : 'KEY HIGHLIGHTS'}
                </h4>
                <ul className="case-dialog__list">
                  {product.highlights.map((item, idx) => (
                    <li key={idx}>{t(item)}</li>
                  ))}
                </ul>
              </div>
            )}

            {product.architectureSpecs.length > 0 && (
              <dl className="spec-list">
                {product.architectureSpecs.map((spec) => (
                  <div className="spec-list__row" key={spec.label.en}>
                    <dt className="spec-list__dt">{t(spec.label)}</dt>
                    <dd className="spec-list__dd">{t(spec.value)}</dd>
                  </div>
                ))}
              </dl>
            )}

            <div className="case-dialog__footer">
              <p className="stack-text mono-num">{product.stack.join(' · ')}</p>
              <div className="product-index__actions">
                {product.repoUrl && (
                  <a
                    className="btn btn--primary btn--compact"
                    href={product.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>GitHub</span>
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </a>
                )}
                {product.liveUrl && (
                  <a
                    className="btn btn--ghost btn--compact"
                    href={product.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>{locale === 'vi' ? 'Bản chạy thử' : 'Live demo'}</span>
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </a>
                )}
                <button type="button" className="btn btn--ghost btn--compact" onClick={onClose}>
                  {locale === 'vi' ? 'Đóng' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </dialog>
  );
}

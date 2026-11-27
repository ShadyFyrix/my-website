import { ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../i18n/LanguageContext';
import { ACHIEVEMENTS } from '../data/achievements';
import { AnimatedRule } from './SpatialFX';

export function AchievementsSection() {
  const { locale, t } = useLanguage();

  return (
    <section
      className="section section--band-b"
      id="achievements"
      aria-labelledby="achievements-heading"
    >
      <div className="container">
        <AnimatedRule
          sectionIndex="04"
          sectionLabel={locale === 'vi' ? 'THÀNH TỰU' : 'ACHIEVEMENTS'}
        />
        <div className="section__head">
          <h2 id="achievements-heading">
            {locale === 'vi' ? 'THÀNH TỰU & CỘT MỐC' : 'ACHIEVEMENTS & MILESTONES'}
          </h2>
          <p className="section__lead">
            {locale === 'vi'
              ? 'Đồ án tốt nghiệp, nghiên cứu khoa học, kênh sáng tạo và mô hình 3D.'
              : 'Graduation thesis, scientific research, creator milestones, and 3D packs.'}
          </p>
        </div>

        <ol className="ledger-list">
          {ACHIEVEMENTS.map((item, idx) => (
            <motion.li
              className="ledger-list__row kinetic-row"
              key={item.id}
              initial={{ opacity: 0.14, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 'some' }}
              transition={{ duration: 0.42, delay: idx * 0.04, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="mono-num ledger-list__year">{item.year}</span>
              <div>
                <h3 className="ledger-list__title">{t(item.title)}</h3>
                <p className="ledger-list__org">{t(item.organization)}</p>
              </div>
              <p className="ledger-list__detail">{t(item.detail)}</p>
              <div className="ledger-list__link-col">
                {item.linkUrl && item.linkLabel && (
                  <a
                    className="inline-link"
                    href={item.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>{t(item.linkLabel)}</span>
                    <ArrowUpRight size={15} aria-hidden="true" />
                  </a>
                )}
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}

import { ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../i18n/LanguageContext';
import { ACHIEVEMENTS } from '../data/achievements';
import { useLiveData } from '../hooks/useLiveData';
import { AnimatedRule, MotionHeadline } from './SpatialFX';

export function AchievementsSection() {
  const { locale, t } = useLanguage();
  const { data } = useLiveData();

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
          <MotionHeadline
            id="achievements-heading"
            text={locale === 'vi' ? 'THÀNH TỰU & CỘT MỐC' : 'ACHIEVEMENTS & MILESTONES'}
          />
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
              initial={{ opacity: 0, y: 28, rotateX: -32, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ duration: 0.54, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: '50% 88%', transformPerspective: 1050 }}
            >
              <span className="mono-num ledger-list__year">{item.year}</span>
              <div>
                <h3 className="ledger-list__title">{t(item.title)}</h3>
                <p className="ledger-list__org">{t(item.organization)}</p>
              </div>
              <p className="ledger-list__detail">
                {item.id === 'ach-youtube'
                  ? locale === 'vi'
                    ? `Duy trì sáng tạo từ năm ${data.youtube.joinedYear}, đạt ${data.youtube.subscribers.toLocaleString('en-US')}+ người đăng ký và ${data.youtube.videoCount.toLocaleString('en-US')} video đã xuất bản.`
                    : `Active since ${data.youtube.joinedYear} with ${data.youtube.subscribers.toLocaleString('en-US')}+ subscribers and ${data.youtube.videoCount.toLocaleString('en-US')} published gaming and showcase videos.`
                  : t(item.detail)}
              </p>
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

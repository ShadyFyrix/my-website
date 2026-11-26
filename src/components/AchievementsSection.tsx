import { ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { ACHIEVEMENTS } from '../data/achievements';
import { AnimatedRule, RevealBlock } from './MotionPrimitives';

export function AchievementsSection() {
  const { locale, t } = useLanguage();

  return (
    <section
      className="section section--cast"
      id="achievements"
      aria-labelledby="achievements-heading"
    >
      <div className="container">
        <AnimatedRule />
        <div className="section__head section__head--plain">
          <h2 id="achievements-heading">
            {locale === 'vi' ? 'THÀNH TỰU VÀ CỘT MỐC' : 'ACHIEVEMENTS AND MILESTONES'}
          </h2>
          <p className="section__lead">
            {locale === 'vi'
              ? 'Đồ án, nghiên cứu khoa học, kênh sáng tạo và mô hình 3D.'
              : 'Thesis work, scientific research, creator milestones, and 3D releases.'}
          </p>
        </div>

        <RevealBlock>
          <ol className="ledger-list">
            {ACHIEVEMENTS.map((item) => (
              <li className="ledger-list__row" key={item.id}>
                <span className="num-year ledger-list__year">{item.year}</span>
                <div>
                  <h3>{t(item.title)}</h3>
                  <p className="ledger-list__org">{t(item.organization)}</p>
                </div>
                <p className="ledger-list__detail">{t(item.detail)}</p>
                <div>
                  {item.linkUrl && item.linkLabel && (
                    <a
                      className="inline-link"
                      href={item.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span>{t(item.linkLabel)}</span>
                      <ArrowUpRight size={16} aria-hidden="true" />
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </RevealBlock>
      </div>
    </section>
  );
}

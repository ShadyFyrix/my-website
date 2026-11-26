import { useState } from 'react';
import {
  ArrowUpRight,
  Briefcase,
  Camera,
  Check,
  Code2,
  Copy,
  FileText,
  Gamepad2,
  Globe,
  Mail,
  MessageSquare,
  Video,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { PROFILE } from '../data/profile';
import { SOCIAL_LINKS } from '../data/socials';
import type { SocialPlatform } from '../data/types';
import { AnimatedRule, MagneticWrap, RevealBlock, TiltPlate } from './MotionPrimitives';

function SocialIcon({ platform }: { platform: SocialPlatform }) {
  switch (platform) {
    case 'github':
      return <Code2 size={20} aria-hidden="true" />;
    case 'youtube':
    case 'tiktok':
      return <Video size={20} aria-hidden="true" />;
    case 'steam':
      return <Gamepad2 size={20} aria-hidden="true" />;
    case 'linkedin':
      return <Briefcase size={20} aria-hidden="true" />;
    case 'instagram':
      return <Camera size={20} aria-hidden="true" />;
    case 'facebook':
    case 'zalo':
      return <MessageSquare size={20} aria-hidden="true" />;
    default:
      return <Globe size={20} aria-hidden="true" />;
  }
}

export function ConnectSection() {
  const { locale, t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const activeSocials = SOCIAL_LINKS.filter((item) => item.enabled);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = PROFILE.email;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2500);
      } finally {
        document.body.removeChild(textarea);
      }
    }
  };

  return (
    <section className="section section--wide" id="connect" aria-labelledby="connect-heading">
      <div className="container">
        <AnimatedRule />
        <div className="section__head section__head--plain">
          <h2 id="connect-heading">
            {locale === 'vi' ? 'MẠNG CÁ NHÂN VÀ LIÊN HỆ' : 'NETWORKS AND CONTACT'}
          </h2>
          <p className="section__lead">
            {locale === 'vi'
              ? 'GitHub, YouTube, Facebook, Steam và email cá nhân.'
              : 'GitHub, YouTube, Facebook, Steam, and direct email.'}
          </p>
        </div>

        <RevealBlock>
          <div className="connect-grid">
            <TiltPlate className="connect-plate" maxTilt={3.2}>
              <h3 className="connect-plate__title">
                {locale === 'vi' ? 'TRANG MẠNG CÁ NHÂN' : 'PERSONAL NETWORKS'}
              </h3>

              <ul className="social-list">
                {activeSocials.map((social) => (
                  <li key={social.id}>
                    <a
                      className="social-list__link"
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="social-list__identity">
                        <SocialIcon platform={social.platform} />
                        <span>{social.name}</span>
                      </span>
                      <span className="social-list__handle">
                        {social.handle}{' '}
                        <ArrowUpRight
                          size={16}
                          className="social-list__arrow"
                          aria-hidden="true"
                        />
                      </span>
                    </a>
                  </li>
                ))}
                <li>
                  <a className="social-list__link" href={`mailto:${PROFILE.email}`}>
                    <span className="social-list__identity">
                      <Mail size={20} aria-hidden="true" />
                      <span>Email</span>
                    </span>
                    <span className="social-list__handle">{PROFILE.email}</span>
                  </a>
                </li>
              </ul>
            </TiltPlate>

            <TiltPlate className="connect-plate" maxTilt={3.2}>
              <h3 className="connect-plate__title">
                {locale === 'vi' ? 'LIÊN HỆ TRỰC TIẾP' : 'DIRECT CONTACT'}
              </h3>
              <p className="product-card__summary">
                {locale === 'vi'
                  ? 'Trao đổi về phần mềm, ứng dụng AI, dự án 3D hoặc hợp tác.'
                  : 'Open to software, applied AI, 3D modeling, and project collaboration.'}
              </p>
              <p className="connect-plate__email">{PROFILE.email}</p>
              <p className="social-list__handle">{t(PROFILE.location)}</p>

              <div className="connect-plate__actions">
                <MagneticWrap>
                  <a className="btn btn--secondary" href={`mailto:${PROFILE.email}`}>
                    <Mail size={18} aria-hidden="true" />
                    <span>{locale === 'vi' ? 'Gửi email' : 'Send email'}</span>
                  </a>
                </MagneticWrap>
                <MagneticWrap>
                  <button
                    type="button"
                    className="btn btn--secondary"
                    onClick={handleCopyEmail}
                  >
                    {copied ? (
                      <>
                        <Check size={18} aria-hidden="true" />
                        <span>{locale === 'vi' ? 'Đã sao chép email' : 'Email copied'}</span>
                      </>
                    ) : (
                      <>
                        <Copy size={18} aria-hidden="true" />
                        <span>{locale === 'vi' ? 'Sao chép email' : 'Copy email'}</span>
                      </>
                    )}
                  </button>
                </MagneticWrap>
                {PROFILE.cvUrl && (
                  <a
                    className="btn btn--secondary"
                    href={PROFILE.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FileText size={18} aria-hidden="true" />
                    <span>{locale === 'vi' ? 'Tải CV' : 'Download CV'}</span>
                  </a>
                )}
              </div>
            </TiltPlate>
          </div>
        </RevealBlock>
      </div>
    </section>
  );
}

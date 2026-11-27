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
import { useSpatial } from './SpatialContext';
import { AnimatedRule, DepthSurface, MagneticWrap, RevealBlock } from './SpatialFX';

function SocialIcon({ platform }: { platform: SocialPlatform }) {
  switch (platform) {
    case 'github':
      return <Code2 size={18} aria-hidden="true" />;
    case 'youtube':
    case 'tiktok':
      return <Video size={18} aria-hidden="true" />;
    case 'steam':
      return <Gamepad2 size={18} aria-hidden="true" />;
    case 'linkedin':
      return <Briefcase size={18} aria-hidden="true" />;
    case 'instagram':
      return <Camera size={18} aria-hidden="true" />;
    case 'facebook':
    case 'zalo':
      return <MessageSquare size={18} aria-hidden="true" />;
    default:
      return <Globe size={18} aria-hidden="true" />;
  }
}

export function ConnectSection() {
  const { locale, t } = useLanguage();
  const { triggerShockwave } = useSpatial();
  const [copied, setCopied] = useState(false);

  const activeSocials = SOCIAL_LINKS.filter((item) => item.enabled);

  const handleCopyEmail = async () => {
    triggerShockwave(0.85, 0);
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
    <section
      className="section section--band-a"
      id="connect"
      aria-labelledby="connect-heading"
    >
      <div className="container">
        <AnimatedRule
          sectionIndex="05"
          sectionLabel={locale === 'vi' ? 'KẾT NỐI' : 'CONNECT'}
        />
        <div className="section__head">
          <h2 id="connect-heading">
            {locale === 'vi' ? 'MẠNG CÁ NHÂN & LIÊN HỆ' : 'NETWORKS & CONTACT'}
          </h2>
          <p className="section__lead">
            {locale === 'vi'
              ? 'GitHub, YouTube, Facebook, Steam và email trao đổi trực tiếp.'
              : 'GitHub, YouTube, Facebook, Steam, and direct email.'}
          </p>
        </div>

        <RevealBlock>
          <div className="connect-grid">
            <DepthSurface className="connect-plate" maxTilt={2.8}>
              <h3 className="connect-plate__title">
                {locale === 'vi' ? 'TRANG MẠNG CÁ NHÂN' : 'PERSONAL NETWORKS'}
              </h3>

              <ul className="social-list">
                {activeSocials.map((social) => (
                  <li key={social.id}>
                    <a
                      className="social-list__link kinetic-row"
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="social-list__identity">
                        <SocialIcon platform={social.platform} />
                        <span>{social.name}</span>
                      </span>
                      <span className="social-list__handle mono-num">
                        {social.handle}{' '}
                        <ArrowUpRight
                          size={15}
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
                      <Mail size={18} aria-hidden="true" />
                      <span>Email</span>
                    </span>
                    <span className="social-list__handle mono-num">{PROFILE.email}</span>
                  </a>
                </li>
              </ul>
            </DepthSurface>

            <DepthSurface className="connect-plate connect-plate--direct" maxTilt={2.8}>
              <h3 className="connect-plate__title">
                {locale === 'vi' ? 'LIÊN HỆ TRỰC TIẾP' : 'DIRECT CONTACT'}
              </h3>
              <p className="connect-plate__copy">
                {locale === 'vi'
                  ? 'Trao đổi về kỹ thuật phần mềm, AI ứng dụng, mô hình 3D hoặc cơ hội hợp tác.'
                  : 'Open to software engineering, applied AI, 3D modeling, and project collaboration.'}
              </p>
              <p className="connect-plate__email mono-num">{PROFILE.email}</p>
              <p className="connect-plate__loc">{t(PROFILE.location)}</p>

              <div className="connect-plate__actions">
                <MagneticWrap>
                  <a className="btn btn--primary" href={`mailto:${PROFILE.email}`}>
                    <Mail size={17} aria-hidden="true" />
                    <span>{locale === 'vi' ? 'Gửi email' : 'Send email'}</span>
                  </a>
                </MagneticWrap>
                <MagneticWrap>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={handleCopyEmail}
                  >
                    {copied ? (
                      <>
                        <Check size={17} aria-hidden="true" />
                        <span>{locale === 'vi' ? 'Đã sao chép' : 'Copied'}</span>
                      </>
                    ) : (
                      <>
                        <Copy size={17} aria-hidden="true" />
                        <span>{locale === 'vi' ? 'Sao chép email' : 'Copy email'}</span>
                      </>
                    )}
                  </button>
                </MagneticWrap>
                {PROFILE.cvUrl && (
                  <a
                    className="btn btn--ghost"
                    href={PROFILE.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FileText size={17} aria-hidden="true" />
                    <span>{locale === 'vi' ? 'Tải CV' : 'Download CV'}</span>
                  </a>
                )}
              </div>
            </DepthSurface>
          </div>
        </RevealBlock>
      </div>
    </section>
  );
}

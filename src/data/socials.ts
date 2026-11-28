import type { SocialLink } from './types';

export const SOCIAL_LINKS: SocialLink[] = [
  {
    id: 'github',
    platform: 'github',
    name: 'GitHub',
    handle: '@ShadyFyrix',
    url: 'https://github.com/ShadyFyrix',
    description: {
      vi: 'Mã nguồn đồ án, nghiên cứu khoa học, game 2D và công cụ mã nguồn mở.',
      en: 'Repositories for graduation thesis, research, 2D game dev, and open-source tools.',
    },
    enabled: true,
  },
  {
    id: 'youtube',
    platform: 'youtube',
    name: 'YouTube',
    handle: '@BetterCallShady',
    url: 'https://www.youtube.com/@BetterCallShady',
    description: {
      vi: 'Kênh ShadyFyrix: 752+ người đăng ký, 104+ video giải trí và gaming từ 2019.',
      en: 'ShadyFyrix channel: 752+ subscribers and 104+ gaming videos since 2019.',
    },
    enabled: true,
  },
  {
    id: 'facebook',
    platform: 'facebook',
    name: 'Facebook',
    handle: 'ShadyFyrix00',
    url: 'https://www.facebook.com/ShadyFyrix00',
    description: {
      vi: 'Trang cá nhân Lục Văn Sơn (ShadyFyrix), kết nối bạn bè và cộng đồng.',
      en: 'Personal profile of Luc Van Son (ShadyFyrix) for updates and direct chat.',
    },
    enabled: true,
  },
  {
    id: 'steam',
    platform: 'steam',
    name: 'Steam',
    handle: 'ShadyFyrixVN',
    url: 'https://steamcommunity.com/id/BetterCallShady/',
    description: {
      vi: 'Hồ sơ Steam Level 9, 7 năm hoạt động, 56 trò chơi và hoạt động gần đây.',
      en: 'Steam profile at Level 9, 7 years of service, 56 games, and live activity.',
    },
    enabled: true,
  },
  {
    id: 'linkedin',
    platform: 'linkedin',
    name: 'LinkedIn',
    handle: 'in/luc-van-son',
    url: 'https://linkedin.com/in/',
    description: {
      vi: 'Hồ sơ nghề nghiệp và kinh nghiệm dự án.',
      en: 'Professional profile and engineering background.',
    },
    enabled: false,
  },
  {
    id: 'tiktok',
    platform: 'tiktok',
    name: 'TikTok',
    handle: '@shadyfyrix',
    url: 'https://tiktok.com/',
    description: {
      vi: 'Video ngắn lập trình và sáng tạo nội dung.',
      en: 'Short coding and creative clips.',
    },
    enabled: false,
  },
  {
    id: 'zalo',
    platform: 'zalo',
    name: 'Zalo',
    handle: 'Zalo cá nhân',
    url: 'https://zalo.me/',
    description: {
      vi: 'Kênh trao đổi nhanh công việc tại Việt Nam.',
      en: 'Direct messaging for work in Vietnam.',
    },
    enabled: false,
  },
];

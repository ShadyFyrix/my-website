export type Locale = 'vi' | 'en';

export interface BilingualText {
  vi: string;
  en: string;
}

export type ProductCategory = 'ai' | 'systems' | 'creative';

export interface SpecItem {
  label: BilingualText;
  value: BilingualText;
}

export interface AudioSample {
  id: string;
  label: BilingualText;
  src: string;
}

export interface ProfileData {
  name: BilingualText;
  handle: string;
  documentTitle: BilingualText;
  heroHeadline: BilingualText;
  heroLead: BilingualText;
  aboutHeading: BilingualText;
  aboutLead: BilingualText;
  aboutBio: BilingualText;
  portraitSrc: string;
  portraitWidth: number;
  portraitHeight: number;
  portraitAlt: BilingualText;
  portraitCaption: BilingualText;
  specs: SpecItem[];
  email: string;
  cvUrl: string;
  location: BilingualText;
}

export interface ProductItem {
  id: string;
  title: string;
  year: string;
  category: ProductCategory;
  role: BilingualText;
  summary: BilingualText;
  problem: BilingualText;
  solution: BilingualText;
  highlights: BilingualText[];
  stack: string[];
  architectureSpecs: SpecItem[];
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
  imageAlt: BilingualText;
  has3DViewer?: boolean;
  audioSamples?: AudioSample[];
  repoUrl?: string;
  liveUrl?: string;
  featured?: boolean;
  visible: boolean;
}

export interface AchievementItem {
  id: string;
  year: string;
  title: BilingualText;
  organization: BilingualText;
  detail: BilingualText;
  linkUrl?: string;
  linkLabel?: BilingualText;
}

export type SocialPlatform =
  | 'github'
  | 'youtube'
  | 'facebook'
  | 'steam'
  | 'linkedin'
  | 'tiktok'
  | 'instagram'
  | 'zalo'
  | 'website';

export interface SocialLink {
  id: string;
  platform: SocialPlatform;
  name: string;
  handle: string;
  url: string;
  description: BilingualText;
  enabled: boolean;
}

export interface LiveGithubRepo {
  name: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  updatedAt: string;
  url: string;
}

export interface LiveYoutubeVideo {
  videoId: string;
  title: string;
  url: string;
  thumbnail: string;
  publishedAt: string;
  views: number;
}

export interface LiveSteamGame {
  name: string;
  hoursTotal: number;
  hours2Weeks?: number;
  lastPlayed?: string;
}

export interface LiveFeedSnapshot {
  syncedAt: string;
  sources: {
    github: 'live' | 'snapshot';
    youtube: 'live' | 'snapshot';
    steam: 'live' | 'snapshot';
  };
  github: {
    login: string;
    name: string;
    url: string;
    avatarUrl: string;
    publicRepos: number;
    followers: number;
    following: number;
    updatedAt: string;
    repos: LiveGithubRepo[];
  };
  youtube: {
    channelId: string;
    handle: string;
    name: string;
    url: string;
    subscribers: number;
    subscribersText: string;
    videoCount: number;
    joinedYear: number;
    featuredVideo: {
      title: string;
      views: number;
      url: string;
    };
    videos: LiveYoutubeVideo[];
  };
  steam: {
    profileName: string;
    realName: string;
    url: string;
    onlineState: string;
    onlineCode?: number;
    currentGame?: string | null;
    level: number;
    yearsOfService: number;
    xp: number;
    gamesCount: number;
    badgesCount: number;
    profileAwards: number;
    friendsCount: number;
    recentHours2Weeks: number;
    recentGames: LiveSteamGame[];
  };
  facebook: {
    name: string;
    handle: string;
    url: string;
    friendsCount: number;
    hometown: string;
  };
}

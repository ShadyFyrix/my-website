import type { BilingualText } from './types';

export type EyjaSkinId =
  | 'medic-default'
  | 'caster-default'
  | 'caster-dream'
  | 'caster-summer'
  | 'medic-camping'
  | 'medic-family';

export type EyjaActionId =
  | 'relax'
  | 'move'
  | 'interact'
  | 'sit'
  | 'sleep'
  | 'attack'
  | 'skill';

export interface EyjaSkin {
  id: EyjaSkinId;
  name: BilingualText;
  shortLabel: string;
  accent: string;
}

export interface EyjaActionMeta {
  id: EyjaActionId;
  label: BilingualText;
  loop: boolean;
}

export const EYJA_SKINS: EyjaSkin[] = [
  {
    id: 'medic-default',
    name: { vi: 'Eyja Medic (Mặc định)', en: 'Eyja Medic (Default)' },
    shortLabel: 'Medic',
    accent: '#36e5ff',
  },
  {
    id: 'caster-default',
    name: { vi: 'Eyja Caster (Volcano)', en: 'Eyja Caster (Volcano)' },
    shortLabel: 'Caster',
    accent: '#ff6a45',
  },
  {
    id: 'caster-dream',
    name: { vi: 'Phù thủy Miên Nhung', en: 'Fluffy Witch' },
    shortLabel: 'Witch',
    accent: '#c084fc',
  },
  {
    id: 'caster-summer',
    name: { vi: 'Hè Rực Rỡ FA018', en: 'Summer FA018' },
    shortLabel: 'Summer',
    accent: '#ff7eb6',
  },
  {
    id: 'medic-camping',
    name: { vi: 'Dã ngoại Cừu Bông', en: 'Picnic Sheep' },
    shortLabel: 'Picnic',
    accent: '#5ce1e6',
  },
  {
    id: 'medic-family',
    name: { vi: 'Câu chuyện Sau đó', en: 'Later Story' },
    shortLabel: 'Family',
    accent: '#f9a8d4',
  },
];

export const EYJA_ACTIONS: EyjaActionMeta[] = [
  { id: 'relax', label: { vi: 'Đứng nghỉ', en: 'Relax' }, loop: true },
  { id: 'move', label: { vi: 'Đi dạo', en: 'Walk' }, loop: true },
  { id: 'interact', label: { vi: 'Xoa đầu', en: 'Pat' }, loop: false },
  { id: 'sit', label: { vi: 'Ngồi', en: 'Sit' }, loop: true },
  { id: 'sleep', label: { vi: 'Ngủ', en: 'Sleep' }, loop: true },
  { id: 'attack', label: { vi: 'Tấn công', en: 'Attack' }, loop: false },
  { id: 'skill', label: { vi: 'Tung Skill', en: 'Skill' }, loop: true },
];

export function getEyjaClipSrc(skin: EyjaSkinId, action: EyjaActionId): string {
  return `/eyja/${skin}/${action}.webm`;
}

export const EYJA_PAT_QUOTES: BilingualText[] = [
  { vi: 'Senpai~ ♪', en: 'Senpai~ ♪' },
  { vi: 'Hì hì, nhột quá!', en: 'Hehe, that tickles!' },
  { vi: 'Sẵn sàng tiếp sức!', en: 'Ready to help!' },
  { vi: 'Cừu con ngoan lắm~', en: 'Good little sheep~' },
];

export const EYJA_SKILL_QUOTES: BilingualText[] = [
  { vi: 'Volcano bùng nổ! ✦', en: 'Volcano burst! ✦' },
  { vi: 'Sóng năng lượng!', en: 'Energy surge!' },
  { vi: 'Sưởi ấm không gian~', en: 'Warming the stage~' },
];

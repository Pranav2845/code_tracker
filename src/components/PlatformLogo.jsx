// src/components/PlatformLogo.jsx
import React from 'react';
import Image from './AppImage';

const PLATFORM_LOGOS = {
  leetcode: '/assets/images/leetcode.png',
  codeforces: '/assets/images/codeforces.png',
  atcoder: '/assets/images/atcoder.png',
  codechef: '/assets/images/codechef.jpeg',
  gfg: '/assets/images/gfg.png',
  hackerrank: '/assets/images/hackerrank.webp',
  code360: '/assets/images/codingninjas.jpeg',
};

export default function PlatformLogo({ platform, className = 'w-4 h-4', ...props }) {
   const key = typeof platform === 'string' ? platform.toLowerCase() : '';
  const src = PLATFORM_LOGOS[key] || '/assets/images/no_image.png';
  return <Image src={src} alt={`${platform} logo`} className={className} {...props} />;
}
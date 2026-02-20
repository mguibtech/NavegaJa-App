import React, {useState} from 'react';
import {Image} from 'react-native';

import {createAvatar} from '@dicebear/core';
import {
  avataaars,
  lorelei,
  bottts,
  pixelArt,
  micah,
  funEmoji,
  initials,
  adventurer,
  openPeeps,
  personas,
  notionists,
  thumbs,
} from '@dicebear/collection';
import {SvgXml} from 'react-native-svg';

import {Box, Icon} from '@components';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type DiceBearStyle =
  | 'avataaars'
  | 'lorelei'
  | 'bottts'
  | 'pixel-art'
  | 'micah'
  | 'fun-emoji'
  | 'initials'
  | 'adventurer'
  | 'open-peeps'
  | 'personas'
  | 'notionists'
  | 'thumbs';

const SIZE_PX: Record<AvatarSize, number> = {
  xs: 32,
  sm: 40,
  md: 56,
  lg: 80,
  xl: 100,
};

const ICON_SIZE: Record<AvatarSize, number> = {
  xs: 16,
  sm: 20,
  md: 28,
  lg: 40,
  xl: 50,
};

// Maps DiceBearStyle (URL kebab-case) → @dicebear/collection export
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const STYLE_MAP: Record<DiceBearStyle, any> = {
  avataaars,
  lorelei,
  bottts,
  'pixel-art': pixelArt,
  micah,
  'fun-emoji': funEmoji,
  initials,
  adventurer,
  'open-peeps': openPeeps,
  personas,
  notionists,
  thumbs,
};

// Optional features that use {key}Probability to show/hide
const TOGGLEABLE_KEYS = new Set([
  'accessories',
  'glasses',
  'facialHair',
  'beard',
  'earrings',
  'hat',
  'texture',
  'mask',
]);

// Options that expect a plain number (not array)
const NUMERIC_KEYS = new Set(['fontWeight', 'fontSize']);

// Options that expect a plain string (not array)
const STRING_KEYS = new Set(['fontFamily']);

/**
 * Converts URL query params (string) to DiceBear createAvatar options.
 * Handles toggleable features (accessories, glasses, beard, etc.) via probability=0/100.
 */
function urlParamsToDiceBearOptions(
  urlParams: Record<string, string>,
): Record<string, unknown> {
  const opts: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(urlParams)) {
    if (TOGGLEABLE_KEYS.has(key)) {
      if (value === 'none') {
        opts[`${key}Probability`] = 0;
      } else {
        opts[key] = [value];
        opts[`${key}Probability`] = 100;
      }
    } else if (NUMERIC_KEYS.has(key)) {
      opts[key] = parseInt(value, 10);
    } else if (STRING_KEYS.has(key)) {
      opts[key] = value;
    } else {
      // Array-based options: skinColor, baseColor, top, hair, hairColor, etc.
      opts[key] = [value];
    }
  }

  return opts;
}

/** Gera SVG localmente sem precisar de internet */
export function generateDiceBearSvg(
  style: DiceBearStyle,
  seed: string,
  urlParams: Record<string, string> = {},
): string {
  const collection = STYLE_MAP[style] ?? avataaars;
  const dicebearOpts = urlParamsToDiceBearOptions(urlParams);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createAvatar(collection as any, {seed, ...dicebearOpts}).toString();
}

/**
 * Builds a valid HTTP URL for the DiceBear API.
 * The backend accepts this as a valid HTTP URL.
 * The app renders locally using the DiceBear library (no network needed).
 *
 * Format: https://api.dicebear.com/9.x/{style}/svg?seed={seed}&{options...}
 */
export function buildDiceBearUrl(
  style: DiceBearStyle,
  seed: string,
  urlParams: Record<string, string> = {},
): string {
  let url = `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
  for (const [key, value] of Object.entries(urlParams)) {
    url += `&${key}=${encodeURIComponent(value)}`;
  }
  return url;
}

/**
 * Parses a DiceBear URL into its components.
 * Supports both:
 * - New format: https://api.dicebear.com/9.x/avataaars/svg?seed=Felix&skinColor=ffdbb4
 * - Legacy format: dicebear:avataaars:Felix
 */
export function parseDiceBearUrl(avatarUrl: string): {
  style: DiceBearStyle;
  seed: string;
  urlParams: Record<string, string>;
} | null {
  // Legacy format: dicebear:avataaars:Felix
  if (avatarUrl.startsWith('dicebear:')) {
    const parts = avatarUrl.split(':');
    if (parts.length < 3) {
      return null;
    }
    return {
      style: parts[1] as DiceBearStyle,
      seed: parts.slice(2).join(':'),
      urlParams: {},
    };
  }

  // New format: https://api.dicebear.com/9.x/avataaars/svg?seed=Felix&...
  if (avatarUrl.includes('api.dicebear.com')) {
    const qIndex = avatarUrl.indexOf('?');
    const path = qIndex > -1 ? avatarUrl.substring(0, qIndex) : avatarUrl;
    const queryStr = qIndex > -1 ? avatarUrl.substring(qIndex + 1) : '';

    // path: https://api.dicebear.com/9.x/avataaars/svg
    // split: ['https:', '', 'api.dicebear.com', '9.x', 'avataaars', 'svg']
    const pathParts = path.split('/');
    const style = (pathParts[4] ?? 'avataaars') as DiceBearStyle;

    const urlParams: Record<string, string> = {};
    let seed = 'default';
    queryStr.split('&').forEach(pair => {
      if (!pair) {
        return;
      }
      const eqIndex = pair.indexOf('=');
      if (eqIndex < 0) {
        return;
      }
      const k = pair.substring(0, eqIndex);
      const v = decodeURIComponent(pair.substring(eqIndex + 1));
      if (k === 'seed') {
        seed = v;
      } else {
        urlParams[k] = v;
      }
    });

    return {style, seed, urlParams};
  }

  return null;
}

export function buildDiceBearUrlFromParsed(parsed: {
  style: DiceBearStyle;
  seed: string;
  urlParams: Record<string, string>;
}): string {
  return buildDiceBearUrl(parsed.style, parsed.seed, parsed.urlParams);
}

export interface UserAvatarProps {
  userId?: string | null;
  avatarUrl?: string | null;
  name?: string | null;
  size?: AvatarSize;
}

export function UserAvatar({
  userId,
  avatarUrl,
  name,
  size = 'md',
}: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const dim = SIZE_PX[size];
  const iconSize = ICON_SIZE[size];
  const radius = dim / 2;

  // Caso 1: URL DiceBear (api.dicebear.com ou legado dicebear:) → renderiza localmente
  const dicebearConfig = avatarUrl ? parseDiceBearUrl(avatarUrl) : null;
  if (dicebearConfig) {
    const svg = generateDiceBearSvg(
      dicebearConfig.style,
      dicebearConfig.seed,
      dicebearConfig.urlParams,
    );
    return (
      <Box
        width={dim}
        height={dim}
        backgroundColor="primaryBg"
        overflow="hidden"
        style={{borderRadius: radius}}>
        <SvgXml xml={svg} width={dim} height={dim} />
      </Box>
    );
  }

  // Caso 2: foto real (upload)
  const hasRealPhoto = !imgError && !!avatarUrl && avatarUrl.startsWith('http');

  // Caso 3: fallback DiceBear local
  const seed = userId ?? name ?? 'default';
  const fallbackSvg = generateDiceBearSvg('avataaars', seed);

  return (
    <Box
      width={dim}
      height={dim}
      backgroundColor="primaryBg"
      overflow="hidden"
      style={{borderRadius: radius}}>
      {hasRealPhoto ? (
        <Image
          source={{uri: avatarUrl!}}
          style={{width: dim, height: dim}}
          onError={() => setImgError(true)}
        />
      ) : (
        <SvgXml xml={fallbackSvg} width={dim} height={dim} />
      )}
      {imgError && !hasRealPhoto && (
        <Box
          position="absolute"
          width={dim}
          height={dim}
          alignItems="center"
          justifyContent="center">
          <Icon name="person" size={iconSize} color="primary" />
        </Box>
      )}
    </Box>
  );
}

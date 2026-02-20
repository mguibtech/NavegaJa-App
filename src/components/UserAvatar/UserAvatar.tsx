import React, {useState} from 'react';
import {Image} from 'react-native';

import {Box, Icon} from '@components';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

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

const DICEBEAR = 'https://api.dicebear.com/9.x/avataaars/png';
const BG_COLORS = 'b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf';

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

  const seed = encodeURIComponent(userId ?? name ?? 'default');
  const dicebearUri = `${DICEBEAR}?seed=${seed}&size=${dim * 2}&backgroundColor=${BG_COLORS}&backgroundType=gradientLinear`;

  const hasRealPhoto = !imgError && !!avatarUrl && avatarUrl.startsWith('http');
  const uri = hasRealPhoto ? avatarUrl! : dicebearUri;

  return (
    <Box
      width={dim}
      height={dim}
      backgroundColor="primaryBg"
      overflow="hidden"
      style={{borderRadius: radius}}>
      <Image
        source={{uri}}
        style={{width: dim, height: dim}}
        onError={() => setImgError(true)}
        defaultSource={undefined}
      />
      {/* fallback icon if dicebear also fails (offline) */}
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

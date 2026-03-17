import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  ViewToken,
} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {useTheme} from '@shopify/restyle';

import {apiImageSource} from '@api/config';
import {Theme} from '@theme';

import {Box, TouchableOpacityBox} from '../Box/Box';
import {Icon} from '../Icon/Icon';
import {Text} from '../Text/Text';

export type PhotoViewerItem = {
  id?: string;
  uri: string;
  title?: string;
};

type PhotoViewerInput = string | PhotoViewerItem;

export type PhotoViewerModalProps = {
  visible: boolean;
  images: PhotoViewerItem[];
  initialIndex?: number;
  onClose: () => void;
  title?: string;
  closeOnBackdropPress?: boolean;
};

function normalizeViewerItems(images: PhotoViewerInput[]): PhotoViewerItem[] {
  return images
    .map((item, index) => {
      if (typeof item === 'string') {
        return {
          id: `photo-${index}`,
          uri: item,
        };
      }

      return {
        id: item.id ?? `photo-${index}`,
        uri: item.uri,
        title: item.title,
      };
    })
    .filter(item => !!item.uri);
}

function clampIndex(index: number, max: number): number {
  if (max <= 0) {return 0;}
  return Math.max(0, Math.min(index, max - 1));
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

const MAX_ZOOM_SCALE = 4.5;
const DOUBLE_TAP_ZOOM_SCALE = 3;
const PAN_LIMIT_FACTOR = 0.94;

function PhotoSlide({
  item,
  width,
  height,
  isActive,
  onZoomStateChange,
}: {
  item: PhotoViewerItem;
  width: number;
  height: number;
  isActive: boolean;
  onZoomStateChange: (zoomed: boolean) => void;
}) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const lastReportedZoom = React.useRef(false);

  const frameHeight = Math.max(260, height * 0.62);

  const emitZoomState = React.useCallback((zoomed: boolean) => {
    if (lastReportedZoom.current === zoomed) {return;}
    lastReportedZoom.current = zoomed;
    onZoomStateChange(zoomed);
  }, [onZoomStateChange]);

  const resetTransform = React.useCallback((animated = true) => {
    const apply = animated ? withTiming : (value: number) => value;
    scale.value = apply(1);
    savedScale.value = 1;
    translateX.value = apply(0);
    translateY.value = apply(0);
    startX.value = 0;
    startY.value = 0;
    emitZoomState(false);
  }, [emitZoomState, scale, savedScale, startX, startY, translateX, translateY]);

  React.useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    resetTransform(false);
  }, [item.uri, resetTransform]);

  React.useEffect(() => {
    if (!isActive) {
      resetTransform(false);
    }
  }, [isActive, resetTransform]);

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {translateX: translateX.value},
      {translateY: translateY.value},
      {scale: scale.value},
    ],
  }));

  const panGesture = Gesture.Pan()
    .maxPointers(1)
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate(event => {
      if (scale.value <= 1) {return;}

      const maxOffsetX = ((scale.value - 1) * width * PAN_LIMIT_FACTOR) / 2;
      const maxOffsetY = ((scale.value - 1) * frameHeight * PAN_LIMIT_FACTOR) / 2;

      translateX.value = clamp(startX.value + event.translationX, -maxOffsetX, maxOffsetX);
      translateY.value = clamp(startY.value + event.translationY, -maxOffsetY, maxOffsetY);
    });

  const pinchGesture = Gesture.Pinch()
    .onBegin(() => {
      runOnJS(emitZoomState)(true);
    })
    .onUpdate(event => {
      const nextScale = clamp(savedScale.value * event.scale, 1, MAX_ZOOM_SCALE);
      scale.value = nextScale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value <= 1.02) {
        scale.value = withTiming(1);
        savedScale.value = 1;
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
        runOnJS(emitZoomState)(false);
      } else {
        runOnJS(emitZoomState)(true);
      }
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      const nextZoomed = scale.value <= 1.02;
      const nextScale = nextZoomed ? DOUBLE_TAP_ZOOM_SCALE : 1;

      scale.value = withTiming(nextScale);
      savedScale.value = nextScale;
      translateX.value = withTiming(0);
      translateY.value = withTiming(0);
      startX.value = 0;
      startY.value = 0;
      runOnJS(emitZoomState)(nextZoomed);
    });

  const composedGesture = Gesture.Exclusive(
    doubleTapGesture,
    Gesture.Simultaneous(panGesture, pinchGesture),
  );

  return (
    <View style={[styles.slide, {width, minHeight: height * 0.62}]}>
      <View style={[styles.imageFrame, {height: frameHeight}]}>
        {!hasError && (
          <GestureDetector gesture={composedGesture}>
            <Animated.View style={[styles.imageGestureLayer, imageAnimatedStyle]}>
              <Image
                source={apiImageSource(item.uri)}
                style={styles.image}
                resizeMode="contain"
                onLoadStart={() => setIsLoading(true)}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false);
                  setHasError(true);
                  resetTransform(false);
                }}
              />
            </Animated.View>
          </GestureDetector>
        )}

        {isLoading && !hasError && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text preset="paragraphSmall" style={styles.loadingText}>
              Carregando imagem...
            </Text>
          </View>
        )}

        {hasError && (
          <View style={styles.errorState}>
            <Icon name="broken-image" size={54} color={'rgba(255,255,255,0.52)' as any} />
            <Text preset="paragraphSmall" style={styles.errorTitle}>
              Não foi possível carregar a imagem
            </Text>
            <Text preset="paragraphCaptionSmall" style={styles.errorUri}>
              {item.uri}
            </Text>
          </View>
        )}
      </View>

      {item.title ? (
        <Text preset="paragraphSmall" style={styles.caption} numberOfLines={2}>
          {item.title}
        </Text>
      ) : null}
    </View>
  );
}

export function PhotoViewerModal({
  visible,
  images,
  initialIndex = 0,
  onClose,
  title,
  closeOnBackdropPress = true,
}: PhotoViewerModalProps) {
  const {width, height} = useWindowDimensions();
  const {colors} = useTheme<Theme>();
  const flatListRef = React.useRef<FlatList<PhotoViewerItem>>(null);
  const [activeIndex, setActiveIndex] = React.useState(
    clampIndex(initialIndex, images.length),
  );
  const [isZoomed, setIsZoomed] = React.useState(false);

  const safeImages = React.useMemo(() => normalizeViewerItems(images), [images]);
  const safeInitialIndex = clampIndex(initialIndex, safeImages.length);

  const viewabilityConfig = React.useRef({
    itemVisiblePercentThreshold: 60,
  }).current;

  const onViewableItemsChanged = React.useRef(
    ({viewableItems}: {viewableItems: Array<ViewToken<PhotoViewerItem>>}) => {
      const nextItem = viewableItems[0]?.index;
      if (typeof nextItem === 'number') {
        setActiveIndex(nextItem);
        setIsZoomed(false);
      }
    },
  ).current;

  React.useEffect(() => {
    if (!visible) {return;}

    setActiveIndex(safeInitialIndex);
    setIsZoomed(false);
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToIndex({
        index: safeInitialIndex,
        animated: false,
      });
    });
  }, [safeInitialIndex, visible]);

  function handleNavigate(nextIndex: number) {
    const targetIndex = clampIndex(nextIndex, safeImages.length);
    setActiveIndex(targetIndex);
    setIsZoomed(false);
    flatListRef.current?.scrollToIndex({
      index: targetIndex,
      animated: true,
    });
  }

  if (!safeImages.length) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        {closeOnBackdropPress ? (
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        ) : null}

        <View style={[styles.viewerShell, {paddingTop: Math.max(24, height * 0.05)}]}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              {title ? (
                <Text preset="paragraphMedium" style={styles.title} numberOfLines={1}>
                  {title}
                </Text>
              ) : null}
              <Text preset="paragraphSmall" style={styles.counter}>
                {activeIndex + 1} de {safeImages.length}
              </Text>
            </View>

            <TouchableOpacityBox
              onPress={onClose}
              width={40}
              height={40}
              borderRadius="s20"
              alignItems="center"
              justifyContent="center"
              style={{backgroundColor: 'rgba(255,255,255,0.14)'}}>
              <Icon name="close" size={22} color={'#FFFFFF' as any} />
            </TouchableOpacityBox>
          </View>

          <FlatList
            ref={flatListRef}
            horizontal
            pagingEnabled
            scrollEnabled={!isZoomed}
            data={safeImages}
            keyExtractor={item => item.id ?? item.uri}
            renderItem={({item, index}) => (
              <PhotoSlide
                item={item}
                width={width}
                height={height}
                isActive={index === activeIndex}
                onZoomStateChange={zoomed => {
                  if (index === activeIndex) {
                    setIsZoomed(zoomed);
                  }
                }}
              />
            )}
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={safeInitialIndex}
            getItemLayout={(_, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            windowSize={2}
            maxToRenderPerBatch={2}
            removeClippedSubviews
          />

          {safeImages.length > 1 ? (
            <>
              <TouchableOpacityBox
                onPress={() => handleNavigate(activeIndex - 1)}
                disabled={activeIndex === 0}
                style={[
                  styles.navButton,
                  styles.navLeft,
                  activeIndex === 0 && styles.navButtonDisabled,
                ]}>
                <Icon name="chevron-left" size={26} color={'#FFFFFF' as any} />
              </TouchableOpacityBox>

              <TouchableOpacityBox
                onPress={() => handleNavigate(activeIndex + 1)}
                disabled={activeIndex >= safeImages.length - 1}
                style={[
                  styles.navButton,
                  styles.navRight,
                  activeIndex >= safeImages.length - 1 && styles.navButtonDisabled,
                ]}>
                <Icon name="chevron-right" size={26} color={'#FFFFFF' as any} />
              </TouchableOpacityBox>
            </>
          ) : null}

          <Box
            flexDirection="row"
            alignItems="center"
            justifyContent="center"
            mt="s16"
            g="s8">
            {safeImages.map((item, index) => (
              <Box
                key={`${item.id ?? item.uri}-dot`}
                width={index === activeIndex ? 18 : 8}
                height={8}
                borderRadius="s8"
                style={{
                  backgroundColor:
                    index === activeIndex ? colors.primaryLight : 'rgba(255,255,255,0.28)',
                }}
              />
            ))}
          </Box>

          <Text preset="paragraphCaptionSmall" style={styles.zoomHint}>
            Pinça ou toque duplo para ampliar
          </Text>
        </View>
      </View>
    </Modal>
  );
}

export function usePhotoViewer() {
  const [visible, setVisible] = React.useState(false);
  const [images, setImages] = React.useState<PhotoViewerItem[]>([]);
  const [initialIndex, setInitialIndex] = React.useState(0);
  const [title, setTitle] = React.useState<string | undefined>(undefined);

  const openViewer = React.useCallback(
    (
      nextImages: PhotoViewerInput[],
      index = 0,
      nextTitle?: string,
    ) => {
      const normalized = normalizeViewerItems(nextImages);
      if (!normalized.length) {return;}

      setImages(normalized);
      setInitialIndex(clampIndex(index, normalized.length));
      setTitle(nextTitle);
      setVisible(true);
    },
    [],
  );

  const closeViewer = React.useCallback(() => {
    setVisible(false);
  }, []);

  return {
    openViewer,
    closeViewer,
    viewerProps: {
      visible,
      images,
      initialIndex,
      onClose: closeViewer,
      title,
    } satisfies PhotoViewerModalProps,
  };
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 11, 19, 0.94)',
  },
  viewerShell: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginBottom: 8,
  },
  headerText: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    color: '#FFFFFF',
  },
  counter: {
    color: 'rgba(255,255,255,0.72)',
    marginTop: 2,
  },
  slide: {
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageFrame: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageGestureLayer: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: 'rgba(255,255,255,0.72)',
    marginTop: 10,
  },
  errorState: {
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorTitle: {
    color: 'rgba(255,255,255,0.78)',
    marginTop: 12,
    textAlign: 'center',
  },
  errorUri: {
    color: 'rgba(255,255,255,0.45)',
    marginTop: 8,
    textAlign: 'center',
  },
  caption: {
    color: 'rgba(255,255,255,0.72)',
    marginTop: 14,
    paddingHorizontal: 10,
    textAlign: 'center',
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -22,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.42)',
  },
  navLeft: {
    left: 16,
  },
  navRight: {
    right: 16,
  },
  navButtonDisabled: {
    opacity: 0.32,
  },
  zoomHint: {
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
    marginTop: 10,
  },
});

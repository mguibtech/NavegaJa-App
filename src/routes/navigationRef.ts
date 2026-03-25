import {createNavigationContainerRef} from '@react-navigation/native';
import type {AppStackParamList} from './navigationTypes';

export const navigationRef = createNavigationContainerRef<AppStackParamList>();

import React from 'react';

import {useAuthStore} from '@store';

import {CaptainStack} from './CaptainStack';
import {PassengerStack} from './PassengerStack';

export {PassengerStack} from './PassengerStack';
export {CaptainStack} from './CaptainStack';
export type {
  AppStackParamList,
  PassengerStackParamList,
  CaptainStackParamList,
  TabsParamList,
  CaptainTabsParamList,
} from './navigationTypes';

export function AppStack() {
  const user = useAuthStore(s => s.user);
  const isManagerRole = user?.role === 'captain' || user?.role === 'boat_manager';
  return isManagerRole ? <CaptainStack /> : <PassengerStack />;
}

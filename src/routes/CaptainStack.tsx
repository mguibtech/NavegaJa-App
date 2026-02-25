import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useTheme} from '@shopify/restyle';

import {CaptainTabBar, Icon} from '@components';
import {Theme} from '@theme';

import {
  // Tabs
  CaptainDashboardScreen,
  CaptainOperationsScreen,
  CaptainFinancialScreen,
  ProfileScreen,
  // Captain screens
  CaptainMyTripsScreen,
  CaptainCreateTripScreen,
  CaptainTripManageScreen,
  CaptainMyBoatsScreen,
  CaptainCreateBoatScreen,
  CaptainEditBoatScreen,
  CaptainChecklistScreen,
  CaptainStartTripScreen,
  CaptainShipmentCollectScreen,
  CaptainTripLiveScreen,
  // Shared screens
  ShipmentDetailsScreen,
  ShipmentReviewScreen,
  EditProfileScreen,
  CaptainProfileScreen,
  BoatDetailScreen,
  PaymentMethodsScreen,
  AddCardScreen,
  NotificationsScreen,
  GamificationScreen,
  MyReviewsScreen,
  HelpScreen,
  TermsScreen,
  PrivacyScreen,
  EmergencyContactsScreen,
  SosAlertScreen,
} from '@screens';

import type {CaptainStackParamList, CaptainTabsParamList} from './navigationTypes';

const Stack = createNativeStackNavigator<CaptainStackParamList>();
const CaptainTab = createBottomTabNavigator<CaptainTabsParamList>();

function CaptainTabs() {
  return (
    <CaptainTab.Navigator
      tabBar={props => <CaptainTabBar {...props} />}
      screenOptions={{headerShown: false}}>
      <CaptainTab.Screen
        name="Dashboard"
        component={CaptainDashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({color, size}) => (
            <Icon name="dashboard" size={size} color={color} />
          ),
        }}
      />
      <CaptainTab.Screen
        name="Operations"
        component={CaptainOperationsScreen}
        options={{
          tabBarLabel: 'Operações',
          tabBarIcon: ({color, size}) => (
            <Icon name="directions-boat" size={size} color={color} />
          ),
        }}
      />
      <CaptainTab.Screen
        name="Financial"
        component={CaptainFinancialScreen}
        options={{
          tabBarLabel: 'Financeiro',
          tabBarIcon: ({color, size}) => (
            <Icon name="attach-money" size={size} color={color} />
          ),
        }}
      />
      <CaptainTab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({color, size}) => (
            <Icon name="person" size={size} color={color} />
          ),
        }}
      />
    </CaptainTab.Navigator>
  );
}

export function CaptainStack() {
  const {colors} = useTheme<Theme>();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {backgroundColor: colors.background},
      }}>
      <Stack.Screen name="HomeTabs" component={CaptainTabs} />

      {/* ── Telas do Capitão ───────────────────────────────── */}
      <Stack.Screen name="CaptainMyTrips" component={CaptainMyTripsScreen} />
      <Stack.Screen name="CaptainCreateTrip" component={CaptainCreateTripScreen} />
      <Stack.Screen name="CaptainTripManage" component={CaptainTripManageScreen} />
      <Stack.Screen name="CaptainMyBoats" component={CaptainMyBoatsScreen} />
      <Stack.Screen name="CaptainCreateBoat" component={CaptainCreateBoatScreen} />
      <Stack.Screen name="CaptainEditBoat" component={CaptainEditBoatScreen} />
      <Stack.Screen name="CaptainChecklist" component={CaptainChecklistScreen} />
      <Stack.Screen name="CaptainStartTrip" component={CaptainStartTripScreen} />
      <Stack.Screen name="CaptainShipmentCollect" component={CaptainShipmentCollectScreen} />
      <Stack.Screen name="CaptainTripLive" component={CaptainTripLiveScreen} />

      {/* ── Telas Compartilhadas ───────────────────────────── */}
      <Stack.Screen name="ShipmentDetails" component={ShipmentDetailsScreen} />
      <Stack.Screen name="ShipmentReview" component={ShipmentReviewScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="CaptainProfile" component={CaptainProfileScreen} />
      <Stack.Screen name="BoatDetail" component={BoatDetailScreen} />
      <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
      <Stack.Screen name="AddCard" component={AddCardScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Gamification" component={GamificationScreen} />
      <Stack.Screen name="MyReviews" component={MyReviewsScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
      <Stack.Screen name="Terms" component={TermsScreen} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} />
      <Stack.Screen name="EmergencyContacts" component={EmergencyContactsScreen} />
      <Stack.Screen name="SosAlert" component={SosAlertScreen} />
    </Stack.Navigator>
  );
}

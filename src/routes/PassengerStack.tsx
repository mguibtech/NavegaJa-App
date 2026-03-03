import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useTheme} from '@shopify/restyle';

import {CustomTabBar, Icon} from '@components';
import {Theme} from '@theme';
import {useConversations} from '@domain';

import {
  // Tabs
  HomeScreen,
  SearchScreen,
  BookingsScreen,
  ShipmentsScreen,
  ProfileScreen,
  // Passenger screens
  SearchResultsScreen,
  PopularRoutesScreen,
  TripDetailsScreen,
  FavoritesScreen,
  BookingScreen,
  PaymentScreen,
  TicketScreen,
  TrackingScreen,
  CreateShipmentScreen,
  TripReviewScreen,
  ValidateDeliveryScreen,
  ScanShipmentQRScreen,
  WeatherScreen,
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
  PersonalContactsScreen,
  SosAlertScreen,
  ChatScreen,
  ConversationsScreen,
  ReferralsScreen,
  StopReviewCreateScreen,
  StopReviewsListScreen,
} from '@screens';

import type {PassengerStackParamList, TabsParamList} from './navigationTypes';

const Stack = createNativeStackNavigator<PassengerStackParamList>();
const Tab = createBottomTabNavigator<TabsParamList>();

function PassengerTabs() {
  const {totalUnread} = useConversations();

  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{headerShown: false}}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Início',
          tabBarIcon: ({color, size}) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: 'Buscar',
          tabBarIcon: ({color, size}) => (
            <Icon name="search" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingsScreen}
        options={{
          tabBarLabel: 'Reservas',
          tabBarIcon: ({color, size}) => (
            <Icon name="receipt-long" size={size} color={color} />
          ),
          // badge gerenciado via setOptions em useBookingsScreen
        }}
      />
      <Tab.Screen
        name="Shipments"
        component={ShipmentsScreen}
        options={{
          tabBarLabel: 'Entregas',
          tabBarIcon: ({color, size}) => (
            <Icon name="inventory" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({color, size}) => (
            <Icon name="person" size={size} color={color} />
          ),
          tabBarBadge: totalUnread > 0 ? totalUnread : undefined,
        }}
      />
    </Tab.Navigator>
  );
}

export function PassengerStack() {
  const {colors} = useTheme<Theme>();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {backgroundColor: colors.background},
      }}>
      <Stack.Screen name="HomeTabs" component={PassengerTabs} />

      {/* ── Telas do Navegador ─────────────────────────────── */}
      <Stack.Screen name="WeatherScreen" component={WeatherScreen} />
      <Stack.Screen name="SearchResults" component={SearchResultsScreen} />
      <Stack.Screen name="PopularRoutes" component={PopularRoutesScreen} />
      <Stack.Screen name="TripDetails" component={TripDetailsScreen} />
      <Stack.Screen name="Favorites" component={FavoritesScreen} />
      <Stack.Screen name="Booking" component={BookingScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="Ticket" component={TicketScreen} />
      <Stack.Screen name="Tracking" component={TrackingScreen} />
      <Stack.Screen name="CreateShipment" component={CreateShipmentScreen} />
      <Stack.Screen name="Shipments" component={ShipmentsScreen} />
      <Stack.Screen name="TripReview" component={TripReviewScreen} />
      <Stack.Screen name="ValidateDelivery" component={ValidateDeliveryScreen} />
      <Stack.Screen name="ScanShipmentQR" component={ScanShipmentQRScreen} />

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
      <Stack.Screen name="PersonalContacts" component={PersonalContactsScreen} />
      <Stack.Screen name="SosAlert" component={SosAlertScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="Conversations" component={ConversationsScreen} />
      <Stack.Screen name="Referrals" component={ReferralsScreen} />
      <Stack.Screen name="StopReviewCreate" component={StopReviewCreateScreen} />
      <Stack.Screen name="StopReviewsList" component={StopReviewsListScreen} />
    </Stack.Navigator>
  );
}

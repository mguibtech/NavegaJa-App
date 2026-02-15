import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {CustomTabBar, Icon} from '@components';

import { Promotion, PaymentMethod } from '@domain';
import { BookingScreen, BookingsScreen, CreateShipmentScreen, EditProfileScreen, EmergencyContactsScreen, FavoritesScreen, HelpScreen, HomeScreen, NotificationsScreen, PaymentMethodsScreen, PaymentScreen, PopularRoutesScreen, PrivacyScreen, ProfileScreen, ScanShipmentQRScreen, SearchResultsScreen, SearchScreen, ShipmentDetailsScreen, ShipmentReviewScreen, ShipmentsScreen, SosAlertScreen, TermsScreen, TicketScreen, TrackingScreen, TripDetailsScreen, ValidateDeliveryScreen } from '@screens';

export type AppStackParamList = {
  HomeTabs: undefined;
  SearchResults: {
    origin: string;
    destination: string;
    date?: string;
    promotion?: Promotion;
    context?: 'booking' | 'shipment';
  };
  PopularRoutes: undefined;
  TripDetails: {
    tripId: string;
    promotion?: Promotion;
    context?: 'booking' | 'shipment';
  };
  Favorites: undefined;
  Booking: {
    tripId: string;
  };
  Payment: {
    bookingId: string;
    amount: number;
    paymentMethod: PaymentMethod;
  };
  Ticket: {
    bookingId: string;
  };
  Tracking: {
    bookingId: string;
  };
  EditProfile: undefined;
  CreateShipment: {
    tripId: string;
  };
  Shipments: undefined;
  ShipmentDetails: {
    shipmentId: string;
  };
  ShipmentReview: {
    shipmentId: string;
  };
  ValidateDelivery: {
    trackingCode?: string;
    pin?: string;
  };
  ScanShipmentQR: undefined;
  PaymentMethods: undefined;
  Notifications: undefined;
  Help: undefined;
  Terms: undefined;
  Privacy: undefined;
  EmergencyContacts: undefined;
  SosAlert: {
    tripId?: string;
  };
};

export type TabsParamList = {
  Home: undefined;
  Search: {
    context?: 'booking' | 'shipment';
  };
  Bookings: undefined;
  Shipments: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();
const Tab = createBottomTabNavigator<TabsParamList>();

function HomeTabs() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
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
        }}
      />
      <Tab.Screen
        name="Shipments"
        component={ShipmentsScreen}
        options={{
          tabBarLabel: 'Encomendas',
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
        }}
      />
    </Tab.Navigator>
  );
}

export function AppStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="HomeTabs" component={HomeTabs} />
      <Stack.Screen name="SearchResults" component={SearchResultsScreen} />
      <Stack.Screen name="PopularRoutes" component={PopularRoutesScreen} />
      <Stack.Screen name="TripDetails" component={TripDetailsScreen} />
      <Stack.Screen name="Favorites" component={FavoritesScreen} />
      <Stack.Screen name="Booking" component={BookingScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="Ticket" component={TicketScreen} />
      <Stack.Screen name="Tracking" component={TrackingScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="CreateShipment" component={CreateShipmentScreen} />
      <Stack.Screen name="Shipments" component={ShipmentsScreen} />
      <Stack.Screen name="ShipmentDetails" component={ShipmentDetailsScreen} />
      <Stack.Screen name="ShipmentReview" component={ShipmentReviewScreen} />
      <Stack.Screen name="ValidateDelivery" component={ValidateDeliveryScreen} />
      <Stack.Screen name="ScanShipmentQR" component={ScanShipmentQRScreen} />
      <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
      <Stack.Screen name="Terms" component={TermsScreen} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} />
      <Stack.Screen name="EmergencyContacts" component={EmergencyContactsScreen} />
      <Stack.Screen name="SosAlert" component={SosAlertScreen} />
    </Stack.Navigator>
  );
}

import React, {useEffect, useState} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {CaptainTabBar, CustomTabBar, Icon} from '@components';

import {Promotion, PaymentMethod, bookingService, BookingStatus} from '@domain';
import {
  BoatDetailScreen,
  BookingScreen,
  BookingsScreen,
  CaptainChecklistScreen,
  CaptainProfileScreen,
  CaptainShipmentCollectScreen,
  CaptainTripLiveScreen,
  CaptainCreateBoatScreen,
  CaptainCreateTripScreen,
  CaptainDashboardScreen,
  CaptainEditBoatScreen,
  CaptainStartTripScreen,
  CaptainFinancialScreen,
  CaptainMyBoatsScreen,
  CaptainMyTripsScreen,
  CaptainOperationsScreen,
  CaptainTripManageScreen,
  CreateShipmentScreen,
  EditProfileScreen,
  EmergencyContactsScreen,
  FavoritesScreen,
  GamificationScreen,
  HelpScreen,
  HomeScreen,
  NotificationsScreen,
  PaymentMethodsScreen,
  PaymentScreen,
  PopularRoutesScreen,
  PrivacyScreen,
  ProfileScreen,
  ScanShipmentQRScreen,
  SearchResultsScreen,
  SearchScreen,
  ShipmentDetailsScreen,
  ShipmentReviewScreen,
  ShipmentsScreen,
  TripReviewScreen,
  SosAlertScreen,
  TermsScreen,
  TicketScreen,
  TrackingScreen,
  TripDetailsScreen,
  ValidateDeliveryScreen,
} from '@screens';
import {useAuthStore} from '@store';

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
  TripReview: {
    tripId: string;
    captainName?: string;
    boatName?: string;
  };
  CaptainProfile: {
    captainId: string;
    captainName?: string;
    captainRating?: string | number;
    captainTotalTrips?: number;
    captainLevel?: string;
    captainCreatedAt?: string;
    captainAvatarUrl?: string | null;
    captainIsVerified?: boolean;
    captainHasLicensePhoto?: boolean;
  };
  BoatDetail: {
    boatId: string;
    boatName?: string;
    boatType?: string;
    boatCapacity?: number;
    boatModel?: string | null;
    boatYear?: number | null;
    boatAmenities?: string[];
    boatRegistrationNum?: string;
    boatIsVerified?: boolean;
    boatPhotoUrl?: string | null;
    boatCreatedAt?: string;
  };
  ValidateDelivery: {
    trackingCode?: string;
    pin?: string;
  };
  ScanShipmentQR: undefined;
  PaymentMethods: undefined;
  Notifications: undefined;
  Gamification: undefined;
  Help: undefined;
  Terms: undefined;
  Privacy: undefined;
  EmergencyContacts: undefined;
  SosAlert: {
    tripId?: string;
  };
  // Captain screens
  CaptainMyTrips: undefined;
  CaptainCreateTrip: undefined;
  CaptainTripManage: {tripId: string};
  CaptainMyBoats: undefined;
  CaptainCreateBoat: undefined;
  CaptainEditBoat: {boatId: string};
  CaptainChecklist: {tripId: string};
  CaptainStartTrip: {tripId: string};
  CaptainShipmentCollect: {shipmentId: string};
  CaptainTripLive: {tripId: string; origin: string; destination: string};
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

export type CaptainTabsParamList = {
  Dashboard: undefined;
  Operations: undefined;
  Financial: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();
const Tab = createBottomTabNavigator<TabsParamList>();
const CaptainTab = createBottomTabNavigator<CaptainTabsParamList>();

function HomeTabs() {
  const [bookingsBadge, setBookingsBadge] = useState<number | undefined>(undefined);

  useEffect(() => {
    async function loadBadge() {
      try {
        const bookings = await bookingService.getMyBookings();
        const activeCount = bookings.filter(
          b =>
            b.status === BookingStatus.CONFIRMED ||
            b.status === BookingStatus.PENDING ||
            b.status === BookingStatus.CHECKED_IN,
        ).length;
        setBookingsBadge(activeCount > 0 ? activeCount : undefined);
      } catch {
        // ignore badge errors silently
      }
    }
    loadBadge();
  }, []);

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
          tabBarBadge: bookingsBadge,
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
        }}
      />
    </Tab.Navigator>
  );
}

function CaptainHomeTabs() {
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

export function AppStack() {
  const user = useAuthStore(s => s.user);
  const isCaptain = user?.role === 'captain';

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {backgroundColor: '#F5F7F8'},
      }}>
      <Stack.Screen
        name="HomeTabs"
        component={isCaptain ? CaptainHomeTabs : HomeTabs}
      />
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
      <Stack.Screen name="TripReview" component={TripReviewScreen} />
      <Stack.Screen name="CaptainProfile" component={CaptainProfileScreen} />
      <Stack.Screen name="BoatDetail" component={BoatDetailScreen} />
      <Stack.Screen name="ValidateDelivery" component={ValidateDeliveryScreen} />
      <Stack.Screen name="ScanShipmentQR" component={ScanShipmentQRScreen} />
      <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Gamification" component={GamificationScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
      <Stack.Screen name="Terms" component={TermsScreen} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} />
      <Stack.Screen name="EmergencyContacts" component={EmergencyContactsScreen} />
      <Stack.Screen name="SosAlert" component={SosAlertScreen} />
      {/* Captain stack screens */}
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
    </Stack.Navigator>
  );
}

import { NavigationContainer, type NavigatorScreenParams } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MainTabs, { type MainTabParamList } from "./MainTabs";
import AlarmFormScreen from "../screens/alarms/AlarmFormScreen/AlarmFormScreen";
import AlarmRingingScreen from "../screens/ringing/AlarmRingingScreen/AlarmRingingScreen";
import QuoteScreen from "../screens/ringing/QuoteScreen/QuoteScreen";
import SettingsScreen from "../screens/settings/SettingsScreen/SettingsScreen";
import ReflectionsScreen from "../screens/settings/ReflectionsScreen/ReflectionsScreen";
import NightGuideFormScreen from "../screens/nightGuide/NightGuideFormScreen/NightGuideFormScreen";
import NightGuideActiveScreen from "../screens/nightGuide/NightGuideActiveScreen/NightGuideActiveScreen";
import GoodNightScreen from "../screens/nightGuide/GoodNightScreen/GoodNightScreen";
import NightGuideHistoryScreen from "../screens/nightGuide/NightGuideHistoryScreen/NightGuideHistoryScreen";
import HistoryScreen from "../screens/history/HistoryScreen/HistoryScreen";

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  AlarmForm: { alarmId?: string };
  AlarmRinging: { alarmId: string };
  Quote: { alarmId: string };
  Settings: undefined;
  Reflections: undefined;
  NightGuideForm: { nightGuideId?: string };
  NightGuideActive: { guideId: string; occurrenceId?: string; mode?: "tasks-only" | "full" | "readonly"; };
  NightGuideGoodNight: undefined;
  NightGuideHistory: undefined;
  History: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

import { forwardRef } from "react";
import type { NavigationContainerRef } from "@react-navigation/native";

interface RootStackProps {
  navigationRef?: React.RefObject<NavigationContainerRef<RootStackParamList>>;
}

function RootStackComponent({ navigationRef }: RootStackProps, ref: React.ForwardedRef<NavigationContainerRef<RootStackParamList>>) {
  const navRef = ref || navigationRef;
  return (
    <NavigationContainer ref={navRef}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen
          name="AlarmForm"
          component={AlarmFormScreen}
          options={{ headerShown: false, gestureEnabled: true }}
        />
        <Stack.Screen
          name="AlarmRinging"
          component={AlarmRingingScreen}
          options={{ animation: "fade", gestureEnabled: false }}
        />
        <Stack.Screen
          name="Quote"
          component={QuoteScreen}
          options={{ animation: "fade", gestureEnabled: true }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ headerShown: false, gestureEnabled: true }}
        />
        <Stack.Screen
          name="Reflections"
          component={ReflectionsScreen}
          options={{ headerShown: false, gestureEnabled: true }}
        />
        <Stack.Screen
          name="NightGuideForm"
          component={NightGuideFormScreen}
          options={{ headerShown: false, gestureEnabled: true }}
        />
        <Stack.Screen
          name="NightGuideActive"
          component={NightGuideActiveScreen}
          options={{ animation: "fade", gestureEnabled: false }}
        />
        <Stack.Screen
          name="NightGuideGoodNight"
          component={GoodNightScreen}
          options={{ animation: "fade", gestureEnabled: true }}
        />
        <Stack.Screen
          name="NightGuideHistory"
          component={NightGuideHistoryScreen}
          options={{ headerShown: false, gestureEnabled: true }}
        />
        <Stack.Screen
          name="History"
          component={HistoryScreen}
          options={{ headerShown: false, gestureEnabled: true }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const RootStack = forwardRef(RootStackComponent);
export default RootStack;

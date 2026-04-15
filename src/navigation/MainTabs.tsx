import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import AlarmListScreen from "../screens/alarms/AlarmListScreen/AlarmListScreen";
import SettingsScreen from "../screens/settings/SettingsScreen/SettingsScreen";
import { useThemeTokens } from "../theme";

export type MainTabParamList = {
  Alarms: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabs() {
  const t = useThemeTokens();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === "Alarms") {
            iconName = focused ? "alarm" : "alarm-outline";
          } else if (route.name === "Settings") {
            iconName = focused ? "settings" : "settings-outline";
          } else {
            iconName = "help-circle";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: t.text.primary,
        tabBarInactiveTintColor: t.text.secondary,
        headerShown: false,
      })}
    >
      <Tab.Screen name="Alarms" component={AlarmListScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

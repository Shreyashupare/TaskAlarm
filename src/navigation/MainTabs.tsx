import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import AlarmListScreen from "../screens/alarms/AlarmListScreen/AlarmListScreen";
import MyQuestionsScreen from "../screens/myQuestions/MyQuestionsScreen/MyQuestionsScreen";
import { useThemeTokens } from "../theme";

export type MainTabParamList = {
  Alarms: undefined;
  MyQuestions: undefined;
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
          } else if (route.name === "MyQuestions") {
            iconName = focused ? "help-circle" : "help-circle-outline";
          } else {
            iconName = "help-circle";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: t.action.primaryBg,
        tabBarInactiveTintColor: t.text.secondary,
        tabBarStyle: {
          backgroundColor: t.bg.surface,
          borderTopColor: t.border.default,
          borderTopWidth: 1,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Alarms"
        component={AlarmListScreen}
        options={{ tabBarLabel: "Alarms" }}
      />
      <Tab.Screen
        name="MyQuestions"
        component={MyQuestionsScreen}
        options={{ tabBarLabel: "My Questions" }}
      />
    </Tab.Navigator>
  );
}

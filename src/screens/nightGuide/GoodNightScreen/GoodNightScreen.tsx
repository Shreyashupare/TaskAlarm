import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useThemeTokens } from "../../../theme";
import { NIGHT_GUIDE_TITLE } from "../../../constants/nightGuideConstants";
import { styles } from "./styles";

export default function GoodNightScreen() {
  const t = useThemeTokens();
  const navigation = useNavigation();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: t.bg.app }]}>
      <View style={styles.container}>
        <Ionicons name="moon" size={100} color={t.accent.softSky} />
        <Text style={[styles.title, { color: t.text.primary }]}>
          Good Night!
        </Text>
        <Text style={[styles.subtitle, { color: t.text.secondary }]}>
          You've completed your {NIGHT_GUIDE_TITLE} routine. Rest well and recharge for tomorrow.
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: t.action.primaryBg }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Finish</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

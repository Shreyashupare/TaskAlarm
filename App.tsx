import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>TaskAlarm</Text>
        <Text style={styles.subtitle}>Wake up by solving</Text>
        <Text style={styles.caption}>
          Project setup is complete. Next step: navigation and core screens.
        </Text>
      </View>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 480,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E4E4E7",
    backgroundColor: "#F7F7F8",
    padding: 20,
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111111",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111111",
  },
  caption: {
    fontSize: 14,
    color: "#4A4A4A",
  },
});

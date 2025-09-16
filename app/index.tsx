import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import WelcomeLogo from "../assets/images/Welcome.svg";

const { width } = Dimensions.get("window");

import { Stack } from "expo-router";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />  
      
      <Text style={styles.title}>Conoce las estadísticas de tu trabajo</Text>
      <WelcomeLogo width={width * 0.7} height={width * 0.7} style={styles.logo} />
      
      <Text style={styles.subtitle}>Tu centro de control para estadísticas y datos</Text>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => router.replace("/(tabs)")}
      >
        <Text style={styles.buttonText}>Iniciar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-start",
        backgroundColor: "#fff",
        padding: 20,
        paddingTop: 180, // desplaza hacia abajo desde arriba
      },
      
  logo: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 40,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#DA2B1F",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
  },
});

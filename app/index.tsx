import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import WelcomeLogo from "../assets/images/Welcome-SecTry.svg";
import { Feather } from "@expo/vector-icons";


const { width } = Dimensions.get("window");

import { Stack } from "expo-router";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />  
      
      
      <WelcomeLogo width={width * 0.8} height={width * 0.8} style={styles.logo} />
      <Text style={styles.title}>Conoce las estadísticas de tu trabajo</Text>
      
      <Text style={styles.subtitle}>Accede a una visión completa de tus estadísticas para comprender mejor tu desempeño y optimizar tu trabajo en Expoflamenco.</Text>

        <TouchableOpacity 
    style={styles.button} 
    onPress={() => router.replace("/(tabs)")}
    >
    <Feather name="arrow-right" size={25} color="#fff"/>
    
    </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-start",
        backgroundColor: "#fff3e8",
        padding: 20,
        paddingTop: 130, // desplaza hacia abajo desde arriba
      },
      
  logo: {
    marginBottom: 30,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: "#000000",
  },
  subtitle: {
    fontSize: 16,
    color: "#000000",
    marginBottom: 40,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#DA2B1F",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
  },
});

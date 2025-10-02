import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
  Linking,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';

const { height } = Dimensions.get("window");
const HEADER_HEIGHT = Math.round(height * 0.40);

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuth();
  const { t } = useTranslation();

  const handleLogin = async () => {
    try {
      const success = await login(username.trim(), password.trim());
      if (!success) {
        Alert.alert(t('auth.loginError'), t('auth.credentialsError'));
      }
    } catch (error) {
      console.error('Login error details:', error);
    }
  };

  const handleForgotPassword = async () => {
    const resetUrl = 'https://expoflamenco.com/membresias/login/?action=reset_pass';

    try {
      const supported = await Linking.canOpenURL(resetUrl);
      if (supported) {
        await Linking.openURL(resetUrl);
      } else {
        Alert.alert(t('auth.serverError'));
      }
    } catch (error) {
      console.error('Password reset link error:', error);
      Alert.alert(t('auth.serverError'));
    }
  };

  return (
    <View style={styles.container}>
      {/* Header ola */}
      <View style={styles.header}>
  <Svg width="100%" height="100%" viewBox="0 0 393 220" preserveAspectRatio="none">
    <Path
      d="
        M0 0
        H393
        V148
        C 330 220, 250 211, 180 184
        C 120 166, 60 157, 0 171
        Z
      "
      fill="#DA2B1F"
    />

    {/* Líneas internas tipo topografía */}
    <Path
      d="M0 40 C100 60, 200 30, 393 50"
      stroke="white"
      strokeWidth="0.6"
      fill="none"
      opacity="0.2"
    />
    <Path
      d="M0 80 C120 100, 230 70, 393 95"
      stroke="white"
      strokeWidth="0.6"
      fill="none"
      opacity="0.2"
    />
    <Path
      d="M0 120 C150 140, 240 110, 393 135"
      stroke="white"
      strokeWidth="0.6"
      fill="none"
      opacity="0.2"
    />
    <Path
      d="M0 160 C100 180, 200 150, 393 170"
      stroke="white"
      strokeWidth="0.6"
      fill="none"
      opacity="0.2"
    />
  </Svg>
</View>



      {/* Formulario */}
      <ScrollView contentContainerStyle={styles.formContainer}>
        <Text style={styles.title}>Iniciar Sesión</Text>
        <Text style={styles.dsubtitle}>Utiliza los mismos credenciales que en la web</Text>

        <TextInput
          placeholder="Correo electrónico o usuario"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          placeholder="Contraseña"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />

        

        <Pressable
          style={[styles.btn, isLoading && styles.btnDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={styles.btnText}>
            {isLoading ? 'Cargando...' : 'Iniciar Sesión'}
          </Text>
        </Pressable>

        <Pressable style={styles.signupRow} onPress={handleForgotPassword}>
          <Text style={styles.signupText}>¿Has olvidado tu contraseña? </Text>
          <Text style={styles.diagonalArrow}>↗</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    width: "100%",
    height: HEADER_HEIGHT,
  },

  diagonalArrow: {
    color: '#DA2B1F',
    fontSize: 15,
    fontWeight: '600',
  },

  dsubtitle: {
    marginBottom: 12
  },

  formContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 1, // 🔼 antes estaba en 28 → sube el bloque un poco
    paddingBottom: 10,
  },

  title: {
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 12,
  },

  input: {
    width: "100%",
    padding: 15,
    borderWidth: 1,
    borderColor: "#e2e2e2",
    borderRadius: 12,
    backgroundColor: "#fff",
    marginBottom: 14,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  remember: { fontSize: 16, color: "#444" },

  link: { color: "#DA2B1F", fontWeight: "600" },

  btn: {
    backgroundColor: "#DA2B1F",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 22,
  },

  btnDisabled: {
    backgroundColor: "#ccc",
  },

  btnText: { color: "#fff", fontSize: 18, fontWeight: "700" },

  signupRow: { flexDirection: "row", justifyContent: "center" },
  signupText: { fontSize: 15, color: "#555" },
});

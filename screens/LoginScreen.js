import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { useColorScheme } from '@/hooks/useColorScheme';
import { createApiUsers } from '@/services/apiUsers';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleDiagnostic = async () => {
    setIsLoading(true);
    try {
      const apiUsers = createApiUsers();
      // Diagnostic always checks the root site where login happens
      const diagnosis = await apiUsers.diagnoseAuth('root');

      let message = 'Diagnóstico de autenticación:\n\n';
      message += 'Endpoints JWT disponibles:\n';

      Object.entries(diagnosis.jwtEndpoints).forEach(([endpoint, available]) => {
        message += `${endpoint}: ${available ? '✅' : '❌'}\n`;
      });

      message += '\nRecomendaciones:\n';
      if (diagnosis.recommendations.length > 0) {
        diagnosis.recommendations.forEach(rec => {
          message += `• ${rec}\n`;
        });
      } else {
        message += '✅ Tu configuración parece correcta.';
      }

      Alert.alert('Diagnóstico', message);
    } catch (error) {
      Alert.alert('Error', 'No se pudo ejecutar el diagnóstico: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu usuario y contraseña');
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(username.trim(), password.trim());
      if (!success) {
        Alert.alert('Error', 'Usuario o contraseña incorrectos');
      }
    } catch (error) {
      console.error('Login error details:', error);

      let errorMessage = 'Error al iniciar sesión. ';
      if (error.message.includes('rest_no_route')) {
        errorMessage += 'Parece que no tienes instalado un plugin JWT en WordPress. Instala "JWT Authentication for WP REST API".';
      } else if (error.message.includes('404')) {
        errorMessage += 'Endpoint de autenticación no encontrado. Verifica la configuración del servidor.';
      } else if (error.message.includes('401') || error.message.includes('403')) {
        errorMessage += 'Credenciales incorrectas.';
      } else {
        errorMessage += error.message || 'Inténtalo de nuevo.';
      }

      Alert.alert('Error de Autenticación', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        {/* Background Gradient */}
        <View style={styles.backgroundGradient}>
          <View style={[styles.gradientOverlay, isDark && styles.darkGradient]} />
        </View>

        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={[styles.logoIcon, { backgroundColor: isDark ? '#10B981' : '#059669' }]}>
                <Text style={styles.logoText}>📊</Text>
              </View>
              <Text style={[
                styles.title,
                { color: isDark ? '#FFFFFF' : '#111827' }
              ]}>
                Expoflamenco Analytics
              </Text>
            </View>
            <Text style={[
              styles.subtitle,
              { color: isDark ? '#D1D5DB' : '#374151' }
            ]}>
              Accede a tus estadísticas personales de rendimiento
            </Text>
          </View>

          {/* Login Form */}
          <View style={[
            styles.form,
            { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }
          ]}>
            <View style={styles.inputContainer}>
              <Text style={[
                styles.label,
                { color: isDark ? '#D1D5DB' : '#374151' }
              ]}>
                Usuario
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? '#374151' : '#F9FAFB',
                    borderColor: isDark ? '#4B5563' : '#D1D5DB',
                    color: isDark ? '#FFFFFF' : '#111827'
                  }
                ]}
                value={username}
                onChangeText={setUsername}
                placeholder="Ingresa tu usuario"
                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[
                styles.label,
                { color: isDark ? '#D1D5DB' : '#374151' }
              ]}>
                Contraseña
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? '#374151' : '#F9FAFB',
                    borderColor: isDark ? '#4B5563' : '#D1D5DB',
                    color: isDark ? '#FFFFFF' : '#111827'
                  }
                ]}
                value={password}
                onChangeText={setPassword}
                placeholder="Ingresa tu contraseña"
                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.loginButton,
                { backgroundColor: isLoading ? '#6B7280' : '#DA2B1F' }
              ]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.loginButtonText}>
                  Iniciar Sesión
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.diagnosticButton,
                { borderColor: isDark ? '#374151' : '#D1D5DB' }
              ]}
              onPress={handleDiagnostic}
              disabled={isLoading}
            >
              <Text style={[
                styles.diagnosticButtonText,
                { color: isDark ? '#9CA3AF' : '#6B7280' }
              ]}>
                🔍 Diagnosticar Servidor
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[
              styles.footerText,
              { color: isDark ? '#6B7280' : '#9CA3AF' }
            ]}>
              Analytics para autores de Expoflamenco
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#667EEA',
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#667EEA',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  darkGradient: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  logoIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
  form: {
    padding: 32,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    height: 56,
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 20,
    fontSize: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  loginButton: {
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: '#DA2B1F',
    shadowColor: '#DA2B1F',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  diagnosticButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    marginTop: 16,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  diagnosticButtonText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  footer: {
    alignItems: 'center',
    marginTop: 48,
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

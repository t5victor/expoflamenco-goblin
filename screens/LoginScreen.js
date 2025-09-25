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
  Animated,
  Linking,
} from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const passwordFieldAnimation = useState(new Animated.Value(0))[0];
  const { login } = useAuth();
  const { t } = useTranslation();

  const handleArrowPress = async () => {
    if (!username.trim()) return;

    if (!showPasswordField) {
      // First arrow press - show password field after delay
      setIsWaiting(true);
      setTimeout(() => {
        setIsWaiting(false);
        setShowPasswordField(true);
        Animated.timing(passwordFieldAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, 1500);
    } else {
      // Second arrow press - login
      if (!password.trim()) return;
      handleLogin();
    }
  };

  const handleForgotPassword = async () => {
    try {
      await Linking.openURL('https://expoflamenco.com/membresias/login/?action=reset_pass');
    } catch (error) {
      Alert.alert('Error', 'No se pudo abrir el enlace de recuperación de contraseña');
    }
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert(t('auth.authError'), t('auth.credentialsError'));
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(username.trim(), password.trim());
      if (!success) {
        Alert.alert(t('auth.loginError'), t('auth.credentialsError'));
      }
    } catch (error) {
      console.error('Login error details:', error);

      let errorMessage = t('auth.serverError');
      if (error.message.includes('rest_no_route')) {
        errorMessage = t('auth.jwtError');
      } else if (error.message.includes('404')) {
        errorMessage = t('auth.networkError');
      } else if (error.message.includes('401') || error.message.includes('403')) {
        errorMessage = t('auth.credentialsError');
      }

      Alert.alert(t('auth.authError'), errorMessage);
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
        <View style={styles.content}>
          <View style={styles.header}>
            <IconSymbol name="sharedwithyou" size={96} color="#DA2B1F" style={styles.icon} />
            <Text style={styles.title}>
              Expo Stats
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Correo o número de teléfono"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
               autoCorrect={false}
                editable={!isWaiting}
              />
              {!showPasswordField && (
                <TouchableOpacity
                  style={[styles.arrowButton, !username.trim() && styles.arrowButtonDisabled]}
                  onPress={handleArrowPress}
                  disabled={isLoading || isWaiting || !username.trim()}
                >
                  {isWaiting ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.arrowText}>→</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>

            {showPasswordField && (
              <Animated.View
                style={[
                  styles.inputContainer,
                  {
                    opacity: passwordFieldAnimation,
                    transform: [{
                      translateY: passwordFieldAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-20, 0],
                      }),
                    }],
                  },
                ]}
              >
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Contraseña"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={[styles.arrowButton, !password.trim() && styles.arrowButtonDisabled]}
                  onPress={handleArrowPress}
                  disabled={isLoading || !password.trim()}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.arrowText}>→</Text>
                  )}
                </TouchableOpacity>
              </Animated.View>
            )}

            <View style={styles.forgotPasswordContainer}>
              <TouchableOpacity style={styles.forgotPasswordButton} onPress={handleForgotPassword}>
                <Text style={styles.forgotPasswordText}>
                  ¿Has olvidado tu contraseña?
                </Text>
                <Text style={styles.diagonalArrow}>↗</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    marginBottom: 24,
  },
  icon: {
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 8,
  },
  form: {
    marginTop: 16,
  },
  inputContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingRight: 60,
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
  },
  arrowButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  arrowButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  arrowText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  forgotPasswordContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  forgotPasswordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  forgotPasswordText: {
    color: '#DA2B1F',
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  diagonalArrow: {
    color: '#DA2B1F',
    fontSize: 18,
    fontWeight: '600',
  },
});

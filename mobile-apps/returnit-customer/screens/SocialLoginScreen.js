import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import apiClient from '../services/api-client';
import authService from '../services/auth-service';

// Complete auth session on web
WebBrowser.maybeCompleteAuthSession();

const useProxy = Platform.select({ web: false, default: true });

export default function SocialLoginScreen({ navigation, route }) {
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState(null);

  // Google OAuth configuration
  const discovery = {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
    revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
  };

  // Get Google Client ID from Expo config
  const googleClientId = Constants.expoConfig?.extra?.googleClientId || 
                         Constants.manifest?.extra?.googleClientId;

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: googleClientId,
      scopes: ['openid', 'profile', 'email'],
      redirectUri: AuthSession.makeRedirectUri({
        scheme: 'returnit-customer',
        useProxy,
      }),
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleCallback(response.params);
    } else if (response?.type === 'error') {
      Alert.alert('Authentication Error', response.error?.message || 'Failed to authenticate');
      setLoading(false);
    } else if (response?.type === 'dismiss' || response?.type === 'cancel') {
      setLoading(false);
    }
  }, [response]);

  const handleGoogleCallback = async (params) => {
    try {
      setLoading(true);
      
      // Exchange authorization code for access token on backend
      const authResponse = await apiClient.request('/api/auth/google/mobile', {
        method: 'POST',
        body: {
          code: params.code,
          redirectUri: AuthSession.makeRedirectUri({
            scheme: 'returnit-customer',
            useProxy,
          }),
        },
      });

      if (authResponse.user) {
        // Update auth state
        await authService.setAuthenticated(authResponse.user);
        
        // Navigate to home on success
        if (route.params?.onSuccess) {
          route.params.onSuccess();
        } else {
          navigation.replace('Home');
        }
      }
    } catch (error) {
      console.error('Google auth error:', error);
      
      // Handle specific error codes from backend
      if (error.response?.status === 404 && error.response?.data?.error === 'USER_NOT_FOUND') {
        Alert.alert(
          'Account Not Found',
          `No ReturnIt account exists for ${error.response.data.email}. Please create an account first.`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Sign Up', 
              onPress: () => navigation.replace('Login') 
            }
          ]
        );
      } else {
        Alert.alert(
          'Authentication Failed',
          error.response?.data?.message || error.message || 'Unable to complete Google sign-in. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    if (!googleClientId || googleClientId.includes('YOUR_GOOGLE')) {
      Alert.alert(
        'Configuration Required',
        'Google Sign-In requires additional setup. Please use email login or contact support.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setLoading(true);
      setProvider('google');
      await promptAsync({ useProxy });
    } catch (error) {
      console.error('Error initiating Google sign-in:', error);
      Alert.alert('Error', 'Failed to initiate Google sign-in');
      setLoading(false);
    }
  };

  const signInWithFacebook = () => {
    Alert.alert(
      'Facebook Login',
      'Facebook authentication requires additional setup. Please contact support or use email login.',
      [{ text: 'OK' }]
    );
  };

  const signInWithApple = () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('Not Available', 'Apple Sign-In is only available on iOS devices.');
      return;
    }
    Alert.alert(
      'Apple Login',
      'Apple Sign-In requires additional configuration. Please contact support or use email login.',
      [{ text: 'OK' }]
    );
  };

  const goBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Continue with Social</Text>
          <Text style={styles.subtitle}>Choose your preferred sign-in method</Text>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.socialButton, styles.googleButton]}
            onPress={signInWithGoogle}
            disabled={loading}
          >
            {loading && provider === 'google' ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.socialIcon}>G</Text>
                <Text style={styles.socialButtonText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.socialButton, styles.facebookButton]}
            onPress={signInWithFacebook}
            disabled={loading}
          >
            <Text style={styles.socialIcon}>f</Text>
            <Text style={styles.socialButtonText}>Continue with Facebook</Text>
          </TouchableOpacity>

          {Platform.OS === 'ios' && (
            <TouchableOpacity
              style={[styles.socialButton, styles.appleButton]}
              onPress={signInWithApple}
              disabled={loading}
            >
              <Text style={styles.socialIcon}></Text>
              <Text style={styles.socialButtonText}>Continue with Apple</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.divider} />
        </View>

        <TouchableOpacity
          style={styles.emailButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.emailButtonText}>Sign in with Email</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to ReturnIt's{'\n'}
            <Text style={styles.link}>Terms of Service</Text> and{' '}
            <Text style={styles.link}>Privacy Policy</Text>
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F7F4',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#2E8B57',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  titleContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  buttonsContainer: {
    gap: 16,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  googleButton: {
    backgroundColor: '#4285F4',
  },
  facebookButton: {
    backgroundColor: '#1877F2',
  },
  appleButton: {
    backgroundColor: '#000',
  },
  socialIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  emailButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2E8B57',
    alignItems: 'center',
  },
  emailButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E8B57',
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
  link: {
    color: '#2E8B57',
    textDecoration: 'underline',
  },
});

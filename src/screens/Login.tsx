import { COLORS, SIZES } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet,
  Text,
  TextInput, TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter your email and password.');
      return;
    }

    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      // If the email is not confirmed, send them to the verify screen
      if (error.message.includes('Email not confirmed')) {
        router.push({
          pathname: '/verify',
          params: { email: email }
        });
      } else {
        Alert.alert('Login Failed', error.message);
      }
    } else {
      // Navigate to Home on success
      router.replace('/home');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>DriveLux</Text>
            <Text style={styles.headerSubtitle}>Login to your account</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <View style={[styles.inputContainer, focusedInput === 'email' && styles.inputContainerFocused]}>
                <TextInput 
                  style={styles.input}
                  placeholder="Phone Number or Email"
                  placeholderTextColor={COLORS.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={[styles.inputContainer, focusedInput === 'password' && styles.inputContainerFocused]}>
                <TextInput 
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor={COLORS.textSecondary}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.primaryButton} 
              activeOpacity={0.8} 
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.text} />
              ) : (
                <Text style={styles.primaryButtonText}>Login</Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
                <Ionicons name="logo-google" size={18} color={COLORS.text} />
                <Text style={styles.socialButtonText}>Google</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
                <Ionicons name="logo-facebook" size={18} color="#1877F2" />
                <Text style={styles.socialButtonText}>Facebook</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/register')}>
                <Text style={styles.footerLink}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <View style={styles.bottomImageContainer}>
          <Image source={{ uri: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=1000&auto=format&fit=crop' }} style={styles.bottomImage} resizeMode="cover" />
          <View style={styles.imageDarkOverlay} />
          <LinearGradient colors={[COLORS.background, 'transparent']} style={styles.imageGradient} start={{ x: 0, y: 0 }} end={{ x: 0, y: 0.8 }} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { flexGrow: 1, paddingHorizontal: SIZES.padding, paddingTop: 40, paddingBottom: 260 },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logoText: { color: COLORS.primary, fontSize: 42, fontWeight: '800', fontStyle: 'italic', letterSpacing: 1, marginBottom: 10 },
  headerSubtitle: { color: COLORS.textSecondary, fontSize: 16, fontWeight: '500' },
  form: { flex: 1 },
  inputGroup: { marginBottom: 16 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: SIZES.radius, borderWidth: 1, borderColor: 'transparent', paddingHorizontal: 16 },
  inputContainerFocused: { borderColor: COLORS.primary },
  input: { flex: 1, paddingVertical: 18, color: COLORS.text, fontSize: 15 },
  eyeIcon: { padding: 8 },
  primaryButton: { backgroundColor: COLORS.primary, paddingVertical: 18, borderRadius: SIZES.radius, alignItems: 'center', marginTop: 10, marginBottom: 30, height: 58, justifyContent: 'center' },
  primaryButtonText: { color: COLORS.text, fontSize: 16, fontWeight: '800' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  divider: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { color: COLORS.textSecondary, paddingHorizontal: 16, fontSize: 13 },
  socialRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 30 },
  socialButton: { flex: 1, flexDirection: 'row', paddingVertical: 14, borderRadius: SIZES.radius, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface },
  socialButtonText: { color: COLORS.text, fontSize: 14, fontWeight: '600', marginLeft: 8 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  footerText: { color: COLORS.textSecondary, fontSize: 14 },
  footerLink: { color: COLORS.primary, fontSize: 14, fontWeight: '700' },
  bottomImageContainer: { position: 'absolute', bottom: 0, width: width, height: 240, zIndex: -1 },
  bottomImage: { width: '100%', height: '100%' },
  imageDarkOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(11, 19, 25, 0.4)' },
  imageGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 100 }
});
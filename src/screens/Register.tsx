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

const { width } = Dimensions.get('window');

export default function RegisterScreen() {
  const router = useRouter();
  
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  
  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !email || !phone || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    if (!isChecked) {
      Alert.alert('Error', 'Please agree to the Terms of Service.');
      return;
    }

    setLoading(true);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone,
        }
      }
    });

    setLoading(false);

    if (error) {
      Alert.alert('Registration Failed', error.message);
    } else {
      router.replace('/(tabs)/home'); 
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}>
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>DriveLux</Text>
              <Text style={styles.headerSubtitle}>Create an account to start driving.</Text>
            </View>
          </View>

          <View style={styles.form}>
            
            <View style={styles.inputGroup}>
              <View style={[styles.inputContainer, focusedInput === 'name' && styles.inputContainerFocused]}>
                <TextInput 
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor={COLORS.textSecondary}
                  value={fullName}
                  onChangeText={setFullName}
                  onFocus={() => setFocusedInput('name')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={[styles.inputContainer, focusedInput === 'email' && styles.inputContainerFocused]}>
                <TextInput 
                  style={styles.input}
                  placeholder="Email Address"
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
              <View style={[styles.inputContainer, focusedInput === 'phone' && styles.inputContainerFocused]}>
                <TextInput 
                  style={styles.input}
                  placeholder="Phone Number"
                  placeholderTextColor={COLORS.textSecondary}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  onFocus={() => setFocusedInput('phone')}
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

            <View style={styles.inputGroup}>
              <View style={[styles.inputContainer, focusedInput === 'confirmPassword' && styles.inputContainerFocused]}>
                <TextInput 
                  style={styles.input}
                  placeholder="Confirm Password"
                  placeholderTextColor={COLORS.textSecondary}
                  secureTextEntry={!showPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  onFocus={() => setFocusedInput('confirmPassword')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.termsContainer} onPress={() => setIsChecked(!isChecked)} activeOpacity={0.7}>
              <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                {isChecked && <Ionicons name="checkmark" size={14} color={COLORS.background} />}
              </View>
              <Text style={styles.termsText}>
                I agree to the <Text style={styles.termsLink}>Terms of Service</Text> and <Text style={styles.termsLink}>Privacy Policy</Text>.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.primaryButton} 
              activeOpacity={0.8} 
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.text} />
              ) : (
                <Text style={styles.primaryButtonText}>Register</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={styles.footerLink}>Login</Text>
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
  scrollContent: { flexGrow: 1, paddingHorizontal: SIZES.padding, paddingTop: 20, paddingBottom: 350 },
  header: { marginBottom: 30 },
  backBtn: { marginBottom: 20, alignSelf: 'flex-start' },
  logoContainer: { alignItems: 'center' },
  logoText: { color: COLORS.primary, fontSize: 42, fontWeight: '800', fontStyle: 'italic', letterSpacing: 1, marginBottom: 10 },
  headerSubtitle: { color: COLORS.textSecondary, fontSize: 16, fontWeight: '500' },
  form: { flex: 1 },
  inputGroup: { marginBottom: 16 },
  
  // SHARP CORNERS FOR INPUTS
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 0, borderWidth: 1, borderColor: 'transparent', paddingHorizontal: 16 },
  inputContainerFocused: { borderColor: COLORS.primary },
  input: { flex: 1, paddingVertical: 18, color: COLORS.text, fontSize: 15 },
  eyeIcon: { padding: 8 },
  
  termsContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 10, marginBottom: 24 },
  
  // SHARP CORNER FOR CHECKBOX
  checkbox: { width: 22, height: 22, borderRadius: 0, borderWidth: 2, borderColor: COLORS.textSecondary, marginRight: 12, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  termsText: { color: COLORS.textSecondary, fontSize: 13, flex: 1, lineHeight: 20 },
  termsLink: { color: COLORS.primary, fontWeight: '600' },
  
  // SHARP CORNER FOR BUTTON
  primaryButton: { backgroundColor: COLORS.primary, paddingVertical: 18, borderRadius: 0, alignItems: 'center', marginBottom: 20, height: 58, justifyContent: 'center' },
  primaryButtonText: { color: COLORS.text, fontSize: 16, fontWeight: '800' },
  
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 10 },
  footerText: { color: COLORS.textSecondary, fontSize: 14 },
  footerLink: { color: COLORS.primary, fontSize: 14, fontWeight: '700' },
  
  // BOTTOM IMAGE STYLES (UNTOUCHED)
  bottomImageContainer: { position: 'absolute', bottom: 0, width: width, height: 250, zIndex: -1 },
  bottomImage: { width: '100%', height: '100%' },
  imageDarkOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(11, 19, 25, 0.4)' },
  imageGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 120 }
});
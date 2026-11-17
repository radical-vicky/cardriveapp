import { COLORS, SIZES } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView, Platform,
    StyleSheet,
    Text,
    TextInput, TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VerifyScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>(); // Get email from route params
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  // Handle input changes for 6 separate boxes
  const handleChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const token = code.join('');
    if (token.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit code.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email: email as string,
      token: token,
      type: 'signup', // <-- Important: type is 'signup' for newly created accounts
    });
    setLoading(false);

    if (error) {
      Alert.alert('Verification Failed', error.message);
    } else {
      // Success! Navigate to Home
      router.replace('/home');
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    
    setTimer(60);
    const { error } = await supabase.auth.signInWithOtp({
      email: email as string,
      options: { shouldCreateUser: false },
    });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'A new code has been sent to your email.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title}>Verify your email</Text>
          <Text style={styles.subtitle}>
            We sent a 6-digit code to <Text style={styles.emailText}>{email}</Text>
          </Text>

          {/* OTP Input Boxes */}
          <View style={styles.otpContainer}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => { inputRefs.current[index] = ref; }}
                style={[styles.otpInput, digit ? styles.otpInputFilled : null]}
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>

          {/* Verify Button */}
          <TouchableOpacity 
            style={[styles.primaryButton, loading && { opacity: 0.7 }]} 
            onPress={handleVerify}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.text} />
            ) : (
              <Text style={styles.primaryButtonText}>Verify & Continue</Text>
            )}
          </TouchableOpacity>

          {/* Resend Logic */}
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive the code? </Text>
            <TouchableOpacity onPress={handleResend} disabled={timer > 0}>
              <Text style={[styles.resendLink, timer > 0 && { color: COLORS.textSecondary }]}>
                {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: SIZES.padding },
  backBtn: { marginTop: 20, marginBottom: 40 },
  content: { flex: 1, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text, marginBottom: 10 },
  subtitle: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 40 },
  emailText: { color: COLORS.primary, fontWeight: '600' },
  otpContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 40 },
  otpInput: {
    width: 50,
    height: 60,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  otpInputFilled: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(74, 124, 158, 0.1)',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    width: '100%',
    paddingVertical: 18,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginBottom: 20,
  },
  primaryButtonText: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  resendContainer: { flexDirection: 'row', marginTop: 10 },
  resendText: { color: COLORS.textSecondary, fontSize: 14 },
  resendLink: { color: COLORS.primary, fontSize: 14, fontWeight: '700' },
});
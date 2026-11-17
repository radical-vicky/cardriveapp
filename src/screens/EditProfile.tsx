
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';

const COLORS = {
  background: '#08090B',
  surface: '#121418',
  surfaceLight: '#191C21',
  primary: '#D6AD62',
  goldLight: '#F0D8A5',
  text: '#FFFFFF',
  textSecondary: '#92949A',
  border: 'rgba(255,255,255,0.09)',
  goldBorder: 'rgba(214,173,98,0.28)',
  success: '#62C99A',
  danger: '#E47777',
};

export default function EditProfileScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [initialName, setInitialName] = useState('');
  const [initialPhone, setInitialPhone] = useState('');

  const [focusedField, setFocusedField] = useState('');

  const fetchProfile = useCallback(async () => {
    setLoading(true);

    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) throw error;

      if (!user) {
        Alert.alert(
          'Session expired',
          'Please sign in again to edit your profile.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/login'),
            },
          ]
        );
        return;
      }

      const name = user.user_metadata?.full_name || '';
      const phoneNumber = user.user_metadata?.phone || '';

      setEmail(user.email || '');
      setFullName(name);
      setPhone(phoneNumber);

      setInitialName(name);
      setInitialPhone(phoneNumber);
    } catch (error: any) {
      Alert.alert(
        'Unable to load profile',
        error?.message || 'Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const getInitials = () => {
    const name = fullName.trim();

    if (!name) return 'PD';

    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  };

  const hasChanges =
    fullName.trim() !== initialName ||
    phone.trim() !== initialPhone;

  const handleSave = async () => {
    const cleanedName = fullName.trim();
    const cleanedPhone = phone.trim();

    if (!cleanedName) {
      Alert.alert('Missing information', 'Please enter your full name.');
      return;
    }

    if (!cleanedPhone) {
      Alert.alert('Missing information', 'Please enter your phone number.');
      return;
    }

    if (cleanedName.length < 2) {
      Alert.alert('Invalid name', 'Please enter a valid full name.');
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        throw new Error('Your session has expired. Please sign in again.');
      }

      // Update the profile table first.
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: cleanedName,
          phone: cleanedPhone,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Keep Supabase Auth metadata in sync.
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: cleanedName,
          phone: cleanedPhone,
        },
      });

      if (authError) {
        throw new Error(
          `Your profile record was updated, but account metadata could not be updated: ${authError.message}`
        );
      }

      setFullName(cleanedName);
      setPhone(cleanedPhone);
      setInitialName(cleanedName);
      setInitialPhone(cleanedPhone);

      Alert.alert(
        'Profile Updated',
        'Your personal information has been successfully updated.',
        [
          {
            text: 'Done',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Update failed',
        error?.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const renderInput = (
    label: string,
    icon: keyof typeof Ionicons.glyphMap,
    value: string,
    onChangeText: (value: string) => void,
    placeholder: string,
    field: string,
    options: {
      keyboardType?: 'default' | 'phone-pad' | 'email-address';
      editable?: boolean;
      autoCapitalize?: 'none' | 'sentences' | 'words';
    } = {}
  ) => {
    const isFocused = focusedField === field;
    const isEditable = options.editable !== false;

    return (
      <View style={styles.formGroup}>
        <Text style={styles.label}>{label}</Text>

        <View
          style={[
            styles.inputContainer,
            isFocused && styles.inputFocused,
            !isEditable && styles.inputDisabled,
          ]}
        >
          <Ionicons
            name={icon}
            size={19}
            color={isFocused ? COLORS.primary : COLORS.textSecondary}
          />

          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#62656C"
            keyboardType={options.keyboardType || 'default'}
            editable={isEditable && !saving}
            autoCapitalize={options.autoCapitalize || 'words'}
            autoCorrect={false}
            onFocus={() => setFocusedField(field)}
            onBlur={() => setFocusedField('')}
            selectionColor={COLORS.primary}
          />

          {!isEditable && (
            <Ionicons
              name="lock-closed-outline"
              size={17}
              color={COLORS.textSecondary}
            />
          )}
        </View>

        {!isEditable && (
          <Text style={styles.fieldHint}>
            Your registered email address cannot be changed here.
          </Text>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading your profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            disabled={saving}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={21} color={COLORS.text} />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <Text style={styles.headerSubtitle}>PERSONAL INFORMATION</Text>
          </View>

          <View style={styles.headerRight}>
            <Ionicons name="person-circle-outline" size={25} color={COLORS.primary} />
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {/* Profile identity */}
          <View style={styles.profileSection}>
            <View style={styles.avatarOuter}>
              <View style={styles.avatar}>
                <Text style={styles.avatarInitials}>
                  {getInitials()}
                </Text>
              </View>

              <View style={styles.avatarBadge}>
                <Ionicons name="checkmark" size={12} color={COLORS.background} />
              </View>
            </View>

            <Text style={styles.profileName}>
              {fullName.trim() || 'Your Name'}
            </Text>

            <Text style={styles.profileEmail}>{email}</Text>

            <View style={styles.memberBadge}>
              <Ionicons name="shield-checkmark" size={13} color={COLORS.primary} />
              <Text style={styles.memberBadgeText}>PREMIUM DRIVE MEMBER</Text>
            </View>
          </View>

          {/* Form heading */}
          <View style={styles.sectionHeading}>
            <View>
              <Text style={styles.sectionTitle}>Personal Details</Text>
              <Text style={styles.sectionSubtitle}>
                Keep your account information up to date.
              </Text>
            </View>

            <Ionicons name="create-outline" size={21} color={COLORS.primary} />
          </View>

          <View style={styles.formCard}>
            {renderInput(
              'FULL NAME',
              'person-outline',
              fullName,
              setFullName,
              'Enter your full name',
              'name'
            )}

            {renderInput(
              'PHONE NUMBER',
              'call-outline',
              phone,
              setPhone,
              'e.g. 0712 345 678',
              'phone',
              { keyboardType: 'phone-pad', autoCapitalize: 'none' }
            )}

            {renderInput(
              'EMAIL ADDRESS',
              'mail-outline',
              email,
              () => {},
              'Your email address',
              'email',
              {
                editable: false,
                keyboardType: 'email-address',
                autoCapitalize: 'none',
              }
            )}
          </View>

          {/* Security information */}
          <View style={styles.securityCard}>
            <View style={styles.securityIcon}>
              <Ionicons
                name="shield-checkmark-outline"
                size={21}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.securityContent}>
              <Text style={styles.securityTitle}>Your information is secure</Text>
              <Text style={styles.securityDescription}>
                Your personal details are associated with your account and
                handled through our secure profile service.
              </Text>
            </View>
          </View>

          <Text style={styles.bottomNote}>
            Make sure your phone number is correct so we can reach you about
            your bookings.
          </Text>
        </ScrollView>

        {/* Bottom action */}
        <View style={styles.bottomAction}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              (!hasChanges || saving) && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={!hasChanges || saving}
            activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator color={COLORS.background} />
            ) : (
              <>
                <Text style={styles.saveButtonText}>SAVE CHANGES</Text>
                <Ionicons
                  name="arrow-forward"
                  size={19}
                  color={COLORS.background}
                />
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            disabled={saving}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 14,
  },

  header: {
    height: 66,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  backButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  headerTitleContainer: {
    flex: 1,
    marginLeft: 14,
  },

  headerTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  headerSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.6,
    marginTop: 4,
  },

  headerRight: {
    width: 42,
    alignItems: 'flex-end',
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 30,
  },

  profileSection: {
    alignItems: 'center',
    paddingBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 27,
  },

  avatarOuter: {
    width: 108,
    height: 108,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    padding: 6,
    marginBottom: 15,
  },

  avatar: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: 'rgba(214,173,98,0.18)',
  },

  avatarInitials: {
    color: COLORS.primary,
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: 2,
  },

  avatarBadge: {
    position: 'absolute',
    right: -3,
    bottom: 12,
    width: 23,
    height: 23,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.background,
  },

  profileName: {
    color: COLORS.text,
    fontSize: 21,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  profileEmail: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 6,
  },

  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 13,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: 'rgba(214,173,98,0.08)',
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
  },

  memberBadgeText: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
  },

  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 17,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '700',
  },

  sectionSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 5,
  },

  formCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 17,
  },

  formGroup: {
    marginBottom: 21,
  },

  label: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.3,
    marginBottom: 10,
  },

  inputContainer: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },

  inputFocused: {
    borderColor: COLORS.primary,
    backgroundColor: '#101114',
  },

  inputDisabled: {
    backgroundColor: '#0D0E10',
    opacity: 0.7,
  },

  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
    paddingVertical: 14,
  },

  fieldHint: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 7,
  },

  securityCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    marginTop: 22,
    backgroundColor: 'rgba(214,173,98,0.055)',
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    gap: 13,
  },

  securityIcon: {
    width: 37,
    height: 37,
    backgroundColor: 'rgba(214,173,98,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  securityContent: {
    flex: 1,
  },

  securityTitle: {
    color: COLORS.goldLight,
    fontSize: 13,
    fontWeight: '700',
  },

  securityDescription: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 18,
    marginTop: 5,
  },

  bottomNote: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 10,
  },

  bottomAction: {
    paddingHorizontal: 20,
    paddingTop: 13,
    paddingBottom: Platform.OS === 'ios' ? 12 : 16,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  saveButton: {
    height: 56,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },

  saveButtonDisabled: {
    opacity: 0.45,
  },

  saveButtonText: {
    color: COLORS.background,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
  },

  cancelButtonText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
});

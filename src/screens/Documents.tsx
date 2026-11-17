
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
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
  goldBorder: 'rgba(214,173,98,0.25)',
  success: '#62C99A',
  warning: '#E6B45C',
  danger: '#E47777',
};

type DocumentType = 'license' | 'id';

type DocumentRecord = {
  license_url: string | null;
  id_card_url: string | null;
  status: string | null;
};

export default function DocumentsScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [licenseBase64, setLicenseBase64] = useState<string | null>(null);
  const [idBase64, setIdBase64] = useState<string | null>(null);

  const [licenseUri, setLicenseUri] = useState<string | null>(null);
  const [idUri, setIdUri] = useState<string | null>(null);

  const [existingStatus, setExistingStatus] = useState<string | null>(null);

  const fetchExistingDocs = useCallback(async () => {
    setFetching(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;
      if (!user) throw new Error('Please sign in to view your documents.');

      const { data, error } = await supabase
        .from('documents')
        .select('license_url, id_card_url, status')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const record = data as DocumentRecord;

        setExistingStatus(record.status);
        setLicenseUri(record.license_url);
        setIdUri(record.id_card_url);
      }
    } catch (error: any) {
      Alert.alert(
        'Unable to Load Documents',
        error?.message || 'Please try again.'
      );
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchExistingDocs();
  }, [fetchExistingDocs]);

  const pickImage = async (type: DocumentType) => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Gallery Permission',
          'Allow photo library access to select your document image.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.65,
        base64: true,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];

      if (!asset.base64) {
        Alert.alert(
          'Image Error',
          'We could not read this image. Please select another photo.'
        );
        return;
      }

      if (type === 'license') {
        setLicenseUri(asset.uri);
        setLicenseBase64(asset.base64);
      } else {
        setIdUri(asset.uri);
        setIdBase64(asset.base64);
      }
    } catch (error: any) {
      Alert.alert(
        'Unable to Select Image',
        error?.message || 'Please try again.'
      );
    }
  };

  const uploadToCloudinary = async (base64String: string) => {
    const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error(
        'Cloudinary is not configured. Please check your app environment variables.'
      );
    }

    const formData = new FormData();

    formData.append(
      'file',
      `data:image/jpeg;base64,${base64String}` as any
    );
    formData.append('upload_preset', uploadPreset);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const result = await response.json();

    if (!response.ok || result.error || !result.secure_url) {
      throw new Error(
        result?.error?.message || 'The image upload failed.'
      );
    }

    return result.secure_url as string;
  };

  const handleSubmit = async () => {
    if (!licenseUri || !idUri) {
      Alert.alert(
        'Documents Required',
        'Please provide both your driving licence and National ID or passport.'
      );
      return;
    }

    const hasChanges = Boolean(licenseBase64 || idBase64);

    if (!hasChanges) {
      Alert.alert(
        'No Changes',
        'You have not selected any new document images.'
      );
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;
      if (!user) throw new Error('Your session has expired. Please sign in again.');

      // Keep existing URLs for documents that were not replaced.
      let licenseUrl = licenseUri;
      let idUrl = idUri;

      // Upload only newly selected images.
      if (licenseBase64) {
        licenseUrl = await uploadToCloudinary(licenseBase64);
      }

      if (idBase64) {
        idUrl = await uploadToCloudinary(idBase64);
      }

      if (!licenseUrl || !idUrl) {
        throw new Error('Both document images are required.');
      }

      const { error: saveError } = await supabase
        .from('documents')
        .upsert(
          {
            user_id: user.id,
            license_url: licenseUrl,
            id_card_url: idUrl,
            status: 'pending',
          },
          { onConflict: 'user_id' }
        );

      if (saveError) throw saveError;

      setLicenseUri(licenseUrl);
      setIdUri(idUrl);
      setLicenseBase64(null);
      setIdBase64(null);
      setExistingStatus('pending');

      Alert.alert(
        'Documents Submitted',
        'Your documents have been submitted successfully and are now awaiting review.',
        [
          {
            text: 'Done',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Submission Failed',
        error?.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusDetails = () => {
    switch (existingStatus?.toLowerCase()) {
      case 'verified':
        return {
          title: 'Documents Verified',
          message: 'Your identity documents have been approved.',
          icon: 'checkmark-circle-outline' as const,
          color: COLORS.success,
          background: 'rgba(98,201,154,0.09)',
        };

      case 'pending':
        return {
          title: 'Under Review',
          message: 'Your documents have been submitted and are awaiting verification.',
          icon: 'time-outline' as const,
          color: COLORS.warning,
          background: 'rgba(230,180,92,0.09)',
        };

      case 'rejected':
        return {
          title: 'Verification Unsuccessful',
          message: 'Your documents were not approved. Please upload clear, valid images again.',
          icon: 'alert-circle-outline' as const,
          color: COLORS.danger,
          background: 'rgba(228,119,119,0.09)',
        };

      default:
        return null;
    }
  };

  const status = getStatusDetails();
  const hasNewDocuments = Boolean(licenseBase64 || idBase64);
  const canSubmit =
    Boolean(licenseUri && idUri) &&
    hasNewDocuments &&
    !loading;

  const renderDocumentCard = (
    type: DocumentType,
    title: string,
    subtitle: string,
    uri: string | null,
    isNew: boolean
  ) => {
    const isLicense = type === 'license';

    return (
      <View style={styles.documentSection}>
        <View style={styles.documentHeading}>
          <View style={styles.documentHeadingLeft}>
            <View style={styles.documentIcon}>
              <Ionicons
                name={isLicense ? 'card-outline' : 'id-card-outline'}
                size={21}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.documentHeadingText}>
              <Text style={styles.documentTitle}>{title}</Text>
              <Text style={styles.documentSubtitle}>{subtitle}</Text>
            </View>
          </View>

          {uri ? (
            <View style={styles.attachedBadge}>
              <Ionicons
                name="checkmark-circle"
                size={14}
                color={COLORS.success}
              />
              <Text style={styles.attachedText}>Added</Text>
            </View>
          ) : (
            <Text style={styles.requiredText}>Required</Text>
          )}
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.uploadCard}
          onPress={() => pickImage(type)}
          disabled={loading}
        >
          {uri ? (
            <>
              <Image
                source={{ uri }}
                style={styles.previewImage}
                resizeMode="cover"
              />

              <View style={styles.previewOverlay}>
                <View style={styles.changeImageButton}>
                  <Ionicons
                    name="camera-outline"
                    size={16}
                    color={COLORS.text}
                  />
                  <Text style={styles.changeImageText}>Change image</Text>
                </View>
              </View>

              {isNew && (
                <View style={styles.newImageBadge}>
                  <Text style={styles.newImageText}>NEW IMAGE</Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.uploadPlaceholder}>
              <View style={styles.uploadIconCircle}>
                <Ionicons
                  name="cloud-upload-outline"
                  size={27}
                  color={COLORS.primary}
                />
              </View>

              <Text style={styles.uploadMainText}>Upload {isLicense ? 'driving licence' : 'identification'}</Text>
              <Text style={styles.uploadHint}>Select a clear photo from your gallery</Text>

              <View style={styles.chooseImageButton}>
                <Ionicons
                  name="image-outline"
                  size={16}
                  color={COLORS.primary}
                />
                <Text style={styles.chooseImageText}>Choose image</Text>
              </View>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.documentTip}>
          <Ionicons
            name="information-circle-outline"
            size={15}
            color={COLORS.textSecondary}
          />
          <Text style={styles.documentTipText}>
            Make sure all details are visible and the image is not blurry.
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.background}
      />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          disabled={loading}
        >
          <Ionicons name="arrow-back" size={21} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerEyebrow}>ACCOUNT VERIFICATION</Text>
          <Text style={styles.headerTitle}>My Documents</Text>
        </View>

        <View style={styles.headerRight}>
          <Ionicons
            name="shield-checkmark-outline"
            size={22}
            color={COLORS.primary}
          />
        </View>
      </View>

      {fetching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading your documents...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.hero}>
            <View style={styles.heroTop}>
              <View style={styles.heroIcon}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={27}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.secureLabel}>
                <View style={styles.secureDot} />
                <Text style={styles.secureLabelText}>VERIFICATION</Text>
              </View>
            </View>

            <Text style={styles.heroTitle}>
              Your journey starts{'\n'}
              <Text style={styles.heroTitleGold}>with trust.</Text>
            </Text>

            <Text style={styles.heroDescription}>
              Verify your identity by providing your driving licence and
              National ID or passport. This helps us keep every booking secure.
            </Text>

            <View style={styles.heroDivider} />

            <View style={styles.requirementRow}>
              <View style={styles.requirementItem}>
                <Ionicons
                  name="document-text-outline"
                  size={17}
                  color={COLORS.primary}
                />
                <Text style={styles.requirementText}>2 documents</Text>
              </View>

              <View style={styles.requirementItem}>
                <Ionicons
                  name="image-outline"
                  size={17}
                  color={COLORS.primary}
                />
                <Text style={styles.requirementText}>Clear images</Text>
              </View>
            </View>
          </View>

          {status && (
            <View
              style={[
                styles.statusBanner,
                { backgroundColor: status.background },
              ]}
            >
              <Ionicons
                name={status.icon}
                size={23}
                color={status.color}
              />

              <View style={styles.statusContent}>
                <Text style={[styles.statusTitle, { color: status.color }]}>
                  {status.title}
                </Text>
                <Text style={styles.statusMessage}>{status.message}</Text>
              </View>
            </View>
          )}

          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>REQUIRED DOCUMENTS</Text>
              <Text style={styles.sectionTitle}>Upload your details</Text>
            </View>

            <Text style={styles.requiredLabel}>2 REQUIRED</Text>
          </View>

          {renderDocumentCard(
            'license',
            "Driver's Licence",
            'Valid driving licence',
            licenseUri,
            Boolean(licenseBase64)
          )}

          {renderDocumentCard(
            'id',
            'National ID / Passport',
            'Government-issued identification',
            idUri,
            Boolean(idBase64)
          )}

          <View style={styles.privacyCard}>
            <Ionicons
              name="lock-closed-outline"
              size={21}
              color={COLORS.primary}
            />

            <View style={styles.privacyContent}>
              <Text style={styles.privacyTitle}>Your information matters</Text>
              <Text style={styles.privacyText}>
                Only submit genuine documents belonging to you. Your
                verification information should be handled securely and
                accessed only by authorised personnel.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.submitButton,
              !canSubmit && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!canSubmit}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.background} />
            ) : (
              <>
                <Text style={styles.submitButtonText}>
                  {existingStatus === 'verified'
                    ? 'Submit Updated Documents'
                    : 'Submit for Verification'}
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={19}
                  color={COLORS.background}
                />
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.submitFootnote}>
            {hasNewDocuments
              ? 'Your updated documents will be submitted for review.'
              : 'Add or replace a document image to enable submission.'}
          </Text>

          <View style={styles.footer}>
            <Text style={styles.footerBrand}>PREMIUM DRIVE</Text>
            <Text style={styles.footerCaption}>DRIVE WITH CONFIDENCE</Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    height: 76,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
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
  headerEyebrow: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.7,
    marginBottom: 3,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 19,
    fontWeight: '700',
  },
  headerRight: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 45,
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

  hero: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    padding: 21,
    marginBottom: 22,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 23,
  },
  heroIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(214,173,98,0.10)',
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
  },
  secureLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: 'rgba(98,201,154,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(98,201,154,0.18)',
  },
  secureDot: {
    width: 6,
    height: 6,
    backgroundColor: COLORS.success,
    marginRight: 7,
  },
  secureLabelText: {
    color: COLORS.success,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  heroTitle: {
    color: COLORS.text,
    fontSize: 29,
    lineHeight: 36,
    fontWeight: '800',
    letterSpacing: -0.7,
  },
  heroTitleGold: {
    color: COLORS.primary,
  },
  heroDescription: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 21,
    marginTop: 12,
  },
  heroDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 18,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 22,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requirementText: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: '600',
  },

  statusBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 5,
  },
  statusMessage: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 19,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 19,
  },
  sectionEyebrow: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.6,
    marginBottom: 6,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '800',
  },
  requiredLabel: {
    color: COLORS.textSecondary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    paddingBottom: 3,
  },

  documentSection: {
    marginBottom: 25,
  },
  documentHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  documentHeadingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  documentIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    marginRight: 11,
  },
  documentHeadingText: {
    flex: 1,
  },
  documentTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },
  documentSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 4,
  },
  attachedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  attachedText: {
    color: COLORS.success,
    fontSize: 10,
    fontWeight: '700',
  },
  requiredText: {
    color: COLORS.warning,
    fontSize: 10,
    fontWeight: '700',
  },

  uploadCard: {
    height: 190,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.10)',
  },
  changeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: 'rgba(8,9,11,0.88)',
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
  },
  changeImageText: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: '700',
  },
  newImageBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  newImageText: {
    color: COLORS.background,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.7,
  },

  uploadPlaceholder: {
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  uploadIconCircle: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(214,173,98,0.09)',
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    marginBottom: 12,
  },
  uploadMainText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
  },
  uploadHint: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 6,
  },
  chooseImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    marginTop: 13,
  },
  chooseImageText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  documentTip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 9,
  },
  documentTipText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 10,
    lineHeight: 15,
  },

  privacyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 13,
    padding: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 2,
    marginBottom: 23,
  },
  privacyContent: {
    flex: 1,
  },
  privacyTitle: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 6,
  },
  privacyText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 18,
  },

  submitButton: {
    minHeight: 56,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 18,
  },
  submitButtonDisabled: {
    opacity: 0.42,
  },
  submitButtonText: {
    color: COLORS.background,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  submitFootnote: {
    color: COLORS.textSecondary,
    fontSize: 10,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 12,
  },

  footer: {
    alignItems: 'center',
    marginTop: 38,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerBrand: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 3,
  },
  footerCaption: {
    color: COLORS.textSecondary,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 7,
  },
});

import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  ScrollView, Image, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SIZES } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [seats, setSeats] = useState('5');
  const [transmission, setTransmission] = useState('Automatic');
  const [themeColor, setThemeColor] = useState('#4A7C9E');
  const [category, setCategory] = useState('Luxury'); // <-- New Category State

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "You need to grant gallery permissions.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
      base64: true, 
    });

    if (!result.canceled && result.assets[0].base64) {
      setPreviewUri(result.assets[0].uri); 
      setImageBase64(result.assets[0].base64); 
    }
  };

  const uploadImageToCloudinary = async (base64String: string) => {
    const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    
    if (!cloudName || !uploadPreset) throw new Error("Cloudinary environment variables missing in .env");

    const dataUri = `data:image/jpeg;base64,${base64String}`;
    const formData = new FormData();
    formData.append('file', dataUri); 
    formData.append('upload_preset', uploadPreset);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' },
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    
    return data.secure_url;
  };

  const handleAddCar = async () => {
    if (!name || !brand || !price || !imageBase64 || !category) {
      Alert.alert('Error', 'Please fill all fields and select an image.');
      return;
    }

    setLoading(true);

    try {
      const uploadedImageUrl = await uploadImageToCloudinary(imageBase64);

      const { error } = await supabase.from('cars').insert([
        {
          name,
          brand,
          price_per_day: Number(price),
          image_url: uploadedImageUrl,
          seats: Number(seats),
          transmission,
          theme_color: themeColor,
          category: category, // <-- Insert Category
        }
      ]);

      if (error) throw error;

      Alert.alert('Success', 'Car added to inventory successfully!');
      router.back();

    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView style={styles.flexOne} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add New Car</Text>
            <View style={styles.headerSpacer} />
          </View>

          <TouchableOpacity style={styles.imagePicker} onPress={pickImage} activeOpacity={0.8}>
            {previewUri ? (
              <Image source={{ uri: previewUri }} style={styles.imagePreview} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="camera-outline" size={40} color={COLORS.textSecondary} />
                <Text style={styles.imagePlaceholderText}>Tap to upload car image</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Car Name</Text>
            <TextInput style={styles.input} placeholder="e.g. Mercedes-Benz S Class" placeholderTextColor={COLORS.textSecondary} value={name} onChangeText={setName} />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Brand</Text>
            <TextInput style={styles.input} placeholder="e.g. Mercedes" placeholderTextColor={COLORS.textSecondary} value={brand} onChangeText={setBrand} />
          </View>

          {/* NEW CATEGORY INPUT */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Category</Text>
            <TextInput style={styles.input} placeholder="e.g. SUV, Sedan, Luxury" placeholderTextColor={COLORS.textSecondary} value={category} onChangeText={setCategory} />
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, styles.rowItem]}>
              <Text style={styles.label}>Price / Day (KES)</Text>
              <TextInput style={styles.input} placeholder="15000" placeholderTextColor={COLORS.textSecondary} keyboardType="numeric" value={price} onChangeText={setPrice} />
            </View>
            <View style={[styles.formGroup, styles.rowItem]}>
              <Text style={styles.label}>Seats</Text>
              <TextInput style={styles.input} placeholder="5" placeholderTextColor={COLORS.textSecondary} keyboardType="numeric" value={seats} onChangeText={setSeats} />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Transmission</Text>
            <TextInput style={styles.input} placeholder="Automatic" placeholderTextColor={COLORS.textSecondary} value={transmission} onChangeText={setTransmission} />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Theme Color (Hex)</Text>
            <TextInput style={styles.input} placeholder="#4A7C9E" placeholderTextColor={COLORS.textSecondary} value={themeColor} onChangeText={setThemeColor} />
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleAddCar} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={COLORS.text} />
            ) : (
              <Text style={styles.submitBtnText}>Publish Car</Text>
            )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  flexOne: { flex: 1 },
  scrollContent: { padding: SIZES.padding },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  headerTitle: { color: COLORS.text, fontSize: 20, fontWeight: '700' },
  headerSpacer: { width: 24 },
  
  imagePicker: { width: '100%', height: 200, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden', marginBottom: 24 },
  imagePreview: { width: '100%', height: '100%' },
  imagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  imagePlaceholderText: { color: COLORS.textSecondary, fontSize: 14 },

  formGroup: { marginBottom: 20 },
  label: { color: COLORS.text, fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 4, padding: 16, color: COLORS.text, fontSize: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  row: { flexDirection: 'row', gap: 10 },
  rowItem: { flex: 1 },

  submitBtn: { backgroundColor: COLORS.primary, padding: 18, borderRadius: 4, alignItems: 'center', marginTop: 20 },
  submitBtnText: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
});
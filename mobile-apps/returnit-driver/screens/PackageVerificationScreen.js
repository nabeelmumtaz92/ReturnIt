import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import apiClient from '../services/api-client';

export default function PackageVerificationScreen({ route, navigation }) {
  const { orderId, orderDetails } = route.params || {};
  
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraActive, setCameraActive] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [customerSignature, setCustomerSignature] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef(null);

  const maxPhotos = 5;

  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission]);

  const takePhoto = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: false, // Disable base64 for better performance
        skipProcessing: false,
      });
      
      console.log('Photo captured:', photo.uri);
      
      const newPhoto = {
        uri: photo.uri,
        width: photo.width,
        height: photo.height,
        timestamp: new Date().toISOString()
      };
      
      setPhotos(prev => {
        const updated = [...prev, newPhoto];
        console.log('Photos state updated, total:', updated.length);
        return updated;
      });
      
      setCameraActive(false);
      
      Alert.alert(
        'Photo Captured',
        `Photo ${photos.length + 1} of ${maxPhotos} added successfully.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
    }
  };

  const removePhoto = (index) => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setPhotos(prev => prev.filter((_, i) => i !== index));
          }
        }
      ]
    );
  };

  const openCamera = () => {
    if (photos.length >= maxPhotos) {
      Alert.alert(
        'Photo Limit Reached',
        `You can upload up to ${maxPhotos} photos per delivery.`,
        [{ text: 'OK' }]
      );
      return;
    }

    if (!permission?.granted) {
      Alert.alert(
        'Camera Permission Required',
        'Please grant camera permission to take photos.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Grant Permission', onPress: () => requestPermission() }
        ]
      );
      return;
    }

    setCameraActive(true);
  };

  const completeDelivery = async () => {
    if (photos.length === 0) {
      Alert.alert(
        'Photos Required',
        'Please take at least one photo of the package before proceeding.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Check if signature is required based on pickup method
    const signatureRequired = orderDetails?.signatureRequired !== false;
    
    if (signatureRequired && !customerSignature.trim()) {
      Alert.alert(
        'Signature Required',
        'This order requires a customer signature. Please collect it before proceeding.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Navigate to completion checklist screen
    navigation.navigate('CompleteDelivery', {
      orderId,
      orderDetails,
      verificationPhotos: photos,
      customerSignature: customerSignature.trim(),
      deliveryNotes: notes.trim()
    });
  };

  if (cameraActive) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
        >
          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setCameraActive(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePhoto}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
            
            <View style={styles.placeholderButton} />
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Package Verification</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {orderDetails && (
          <View style={styles.orderInfo}>
            <Text style={styles.orderInfoTitle}>Order Details</Text>
            <Text style={styles.orderInfoText}>Order ID: {orderId}</Text>
            <Text style={styles.orderInfoText}>
              Customer: {orderDetails.customer || 'N/A'}
            </Text>
            <Text style={styles.orderInfoText}>
              Address: {orderDetails.pickupAddress || 'N/A'}
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Package Photos ({photos.length}/{maxPhotos})</Text>
          <Text style={styles.sectionDescription}>
            Take photos of the package before delivery
          </Text>

          <View style={styles.photosGrid}>
            {photos.map((photo, index) => (
              <View key={`photo-${index}-${photo.timestamp}`} style={styles.photoContainer}>
                <Image 
                  source={{ uri: photo.uri }} 
                  style={styles.photo}
                  resizeMode="cover"
                  onError={(error) => {
                    console.error('Image load error:', error);
                  }}
                  onLoad={() => {
                    console.log('Image loaded successfully:', photo.uri);
                  }}
                />
                <TouchableOpacity
                  style={styles.removePhotoButton}
                  onPress={() => removePhoto(index)}
                >
                  <Text style={styles.removePhotoText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
            
            {photos.length < maxPhotos && (
              <TouchableOpacity
                style={styles.addPhotoButton}
                onPress={openCamera}
              >
                <Text style={styles.addPhotoIcon}>+</Text>
                <Text style={styles.addPhotoText}>Add Photo</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Customer Signature {orderDetails?.signatureRequired !== false ? '*' : '(Optional)'}
          </Text>
          <Text style={styles.sectionDescription}>
            {orderDetails?.signatureRequired !== false 
              ? 'Ask customer to type their full name' 
              : 'Door drop-off - signature not required'}
          </Text>
          <TextInput
            style={styles.input}
            placeholder={orderDetails?.signatureRequired !== false 
              ? "Customer Full Name" 
              : "Customer Full Name (Optional)"}
            value={customerSignature}
            onChangeText={setCustomerSignature}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Notes (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add any notes about the delivery..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[styles.completeButton, loading && styles.completeButtonDisabled]}
          onPress={completeDelivery}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.completeButtonText}>Continue to Completion Checklist</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F8F0',
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: 20,
    paddingBottom: 40,
  },
  cancelButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 15,
    borderRadius: 10,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 5,
    borderColor: '#2E8B57',
  },
  captureButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2E8B57',
  },
  placeholderButton: {
    width: 70,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#2E8B57',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSpacer: {
    width: 60,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  orderInfo: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  orderInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  orderInfoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoContainer: {
    width: 100,
    height: 100,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ff4444',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removePhotoText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#2E8B57',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  addPhotoIcon: {
    fontSize: 32,
    color: '#2E8B57',
    marginBottom: 4,
  },
  addPhotoText: {
    fontSize: 12,
    color: '#2E8B57',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  completeButton: {
    backgroundColor: '#2E8B57',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  completeButtonDisabled: {
    backgroundColor: '#ccc',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

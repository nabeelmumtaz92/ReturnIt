import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { StatusBar } from 'expo-status-bar';
import apiClient from '../services/api-client';

export default function PhotoVerificationScreen({ route, navigation }) {
  const { orderDetails } = route.params || {};
  
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraActive, setCameraActive] = useState(false);
  const [currentPhotoType, setCurrentPhotoType] = useState(null);
  
  const [receiptPhoto, setReceiptPhoto] = useState(null);
  const [tagsPhoto, setTagsPhoto] = useState(null);
  const [packagingPhoto, setPackagingPhoto] = useState(null);
  
  const [uploading, setUploading] = useState(false);
  const cameraRef = React.useRef(null);

  const photoTypes = [
    { 
      key: 'receipt', 
      label: '🧾 Receipt', 
      description: 'Photo of your purchase receipt',
      state: receiptPhoto,
      setState: setReceiptPhoto
    },
    { 
      key: 'tags', 
      label: '🏷️ Original Tags', 
      description: 'Photo showing original tags attached',
      state: tagsPhoto,
      setState: setTagsPhoto
    },
    { 
      key: 'packaging', 
      label: '📦 Original Packaging', 
      description: 'Photo of original packaging',
      state: packagingPhoto,
      setState: setPackagingPhoto
    },
  ];

  const hasAtLeastOnePhoto = receiptPhoto || tagsPhoto || packagingPhoto;

  const openCamera = async (photoType) => {
    if (!permission) {
      const { status } = await requestPermission();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is required to take photos.');
        return;
      }
    }

    if (!permission.granted) {
      const { status } = await requestPermission();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is required to take photos.');
        return;
      }
    }

    setCurrentPhotoType(photoType);
    setCameraActive(true);
  };

  const openGallery = async (photoType) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Gallery permission is required to select photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const photo = result.assets[0];
      const photoData = {
        uri: photo.uri,
        timestamp: Date.now(),
      };

      const photoTypesMap = {
        receipt: setReceiptPhoto,
        tags: setTagsPhoto,
        packaging: setPackagingPhoto,
      };

      photoTypesMap[photoType]?.(photoData);
    }
  };

  const takePhoto = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: true,
      });

      console.log('Photo captured:', photo.uri);

      const photoData = {
        uri: photo.uri,
        timestamp: Date.now(),
      };

      const photoTypesMap = {
        receipt: setReceiptPhoto,
        tags: setTagsPhoto,
        packaging: setPackagingPhoto,
      };

      photoTypesMap[currentPhotoType]?.(photoData);
      setCameraActive(false);
      setCurrentPhotoType(null);
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const deletePhoto = (photoType) => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const photoTypesMap = {
              receipt: setReceiptPhoto,
              tags: setTagsPhoto,
              packaging: setPackagingPhoto,
            };
            photoTypesMap[photoType]?.(null);
          },
        },
      ]
    );
  };

  const handleContinue = async () => {
    if (!hasAtLeastOnePhoto) {
      Alert.alert(
        'Photo Required',
        'Please upload at least ONE photo (receipt, tags, OR packaging) to verify your return.'
      );
      return;
    }

    setUploading(true);

    try {
      const uploadedPhotos = {
        receiptPhotoUrl: null,
        tagsPhotoUrl: null,
        packagingPhotoUrl: null,
      };

      // Upload receipt photo if provided
      if (receiptPhoto) {
        const base64 = await FileSystem.readAsStringAsync(receiptPhoto.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        const uploadResponse = await apiClient.request('/api/objects/upload', {
          method: 'POST',
        });

        await fetch(uploadResponse.uploadURL, {
          method: 'PUT',
          body: await fetch(`data:image/jpeg;base64,${base64}`).then(r => r.blob()),
        });

        const finalizeResponse = await apiClient.request('/api/orders/temp/receipt', {
          method: 'PUT',
          body: { receiptUrl: uploadResponse.uploadURL },
        });

        uploadedPhotos.receiptPhotoUrl = finalizeResponse.objectPath;
      }

      // Upload tags photo if provided
      if (tagsPhoto) {
        const base64 = await FileSystem.readAsStringAsync(tagsPhoto.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        const uploadResponse = await apiClient.request('/api/objects/upload', {
          method: 'POST',
        });

        await fetch(uploadResponse.uploadURL, {
          method: 'PUT',
          body: await fetch(`data:image/jpeg;base64,${base64}`).then(r => r.blob()),
        });

        const finalizeResponse = await apiClient.request('/api/orders/temp/receipt', {
          method: 'PUT',
          body: { receiptUrl: uploadResponse.uploadURL },
        });

        uploadedPhotos.tagsPhotoUrl = finalizeResponse.objectPath;
      }

      // Upload packaging photo if provided
      if (packagingPhoto) {
        const base64 = await FileSystem.readAsStringAsync(packagingPhoto.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        const uploadResponse = await apiClient.request('/api/objects/upload', {
          method: 'POST',
        });

        await fetch(uploadResponse.uploadURL, {
          method: 'PUT',
          body: await fetch(`data:image/jpeg;base64,${base64}`).then(r => r.blob()),
        });

        const finalizeResponse = await apiClient.request('/api/orders/temp/receipt', {
          method: 'PUT',
          body: { receiptUrl: uploadResponse.uploadURL },
        });

        uploadedPhotos.packagingPhotoUrl = finalizeResponse.objectPath;
      }

      // Navigate to payment with uploaded photos
      navigation.navigate('PaymentCheckout', {
        orderDetails: {
          ...orderDetails,
          ...uploadedPhotos,
        },
      });
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert(
        'Upload Failed',
        'Failed to upload photos. Please check your connection and try again.'
      );
    } finally {
      setUploading(false);
    }
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
          <View style={styles.cameraOverlay}>
            <View style={styles.cameraHeader}>
              <TouchableOpacity
                onPress={() => {
                  setCameraActive(false);
                  setCurrentPhotoType(null);
                }}
                style={styles.cameraBackButton}
              >
                <Text style={styles.cameraBackButtonText}>✕ Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.cameraTitle}>
                {photoTypes.find(t => t.key === currentPhotoType)?.label}
              </Text>
              <View style={{ width: 80 }} />
            </View>

            <View style={styles.cameraControls}>
              <TouchableOpacity
                onPress={takePhoto}
                style={styles.captureButton}
              >
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Photo Verification</Text>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>📸 Proof of Purchase Required</Text>
          <Text style={styles.instructionsText}>
            Please upload at least ONE photo to verify your return:
          </Text>
          <Text style={styles.instructionsBullet}>• Receipt from your purchase</Text>
          <Text style={styles.instructionsBullet}>• Original tags still attached</Text>
          <Text style={styles.instructionsBullet}>• Original packaging</Text>
          <Text style={styles.instructionsFooter}>
            This helps us process your return quickly and securely.
          </Text>
        </View>

        {/* Photo Upload Cards */}
        {photoTypes.map((photoType) => (
          <View key={photoType.key} style={styles.photoCard}>
            <View style={styles.photoCardHeader}>
              <Text style={styles.photoCardLabel}>{photoType.label}</Text>
              <Text style={styles.photoCardDescription}>{photoType.description}</Text>
            </View>

            {photoType.state ? (
              <View style={styles.photoPreviewContainer}>
                <Image
                  source={{ uri: photoType.state.uri }}
                  style={styles.photoPreview}
                  resizeMode="cover"
                  onError={(error) => {
                    console.error('Image load error:', error);
                  }}
                />
                <View style={styles.photoActions}>
                  <TouchableOpacity
                    onPress={() => openCamera(photoType.key)}
                    style={styles.retakeButton}
                  >
                    <Text style={styles.retakeButtonText}>📷 Retake</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => deletePhoto(photoType.key)}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.uploadButtons}>
                <TouchableOpacity
                  onPress={() => openCamera(photoType.key)}
                  style={styles.cameraButton}
                >
                  <Text style={styles.cameraButtonText}>📷 Take Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => openGallery(photoType.key)}
                  style={styles.galleryButton}
                >
                  <Text style={styles.galleryButtonText}>🖼️ Choose from Gallery</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}

        {/* Continue Button */}
        <TouchableOpacity
          onPress={handleContinue}
          style={[
            styles.continueButton,
            !hasAtLeastOnePhoto && styles.continueButtonDisabled,
          ]}
          disabled={uploading || !hasAtLeastOnePhoto}
        >
          {uploading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.continueButtonText}>
              Continue to Payment →
            </Text>
          )}
        </TouchableOpacity>

        {!hasAtLeastOnePhoto && (
          <Text style={styles.validationText}>
            ⚠️ At least one photo is required to continue
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F4',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#B8956A',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C2013',
  },
  instructionsCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#E8E2D5',
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C2013',
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 15,
    color: '#5C4A2F',
    marginBottom: 8,
    lineHeight: 22,
  },
  instructionsBullet: {
    fontSize: 14,
    color: '#5C4A2F',
    marginLeft: 8,
    marginBottom: 4,
  },
  instructionsFooter: {
    fontSize: 13,
    color: '#8B7355',
    marginTop: 12,
    fontStyle: 'italic',
  },
  photoCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E8E2D5',
  },
  photoCardHeader: {
    marginBottom: 12,
  },
  photoCardLabel: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#2C2013',
    marginBottom: 4,
  },
  photoCardDescription: {
    fontSize: 14,
    color: '#8B7355',
  },
  uploadButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  cameraButton: {
    flex: 1,
    backgroundColor: '#B8956A',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  cameraButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  galleryButton: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#B8956A',
  },
  galleryButtonText: {
    color: '#B8956A',
    fontSize: 15,
    fontWeight: '600',
  },
  photoPreviewContainer: {
    marginTop: 8,
  },
  photoPreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#E8E2D5',
  },
  photoActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  retakeButton: {
    flex: 1,
    backgroundColor: '#B8956A',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  retakeButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#DC2626',
  },
  deleteButtonText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: '#B8956A',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 24,
  },
  continueButtonDisabled: {
    backgroundColor: '#D4C5B0',
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  validationText: {
    textAlign: 'center',
    color: '#DC2626',
    fontSize: 14,
    marginTop: 12,
    fontWeight: '600',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  cameraBackButton: {
    padding: 10,
  },
  cameraBackButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cameraTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cameraControls: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 6,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF',
  },
});

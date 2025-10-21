import { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import Button from '../components/Button';
import { COLORS, SPACING, FONTS } from '../constants/theme';

export default function CameraScreen({ onPhotoTaken, onCancel }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const cameraRef = useRef(null);

  useState(async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
        });
        onPhotoTaken(photo.uri);
      } catch (error) {
        Alert.alert('Error', 'Failed to take photo');
      }
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.messageText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.messageText}>No access to camera</Text>
        <Button title="Go Back" onPress={onCancel} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} type={type} ref={cameraRef}>
        <View style={styles.overlay}>
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelText}>✕ Cancel</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.centerGuide}>
            <View style={styles.guideBorder} />
            <Text style={styles.guideText}>Center package in frame</Text>
          </View>

          <View style={styles.bottomBar}>
            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
          </View>
        </View>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.text,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageText: {
    color: COLORS.surface,
    fontSize: FONTS.size.md,
    marginBottom: SPACING.lg,
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  topBar: {
    padding: SPACING.md,
    alignItems: 'flex-start',
  },
  cancelButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 8,
    padding: SPACING.sm,
  },
  cancelText: {
    color: COLORS.surface,
    fontSize: FONTS.size.md,
    fontWeight: 'bold',
  },
  centerGuide: {
    alignItems: 'center',
  },
  guideBorder: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: COLORS.primary,
    borderRadius: 12,
    borderStyle: 'dashed',
  },
  guideText: {
    color: COLORS.surface,
    fontSize: FONTS.size.sm,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: SPACING.sm,
    borderRadius: 6,
    marginTop: SPACING.sm,
  },
  bottomBar: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
  },
});

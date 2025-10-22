import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Input from '../components/Input';
import Button from '../components/Button';
import ApiService from '../services/api';
import { COLORS, SPACING, FONTS } from '../constants/theme';

export default function ProfileScreen({ navigation, user }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    vehicleMake: user?.vehicleMake || '',
    vehicleModel: user?.vehicleModel || '',
    vehicleYear: user?.vehicleYear?.toString() || '',
    vehicleColor: user?.vehicleColor || '',
    vehicleType: user?.vehicleType || 'Sedan',
    licensePlate: user?.licensePlate || ''
  });

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await ApiService.updateProfile(profileData);
      Alert.alert('Success', 'Your profile has been updated successfully.');
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const vehiclePreview = () => {
    const { vehicleColor, vehicleYear, vehicleMake, vehicleModel } = profileData;
    if (!vehicleColor || !vehicleYear || !vehicleMake || !vehicleModel) {
      return 'Complete vehicle info to see preview';
    }
    return `${vehicleColor} ${vehicleYear} ${vehicleMake} ${vehicleModel}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Driver Profile</Text>
            <TouchableOpacity 
              onPress={() => setIsEditing(!isEditing)}
              style={styles.editButton}
            >
              <Text style={styles.editButtonText}>
                {isEditing ? 'Cancel' : 'Edit'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Picture Section */}
        <View style={styles.profileSection}>
          <View style={styles.profilePicture}>
            <Text style={styles.profileInitials}>
              {profileData.firstName?.[0] || 'D'}{profileData.lastName?.[0] || 'R'}
            </Text>
          </View>
          <Text style={styles.profileName}>
            {profileData.firstName} {profileData.lastName}
          </Text>
          <Text style={styles.profileEmail}>{profileData.email}</Text>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <Input
            label="First Name"
            value={profileData.firstName}
            onChangeText={(value) => handleInputChange('firstName', value)}
            editable={isEditing}
          />
          
          <Input
            label="Last Name"
            value={profileData.lastName}
            onChangeText={(value) => handleInputChange('lastName', value)}
            editable={isEditing}
          />

          <Input
            label="Email"
            value={profileData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            editable={isEditing}
            keyboardType="email-address"
          />

          <Input
            label="Phone"
            value={profileData.phone}
            onChangeText={(value) => handleInputChange('phone', value)}
            editable={isEditing}
            keyboardType="phone-pad"
          />
        </View>

        {/* Vehicle Information */}
        <View style={styles.section}>
          <View style={styles.vehicleHeader}>
            <Text style={styles.sectionTitle}>🚗 Vehicle Information</Text>
            <Text style={styles.requiredBadge}>Required</Text>
          </View>
          <Text style={styles.vehicleSubtext}>
            Vehicle details help customers identify you during pickup
          </Text>

          <Input
            label="Make"
            value={profileData.vehicleMake}
            onChangeText={(value) => handleInputChange('vehicleMake', value)}
            editable={isEditing}
            placeholder="e.g., Toyota, Honda, Ford"
          />

          <Input
            label="Model"
            value={profileData.vehicleModel}
            onChangeText={(value) => handleInputChange('vehicleModel', value)}
            editable={isEditing}
            placeholder="e.g., Camry, Accord, F-150"
          />

          <Input
            label="Year"
            value={profileData.vehicleYear}
            onChangeText={(value) => handleInputChange('vehicleYear', value)}
            editable={isEditing}
            keyboardType="numeric"
            placeholder="e.g., 2020"
          />

          <Input
            label="Color"
            value={profileData.vehicleColor}
            onChangeText={(value) => handleInputChange('vehicleColor', value)}
            editable={isEditing}
            placeholder="e.g., White, Black, Silver"
          />

          <Input
            label="Type"
            value={profileData.vehicleType}
            onChangeText={(value) => handleInputChange('vehicleType', value)}
            editable={isEditing}
            placeholder="e.g., Sedan, SUV, Truck"
          />

          <Input
            label="License Plate"
            value={profileData.licensePlate}
            onChangeText={(value) => handleInputChange('licensePlate', value.toUpperCase())}
            editable={isEditing}
            placeholder="e.g., ABC123"
            autoCapitalize="characters"
          />

          {/* Vehicle Preview */}
          <View style={styles.vehiclePreview}>
            <Text style={styles.previewLabel}>Preview:</Text>
            <Text style={styles.previewText}>{vehiclePreview()}</Text>
          </View>
        </View>

        {/* Save Button */}
        {isEditing && (
          <Button
            title="Save Changes"
            onPress={handleSaveProfile}
            loading={loading}
            style={styles.saveButton}
          />
        )}

        {/* Help Section */}
        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>Need Help?</Text>
          <Text style={styles.helpText}>
            Contact Support: (636) 254-4821{'\n'}
            Email: support@returnit.online
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingTop: 50,
    paddingHorizontal: SPACING.md,
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
    color: COLORS.primary,
    fontWeight: '600',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  profileInitials: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  requiredBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#DC2626',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  vehicleSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  vehiclePreview: {
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  previewText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  saveButton: {
    marginBottom: 20,
  },
  helpSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});

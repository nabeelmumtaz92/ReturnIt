import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function DriverProfileScreen({ navigation }) {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Driver',
    email: 'john.driver@email.com',
    phone: '(555) 987-6543',
    licenseNumber: 'DL123456789',
    vehicleInfo: '2020 Honda Civic - ABC123',
    bankAccount: '****1234',
    rating: 4.8,
    totalDeliveries: 1247,
    joinDate: 'Jan 2023'
  });

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = () => {
    Alert.alert('Profile Updated', 'Your driver profile has been successfully updated.');
    setIsEditing(false);
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

        {/* Driver Stats */}
        <View style={styles.statsSection}>
          <View style={styles.profilePicture}>
            <Text style={styles.profileInitials}>
              {profileData.firstName[0]}{profileData.lastName[0]}
            </Text>
          </View>
          
          <Text style={styles.profileName}>
            {profileData.firstName} {profileData.lastName}
          </Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>⭐ {profileData.rating}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profileData.totalDeliveries}</Text>
              <Text style={styles.statLabel}>Deliveries</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profileData.joinDate}</Text>
              <Text style={styles.statLabel}>Joined</Text>
            </View>
          </View>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>First Name</Text>
              <TextInput
                style={[styles.textInput, !isEditing && styles.textInputDisabled]}
                value={profileData.firstName}
                onChangeText={(value) => handleInputChange('firstName', value)}
                editable={isEditing}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Last Name</Text>
              <TextInput
                style={[styles.textInput, !isEditing && styles.textInputDisabled]}
                value={profileData.lastName}
                onChangeText={(value) => handleInputChange('lastName', value)}
                editable={isEditing}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={[styles.textInput, styles.textInputDisabled]}
              value={profileData.email}
              editable={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Phone</Text>
            <TextInput
              style={[styles.textInput, !isEditing && styles.textInputDisabled]}
              value={profileData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              editable={isEditing}
            />
          </View>
        </View>

        {/* Driver Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Driver Information</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>License Number</Text>
            <TextInput
              style={[styles.textInput, !isEditing && styles.textInputDisabled]}
              value={profileData.licenseNumber}
              onChangeText={(value) => handleInputChange('licenseNumber', value)}
              editable={isEditing}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Vehicle Information</Text>
            <TextInput
              style={[styles.textInput, !isEditing && styles.textInputDisabled]}
              value={profileData.vehicleInfo}
              onChangeText={(value) => handleInputChange('vehicleInfo', value)}
              editable={isEditing}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Bank Account</Text>
            <TextInput
              style={[styles.textInput, styles.textInputDisabled]}
              value={profileData.bankAccount}
              editable={false}
            />
          </View>
        </View>

        {/* Driver Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Driver Tools</Text>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>📄 Update Documents</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>🚗 Vehicle Inspection</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>💳 Payment Settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>📊 Performance Report</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>🎓 Driver Training</Text>
          </TouchableOpacity>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>🔒 Change Password</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>📱 App Settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>📄 Terms & Conditions</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>🚪 Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        {isEditing && (
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F7F4',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#92400E',
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
    color: '#92400E',
  },
  editButton: {
    backgroundColor: '#FB923C',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  statsSection: {
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: 'white',
    paddingVertical: 30,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FB923C',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  profileInitials: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#78716C',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputContainer: {
    flex: 1,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 16,
    color: '#374151',
  },
  textInputDisabled: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
  },
  actionButton: {
    backgroundColor: '#F8F7F4',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#92400E',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#FB923C',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});
import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function ProfileScreen({ navigation }) {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@email.com',
    phone: '(555) 123-4567',
    address: '123 Main St, City, ST 12345',
    preferences: {
      notifications: true,
      emailUpdates: true,
      smsUpdates: false
    }
  });

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handlePreferenceChange = (preference) => {
    setProfileData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [preference]: !prev.preferences[preference]
      }
    }));
  };

  const handleSaveProfile = () => {
    Alert.alert('Profile Updated', 'Your profile has been successfully updated.');
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
            <Text style={styles.headerTitle}>Profile</Text>
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
              {profileData.firstName[0]}{profileData.lastName[0]}
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
              style={[styles.textInput, !isEditing && styles.textInputDisabled]}
              value={profileData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              editable={isEditing}
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Phone</Text>
            <TextInput
              style={[styles.textInput, !isEditing && styles.textInputDisabled]}
              value={profileData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              editable={isEditing}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Address</Text>
            <TextInput
              style={[styles.textInput, !isEditing && styles.textInputDisabled, { minHeight: 60 }]}
              value={profileData.address}
              onChangeText={(value) => handleInputChange('address', value)}
              editable={isEditing}
              multiline
            />
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <TouchableOpacity 
            style={styles.preferenceRow}
            onPress={() => handlePreferenceChange('notifications')}
          >
            <Text style={styles.preferenceText}>Push Notifications</Text>
            <View style={[
              styles.toggleSwitch,
              profileData.preferences.notifications && styles.toggleSwitchActive
            ]}>
              <View style={[
                styles.toggleThumb,
                profileData.preferences.notifications && styles.toggleThumbActive
              ]} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.preferenceRow}
            onPress={() => handlePreferenceChange('emailUpdates')}
          >
            <Text style={styles.preferenceText}>Email Updates</Text>
            <View style={[
              styles.toggleSwitch,
              profileData.preferences.emailUpdates && styles.toggleSwitchActive
            ]}>
              <View style={[
                styles.toggleThumb,
                profileData.preferences.emailUpdates && styles.toggleThumbActive
              ]} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.preferenceRow}
            onPress={() => handlePreferenceChange('smsUpdates')}
          >
            <Text style={styles.preferenceText}>SMS Updates</Text>
            <View style={[
              styles.toggleSwitch,
              profileData.preferences.smsUpdates && styles.toggleSwitchActive
            ]}>
              <View style={[
                styles.toggleThumb,
                profileData.preferences.smsUpdates && styles.toggleThumbActive
              ]} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>🔒 Change Password</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>💳 Payment Methods</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>📄 Terms & Privacy</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.dangerButton]}>
            <Text style={[styles.actionButtonText, styles.dangerButtonText]}>🗑️ Delete Account</Text>
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
  profileSection: {
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
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
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
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  preferenceText: {
    fontSize: 16,
    color: '#374151',
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#D1D5DB',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleSwitchActive: {
    backgroundColor: '#FB923C',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    alignSelf: 'flex-start',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
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
  dangerButton: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  dangerButtonText: {
    color: '#DC2626',
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
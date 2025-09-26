import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function BookReturnScreen({ navigation, route }) {
  const [formData, setFormData] = useState({
    pickupAddress: '',
    returnAddress: '',
    packageType: route?.params?.type || 'return',
    description: '',
    estimatedWeight: '',
    preferredDate: '',
    contactPhone: '',
    specialInstructions: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitBooking = () => {
    // Basic validation
    if (!formData.pickupAddress || !formData.contactPhone) {
      Alert.alert('Missing Information', 'Please fill in required fields (pickup address and phone number)');
      return;
    }

    // In a real app, this would make an API call
    Alert.alert(
      'Booking Submitted!',
      'Your return pickup has been scheduled. You will receive a confirmation shortly.',
      [
        {
          text: 'Track Order',
          onPress: () => navigation.navigate('TrackPackage')
        },
        {
          text: 'Home',
          onPress: () => navigation.navigate('Home')
        }
      ]
    );
  };

  const packageTypes = [
    { key: 'return', label: '📦 Return to Store' },
    { key: 'exchange', label: '🔄 Exchange Item' },
    { key: 'donation', label: '💝 Donate to Charity' },
    { key: 'warranty', label: '🛠️ Warranty Return' }
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {formData.packageType === 'donation' ? 'Schedule Donation' : 'Book Return'}
          </Text>
        </View>

        {/* Package Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Type</Text>
          <View style={styles.packageTypeContainer}>
            {packageTypes.map((type) => (
              <TouchableOpacity
                key={type.key}
                style={[
                  styles.packageTypeButton,
                  formData.packageType === type.key && styles.packageTypeButtonActive
                ]}
                onPress={() => handleInputChange('packageType', type.key)}
              >
                <Text style={[
                  styles.packageTypeText,
                  formData.packageType === type.key && styles.packageTypeTextActive
                ]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Pickup Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pickup Information</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Pickup Address *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.pickupAddress}
              onChangeText={(value) => handleInputChange('pickupAddress', value)}
              placeholder="Enter your pickup address"
              multiline
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Contact Phone *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.contactPhone}
              onChangeText={(value) => handleInputChange('contactPhone', value)}
              placeholder="(555) 123-4567"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Preferred Date</Text>
            <TextInput
              style={styles.textInput}
              value={formData.preferredDate}
              onChangeText={(value) => handleInputChange('preferredDate', value)}
              placeholder="MM/DD/YYYY or 'ASAP'"
            />
          </View>
        </View>

        {/* Package Details */}
        {formData.packageType !== 'donation' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Return Details</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Return Address</Text>
              <TextInput
                style={styles.textInput}
                value={formData.returnAddress}
                onChangeText={(value) => handleInputChange('returnAddress', value)}
                placeholder="Store address or return center"
                multiline
              />
            </View>
          </View>
        )}

        {/* Package Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Package Information</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Package Description</Text>
            <TextInput
              style={[styles.textInput, { minHeight: 60 }]}
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              placeholder="Describe the items (clothing, electronics, etc.)"
              multiline
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Estimated Weight (lbs)</Text>
            <TextInput
              style={styles.textInput}
              value={formData.estimatedWeight}
              onChangeText={(value) => handleInputChange('estimatedWeight', value)}
              placeholder="5"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Special Instructions</Text>
            <TextInput
              style={[styles.textInput, { minHeight: 60 }]}
              value={formData.specialInstructions}
              onChangeText={(value) => handleInputChange('specialInstructions', value)}
              placeholder="Any special handling instructions..."
              multiline
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmitBooking}>
          <Text style={styles.submitButtonText}>Schedule Pickup</Text>
        </TouchableOpacity>
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
    padding: 20,
    paddingTop: 50,
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
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#92400E',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 16,
  },
  packageTypeContainer: {
    gap: 12,
  },
  packageTypeButton: {
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FED7AA',
  },
  packageTypeButtonActive: {
    backgroundColor: '#FB923C',
    borderColor: '#FB923C',
  },
  packageTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    textAlign: 'center',
  },
  packageTypeTextActive: {
    color: 'white',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FED7AA',
    fontSize: 16,
    color: '#374151',
  },
  submitButton: {
    backgroundColor: '#FB923C',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});
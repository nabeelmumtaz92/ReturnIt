import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import apiClient from '../../shared/api-client';

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

  const [promoCode, setPromoCode] = useState('');
  const [promoValidation, setPromoValidation] = useState(null);
  const [validatingPromo, setValidatingPromo] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validatePromoCode = async () => {
    if (!promoCode.trim()) {
      Alert.alert('Invalid Code', 'Please enter a promo code');
      return;
    }

    try {
      setValidatingPromo(true);
      const response = await apiClient.request('/api/promo/validate', {
        method: 'POST',
        body: { code: promoCode.trim().toUpperCase() }
      });

      if (response.valid) {
        setPromoValidation(response);
        Alert.alert(
          'Promo Code Applied! 🎉',
          `You'll save ${response.type === 'percentage' ? response.discount + '%' : '$' + response.discount.toFixed(2)} on this order!`
        );
      } else {
        setPromoValidation(null);
        Alert.alert('Invalid Code', 'This promo code is not valid or has expired.');
      }
    } catch (error) {
      console.error('Promo validation error:', error);
      Alert.alert('Error', 'Failed to validate promo code. Please try again.');
    } finally {
      setValidatingPromo(false);
    }
  };

  const removePromoCode = () => {
    setPromoCode('');
    setPromoValidation(null);
  };

  const calculateDiscount = (basePrice) => {
    if (!promoValidation || !promoValidation.valid) return 0;

    const { type, discount } = promoValidation;
    
    if (type === 'percentage') {
      return basePrice * (discount / 100);
    } else if (type === 'fixed') {
      return Math.min(discount, basePrice);
    } else if (type === 'free_delivery') {
      return basePrice;
    }
    return 0;
  };

  const handleSubmitBooking = () => {
    // Basic validation
    if (!formData.pickupAddress || !formData.contactPhone) {
      Alert.alert('Missing Information', 'Please fill in required fields (pickup address and phone number)');
      return;
    }

    const baseCost = 15.00;
    const discount = calculateDiscount(baseCost);
    const finalCost = Math.max(0, baseCost - discount);

    navigation.navigate('PaymentCheckout', {
      orderDetails: {
        pickupAddress: formData.pickupAddress,
        returnAddress: formData.returnAddress || 'Store Return Center',
        packageType: formData.packageType,
        estimatedCost: finalCost,
        baseCost: baseCost,
        discount: discount,
        promoCode: promoValidation ? promoCode.toUpperCase() : null,
        formData: formData
      }
    });
  };

  const packageTypes = [
    { key: 'return', label: '📦 Return to Store' },
    { key: 'exchange', label: '🔄 Exchange Item' },
    { key: 'donation', label: '💝 Donate to Charity' },
    { key: 'warranty', label: '🛠️ Warranty Return' }
  ];

  const baseCost = 15.00;
  const discount = calculateDiscount(baseCost);
  const finalCost = Math.max(0, baseCost - discount);

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
              data-testid="input-pickup-address"
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
              data-testid="input-contact-phone"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Preferred Date</Text>
            <TextInput
              style={styles.textInput}
              value={formData.preferredDate}
              onChangeText={(value) => handleInputChange('preferredDate', value)}
              placeholder="MM/DD/YYYY or 'ASAP'"
              data-testid="input-preferred-date"
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
                data-testid="input-return-address"
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
              data-testid="input-description"
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
              data-testid="input-weight"
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
              data-testid="input-special-instructions"
            />
          </View>
        </View>

        {/* Promo Code Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Promo Code</Text>
          
          {!promoValidation ? (
            <View style={styles.promoInputContainer}>
              <TextInput
                style={styles.promoInput}
                value={promoCode}
                onChangeText={setPromoCode}
                placeholder="Enter promo code"
                autoCapitalize="characters"
                data-testid="input-promo-code"
              />
              <TouchableOpacity
                style={[styles.applyButton, validatingPromo && styles.disabledButton]}
                onPress={validatePromoCode}
                disabled={validatingPromo}
                data-testid="button-apply-promo"
              >
                {validatingPromo ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.applyButtonText}>Apply</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.promoAppliedContainer}>
              <View style={styles.promoAppliedBadge}>
                <Text style={styles.promoAppliedText}>
                  ✓ {promoCode.toUpperCase()} Applied
                </Text>
                <Text style={styles.promoSavingsText}>
                  Save{' '}
                  {promoValidation.type === 'percentage'
                    ? `${promoValidation.discount}%`
                    : `$${promoValidation.discount.toFixed(2)}`}
                </Text>
              </View>
              <TouchableOpacity onPress={removePromoCode} data-testid="button-remove-promo">
                <Text style={styles.removePromoText}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Price Summary */}
        <View style={styles.priceSummaryContainer}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Base Price:</Text>
            <Text style={styles.priceValue}>${baseCost.toFixed(2)}</Text>
          </View>
          
          {discount > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.discountLabel}>Discount:</Text>
              <Text style={styles.discountValue}>-${discount.toFixed(2)}</Text>
            </View>
          )}
          
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>${finalCost.toFixed(2)}</Text>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          style={styles.submitButton} 
          onPress={handleSubmitBooking}
          data-testid="button-schedule-pickup"
        >
          <Text style={styles.submitButtonText}>
            Continue to Payment (${finalCost.toFixed(2)})
          </Text>
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
  promoInputContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  promoInput: {
    flex: 1,
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FED7AA',
    fontSize: 16,
    color: '#374151',
  },
  applyButton: {
    backgroundColor: '#FB923C',
    paddingHorizontal: 24,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  promoAppliedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#D1FAE5',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  promoAppliedBadge: {
    flex: 1,
  },
  promoAppliedText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 4,
  },
  promoSavingsText: {
    fontSize: 14,
    color: '#047857',
  },
  removePromoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
    textDecorationLine: 'underline',
  },
  priceSummaryContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  priceLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  priceValue: {
    fontSize: 16,
    color: '#374151',
  },
  discountLabel: {
    fontSize: 16,
    color: '#10B981',
  },
  discountValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#FED7AA',
    marginTop: 8,
    paddingTop: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#92400E',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FB923C',
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

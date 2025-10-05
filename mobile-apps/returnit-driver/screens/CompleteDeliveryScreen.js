import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import apiClient from '../services/api-client';

export default function CompleteDeliveryScreen({ route, navigation }) {
  const { orderId, orderDetails } = route.params || {};
  
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraActive, setCameraActive] = useState(false);
  
  // Completion outcome
  const [selectedOutcome, setSelectedOutcome] = useState('');
  
  // Refund details
  const [retailerAccepted, setRetailerAccepted] = useState(false);
  const [retailerIssuedRefund, setRetailerIssuedRefund] = useState(false);
  const [refundMethod, setRefundMethod] = useState('');
  const [refundAmount, setRefundAmount] = useState(orderDetails?.totalOrderValue?.toString() || '');
  const [refundTimeline, setRefundTimeline] = useState('');
  
  // Store credit details
  const [storeCreditIssued, setStoreCreditIssued] = useState(false);
  const [storeCreditAmount, setStoreCreditAmount] = useState('');
  const [giftCardNumber, setGiftCardNumber] = useState('');
  
  // Donation details
  const [donationConfirmed, setDonationConfirmed] = useState(false);
  const [donationReceiptProvided, setDonationReceiptProvided] = useState(false);
  const [donationOrganization, setDonationOrganization] = useState('');
  
  // Return refused details
  const [refusalReason, setRefusalReason] = useState('');
  
  // Evidence
  const [completionPhotos, setCompletionPhotos] = useState([]);
  const [driverNotes, setDriverNotes] = useState('');
  const [loading, setLoading] = useState(false);
  
  const cameraRef = useRef(null);
  const maxPhotos = 5;

  const outcomes = [
    { id: 'refund_processed', label: 'Return Accepted - Refund Processing', icon: '💳' },
    { id: 'store_credit_issued', label: 'Return Accepted - Store Credit Issued', icon: '🎁' },
    { id: 'exchange_completed', label: 'Return Accepted - Exchange Completed', icon: '🔄' },
    { id: 'donation_accepted', label: 'Donation Accepted', icon: '❤️' },
    { id: 'return_refused', label: 'Return Refused', icon: '❌' }
  ];

  const refundMethods = [
    { id: 'original_payment', label: 'Original Payment Method' },
    { id: 'store_credit', label: 'Store Credit/Gift Card' },
    { id: 'cash', label: 'Cash Refund' },
    { id: 'check', label: 'Check by Mail' }
  ];

  const refundTimelines = [
    { id: 'immediate', label: 'Immediate (Today)' },
    { id: '3-5_days', label: '3-5 Business Days' },
    { id: '7-10_days', label: '7-10 Business Days' },
    { id: '14+_days', label: '14+ Business Days' }
  ];

  const refusalReasons = [
    { id: 'expired_window', label: 'Past Return Window' },
    { id: 'no_receipt', label: 'No Receipt/Proof of Purchase' },
    { id: 'damaged', label: 'Item Damaged/Used' },
    { id: 'policy_violation', label: 'Policy Violation' },
    { id: 'other', label: 'Other' }
  ];

  const takePhoto = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: true,
      });
      
      setCompletionPhotos(prev => [...prev, {
        uri: photo.uri,
        base64: photo.base64,
        timestamp: new Date().toISOString()
      }]);
      
      setCameraActive(false);
      
      Alert.alert(
        'Photo Captured',
        `Photo ${completionPhotos.length + 1} of ${maxPhotos} added successfully.`,
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
            setCompletionPhotos(prev => prev.filter((_, i) => i !== index));
          }
        }
      ]
    );
  };

  const openCamera = () => {
    if (completionPhotos.length >= maxPhotos) {
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

  const validateCompletion = () => {
    if (!selectedOutcome) {
      Alert.alert('Outcome Required', 'Please select what happened with this return.');
      return false;
    }

    if (selectedOutcome === 'refund_processed') {
      if (!retailerAccepted) {
        Alert.alert('Confirmation Required', 'Please confirm retailer accepted the return.');
        return false;
      }
      if (!refundMethod) {
        Alert.alert('Refund Method Required', 'Please select the refund method.');
        return false;
      }
      if (!refundTimeline) {
        Alert.alert('Timeline Required', 'Please select the refund timeline.');
        return false;
      }
    }

    if (selectedOutcome === 'store_credit_issued') {
      if (!storeCreditAmount || parseFloat(storeCreditAmount) <= 0) {
        Alert.alert('Amount Required', 'Please enter the store credit amount.');
        return false;
      }
    }

    if (selectedOutcome === 'donation_accepted') {
      if (!donationOrganization.trim()) {
        Alert.alert('Organization Required', 'Please enter the donation organization name.');
        return false;
      }
    }

    if (selectedOutcome === 'return_refused') {
      if (!refusalReason) {
        Alert.alert('Reason Required', 'Please select why the return was refused.');
        return false;
      }
    }

    return true;
  };

  const completeDelivery = async () => {
    if (!validateCompletion()) {
      return;
    }

    setLoading(true);

    try {
      const photoDataUrls = completionPhotos.map(photo => 
        `data:image/jpeg;base64,${photo.base64}`
      );
      
      const completionData = {
        actualReturnOutcome: selectedOutcome,
        driverCompletionConfirmed: true,
        driverCompletionTimestamp: new Date().toISOString(),
        driverCompletionNotes: driverNotes.trim() || undefined,
        driverCompletionPhotos: photoDataUrls,
        
        // Refund details
        retailerAcceptedReturn: selectedOutcome === 'refund_processed' ? retailerAccepted : undefined,
        retailerIssuedRefund: selectedOutcome === 'refund_processed' ? retailerIssuedRefund : undefined,
        retailerRefundMethod: selectedOutcome === 'refund_processed' ? refundMethod : undefined,
        retailerRefundAmount: selectedOutcome === 'refund_processed' ? parseFloat(refundAmount) : undefined,
        retailerRefundTimeline: selectedOutcome === 'refund_processed' ? refundTimeline : undefined,
        
        // Store credit details
        storeCreditIssued: selectedOutcome === 'store_credit_issued' ? storeCreditIssued : undefined,
        storeCreditAmount: selectedOutcome === 'store_credit_issued' ? parseFloat(storeCreditAmount) : undefined,
        storeCreditCardNumber: selectedOutcome === 'store_credit_issued' ? giftCardNumber : undefined,
        
        // Donation details
        donationConfirmed: selectedOutcome === 'donation_accepted' ? donationConfirmed : undefined,
        donationReceiptProvided: selectedOutcome === 'donation_accepted' ? donationReceiptProvided : undefined,
        donationOrganization: selectedOutcome === 'donation_accepted' ? donationOrganization : undefined,
        donationReceiptPhotos: selectedOutcome === 'donation_accepted' ? photoDataUrls : undefined,
        
        // Return refused
        returnRefused: selectedOutcome === 'return_refused',
        returnRefusedReason: selectedOutcome === 'return_refused' ? refusalReason : undefined,
        returnRefusedPhotos: selectedOutcome === 'return_refused' ? photoDataUrls : undefined,
      };

      const response = await apiClient.request(`/api/driver/complete-delivery/${orderId}`, {
        method: 'POST',
        body: JSON.stringify(completionData)
      });

      Alert.alert(
        'Delivery Completed',
        response.message || 'Delivery completion confirmed successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('DriverDashboard')
          }
        ]
      );
    } catch (error) {
      console.error('Error completing delivery:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to complete delivery. Please try again.'
      );
    } finally {
      setLoading(false);
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
            <View style={styles.photoCounter}>
              <Text style={styles.photoCounterText}>
                {completionPhotos.length}/{maxPhotos}
              </Text>
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Complete Delivery</Text>
          <Text style={styles.subtitle}>Confirm what happened with this return</Text>
        </View>

        {/* Order Info */}
        <View style={styles.orderCard}>
          <Text style={styles.orderLabel}>Order #{orderId?.substring(0, 8)}</Text>
          <Text style={styles.orderRetailer}>{orderDetails?.retailer || 'Retailer'}</Text>
        </View>

        {/* Outcome Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Return Outcome (Required)</Text>
          <Text style={styles.sectionSubtitle}>What was the final result?</Text>
          
          {outcomes.map((outcome) => (
            <TouchableOpacity
              key={outcome.id}
              style={[
                styles.outcomeButton,
                selectedOutcome === outcome.id && styles.outcomeButtonSelected
              ]}
              onPress={() => setSelectedOutcome(outcome.id)}
            >
              <Text style={styles.outcomeIcon}>{outcome.icon}</Text>
              <Text style={[
                styles.outcomeLabel,
                selectedOutcome === outcome.id && styles.outcomeLabelSelected
              ]}>
                {outcome.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Refund Details */}
        {selectedOutcome === 'refund_processed' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Refund Details</Text>
            
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setRetailerAccepted(!retailerAccepted)}
            >
              <View style={[styles.checkbox, retailerAccepted && styles.checkboxChecked]}>
                {retailerAccepted && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Retailer accepted the return</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setRetailerIssuedRefund(!retailerIssuedRefund)}
            >
              <View style={[styles.checkbox, retailerIssuedRefund && styles.checkboxChecked]}>
                {retailerIssuedRefund && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Retailer confirmed refund</Text>
            </TouchableOpacity>

            <Text style={styles.inputLabel}>Refund Method *</Text>
            {refundMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.radioButton,
                  refundMethod === method.id && styles.radioButtonSelected
                ]}
                onPress={() => setRefundMethod(method.id)}
              >
                <View style={[styles.radio, refundMethod === method.id && styles.radioSelected]}>
                  {refundMethod === method.id && <View style={styles.radioDot} />}
                </View>
                <Text style={styles.radioLabel}>{method.label}</Text>
              </TouchableOpacity>
            ))}

            <Text style={styles.inputLabel}>Refund Amount</Text>
            <TextInput
              style={styles.input}
              value={refundAmount}
              onChangeText={setRefundAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
            />

            <Text style={styles.inputLabel}>Refund Timeline *</Text>
            {refundTimelines.map((timeline) => (
              <TouchableOpacity
                key={timeline.id}
                style={[
                  styles.radioButton,
                  refundTimeline === timeline.id && styles.radioButtonSelected
                ]}
                onPress={() => setRefundTimeline(timeline.id)}
              >
                <View style={[styles.radio, refundTimeline === timeline.id && styles.radioSelected]}>
                  {refundTimeline === timeline.id && <View style={styles.radioDot} />}
                </View>
                <Text style={styles.radioLabel}>{timeline.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Store Credit Details */}
        {selectedOutcome === 'store_credit_issued' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Store Credit Details</Text>
            
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setStoreCreditIssued(!storeCreditIssued)}
            >
              <View style={[styles.checkbox, storeCreditIssued && styles.checkboxChecked]}>
                {storeCreditIssued && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Physical gift card issued</Text>
            </TouchableOpacity>

            <Text style={styles.inputLabel}>Store Credit Amount *</Text>
            <TextInput
              style={styles.input}
              value={storeCreditAmount}
              onChangeText={setStoreCreditAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
            />

            <Text style={styles.inputLabel}>Gift Card Last 4 Digits</Text>
            <TextInput
              style={styles.input}
              value={giftCardNumber}
              onChangeText={setGiftCardNumber}
              keyboardType="number-pad"
              placeholder="1234"
              maxLength={4}
            />

            <View style={styles.noteBox}>
              <Text style={styles.noteText}>
                📦 You'll deliver this gift card back to the customer for a $3.99 delivery fee
              </Text>
            </View>
          </View>
        )}

        {/* Donation Details */}
        {selectedOutcome === 'donation_accepted' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Donation Details</Text>
            
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setDonationConfirmed(!donationConfirmed)}
            >
              <View style={[styles.checkbox, donationConfirmed && styles.checkboxChecked]}>
                {donationConfirmed && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Organization confirmed acceptance</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setDonationReceiptProvided(!donationReceiptProvided)}
            >
              <View style={[styles.checkbox, donationReceiptProvided && styles.checkboxChecked]}>
                {donationReceiptProvided && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Tax receipt provided</Text>
            </TouchableOpacity>

            <Text style={styles.inputLabel}>Organization Name *</Text>
            <TextInput
              style={styles.input}
              value={donationOrganization}
              onChangeText={setDonationOrganization}
              placeholder="Goodwill, Salvation Army, etc."
            />
          </View>
        )}

        {/* Return Refused */}
        {selectedOutcome === 'return_refused' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Return Refusal Reason</Text>
            
            {refusalReasons.map((reason) => (
              <TouchableOpacity
                key={reason.id}
                style={[
                  styles.radioButton,
                  refusalReason === reason.id && styles.radioButtonSelected
                ]}
                onPress={() => setRefusalReason(reason.id)}
              >
                <View style={[styles.radio, refusalReason === reason.id && styles.radioSelected]}>
                  {refusalReason === reason.id && <View style={styles.radioDot} />}
                </View>
                <Text style={styles.radioLabel}>{reason.label}</Text>
              </TouchableOpacity>
            ))}

            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                ⚠️ You'll return these items to the customer. They'll be charged a $3.99 return delivery fee.
              </Text>
            </View>
          </View>
        )}

        {/* Driver Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Driver Notes</Text>
          <TextInput
            style={styles.textArea}
            value={driverNotes}
            onChangeText={setDriverNotes}
            placeholder="Add any additional observations..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Completion Photos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Evidence Photos (Optional)</Text>
          <Text style={styles.sectionSubtitle}>
            Add photos of receipts, gift cards, or donation confirmations
          </Text>

          <View style={styles.photoGrid}>
            {completionPhotos.map((photo, index) => (
              <View key={index} style={styles.photoContainer}>
                <Image source={{ uri: photo.uri }} style={styles.photo} />
                <TouchableOpacity
                  style={styles.removePhotoButton}
                  onPress={() => removePhoto(index)}
                >
                  <Text style={styles.removePhotoText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {completionPhotos.length < maxPhotos && (
            <TouchableOpacity
              style={styles.addPhotoButton}
              onPress={openCamera}
            >
              <Text style={styles.addPhotoText}>
                📷 Add Photo ({completionPhotos.length}/{maxPhotos})
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Complete Button */}
        <TouchableOpacity
          style={[styles.completeButton, loading && styles.completeButtonDisabled]}
          onPress={completeDelivery}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.completeButtonText}>Complete Delivery</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBEB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#78350F',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#B45309',
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  orderLabel: {
    fontSize: 14,
    color: '#B45309',
    marginBottom: 4,
  },
  orderRetailer: {
    fontSize: 20,
    fontWeight: '600',
    color: '#78350F',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#78350F',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#B45309',
    marginBottom: 12,
  },
  outcomeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#FEF3C7',
  },
  outcomeButtonSelected: {
    borderColor: '#EA580C',
    backgroundColor: '#FFF7ED',
  },
  outcomeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  outcomeLabel: {
    fontSize: 16,
    color: '#78350F',
    flex: 1,
  },
  outcomeLabelSelected: {
    fontWeight: '600',
    color: '#EA580C',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D97706',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#EA580C',
    borderColor: '#EA580C',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#78350F',
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#78350F',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    color: '#78350F',
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    color: '#78350F',
    minHeight: 100,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  radioButtonSelected: {
    borderColor: '#EA580C',
    backgroundColor: '#FFF7ED',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D97706',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#EA580C',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EA580C',
  },
  radioLabel: {
    fontSize: 16,
    color: '#78350F',
    flex: 1,
  },
  noteBox: {
    backgroundColor: '#DBEAFE',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  noteText: {
    fontSize: 14,
    color: '#1E40AF',
  },
  warningBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  warningText: {
    fontSize: 14,
    color: '#92400E',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  photoContainer: {
    width: 100,
    height: 100,
    marginRight: 8,
    marginBottom: 8,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removePhotoText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addPhotoButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D97706',
    borderStyle: 'dashed',
  },
  addPhotoText: {
    fontSize: 16,
    color: '#D97706',
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: '#EA580C',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 24,
  },
  completeButtonDisabled: {
    opacity: 0.6,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
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
  },
  cancelButton: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    padding: 12,
    paddingHorizontal: 20,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  captureButtonInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
  },
  photoCounter: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 8,
    padding: 8,
    paddingHorizontal: 12,
  },
  photoCounterText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

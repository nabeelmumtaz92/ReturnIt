import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import apiClient from '../services/api-client';
import ErrorHandler from '../services/error-handler';

export default function DriverReviewDeliveryScreen({ navigation, route }) {
  const { orderId, customerId, customerName, pickupAddress, dropoffAddress } = route.params || {};

  // Review State
  const [overallRating, setOverallRating] = useState(0);
  const [customerRating, setCustomerRating] = useState(0);
  const [packageConditionRating, setPackageConditionRating] = useState(0);
  const [locationRating, setLocationRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [hadIssues, setHadIssues] = useState(false);
  const [issuesEncountered, setIssuesEncountered] = useState([]);
  const [issueDescription, setIssueDescription] = useState('');
  const [wouldAcceptAgain, setWouldAcceptAgain] = useState(null);

  const [submitting, setSubmitting] = useState(false);

  const issueOptions = [
    { id: 'access', label: 'Difficult Access' },
    { id: 'packaging', label: 'Poor Packaging' },
    { id: 'communication', label: 'Communication Issues' },
    { id: 'directions', label: 'Unclear Directions' },
    { id: 'delay', label: 'Customer Delay' },
    { id: 'other', label: 'Other' }
  ];

  const StarRating = ({ rating, onRate, label }) => (
    <View style={styles.ratingRow}>
      <Text style={styles.ratingLabel}>{label}</Text>
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => onRate(star)}>
            <Text style={styles.star}>{star <= rating ? '⭐' : '☆'}</Text>
          </TouchableOpacity>
        ))}
        <Text style={styles.ratingValue}>{rating > 0 ? rating.toFixed(1) : '-'}</Text>
      </View>
    </View>
  );

  const toggleIssue = (issueId) => {
    let updatedIssues;
    if (issuesEncountered.includes(issueId)) {
      updatedIssues = issuesEncountered.filter(id => id !== issueId);
    } else {
      updatedIssues = [...issuesEncountered, issueId];
    }
    setIssuesEncountered(updatedIssues);
    setHadIssues(updatedIssues.length > 0);
  };

  const submitReview = async () => {
    if (overallRating === 0) {
      Alert.alert('Missing Rating', 'Please provide an overall delivery rating.');
      return;
    }

    if (wouldAcceptAgain === null) {
      Alert.alert('Missing Information', 'Please let us know if you would accept deliveries from this customer again.');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        orderId,
        driverId: null, // Will be populated from session
        customerId,
        overallRating,
        customerRating: customerRating || undefined,
        packageConditionRating: packageConditionRating || undefined,
        locationRating: locationRating || undefined,
        reviewText: reviewText.trim() || undefined,
        hadIssues: hadIssues || issuesEncountered.length > 0,
        issueDescription: issuesEncountered.length > 0 ? issuesEncountered.map(id => 
          issueOptions.find(opt => opt.id === id)?.label || id
        ).join(', ') + (issueDescription.trim() ? `: ${issueDescription.trim()}` : '') : undefined,
        wouldAcceptAgain,
      };

      await apiClient.post('/api/driver-reviews', payload);

      Alert.alert(
        'Review Submitted!',
        'Thank you for your feedback. This helps us improve our platform and match you with great customers.',
        [{ text: 'OK', onPress: () => navigation.navigate('DriverDashboard') }]
      );
    } catch (err) {
      const appError = ErrorHandler.handleAPIError(err);
      Alert.alert('Error', appError.userFriendly);
    } finally {
      setSubmitting(false);
    }
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
          <Text style={styles.headerTitle}>Rate Delivery</Text>
          <Text style={styles.headerSubtitle}>
            {customerName ? `How was your delivery for ${customerName}?` : 'How was this delivery?'}
          </Text>
        </View>

        {/* Delivery Context Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📦 Delivery Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Pickup:</Text>
            <Text style={styles.detailValue}>{pickupAddress || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Dropoff:</Text>
            <Text style={styles.detailValue}>{dropoffAddress || 'N/A'}</Text>
          </View>
        </View>

        {/* Overall Rating Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Overall Delivery Experience</Text>
          <StarRating 
            rating={overallRating}
            onRate={setOverallRating}
            label="Overall Rating *"
          />
        </View>

        {/* Detailed Ratings Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Rate Specific Aspects</Text>
          
          <StarRating 
            rating={customerRating}
            onRate={setCustomerRating}
            label="Customer Interaction"
          />
          
          <StarRating 
            rating={packageConditionRating}
            onRate={setPackageConditionRating}
            label="Package Condition"
          />
          
          <StarRating 
            rating={locationRating}
            onRate={setLocationRating}
            label="Location Accessibility"
          />
        </View>

        {/* Issues Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Did you encounter any issues?</Text>
          
          <View style={styles.issuesContainer}>
            {issueOptions.map((issue) => (
              <TouchableOpacity
                key={issue.id}
                style={[
                  styles.issueButton,
                  issuesEncountered.includes(issue.id) && styles.issueButtonActive
                ]}
                onPress={() => toggleIssue(issue.id)}
              >
                <Text style={[
                  styles.issueButtonText,
                  issuesEncountered.includes(issue.id) && styles.issueButtonTextActive
                ]}>
                  {issue.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {issuesEncountered.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>Describe the issue (Optional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Provide more details about the issues..."
                placeholderTextColor="#92400E80"
                value={issueDescription}
                onChangeText={setIssueDescription}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </>
          )}
        </View>

        {/* Comments Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Additional Comments (Optional)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Share your thoughts about this delivery..."
            placeholderTextColor="#92400E80"
            value={reviewText}
            onChangeText={setReviewText}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Would Accept Again Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Would you accept deliveries from this customer again? *</Text>
          <View style={styles.acceptContainer}>
            <TouchableOpacity
              style={[styles.acceptButton, wouldAcceptAgain === true && styles.acceptButtonYes]}
              onPress={() => setWouldAcceptAgain(true)}
            >
              <Text style={[styles.acceptButtonText, wouldAcceptAgain === true && styles.acceptButtonTextActive]}>
                👍 Yes
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.acceptButton, wouldAcceptAgain === false && styles.acceptButtonNo]}
              onPress={() => setWouldAcceptAgain(false)}
            >
              <Text style={[styles.acceptButtonText, wouldAcceptAgain === false && styles.acceptButtonTextActive]}>
                👎 No
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={submitReview}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Review</Text>
          )}
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
    paddingTop: 50,
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4A3F35',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B5B4F',
    lineHeight: 22,
  },
  card: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E3DD',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A3F35',
    marginBottom: 16,
  },
  detailRow: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B5B4F',
    marginBottom: 4,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    color: '#4A3F35',
    lineHeight: 20,
  },
  ratingRow: {
    marginBottom: 16,
  },
  ratingLabel: {
    fontSize: 15,
    color: '#4A3F35',
    marginBottom: 8,
    fontWeight: '600',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    fontSize: 32,
    marginRight: 8,
  },
  ratingValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginLeft: 8,
  },
  issuesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  issueButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8F7F4',
    borderWidth: 1,
    borderColor: '#E5E3DD',
  },
  issueButtonActive: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  issueButtonText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '600',
  },
  issueButtonTextActive: {
    color: '#FFFFFF',
  },
  sectionLabel: {
    fontSize: 15,
    color: '#4A3F35',
    marginBottom: 12,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: '#F8F7F4',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#4A3F35',
    borderWidth: 1,
    borderColor: '#E5E3DD',
    minHeight: 80,
  },
  acceptContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  acceptButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E3DD',
    backgroundColor: 'white',
    alignItems: 'center',
  },
  acceptButtonYes: {
    borderColor: '#10B981',
    backgroundColor: '#10B981',
  },
  acceptButtonNo: {
    borderColor: '#EF4444',
    backgroundColor: '#EF4444',
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#78716C',
  },
  acceptButtonTextActive: {
    color: 'white',
  },
  submitButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 8,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: '#E5E3DD',
    shadowOpacity: 0,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

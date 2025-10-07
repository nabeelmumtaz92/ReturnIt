import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import apiClient from '../services/api-client';
import ErrorHandler from '../services/error-handler';

export default function CustomerReviewScreen({ navigation, route }) {
  const { orderId, driverId, driverName } = route.params || {};

  // Driver Review State
  const [overallRating, setOverallRating] = useState(0);
  const [serviceRating, setServiceRating] = useState(0);
  const [timelinessRating, setTimelinessRating] = useState(0);
  const [communicationRating, setCommunicationRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState(null);

  // App Review State
  const [appRating, setAppRating] = useState(0);
  const [appReviewText, setAppReviewText] = useState('');
  const [appCategory, setAppCategory] = useState('general');

  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState('driver'); // 'driver' or 'app'

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

  const submitDriverReview = async () => {
    if (overallRating === 0) {
      Alert.alert('Missing Rating', 'Please provide an overall rating for your driver.');
      return;
    }

    if (wouldRecommend === null) {
      Alert.alert('Missing Information', 'Please let us know if you would recommend this driver.');
      return;
    }

    try {
      setSubmitting(true);
      await apiClient.post('/api/reviews', {
        orderId,
        driverId,
        overallRating,
        serviceRating: serviceRating || undefined,
        timelinessRating: timelinessRating || undefined,
        communicationRating: communicationRating || undefined,
        reviewText: reviewText.trim() || undefined,
        wouldRecommend,
      });

      // Move to app review
      setCurrentStep('app');
    } catch (err) {
      const appError = ErrorHandler.handleAPIError(err);
      Alert.alert('Error', appError.userFriendly);
    } finally {
      setSubmitting(false);
    }
  };

  const submitAppReview = async () => {
    if (appRating === 0) {
      Alert.alert('Missing Rating', 'Please provide a rating for the ReturnIt app.');
      return;
    }

    try {
      setSubmitting(true);
      await apiClient.post('/api/app-reviews', {
        rating: appRating,
        reviewText: appReviewText.trim() || undefined,
        category: appCategory,
      });

      Alert.alert(
        'Thank You!',
        'Your feedback helps us improve our service. We appreciate you taking the time to share your experience!',
        [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
      );
    } catch (err) {
      const appError = ErrorHandler.handleAPIError(err);
      Alert.alert('Error', appError.userFriendly);
    } finally {
      setSubmitting(false);
    }
  };

  const skipAppReview = () => {
    Alert.alert(
      'Skip App Review',
      'Are you sure you want to skip reviewing the app?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Skip', onPress: () => navigation.navigate('Home') }
      ]
    );
  };

  if (currentStep === 'app') {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Rate Your Experience</Text>
            <Text style={styles.headerSubtitle}>Help us improve the ReturnIt app</Text>
          </View>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressDot, styles.progressDotComplete]} />
            <View style={styles.progressLine} />
            <View style={[styles.progressDot, styles.progressDotActive]} />
          </View>
          <Text style={styles.stepText}>Step 2 of 2: App Review</Text>

          {/* App Rating Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>How would you rate the ReturnIt app?</Text>
            
            <StarRating 
              rating={appRating}
              onRate={setAppRating}
              label="Overall App Rating"
            />

            {/* Category Selection */}
            <Text style={styles.sectionLabel}>What aspect are you rating?</Text>
            <View style={styles.categoryContainer}>
              {[
                { key: 'general', label: 'General' },
                { key: 'usability', label: 'Ease of Use' },
                { key: 'features', label: 'Features' },
                { key: 'support', label: 'Support' }
              ].map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  style={[styles.categoryButton, appCategory === cat.key && styles.categoryButtonActive]}
                  onPress={() => setAppCategory(cat.key)}
                >
                  <Text style={[styles.categoryButtonText, appCategory === cat.key && styles.categoryButtonTextActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Comments */}
            <Text style={styles.sectionLabel}>Additional Comments (Optional)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Tell us about your experience with the app..."
              placeholderTextColor="#92400E80"
              value={appReviewText}
              onChangeText={setAppReviewText}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={skipAppReview}
              disabled={submitting}
            >
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
              onPress={submitAppReview}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Review</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Driver Review Step
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Rate Your Driver</Text>
          <Text style={styles.headerSubtitle}>
            {driverName ? `How was your experience with ${driverName}?` : 'How was your delivery experience?'}
          </Text>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={styles.progressLine} />
          <View style={styles.progressDot} />
        </View>
        <Text style={styles.stepText}>Step 1 of 2: Driver Review</Text>

        {/* Overall Rating Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Overall Experience</Text>
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
            rating={serviceRating}
            onRate={setServiceRating}
            label="Service Quality"
          />
          
          <StarRating 
            rating={timelinessRating}
            onRate={setTimelinessRating}
            label="Timeliness"
          />
          
          <StarRating 
            rating={communicationRating}
            onRate={setCommunicationRating}
            label="Communication"
          />
        </View>

        {/* Comments Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Share Your Experience (Optional)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Tell us more about your driver's service..."
            placeholderTextColor="#92400E80"
            value={reviewText}
            onChangeText={setReviewText}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Recommendation Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Would you request this driver again? *</Text>
          <View style={styles.recommendContainer}>
            <TouchableOpacity
              style={[styles.recommendButton, wouldRecommend === true && styles.recommendButtonYes]}
              onPress={() => setWouldRecommend(true)}
            >
              <Text style={[styles.recommendButtonText, wouldRecommend === true && styles.recommendButtonTextActive]}>
                👍 Yes
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.recommendButton, wouldRecommend === false && styles.recommendButtonNo]}
              onPress={() => setWouldRecommend(false)}
            >
              <Text style={[styles.recommendButtonText, wouldRecommend === false && styles.recommendButtonTextActive]}>
                👎 No
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, styles.submitButtonFull, submitting && styles.submitButtonDisabled]}
          onPress={submitDriverReview}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Continue to App Review →</Text>
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
    color: '#FB923C',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#78716C',
    lineHeight: 22,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E5E3DD',
  },
  progressDotActive: {
    backgroundColor: '#FB923C',
  },
  progressDotComplete: {
    backgroundColor: '#10B981',
  },
  progressLine: {
    width: 60,
    height: 2,
    backgroundColor: '#E5E3DD',
    marginHorizontal: 8,
  },
  stepText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#78716C',
    marginBottom: 20,
    fontWeight: '600',
  },
  card: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 16,
  },
  ratingRow: {
    marginBottom: 16,
  },
  ratingLabel: {
    fontSize: 15,
    color: '#374151',
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
    color: '#92400E',
    marginLeft: 8,
  },
  textInput: {
    backgroundColor: '#F8F7F4',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#374151',
    borderWidth: 1,
    borderColor: '#E5E3DD',
    minHeight: 100,
  },
  sectionLabel: {
    fontSize: 15,
    color: '#374151',
    marginBottom: 12,
    marginTop: 8,
    fontWeight: '600',
  },
  recommendContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  recommendButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E3DD',
    backgroundColor: 'white',
    alignItems: 'center',
  },
  recommendButtonYes: {
    borderColor: '#10B981',
    backgroundColor: '#10B981',
  },
  recommendButtonNo: {
    borderColor: '#EF4444',
    backgroundColor: '#EF4444',
  },
  recommendButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#78716C',
  },
  recommendButtonTextActive: {
    color: 'white',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8F7F4',
    borderWidth: 1,
    borderColor: '#E5E3DD',
  },
  categoryButtonActive: {
    backgroundColor: '#FB923C',
    borderColor: '#FB923C',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '600',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#FB923C',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  submitButtonFull: {
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#E5E3DD',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 20,
    marginTop: 8,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E3DD',
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#78716C',
  },
});

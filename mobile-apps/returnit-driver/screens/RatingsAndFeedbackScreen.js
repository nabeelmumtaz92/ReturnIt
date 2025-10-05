import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import apiClient from '../services/api-client';
import ErrorHandler from '../services/error-handler';

export default function RatingsAndFeedbackScreen({ navigation }) {
  const [ratings, setRatings] = useState(null);
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackType, setFeedbackType] = useState('suggestion');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadRatingsData();
  }, []);

  const loadRatingsData = async () => {
    try {
      setLoading(true);
      const [ratingsData, feedbackData] = await Promise.all([
        apiClient.request('/api/driver/ratings'),
        apiClient.request('/api/driver/feedback-history')
      ]);
      setRatings(ratingsData);
      setFeedbackHistory(feedbackData || []);
    } catch (err) {
      const appError = ErrorHandler.handleAPIError(err);
      ErrorHandler.logError(appError, { screen: 'RatingsAndFeedback' });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRatingsData();
    setRefreshing(false);
  };

  const submitFeedback = async () => {
    if (!feedbackText.trim()) {
      Alert.alert('Missing Information', 'Please enter your feedback before submitting.');
      return;
    }

    try {
      setSubmitting(true);
      await apiClient.request('/api/driver/feedback', {
        method: 'POST',
        body: {
          type: feedbackType,
          message: feedbackText.trim()
        }
      });

      Alert.alert(
        'Feedback Submitted',
        'Thank you for your feedback! We review all submissions to improve our platform.',
        [{ text: 'OK' }]
      );

      setFeedbackText('');
      await loadRatingsData();
    } catch (err) {
      const appError = ErrorHandler.handleAPIError(err);
      Alert.alert('Error', appError.userFriendly);
    } finally {
      setSubmitting(false);
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return '#10B981';
    if (rating >= 4.0) return '#F59E0B';
    if (rating >= 3.5) return '#FF6B35';
    return '#EF4444';
  };

  const getStarDisplay = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return '⭐'.repeat(fullStars) + (halfStar ? '✨' : '') + '☆'.repeat(emptyStars);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Loading ratings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#FF6B35']} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ratings & Feedback</Text>
        </View>

        {/* Overall Rating Card */}
        {ratings && (
          <View style={styles.overallRatingCard}>
            <Text style={styles.sectionTitle}>Your Performance</Text>
            <View style={styles.ratingDisplay}>
              <Text style={[styles.ratingNumber, { color: getRatingColor(ratings.averageRating || 0) }]}>
                {(ratings.averageRating || 0).toFixed(1)}
              </Text>
              <Text style={styles.ratingStars}>{getStarDisplay(ratings.averageRating || 0)}</Text>
            </View>
            <Text style={styles.ratingSubtext}>
              Based on {ratings.totalRatings || 0} rating{ratings.totalRatings !== 1 ? 's' : ''}
            </Text>

            {/* Rating Breakdown */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{ratings.completedDeliveries || 0}</Text>
                <Text style={styles.statLabel}>Deliveries</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{ratings.onTimeRate || 0}%</Text>
                <Text style={styles.statLabel}>On-Time</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{ratings.acceptanceRate || 0}%</Text>
                <Text style={styles.statLabel}>Acceptance</Text>
              </View>
            </View>

            {/* Recent Feedback Preview */}
            {ratings.recentFeedback && ratings.recentFeedback.length > 0 && (
              <View style={styles.recentFeedbackSection}>
                <Text style={styles.subsectionTitle}>Recent Customer Feedback</Text>
                {ratings.recentFeedback.slice(0, 3).map((feedback, index) => (
                  <View key={index} style={styles.feedbackQuote}>
                    <Text style={styles.feedbackQuoteText}>"{feedback.comment}"</Text>
                    <Text style={styles.feedbackQuoteRating}>
                      {getStarDisplay(feedback.rating)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Submit Feedback Section */}
        <View style={styles.submitFeedbackCard}>
          <Text style={styles.sectionTitle}>Submit Feedback</Text>
          <Text style={styles.sectionDescription}>
            Share your thoughts, suggestions, or report issues to help us improve.
          </Text>

          {/* Feedback Type Selection */}
          <View style={styles.feedbackTypeContainer}>
            {['suggestion', 'issue', 'praise', 'other'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.typeButton, feedbackType === type && styles.typeButtonActive]}
                onPress={() => setFeedbackType(type)}
              >
                <Text style={[styles.typeButtonText, feedbackType === type && styles.typeButtonTextActive]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Feedback Text Input */}
          <TextInput
            style={styles.feedbackInput}
            placeholder="Enter your feedback here..."
            placeholderTextColor="#92400E"
            value={feedbackText}
            onChangeText={setFeedbackText}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={submitFeedback}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Feedback</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Feedback History */}
        {feedbackHistory.length > 0 && (
          <View style={styles.historyCard}>
            <Text style={styles.sectionTitle}>Your Feedback History</Text>
            {feedbackHistory.map((item, index) => (
              <View key={index} style={styles.historyItem}>
                <View style={styles.historyHeader}>
                  <View style={[styles.typeTag, styles[`typeTag${item.type}`]]}>
                    <Text style={styles.typeTagText}>{item.type}</Text>
                  </View>
                  <Text style={styles.historyDate}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.historyMessage}>{item.message}</Text>
                {item.response && (
                  <View style={styles.responseContainer}>
                    <Text style={styles.responseLabel}>Response:</Text>
                    <Text style={styles.responseText}>{item.response}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E3DD',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
    letterSpacing: -0.5,
  },
  overallRatingCard: {
    backgroundColor: '#FFFFFF',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E3DD',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A3F35',
    marginBottom: 16,
  },
  ratingDisplay: {
    alignItems: 'center',
    marginVertical: 12,
  },
  ratingNumber: {
    fontSize: 56,
    fontWeight: 'bold',
    letterSpacing: -1,
  },
  ratingStars: {
    fontSize: 24,
    marginTop: 8,
  },
  ratingSubtext: {
    textAlign: 'center',
    fontSize: 14,
    color: '#92400E',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8F7F4',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E3DD',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '600',
  },
  recentFeedbackSection: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E3DD',
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A3F35',
    marginBottom: 12,
  },
  feedbackQuote: {
    backgroundColor: '#FFF8F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FF6B35',
  },
  feedbackQuoteText: {
    fontSize: 14,
    color: '#4A3F35',
    fontStyle: 'italic',
    marginBottom: 6,
    lineHeight: 20,
  },
  feedbackQuoteRating: {
    fontSize: 14,
  },
  submitFeedbackCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E3DD',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B5B4F',
    marginBottom: 16,
    lineHeight: 20,
  },
  feedbackTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8F7F4',
    borderWidth: 1,
    borderColor: '#E5E3DD',
  },
  typeButtonActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
  },
  feedbackInput: {
    backgroundColor: '#F8F7F4',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#4A3F35',
    borderWidth: 1,
    borderColor: '#E5E3DD',
    minHeight: 120,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
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
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E3DD',
  },
  historyItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E3DD',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F8F7F4',
  },
  typeTagsuggestion: {
    backgroundColor: '#DBEAFE',
  },
  typeTagissue: {
    backgroundColor: '#FEE2E2',
  },
  typeTagpraise: {
    backgroundColor: '#D1FAE5',
  },
  typeTagother: {
    backgroundColor: '#F3F4F6',
  },
  typeTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A3F35',
  },
  historyDate: {
    fontSize: 12,
    color: '#92400E',
  },
  historyMessage: {
    fontSize: 14,
    color: '#4A3F35',
    lineHeight: 20,
  },
  responseContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F8F7F4',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  responseLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 4,
  },
  responseText: {
    fontSize: 14,
    color: '#4A3F35',
    lineHeight: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#92400E',
  },
});

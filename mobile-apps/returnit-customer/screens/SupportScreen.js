import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Alert, Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function SupportScreen({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [message, setMessage] = useState('');

  const supportCategories = [
    { id: 'booking', title: 'Booking Issues', icon: '📦' },
    { id: 'tracking', title: 'Package Tracking', icon: '📍' },
    { id: 'billing', title: 'Billing & Payments', icon: '💳' },
    { id: 'driver', title: 'Driver Issues', icon: '🚗' },
    { id: 'other', title: 'Other', icon: '❓' }
  ];

  const faqItems = [
    {
      question: 'How quickly can you pick up my package?',
      answer: 'Most pickups are scheduled within 2-4 hours during business hours, or next business day for evening requests.'
    },
    {
      question: 'What items can you handle?',
      answer: 'We handle most retail returns, exchanges, and donations. Items must be under 50lbs and fit standard packaging.'
    },
    {
      question: 'How much does the service cost?',
      answer: 'Our transparent pricing starts at $8.99 base fee, plus $1.25 fuel surcharge and $1.50 service fee. Package size affects pricing: Small (shoebox) $0, Medium (microwave) $3, Large (TV box) $6. Multiple packages add $3 each after the first.'
    },
    {
      question: 'Can I track my package in real-time?',
      answer: 'Yes! You can track your package from pickup to delivery with live updates and driver location.'
    },
    {
      question: 'Can I cancel my pickup?',
      answer: 'Yes! Cancellations before driver dispatch receive a full refund. After driver dispatch, a $4.99 cancellation fee applies.'
    }
  ];

  const handleSubmitTicket = () => {
    if (!selectedCategory || !message.trim()) {
      Alert.alert('Incomplete Form', 'Please select a category and enter your message.');
      return;
    }

    Alert.alert(
      'Support Ticket Submitted',
      'Thank you for contacting us. We\'ll respond within 24 hours.',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  const handleCallSupport = () => {
    Linking.openURL('tel:+16362544821');
  };

  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@returnit.online');
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
          <Text style={styles.headerTitle}>Help & Support</Text>
        </View>

        {/* Quick Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Need Immediate Help?</Text>
          <View style={styles.contactRow}>
            <TouchableOpacity style={styles.contactButton} onPress={handleCallSupport}>
              <Text style={styles.contactButtonText}>📞 Call Support</Text>
              <Text style={styles.contactSubtext}>(636) 254-4821</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.contactButton} onPress={handleEmailSupport}>
              <Text style={styles.contactButtonText}>✉️ Email Support</Text>
              <Text style={styles.contactSubtext}>support@returnit.online</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {faqItems.map((item, index) => (
            <View key={index} style={styles.faqItem}>
              <Text style={styles.faqQuestion}>{item.question}</Text>
              <Text style={styles.faqAnswer}>{item.answer}</Text>
            </View>
          ))}
        </View>

        {/* Submit Ticket */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Submit Support Ticket</Text>
          
          <Text style={styles.inputLabel}>Category</Text>
          <View style={styles.categoryContainer}>
            {supportCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && styles.categoryButtonActive
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={[
                  styles.categoryButtonText,
                  selectedCategory === category.id && styles.categoryButtonTextActive
                ]}>
                  {category.icon} {category.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.inputLabel}>Describe your issue</Text>
          <TextInput
            style={styles.messageInput}
            value={message}
            onChangeText={setMessage}
            placeholder="Please provide details about your issue..."
            multiline
            numberOfLines={4}
          />

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmitTicket}>
            <Text style={styles.submitButtonText}>Submit Ticket</Text>
          </TouchableOpacity>
        </View>

        {/* Additional Resources */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Resources</Text>
          
          <TouchableOpacity style={styles.resourceButton}>
            <Text style={styles.resourceButtonText}>📚 User Guide</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.resourceButton}>
            <Text style={styles.resourceButtonText}>💡 Tips & Tricks</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.resourceButton}>
            <Text style={styles.resourceButtonText}>🌐 Visit Website</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.resourceButton}>
            <Text style={styles.resourceButtonText}>⭐ Rate Our App</Text>
          </TouchableOpacity>
        </View>
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
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#92400E',
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
  contactRow: {
    flexDirection: 'row',
    gap: 12,
  },
  contactButton: {
    flex: 1,
    backgroundColor: '#FB923C',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  contactSubtext: {
    fontSize: 12,
    color: 'white',
    opacity: 0.9,
  },
  faqItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 12,
  },
  categoryContainer: {
    marginBottom: 20,
    gap: 8,
  },
  categoryButton: {
    backgroundColor: '#F8F7F4',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  categoryButtonActive: {
    backgroundColor: '#FB923C',
    borderColor: '#FB923C',
  },
  categoryButtonText: {
    fontSize: 16,
    color: '#92400E',
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: 'white',
  },
  messageInput: {
    backgroundColor: '#F9FAFB',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 16,
    color: '#374151',
    textAlignVertical: 'top',
    marginBottom: 20,
    minHeight: 100,
  },
  submitButton: {
    backgroundColor: '#FB923C',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  resourceButton: {
    backgroundColor: '#F8F7F4',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  resourceButtonText: {
    fontSize: 16,
    color: '#92400E',
    fontWeight: '500',
  },
});
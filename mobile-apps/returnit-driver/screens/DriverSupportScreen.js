import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Alert, Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function DriverSupportScreen({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [message, setMessage] = useState('');

  const supportCategories = [
    { id: 'payment', title: 'Payment Issues', icon: '💰' },
    { id: 'navigation', title: 'Navigation Problems', icon: '🗺️' },
    { id: 'customer', title: 'Customer Issues', icon: '👥' },
    { id: 'vehicle', title: 'Vehicle Problems', icon: '🚗' },
    { id: 'safety', title: 'Safety Concerns', icon: '🛡️' },
    { id: 'other', title: 'Other', icon: '❓' }
  ];

  const driverFAQ = [
    {
      question: 'How do I get paid for my deliveries?',
      answer: 'Payments are processed daily for completed jobs. You can request instant pay for a $0.50 fee or wait for your weekly payout every Friday.'
    },
    {
      question: 'What should I do if a customer is not available?',
      answer: 'Try calling the customer first. If no response after 5 minutes, use the "Customer Unavailable" option in the app and follow the prompts.'
    },
    {
      question: 'How are delivery routes optimized?',
      answer: 'Our system considers traffic, distance, and time windows to create the most efficient routes. You can also manually re-optimize routes in the app.'
    },
    {
      question: 'What if my vehicle breaks down during a delivery?',
      answer: 'Contact driver support immediately at (555) 123-4567. We\'ll help reassign your active jobs and provide roadside assistance if needed.'
    },
    {
      question: 'How do I report unsafe pickup locations?',
      answer: 'Use the "Report Safety Issue" feature in the job details. Our team will review and may restrict future pickups from that location.'
    }
  ];

  const emergencyContacts = [
    { title: 'Emergency Support', number: '(555) 911-HELP', description: 'Immediate assistance for urgent issues' },
    { title: 'Driver Hotline', number: '(555) 123-4567', description: '24/7 driver support line' },
    { title: 'Safety Line', number: '(555) 999-SAFE', description: 'Report safety concerns' }
  ];

  const handleSubmitTicket = () => {
    if (!selectedCategory || !message.trim()) {
      Alert.alert('Incomplete Form', 'Please select a category and enter your message.');
      return;
    }

    Alert.alert(
      'Support Ticket Submitted',
      'Thank you for contacting driver support. We\'ll respond within 2 hours during business hours.',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  const handleCallSupport = (number) => {
    Linking.openURL(`tel:${number.replace(/[^\d]/g, '')}`);
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
          <Text style={styles.headerTitle}>Driver Support</Text>
        </View>

        {/* Emergency Contacts */}
        <View style={styles.emergencySection}>
          <Text style={styles.emergencyTitle}>🚨 Emergency Contacts</Text>
          {emergencyContacts.map((contact, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.emergencyButton}
              onPress={() => handleCallSupport(contact.number)}
            >
              <View style={styles.emergencyInfo}>
                <Text style={styles.emergencyContactTitle}>{contact.title}</Text>
                <Text style={styles.emergencyContactDescription}>{contact.description}</Text>
              </View>
              <Text style={styles.emergencyContactNumber}>{contact.number}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Driver FAQ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Driver FAQ</Text>
          {driverFAQ.map((item, index) => (
            <View key={index} style={styles.faqItem}>
              <Text style={styles.faqQuestion}>{item.question}</Text>
              <Text style={styles.faqAnswer}>{item.answer}</Text>
            </View>
          ))}
        </View>

        {/* Submit Ticket */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Submit Driver Support Ticket</Text>
          
          <Text style={styles.inputLabel}>Issue Category</Text>
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

          <Text style={styles.inputLabel}>Describe the issue</Text>
          <TextInput
            style={styles.messageInput}
            value={message}
            onChangeText={setMessage}
            placeholder="Please provide details about the issue you're experiencing..."
            multiline
            numberOfLines={4}
          />

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmitTicket}>
            <Text style={styles.submitButtonText}>Submit Ticket</Text>
          </TouchableOpacity>
        </View>

        {/* Driver Resources */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Driver Resources</Text>
          
          <TouchableOpacity style={styles.resourceButton}>
            <Text style={styles.resourceButtonText}>📚 Driver Handbook</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.resourceButton}>
            <Text style={styles.resourceButtonText}>🎓 Training Videos</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.resourceButton}>
            <Text style={styles.resourceButtonText}>💡 Best Practices</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.resourceButton}>
            <Text style={styles.resourceButtonText}>📊 Earnings Calculator</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.resourceButton}>
            <Text style={styles.resourceButtonText}>🛡️ Safety Guidelines</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.resourceButton}>
            <Text style={styles.resourceButtonText}>📱 App Tutorial</Text>
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
  emergencySection: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FECACA',
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 16,
    textAlign: 'center',
  },
  emergencyButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  emergencyInfo: {
    flex: 1,
  },
  emergencyContactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 4,
  },
  emergencyContactDescription: {
    fontSize: 14,
    color: '#78716C',
  },
  emergencyContactNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#DC2626',
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
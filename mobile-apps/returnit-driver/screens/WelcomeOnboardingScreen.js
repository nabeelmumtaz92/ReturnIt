import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

export default function WelcomeOnboardingScreen({ navigation }) {
  const [currentStep, setCurrentStep] = useState(0);

  const onboardingSteps = [
    {
      id: 0,
      icon: '🚗',
      title: 'Earn on Your Schedule',
      description: 'Set your own hours and accept jobs when it works for you. Full flexibility, full control.',
      color: '#FF6B35',
    },
    {
      id: 1,
      icon: '💰',
      title: 'Great Earnings',
      description: 'Keep 70% of every delivery fee, plus 100% of tips. Get paid weekly or instantly.',
      color: '#10B981',
    },
    {
      id: 2,
      icon: '📱',
      title: 'Easy Navigation',
      description: 'Get optimized routes, real-time GPS tracking, and turn-by-turn directions for every delivery.',
      color: '#F59E0B',
    },
    {
      id: 3,
      icon: '⭐',
      title: 'Build Your Reputation',
      description: 'Earn ratings and bonuses for excellent service. Top drivers get priority access to premium orders.',
      color: '#8B5CF6',
    },
  ];

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    handleGetStarted();
  };

  const handleGetStarted = () => {
    navigation.replace('Login');
  };

  const currentStepData = onboardingSteps[currentStep];

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipButtonText}>Skip</Text>
      </TouchableOpacity>

      {/* Content */}
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: currentStepData.color + '20' }]}>
          <Text style={styles.icon}>{currentStepData.icon}</Text>
        </View>

        <Text style={styles.title}>{currentStepData.title}</Text>
        <Text style={styles.description}>{currentStepData.description}</Text>
      </View>

      {/* Progress Dots */}
      <View style={styles.dotsContainer}>
        {onboardingSteps.map((step) => (
          <View
            key={step.id}
            style={[
              styles.dot,
              currentStep === step.id && styles.dotActive,
              { backgroundColor: currentStep === step.id ? currentStepData.color : '#E5E3DD' }
            ]}
          />
        ))}
      </View>

      {/* Navigation Buttons */}
      <View style={styles.buttonsContainer}>
        {currentStep > 0 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentStep(currentStep - 1)}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: currentStepData.color }]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Branding */}
      <View style={styles.brandingContainer}>
        <Text style={styles.brandingText}>ReturnIt Driver</Text>
        <Text style={styles.brandingSubtext}>Deliver Returns, Earn Money</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F7F4',
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipButtonText: {
    fontSize: 16,
    color: '#92400E',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4A3F35',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 17,
    color: '#6B5B4F',
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 320,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 40,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 32,
  },
  buttonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  backButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E3DD',
  },
  backButtonText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#4A3F35',
  },
  nextButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  brandingContainer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  brandingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A3F35',
    letterSpacing: -0.5,
  },
  brandingSubtext: {
    fontSize: 12,
    color: '#92400E',
    marginTop: 4,
  },
});

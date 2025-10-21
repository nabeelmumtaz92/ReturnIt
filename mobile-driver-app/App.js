import { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import LoginScreen from './src/screens/LoginScreen';
import AvailableJobsScreen from './src/screens/AvailableJobsScreen';
import JobDetailsScreen from './src/screens/JobDetailsScreen';
import ActiveJobScreen from './src/screens/ActiveJobScreen';
import CameraScreen from './src/screens/CameraScreen';
import EarningsScreen from './src/screens/EarningsScreen';
import PayoutScreen from './src/screens/PayoutScreen';
import { COLORS } from './src/constants/theme';

export default function App() {
  const [user, setUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('login'); // login, jobs, jobDetails, activeJob, camera, earnings, payout
  const [selectedJob, setSelectedJob] = useState(null);
  const [activeJob, setActiveJob] = useState(null);
  const [cameraCallback, setCameraCallback] = useState(null);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setCurrentScreen('jobs');
  };

  const handleSelectJob = (job) => {
    setSelectedJob(job);
    setCurrentScreen('jobDetails');
  };

  const handleAcceptJob = (job) => {
    setActiveJob(job);
    setSelectedJob(null);
    setCurrentScreen('activeJob');
  };

  const handleTakePhoto = () => {
    return new Promise((resolve) => {
      setCameraCallback(() => resolve);
      setCurrentScreen('camera');
    });
  };

  const handlePhotoTaken = (photoUri) => {
    if (cameraCallback) {
      cameraCallback(photoUri);
      setCameraCallback(null);
    }
    setCurrentScreen('activeJob');
  };

  const handleGetSignature = () => {
    return new Promise((resolve) => {
      // For simplicity, return a mock signature
      // In a real app, you'd navigate to a signature capture screen
      Alert.alert(
        'Signature',
        'Get store employee signature on receipt',
        [
          {
            text: 'Got Signature',
            onPress: () => resolve('signature_mock_' + Date.now()),
          },
        ]
      );
    });
  };

  const handleCompleteJob = (data) => {
    Alert.alert(
      'Job Complete!',
      'Great work! Earnings have been added to your account.',
      [
        {
          text: 'View Earnings',
          onPress: () => {
            setActiveJob(null);
            setCurrentScreen('earnings');
          },
        },
        {
          text: 'Find More Jobs',
          onPress: () => {
            setActiveJob(null);
            setCurrentScreen('jobs');
          },
        },
      ]
    );
  };

  const handleRequestPayout = () => {
    setCurrentScreen('payout');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
      
      case 'jobs':
        return (
          <AvailableJobsScreen 
            onSelectJob={handleSelectJob}
            onViewEarnings={() => setCurrentScreen('earnings')}
          />
        );
      
      case 'jobDetails':
        return (
          <JobDetailsScreen
            job={selectedJob}
            onAccept={handleAcceptJob}
            onBack={() => setCurrentScreen('jobs')}
          />
        );
      
      case 'activeJob':
        return (
          <ActiveJobScreen
            job={activeJob}
            onTakePhoto={handleTakePhoto}
            onGetSignature={handleGetSignature}
            onComplete={handleCompleteJob}
          />
        );
      
      case 'camera':
        return (
          <CameraScreen
            onPhotoTaken={handlePhotoTaken}
            onCancel={() => setCurrentScreen('activeJob')}
          />
        );
      
      case 'earnings':
        return (
          <EarningsScreen 
            onRequestPayout={handleRequestPayout}
            onBack={() => setCurrentScreen('jobs')}
          />
        );
      
      case 'payout':
        return (
          <PayoutScreen
            availableBalance={145.80}
            onBack={() => setCurrentScreen('earnings')}
          />
        );
      
      default:
        return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {renderScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});

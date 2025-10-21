import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Linking } from 'react-native';
import Button from '../components/Button';
import { COLORS, SPACING, FONTS } from '../constants/theme';

export default function ActiveJobScreen({ job, onTakePhoto, onGetSignature, onComplete }) {
  const [step, setStep] = useState('pickup'); // pickup, enRoute, dropoff
  const [pickupPhoto, setPickupPhoto] = useState(null);
  const [dropoffPhoto, setDropoffPhoto] = useState(null);
  const [signature, setSignature] = useState(null);

  const openNavigation = (address) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
    Linking.openURL(url);
  };

  const handleTakePhoto = async (type) => {
    try {
      const photo = await onTakePhoto();
      if (type === 'pickup') {
        setPickupPhoto(photo);
        setStep('enRoute');
      } else {
        setDropoffPhoto(photo);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to capture photo');
    }
  };

  const handleGetSignature = async () => {
    try {
      const sig = await onGetSignature();
      setSignature(sig);
    } catch (error) {
      Alert.alert('Error', 'Failed to capture signature');
    }
  };

  const handleComplete = () => {
    if (!pickupPhoto) {
      Alert.alert('Missing Photo', 'Please take a pickup photo');
      return;
    }
    if (!dropoffPhoto) {
      Alert.alert('Missing Photo', 'Please take a dropoff photo');
      return;
    }
    if (!signature) {
      Alert.alert('Missing Signature', 'Please get store receipt signature');
      return;
    }

    onComplete({
      pickupPhoto,
      dropoffPhoto,
      signature,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🚗 Active Delivery</Text>
        <View style={styles.stepIndicator}>
          <StepDot active={step === 'pickup'} complete={pickupPhoto} label="📦" />
          <StepLine complete={pickupPhoto} />
          <StepDot active={step === 'enRoute'} complete={dropoffPhoto} label="🚗" />
          <StepLine complete={dropoffPhoto} />
          <StepDot active={step === 'dropoff'} complete={signature} label="🏬" />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Pickup Section */}
        <View style={[styles.section, step === 'pickup' && styles.sectionActive]}>
          <Text style={styles.sectionTitle}>
            📦 Step 1: Pickup Package
          </Text>
          <View style={styles.addressCard}>
            <Text style={styles.addressText}>{job.pickupAddress || '123 Main St, St. Louis, MO'}</Text>
            <Text style={styles.instructionsText}>{job.pickupInstructions || 'Ring doorbell'}</Text>
            <Button
              title="🗺️ Navigate to Pickup"
              onPress={() => openNavigation(job.pickupAddress || '123 Main St, St. Louis, MO')}
              variant="outline"
              style={styles.navButton}
            />
          </View>
          <Button
            title={pickupPhoto ? '✓ Photo Taken' : '📸 Take Pickup Photo'}
            onPress={() => handleTakePhoto('pickup')}
            variant={pickupPhoto ? 'secondary' : 'primary'}
            disabled={pickupPhoto !== null}
          />
        </View>

        {/* En Route Section */}
        {pickupPhoto && (
          <View style={[styles.section, step === 'enRoute' && styles.sectionActive]}>
            <Text style={styles.sectionTitle}>
              🚗 Step 2: En Route to Store
            </Text>
            <View style={styles.addressCard}>
              <Text style={styles.storeName}>{job.storeName || 'Target'}</Text>
              <Text style={styles.addressText}>{job.storeAddress || '456 Store Ave, St. Louis, MO'}</Text>
              <Button
                title="🗺️ Navigate to Store"
                onPress={() => openNavigation(job.storeAddress || '456 Store Ave, St. Louis, MO')}
                variant="outline"
                style={styles.navButton}
              />
            </View>
            <Button
              title="Arrived at Store"
              onPress={() => setStep('dropoff')}
            />
          </View>
        )}

        {/* Dropoff Section */}
        {step === 'dropoff' && (
          <View style={[styles.section, styles.sectionActive]}>
            <Text style={styles.sectionTitle}>
              🏬 Step 3: Complete Dropoff
            </Text>
            
            <View style={styles.checklistCard}>
              <Text style={styles.checklistTitle}>✓ Dropoff Checklist</Text>
              <ChecklistItem 
                done={dropoffPhoto} 
                text="Take photo of package at customer service" 
              />
              <ChecklistItem 
                done={signature} 
                text="Get store employee signature on receipt" 
              />
            </View>

            <Button
              title={dropoffPhoto ? '✓ Photo Taken' : '📸 Take Dropoff Photo'}
              onPress={() => handleTakePhoto('dropoff')}
              variant={dropoffPhoto ? 'secondary' : 'primary'}
              disabled={dropoffPhoto !== null}
              style={styles.actionButton}
            />

            <Button
              title={signature ? '✓ Signature Captured' : '✍️ Get Signature'}
              onPress={handleGetSignature}
              variant={signature ? 'secondary' : 'primary'}
              disabled={signature !== null}
              style={styles.actionButton}
            />

            <View style={styles.completeSection}>
              <Button
                title="✓ Complete Delivery"
                onPress={handleComplete}
                disabled={!pickupPhoto || !dropoffPhoto || !signature}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function StepDot({ active, complete, label }) {
  return (
    <View style={[
      styles.stepDot,
      active && styles.stepDotActive,
      complete && styles.stepDotComplete,
    ]}>
      <Text style={styles.stepDotText}>{complete ? '✓' : label}</Text>
    </View>
  );
}

function StepLine({ complete }) {
  return (
    <View style={[styles.stepLine, complete && styles.stepLineComplete]} />
  );
}

function ChecklistItem({ done, text }) {
  return (
    <View style={styles.checklistItem}>
      <Text style={styles.checklistIcon}>{done ? '✅' : '⬜'}</Text>
      <Text style={[styles.checklistText, done && styles.checklistTextDone]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: FONTS.size.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.disabled,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: COLORS.primary,
  },
  stepDotComplete: {
    backgroundColor: COLORS.success,
  },
  stepDotText: {
    fontSize: FONTS.size.md,
    color: COLORS.surface,
    fontWeight: 'bold',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.disabled,
    marginHorizontal: SPACING.xs,
  },
  stepLineComplete: {
    backgroundColor: COLORS.success,
  },
  scrollContainer: {
    padding: SPACING.md,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    opacity: 0.6,
  },
  sectionActive: {
    opacity: 1,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  sectionTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  addressCard: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  storeName: {
    fontSize: FONTS.size.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  addressText: {
    fontSize: FONTS.size.sm,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  instructionsText: {
    fontSize: FONTS.size.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginBottom: SPACING.md,
  },
  navButton: {
    marginTop: SPACING.sm,
  },
  checklistCard: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  checklistTitle: {
    fontSize: FONTS.size.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  checklistIcon: {
    fontSize: FONTS.size.lg,
    marginRight: SPACING.sm,
  },
  checklistText: {
    fontSize: FONTS.size.sm,
    color: COLORS.text,
    flex: 1,
  },
  checklistTextDone: {
    textDecorationLine: 'line-through',
    color: COLORS.textSecondary,
  },
  actionButton: {
    marginBottom: SPACING.sm,
  },
  completeSection: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
});

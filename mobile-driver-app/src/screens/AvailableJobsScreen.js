import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import * as Location from 'expo-location';
import ApiService from '../services/api';
import JobClusterMap from '../components/JobClusterMap';
import { COLORS, SPACING, FONTS } from '../constants/theme';
import { PAYOUT_SPLIT } from '../constants/config';

export default function AvailableJobsScreen({ onSelectJob }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    getLocationAndJobs();
  }, []);

  const getLocationAndJobs = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location access is needed to find nearby jobs');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);
      
      await fetchJobs(currentLocation.coords);
    } catch (error) {
      Alert.alert('Error', 'Could not get location');
    }
  };

  const fetchJobs = async (coords) => {
    setLoading(true);
    try {
      const availableJobs = await ApiService.getAvailableJobs(coords);
      setJobs(availableJobs);
    } catch (error) {
      Alert.alert('Error', 'Failed to load jobs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (location) {
      fetchJobs(location);
    } else {
      getLocationAndJobs();
    }
  };

  const calculateDriverPayout = (amount) => {
    return (amount * PAYOUT_SPLIT.DRIVER).toFixed(2);
  };

  const renderJob = ({ item }) => (
    <TouchableOpacity 
      style={styles.jobCard} 
      onPress={() => onSelectJob(item)}
      activeOpacity={0.7}
    >
      <View style={styles.jobHeader}>
        <View style={styles.jobBadge}>
          <Text style={styles.jobBadgeText}>{item.distance || '0.5'} mi</Text>
        </View>
        <View style={styles.earningsBox}>
          <Text style={styles.earningsLabel}>You Earn</Text>
          <Text style={styles.earningsAmount}>${calculateDriverPayout(item.price || 12)}</Text>
        </View>
      </View>

      <Text style={styles.jobTitle}>{item.packageCount || 1} Box{item.packageCount > 1 ? 'es' : ''}/Bag{item.packageCount > 1 ? 's' : ''}</Text>
      
      <View style={styles.locationRow}>
        <Text style={styles.locationIcon}>📍</Text>
        <View style={styles.locationInfo}>
          <Text style={styles.locationLabel}>Pickup</Text>
          <Text style={styles.locationText}>{item.pickupAddress || 'Customer Location'}</Text>
        </View>
      </View>

      <View style={styles.locationRow}>
        <Text style={styles.locationIcon}>🏬</Text>
        <View style={styles.locationInfo}>
          <Text style={styles.locationLabel}>Drop-off</Text>
          <Text style={styles.locationText}>{item.storeName || 'Target - St. Louis'}</Text>
        </View>
      </View>

      {item.notes && (
        <View style={styles.notesBox}>
          <Text style={styles.notesText}>📝 {item.notes}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🔍</Text>
      <Text style={styles.emptyTitle}>No Jobs Available</Text>
      <Text style={styles.emptyText}>Pull down to refresh and check for new deliveries</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📦 Available Jobs</Text>
        <Text style={styles.headerSubtitle}>Tap a job to view details</Text>
      </View>

      <FlatList
        data={jobs}
        renderItem={renderJob}
        keyExtractor={(item, index) => item.id || index.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          jobs.length > 0 ? (
            <JobClusterMap jobs={jobs} userLocation={location} />
          ) : null
        }
        ListEmptyComponent={!loading && renderEmpty()}
      />
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
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: FONTS.size.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: FONTS.size.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  listContainer: {
    padding: SPACING.md,
  },
  jobCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  jobBadge: {
    backgroundColor: COLORS.accent,
    borderRadius: 6,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  jobBadgeText: {
    fontSize: FONTS.size.sm,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  earningsBox: {
    alignItems: 'flex-end',
  },
  earningsLabel: {
    fontSize: FONTS.size.xs,
    color: COLORS.textSecondary,
  },
  earningsAmount: {
    fontSize: FONTS.size.xl,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  jobTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  locationIcon: {
    fontSize: FONTS.size.lg,
    marginRight: SPACING.sm,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: FONTS.size.xs,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  locationText: {
    fontSize: FONTS.size.sm,
    color: COLORS.text,
  },
  notesBox: {
    backgroundColor: COLORS.accent,
    borderRadius: 6,
    padding: SPACING.sm,
    marginTop: SPACING.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  notesText: {
    fontSize: FONTS.size.sm,
    color: COLORS.text,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    marginTop: SPACING.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: FONTS.size.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

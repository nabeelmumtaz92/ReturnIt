import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { COLORS, SPACING, FONTS } from '../constants/theme';

const { width } = Dimensions.get('window');

// AI-Powered Cluster Visualization Component
export default function JobClusterMap({ jobs, userLocation }) {
  // Group jobs by proximity (cluster algorithm)
  const clusterJobs = (jobs, threshold = 0.5) => {
    const clusters = [];
    const processed = new Set();

    jobs.forEach((job, index) => {
      if (processed.has(index)) return;

      const cluster = {
        jobs: [job],
        centerLat: parseFloat(job.latitude) || 0,
        centerLng: parseFloat(job.longitude) || 0,
        totalEarnings: job.price || 12,
      };

      // Find nearby jobs within threshold distance
      jobs.forEach((otherJob, otherIndex) => {
        if (index === otherIndex || processed.has(otherIndex)) return;

        const distance = calculateDistance(
          cluster.centerLat,
          cluster.centerLng,
          parseFloat(otherJob.latitude) || 0,
          parseFloat(otherJob.longitude) || 0
        );

        if (distance <= threshold) {
          cluster.jobs.push(otherJob);
          cluster.totalEarnings += otherJob.price || 12;
          processed.add(otherIndex);
        }
      });

      processed.add(index);
      clusters.push(cluster);
    });

    return clusters;
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 3959; // Earth's radius in miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const clusters = clusterJobs(jobs);

  // AI Detection: Recommend best cluster based on earnings/distance ratio
  const recommendedCluster = clusters.reduce((best, current) => {
    const currentScore = current.totalEarnings * 0.7; // Driver's 70% split
    const bestScore = best ? best.totalEarnings * 0.7 : 0;
    return currentScore > bestScore ? current : best;
  }, null);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎯 AI Job Clusters</Text>
        <Text style={styles.headerSubtitle}>
          {clusters.length} cluster{clusters.length !== 1 ? 's' : ''} detected nearby
        </Text>
      </View>

      <View style={styles.clustersContainer}>
        {clusters.map((cluster, index) => {
          const isRecommended = cluster === recommendedCluster;
          const driverEarnings = (cluster.totalEarnings * 0.7).toFixed(2);

          return (
            <View
              key={index}
              style={[
                styles.clusterCard,
                isRecommended && styles.clusterCardRecommended,
              ]}
            >
              {isRecommended && (
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedBadgeText}>⭐ AI RECOMMENDED</Text>
                </View>
              )}

              <View style={styles.clusterHeader}>
                <View style={styles.clusterIcon}>
                  <Text style={styles.clusterIconText}>📍</Text>
                  <Text style={styles.clusterCount}>{cluster.jobs.length}</Text>
                </View>
                <View style={styles.clusterInfo}>
                  <Text style={styles.clusterTitle}>
                    {cluster.jobs.length} Job{cluster.jobs.length > 1 ? 's' : ''}
                  </Text>
                  <Text style={styles.clusterEarnings}>
                    You Earn: ${driverEarnings}
                  </Text>
                </View>
              </View>

              <View style={styles.jobsList}>
                {cluster.jobs.map((job, jobIndex) => (
                  <Text key={jobIndex} style={styles.jobItem}>
                    • {job.storeName || 'Store'} - ${((job.price || 12) * 0.7).toFixed(2)}
                  </Text>
                ))}
              </View>

              {cluster.jobs.length > 1 && (
                <View style={styles.multiStopBadge}>
                  <Text style={styles.multiStopText}>
                    🚗 Multi-Stop Route Available
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </View>

      {clusters.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyText}>No job clusters detected</Text>
          <Text style={styles.emptySubtext}>Pull down to refresh</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.md,
  },
  header: {
    marginBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: FONTS.size.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  clustersContainer: {
    gap: SPACING.md,
  },
  clusterCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginBottom: SPACING.md,
  },
  clusterCardRecommended: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.accent,
  },
  recommendedBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    alignSelf: 'flex-start',
    marginBottom: SPACING.sm,
  },
  recommendedBadgeText: {
    color: COLORS.surface,
    fontSize: FONTS.size.xs,
    fontWeight: 'bold',
  },
  clusterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  clusterIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    position: 'relative',
  },
  clusterIconText: {
    fontSize: FONTS.size.xl,
  },
  clusterCount: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: COLORS.error,
    color: COLORS.surface,
    fontSize: FONTS.size.xs,
    fontWeight: 'bold',
    borderRadius: 10,
    width: 20,
    height: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  clusterInfo: {
    flex: 1,
  },
  clusterTitle: {
    fontSize: FONTS.size.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  clusterEarnings: {
    fontSize: FONTS.size.lg,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  jobsList: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  jobItem: {
    fontSize: FONTS.size.sm,
    color: COLORS.text,
    marginBottom: 4,
  },
  multiStopBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    padding: SPACING.xs,
    alignItems: 'center',
  },
  multiStopText: {
    color: COLORS.surface,
    fontSize: FONTS.size.xs,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: FONTS.size.md,
    color: COLORS.text,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: FONTS.size.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
});

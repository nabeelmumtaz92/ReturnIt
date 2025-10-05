import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import apiClient from '../services/api-client';
import ErrorHandler from '../services/error-handler';

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await apiClient.request('/api/notifications');
      setNotifications(response || []);
    } catch (err) {
      const appError = ErrorHandler.handleAPIError(err);
      ErrorHandler.logError(appError, { screen: 'Notifications' });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const markAsRead = async (notificationId) => {
    try {
      await apiClient.request(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH'
      });
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ));
    } catch (err) {
      console.error('Mark as read error:', err);
    }
  };

  const markAsUnread = async (notificationId) => {
    try {
      await apiClient.request(`/api/notifications/${notificationId}/unread`, {
        method: 'PATCH'
      });
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, isRead: false } : n
      ));
    } catch (err) {
      console.error('Mark as unread error:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.request('/api/notifications/mark-all-read', {
        method: 'POST'
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Mark all as read error:', err);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await apiClient.request(`/api/notifications/${notificationId}`, {
        method: 'DELETE'
      });
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (err) {
      console.error('Delete notification error:', err);
    }
  };

  const getFilteredNotifications = () => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => !n.isRead);
      case 'orders':
        return notifications.filter(n => n.type === 'order_update');
      case 'promotions':
        return notifications.filter(n => n.type === 'promotion');
      default:
        return notifications;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order_update': return '📦';
      case 'payment': return '💳';
      case 'promotion': return '🎉';
      case 'system': return '🔔';
      default: return '📨';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.isRead).length;

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
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Notifications</Text>
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Bar */}
        <View style={styles.actionBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
            {['all', 'unread', 'orders', 'promotions'].map(f => (
              <TouchableOpacity
                key={f}
                style={[styles.filterButton, filter === f && styles.filterButtonActive]}
                onPress={() => setFilter(f)}
              >
                <Text style={[styles.filterButtonText, filter === f && styles.filterButtonTextActive]}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {unreadCount > 0 && (
            <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
              <Text style={styles.markAllButtonText}>Mark All Read</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptyText}>
              {filter === 'all' ? 
                "You're all caught up!" : 
                `No ${filter} notifications`}
            </Text>
          </View>
        ) : (
          <View style={styles.notificationsList}>
            {filteredNotifications.map((notification) => (
              <View key={notification.id} style={[styles.notificationCard, !notification.isRead && styles.notificationCardUnread]}>
                <View style={styles.notificationHeader}>
                  <View style={styles.notificationIconContainer}>
                    <Text style={styles.notificationIcon}>{getNotificationIcon(notification.type)}</Text>
                  </View>
                  <View style={styles.notificationContent}>
                    <View style={styles.notificationTitleRow}>
                      <Text style={[styles.notificationTitle, !notification.isRead && styles.notificationTitleUnread]}>
                        {notification.title}
                      </Text>
                      {!notification.isRead && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.notificationMessage}>{notification.message}</Text>
                    <Text style={styles.notificationTime}>{formatTimestamp(notification.createdAt)}</Text>
                    
                    {/* Action Buttons */}
                    <View style={styles.actionButtons}>
                      {notification.isRead ? (
                        <TouchableOpacity
                          style={styles.markUnreadButton}
                          onPress={() => markAsUnread(notification.id)}
                        >
                          <Text style={styles.markUnreadButtonText}>Mark as Unread</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={styles.markReadButton}
                          onPress={() => markAsRead(notification.id)}
                        >
                          <Text style={styles.markReadButtonText}>Mark as Read</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteNotification(notification.id)}
                >
                  <Text style={styles.deleteButtonText}>✕</Text>
                </TouchableOpacity>
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
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4A3F35',
    letterSpacing: -0.5,
  },
  unreadBadge: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionBar: {
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E3DD',
  },
  filterContainer: {
    marginBottom: 10,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8F7F4',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E3DD',
  },
  filterButtonActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  markAllButton: {
    alignSelf: 'flex-end',
    paddingVertical: 6,
  },
  markAllButtonText: {
    color: '#FF6B35',
    fontSize: 14,
    fontWeight: '600',
  },
  notificationsList: {
    padding: 15,
  },
  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E5E3DD',
  },
  notificationCardUnread: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
    backgroundColor: '#FFF8F5',
  },
  notificationHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F7F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationIcon: {
    fontSize: 20,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A3F35',
  },
  notificationTitleUnread: {
    fontWeight: '700',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B35',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6B5B4F',
    lineHeight: 20,
    marginBottom: 6,
  },
  notificationTime: {
    fontSize: 12,
    color: '#92400E',
  },
  deleteButton: {
    padding: 4,
    marginLeft: 8,
  },
  deleteButtonText: {
    fontSize: 20,
    color: '#92400E',
  },
  actionButtons: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 8,
  },
  markReadButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#E0F2FE',
    borderWidth: 1,
    borderColor: '#0284C7',
  },
  markReadButtonText: {
    fontSize: 12,
    color: '#0284C7',
    fontWeight: '600',
  },
  markUnreadButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#EA580C',
  },
  markUnreadButtonText: {
    fontSize: 12,
    color: '#EA580C',
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A3F35',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#92400E',
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#92400E',
  },
});

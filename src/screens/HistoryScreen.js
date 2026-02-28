import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

function formatCurrency(value) {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  return `${sign}$${Math.round(abs).toLocaleString('en-US')}`;
}

function formatFullDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function HistoryScreen() {
  const { snapshots, deleteSnapshot } = useApp();

  const handleDelete = (snapshot) => {
    Alert.alert('Delete Snapshot', 'Remove this snapshot from your history?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteSnapshot(snapshot.id),
      },
    ]);
  };

  const renderItem = ({ item, index }) => {
    // Compare to previous snapshot (next in array = older)
    const prev = snapshots[index + 1];
    const change = prev != null ? item.netWorth - prev.netWorth : null;
    const isGain = change != null && change >= 0;
    const isPositiveNW = item.netWorth >= 0;

    return (
      <View style={styles.card}>
        {/* Date row */}
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.dateText}>{formatFullDate(item.date)}</Text>
            <Text style={styles.timeText}>{formatTime(item.date)}</Text>
          </View>
          <TouchableOpacity
            onPress={() => handleDelete(item)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={18} color="#BDBDBD" />
          </TouchableOpacity>
        </View>

        {/* Net worth */}
        <Text style={[styles.netWorthValue, { color: isPositiveNW ? '#1B5E20' : '#C62828' }]}>
          {formatCurrency(item.netWorth)}
        </Text>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Assets</Text>
            <Text style={[styles.statValue, { color: '#1B5E20' }]}>
              +{formatCurrency(item.totalAssets)}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Liabilities</Text>
            <Text style={[styles.statValue, { color: '#C62828' }]}>
              -{formatCurrency(item.totalLiabilities)}
            </Text>
          </View>
          {change != null && (
            <>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statLabel}>vs Prior</Text>
                <View style={styles.changeRow}>
                  <Ionicons
                    name={isGain ? 'arrow-up' : 'arrow-down'}
                    size={12}
                    color={isGain ? '#1B5E20' : '#C62828'}
                  />
                  <Text style={[styles.statValue, { color: isGain ? '#1B5E20' : '#C62828' }]}>
                    {formatCurrency(Math.abs(change))}
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Account count */}
        <Text style={styles.accountCount}>
          {item.accounts.length} account{item.accounts.length !== 1 ? 's' : ''} at time of snapshot
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>History</Text>
        {snapshots.length > 0 && (
          <Text style={styles.headerCount}>
            {snapshots.length} snapshot{snapshots.length !== 1 ? 's' : ''}
          </Text>
        )}
      </View>

      {snapshots.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="time-outline" size={48} color="#BDBDBD" />
          </View>
          <Text style={styles.emptyTitle}>No snapshots yet</Text>
          <Text style={styles.emptySubtitle}>
            Go to the Dashboard tab and tap "Save Snapshot" to record your net worth at this moment
            in time.
          </Text>
        </View>
      ) : (
        <FlatList
          data={snapshots}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },

  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#1A1A1A' },
  headerCount: { fontSize: 14, color: '#9E9E9E', fontWeight: '500' },

  listContent: { paddingHorizontal: 16, paddingBottom: 32, gap: 12 },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  dateText: { fontSize: 14, fontWeight: '600', color: '#424242' },
  timeText: { fontSize: 12, color: '#9E9E9E', marginTop: 2 },

  netWorthValue: { fontSize: 32, fontWeight: '800', letterSpacing: -0.5, marginBottom: 14 },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  stat: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 11, color: '#9E9E9E', fontWeight: '600', letterSpacing: 0.3, marginBottom: 3 },
  statValue: { fontSize: 13, fontWeight: '700' },
  statDivider: { width: 1, height: 28, backgroundColor: '#E8E8E8' },
  changeRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },

  accountCount: { fontSize: 12, color: '#BDBDBD' },

  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingBottom: 60,
  },
  emptyIcon: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#424242', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#9E9E9E', textAlign: 'center', lineHeight: 22 },
});

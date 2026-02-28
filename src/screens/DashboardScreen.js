import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

function formatCurrency(value) {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1_000_000) {
    return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  }
  if (abs >= 1_000) {
    return `${sign}$${Math.round(abs).toLocaleString('en-US')}`;
  }
  return `${sign}$${abs.toFixed(2)}`;
}

function formatShortDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function DashboardScreen() {
  const { netWorth, totalAssets, totalLiabilities, snapshots, takeSnapshot } = useApp();

  const isPositive = netWorth >= 0;
  const gradientColors = isPositive
    ? ['#1B5E20', '#2E7D32', '#43A047']
    : ['#B71C1C', '#C62828', '#E53935'];

  // Build chart from last 10 snapshots (oldest → newest)
  const chartSnapshots = [...snapshots].reverse().slice(-10);
  const hasChartData = chartSnapshots.length >= 2;

  const chartData = hasChartData
    ? {
        labels: chartSnapshots.map((s) => formatShortDate(s.date)),
        datasets: [{ data: chartSnapshots.map((s) => s.netWorth) }],
      }
    : null;

  const handleTakeSnapshot = () => {
    Alert.alert(
      'Save Snapshot',
      'Record your current net worth as a dated snapshot?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save Snapshot',
          onPress: () => {
            takeSnapshot();
            Alert.alert('Saved!', 'Snapshot recorded successfully.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Hero card */}
        <LinearGradient colors={gradientColors} style={styles.hero}>
          <Text style={styles.heroLabel}>CURRENT NET WORTH</Text>
          <Text style={styles.heroValue} adjustsFontSizeToFit numberOfLines={1}>
            {formatCurrency(netWorth)}
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="trending-up" size={16} color="#A5D6A7" />
              <Text style={styles.statLabel}>Total Assets</Text>
              <Text style={styles.statValue}>{formatCurrency(totalAssets)}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="trending-down" size={16} color="#EF9A9A" />
              <Text style={styles.statLabel}>Total Liabilities</Text>
              <Text style={styles.statValue}>{formatCurrency(totalLiabilities)}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.snapshotBtn} onPress={handleTakeSnapshot}>
            <Ionicons name="camera-outline" size={18} color="#FFFFFF" />
            <Text style={styles.snapshotBtnText}>Save Snapshot</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* History chart */}
        {hasChartData && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Net Worth History</Text>
            <LineChart
              data={chartData}
              width={width - 64}
              height={180}
              chartConfig={{
                backgroundColor: '#FFFFFF',
                backgroundGradientFrom: '#FFFFFF',
                backgroundGradientTo: '#FFFFFF',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(27, 94, 32, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(120, 120, 120, ${opacity})`,
                propsForDots: {
                  r: '4',
                  strokeWidth: '2',
                  stroke: '#1B5E20',
                  fill: '#FFFFFF',
                },
                formatYLabel: (v) => {
                  const n = parseFloat(v);
                  if (Math.abs(n) >= 1000) return `$${Math.round(n / 1000)}k`;
                  return `$${Math.round(n)}`;
                },
              }}
              bezier
              style={styles.chart}
              withInnerLines={false}
              withOuterLines={false}
            />
          </View>
        )}

        {/* Tip when no history */}
        {!hasChartData && (
          <View style={styles.tipCard}>
            <Ionicons name="information-circle-outline" size={22} color="#1B5E20" />
            <Text style={styles.tipText}>
              Take 2 or more snapshots to see your net worth history chart here.
            </Text>
          </View>
        )}

        {/* Snapshot count summary */}
        {snapshots.length > 0 && (
          <View style={styles.summaryCard}>
            <Ionicons name="time-outline" size={20} color="#757575" />
            <Text style={styles.summaryText}>
              {snapshots.length} snapshot{snapshots.length !== 1 ? 's' : ''} recorded
            </Text>
            {snapshots.length >= 2 && (() => {
              const latest = snapshots[0].netWorth;
              const oldest = snapshots[snapshots.length - 1].netWorth;
              const change = latest - oldest;
              const isGain = change >= 0;
              return (
                <Text style={[styles.summaryChange, { color: isGain ? '#1B5E20' : '#C62828' }]}>
                  {isGain ? '+' : ''}{formatCurrency(change)} all time
                </Text>
              );
            })()}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  scroll: { paddingBottom: 32 },

  // Hero
  hero: {
    margin: 16,
    borderRadius: 24,
    padding: 24,
    paddingBottom: 20,
  },
  heroLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 6,
  },
  heroValue: {
    color: '#FFFFFF',
    fontSize: 52,
    fontWeight: '800',
    marginBottom: 20,
    letterSpacing: -1,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 14,
    padding: 14,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statLabel: { color: 'rgba(255,255,255,0.65)', fontSize: 11, marginTop: 4, fontWeight: '500' },
  statValue: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', marginTop: 2 },
  statDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.25)' },

  snapshotBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  snapshotBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },

  // Cards
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 14 },
  chart: { borderRadius: 12, marginLeft: -8 },

  tipCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tipText: { color: '#2E7D32', fontSize: 14, flex: 1, lineHeight: 20 },

  summaryCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryText: { flex: 1, fontSize: 14, color: '#424242' },
  summaryChange: { fontSize: 14, fontWeight: '700' },
});

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32; // 16px margin each side
const CHART_WIDTH = CARD_WIDTH - 32; // inner padding

const ASSET_PALETTE = ['#1B5E20', '#2E7D32', '#388E3C', '#43A047', '#4CAF50', '#66BB6A', '#81C784', '#A5D6A7'];
const LIABILITY_PALETTE = ['#B71C1C', '#C62828', '#D32F2F', '#E53935', '#F44336', '#EF5350', '#E57373', '#EF9A9A'];

function shortLabel(value) {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(abs / 1_000).toFixed(0)}k`;
  return `$${Math.round(abs)}`;
}

function formatCurrency(value) {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  return `${sign}$${Math.round(abs).toLocaleString('en-US')}`;
}

function formatShortDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function groupByCategory(accounts, type) {
  return accounts
    .filter((a) => a.type === type)
    .reduce((acc, a) => {
      acc[a.category] = (acc[a.category] || 0) + a.value;
      return acc;
    }, {});
}

function EmptyCard({ title, message }) {
  return (
    <View style={[styles.card, styles.emptyCard]}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Ionicons name="bar-chart-outline" size={36} color="#E0E0E0" style={{ marginBottom: 8 }} />
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

function Legend({ keys, values, palette }) {
  const total = values.reduce((s, v) => s + v, 0);
  return (
    <View style={styles.legend}>
      {keys.map((key, i) => {
        const pct = total > 0 ? ((values[i] / total) * 100).toFixed(1) : '0.0';
        return (
          <View key={key} style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: palette[i % palette.length] }]} />
            <Text style={styles.legendLabel} numberOfLines={1}>
              {key}
            </Text>
            <Text style={styles.legendPct}>{pct}%</Text>
            <Text style={styles.legendValue}>{formatCurrency(values[i])}</Text>
          </View>
        );
      })}
    </View>
  );
}

export default function ChartsScreen() {
  const { snapshots, accounts, netWorth, totalAssets, totalLiabilities } = useApp();

  // ── Net worth history (oldest → newest, max 12) ──
  const historyData = [...snapshots].reverse().slice(-12);
  const hasHistory = historyData.length >= 2;

  // ── Category breakdowns ──
  const assetMap = groupByCategory(accounts, 'asset');
  const liabilityMap = groupByCategory(accounts, 'liability');
  const assetKeys = Object.keys(assetMap);
  const assetValues = assetKeys.map((k) => assetMap[k]);
  const liabilityKeys = Object.keys(liabilityMap);
  const liabilityValues = liabilityKeys.map((k) => liabilityMap[k]);

  const hasAssets = assetKeys.length > 0;
  const hasLiabilities = liabilityKeys.length > 0;

  const baseChartConfig = {
    backgroundColor: '#FFFFFF',
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    decimalPlaces: 0,
    labelColor: () => 'rgba(140,140,140,1)',
    propsForDots: { r: '4', strokeWidth: '2', fill: '#FFFFFF' },
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.screenTitle}>Charts</Text>

        {/* ── Summary strip ── */}
        <View style={styles.summaryStrip}>
          <View style={styles.stripItem}>
            <Text style={styles.stripLabel}>Net Worth</Text>
            <Text style={[styles.stripValue, { color: netWorth >= 0 ? '#1B5E20' : '#C62828' }]}>
              {formatCurrency(netWorth)}
            </Text>
          </View>
          <View style={styles.stripDivider} />
          <View style={styles.stripItem}>
            <Text style={styles.stripLabel}>Assets</Text>
            <Text style={[styles.stripValue, { color: '#1B5E20' }]}>
              {formatCurrency(totalAssets)}
            </Text>
          </View>
          <View style={styles.stripDivider} />
          <View style={styles.stripItem}>
            <Text style={styles.stripLabel}>Liabilities</Text>
            <Text style={[styles.stripValue, { color: '#C62828' }]}>
              {formatCurrency(totalLiabilities)}
            </Text>
          </View>
        </View>

        {/* ── Net Worth Over Time ── */}
        {hasHistory ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Net Worth Over Time</Text>
            <Text style={styles.cardSubtitle}>
              {historyData.length} snapshots · {formatShortDate(historyData[0].date)} –{' '}
              {formatShortDate(historyData[historyData.length - 1].date)}
            </Text>
            <LineChart
              data={{
                labels: historyData.map((s) => formatShortDate(s.date)),
                datasets: [{ data: historyData.map((s) => s.netWorth) }],
              }}
              width={CHART_WIDTH}
              height={200}
              chartConfig={{
                ...baseChartConfig,
                color: (opacity = 1) => `rgba(27, 94, 32, ${opacity})`,
                propsForDots: { r: '4', strokeWidth: '2', stroke: '#1B5E20', fill: '#FFFFFF' },
                formatYLabel: shortLabel,
              }}
              bezier
              style={styles.chart}
              withInnerLines={false}
              withOuterLines={false}
              withShadow={false}
            />
          </View>
        ) : (
          <EmptyCard
            title="Net Worth Over Time"
            message="Take at least 2 snapshots from the Dashboard to see your history chart."
          />
        )}

        {/* ── Assets by Category ── */}
        {hasAssets ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Assets by Category</Text>
            <Text style={styles.cardSubtitle}>
              {assetKeys.length} {assetKeys.length === 1 ? 'category' : 'categories'} · total{' '}
              {formatCurrency(totalAssets)}
            </Text>
            <BarChart
              data={{
                labels: assetKeys.map((k) => k.split(' ')[0]),
                datasets: [{ data: assetValues }],
              }}
              width={CHART_WIDTH}
              height={200}
              chartConfig={{
                ...baseChartConfig,
                color: (opacity = 1) => `rgba(27, 94, 32, ${opacity})`,
                formatYLabel: shortLabel,
              }}
              style={styles.chart}
              showValuesOnTopOfBars
              withInnerLines={false}
              fromZero
            />
            <Legend keys={assetKeys} values={assetValues} palette={ASSET_PALETTE} />
          </View>
        ) : (
          <EmptyCard title="Assets by Category" message="Add asset accounts to see a breakdown." />
        )}

        {/* ── Liabilities by Category ── */}
        {hasLiabilities ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Liabilities by Category</Text>
            <Text style={styles.cardSubtitle}>
              {liabilityKeys.length} {liabilityKeys.length === 1 ? 'category' : 'categories'} ·
              total {formatCurrency(totalLiabilities)}
            </Text>
            <BarChart
              data={{
                labels: liabilityKeys.map((k) => k.split(' ')[0]),
                datasets: [{ data: liabilityValues }],
              }}
              width={CHART_WIDTH}
              height={200}
              chartConfig={{
                ...baseChartConfig,
                color: (opacity = 1) => `rgba(198, 40, 40, ${opacity})`,
                formatYLabel: shortLabel,
              }}
              style={styles.chart}
              showValuesOnTopOfBars
              withInnerLines={false}
              fromZero
            />
            <Legend keys={liabilityKeys} values={liabilityValues} palette={LIABILITY_PALETTE} />
          </View>
        ) : (
          <EmptyCard
            title="Liabilities by Category"
            message="Add liability accounts to see a breakdown."
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  scroll: { padding: 16, paddingBottom: 40 },
  screenTitle: { fontSize: 28, fontWeight: '800', color: '#1A1A1A', marginBottom: 16 },

  // Summary strip
  summaryStrip: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  stripItem: { flex: 1, alignItems: 'center' },
  stripLabel: { fontSize: 11, color: '#9E9E9E', fontWeight: '600', marginBottom: 4, letterSpacing: 0.3 },
  stripValue: { fontSize: 14, fontWeight: '700' },
  stripDivider: { width: 1, backgroundColor: '#F0F0F0', marginHorizontal: 4 },

  // Cards
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 2 },
  cardSubtitle: { fontSize: 12, color: '#9E9E9E', marginBottom: 14 },
  chart: { borderRadius: 12, marginLeft: -8 },

  emptyCard: { alignItems: 'center', paddingVertical: 28 },
  emptyText: { fontSize: 13, color: '#BDBDBD', textAlign: 'center', lineHeight: 20, maxWidth: 240 },

  // Legend
  legend: { marginTop: 16, gap: 10 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  legendLabel: { flex: 1, fontSize: 13, color: '#424242' },
  legendPct: { fontSize: 12, color: '#9E9E9E', width: 40, textAlign: 'right' },
  legendValue: { fontSize: 13, fontWeight: '700', color: '#1A1A1A', width: 72, textAlign: 'right' },
});

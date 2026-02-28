import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

function formatCurrency(value) {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `$${(abs / 1_000_000).toFixed(2)}M`;
  return `$${Math.round(abs).toLocaleString('en-US')}`;
}

export default function AccountsScreen({ navigation }) {
  const { accounts, deleteAccount, totalAssets, totalLiabilities, netWorth } = useApp();

  const assets = accounts.filter((a) => a.type === 'asset');
  const liabilities = accounts.filter((a) => a.type === 'liability');

  const sections = [];
  if (assets.length > 0) sections.push({ title: 'Assets', data: assets, type: 'asset' });
  if (liabilities.length > 0)
    sections.push({ title: 'Liabilities', data: liabilities, type: 'liability' });

  const handleDelete = (account) => {
    Alert.alert('Delete Account', `Delete "${account.name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteAccount(account.id),
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.accountRow}
      onPress={() => navigation.navigate('AddEditAccount', { account: item })}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.categoryBadge,
          { backgroundColor: item.type === 'asset' ? '#E8F5E9' : '#FFEBEE' },
        ]}
      >
        <Ionicons
          name={item.type === 'asset' ? 'trending-up' : 'trending-down'}
          size={16}
          color={item.type === 'asset' ? '#2E7D32' : '#C62828'}
        />
      </View>
      <View style={styles.accountInfo}>
        <Text style={styles.accountName}>{item.name}</Text>
        <Text style={styles.accountCategory}>{item.category}</Text>
      </View>
      <Text style={[styles.accountValue, { color: item.type === 'asset' ? '#1B5E20' : '#C62828' }]}>
        {item.type === 'liability' ? '-' : ''}
        {formatCurrency(item.value)}
      </Text>
      <TouchableOpacity
        onPress={() => handleDelete(item)}
        style={styles.deleteBtn}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="trash-outline" size={17} color="#BDBDBD" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }) => {
    const total = section.data.reduce((sum, a) => sum + a.value, 0);
    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <Text
          style={[
            styles.sectionTotal,
            { color: section.type === 'asset' ? '#1B5E20' : '#C62828' },
          ]}
        >
          {formatCurrency(total)}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Net Worth Banner */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Accounts</Text>
        <View style={styles.netWorthBadge}>
          <Text style={styles.netWorthBadgeLabel}>Net Worth</Text>
          <Text
            style={[
              styles.netWorthBadgeValue,
              { color: netWorth >= 0 ? '#1B5E20' : '#C62828' },
            ]}
          >
            {netWorth >= 0 ? '' : '-'}{formatCurrency(Math.abs(netWorth))}
          </Text>
        </View>
      </View>

      {accounts.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="wallet-outline" size={48} color="#BDBDBD" />
          </View>
          <Text style={styles.emptyTitle}>No accounts yet</Text>
          <Text style={styles.emptySubtitle}>
            Tap the + button to add your assets (savings, investments, property) and liabilities
            (loans, credit cards).
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
          ListFooterComponent={
            accounts.length > 0 ? (
              <View style={styles.footer}>
                <View style={styles.footerRow}>
                  <Text style={styles.footerLabel}>Assets</Text>
                  <Text style={[styles.footerValue, { color: '#1B5E20' }]}>
                    +{formatCurrency(totalAssets)}
                  </Text>
                </View>
                <View style={styles.footerRow}>
                  <Text style={styles.footerLabel}>Liabilities</Text>
                  <Text style={[styles.footerValue, { color: '#C62828' }]}>
                    -{formatCurrency(totalLiabilities)}
                  </Text>
                </View>
                <View style={[styles.footerRow, styles.footerNetRow]}>
                  <Text style={styles.footerNetLabel}>Net Worth</Text>
                  <Text style={[styles.footerNetValue, { color: netWorth >= 0 ? '#1B5E20' : '#C62828' }]}>
                    {formatCurrency(netWorth)}
                  </Text>
                </View>
              </View>
            ) : null
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddEditAccount', { account: null })}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#1A1A1A' },
  netWorthBadge: {
    alignItems: 'flex-end',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  netWorthBadgeLabel: { fontSize: 10, color: '#9E9E9E', fontWeight: '600', letterSpacing: 0.5 },
  netWorthBadgeValue: { fontSize: 15, fontWeight: '700' },

  listContent: { paddingHorizontal: 16, paddingBottom: 100 },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 8,
  },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#757575', letterSpacing: 0.5, textTransform: 'uppercase' },
  sectionTotal: { fontSize: 15, fontWeight: '700' },

  accountRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  accountInfo: { flex: 1 },
  accountName: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
  accountCategory: { fontSize: 12, color: '#9E9E9E', marginTop: 2 },
  accountValue: { fontSize: 15, fontWeight: '700', marginRight: 10 },
  deleteBtn: { padding: 2 },

  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingBottom: 80,
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

  // Footer summary
  footer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  footerLabel: { fontSize: 14, color: '#757575' },
  footerValue: { fontSize: 14, fontWeight: '600' },
  footerNetRow: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 8,
    marginTop: 4,
    marginBottom: 0,
  },
  footerNetLabel: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  footerNetValue: { fontSize: 15, fontWeight: '800' },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#1B5E20',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
});

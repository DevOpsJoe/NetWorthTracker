import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

const ASSET_CATEGORIES = [
  'Cash & Savings',
  'Checking Account',
  'Investments',
  'Retirement (401k/IRA)',
  'Real Estate',
  'Vehicle',
  'Crypto',
  'Business',
  'Other Asset',
];

const LIABILITY_CATEGORIES = [
  'Credit Card',
  'Mortgage',
  'Student Loan',
  'Auto Loan',
  'Personal Loan',
  'Medical Debt',
  'Business Loan',
  'Other Liability',
];

export default function AddEditAccountScreen({ navigation, route }) {
  const { addAccount, updateAccount } = useApp();
  const editingAccount = route.params?.account ?? null;
  const isEditing = !!editingAccount;

  const [name, setName] = useState(editingAccount?.name ?? '');
  const [type, setType] = useState(editingAccount?.type ?? 'asset');
  const [category, setCategory] = useState(editingAccount?.category ?? '');
  const [value, setValue] = useState(editingAccount?.value != null ? String(editingAccount.value) : '');

  const categories = type === 'asset' ? ASSET_CATEGORIES : LIABILITY_CATEGORIES;

  const handleTypeChange = (newType) => {
    setType(newType);
    setCategory(''); // reset category when type changes
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Missing Name', 'Please enter an account name.');
      return;
    }
    const numValue = parseFloat(value.replace(/,/g, ''));
    if (isNaN(numValue) || numValue < 0) {
      Alert.alert('Invalid Value', 'Please enter a valid dollar amount (0 or greater).');
      return;
    }
    if (!category) {
      Alert.alert('Missing Category', 'Please select a category.');
      return;
    }

    const accountData = { name: name.trim(), type, category, value: numValue };

    if (isEditing) {
      updateAccount({ ...editingAccount, ...accountData });
    } else {
      addAccount(accountData);
    }

    navigation.goBack();
  };

  const activeColor = type === 'asset' ? '#1B5E20' : '#C62828';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={26} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isEditing ? 'Edit Account' : 'Add Account'}</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
            <Text style={[styles.saveBtnText, { color: activeColor }]}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Type Toggle */}
          <View style={styles.field}>
            <Text style={styles.label}>TYPE</Text>
            <View style={styles.typeRow}>
              <TouchableOpacity
                style={[styles.typeBtn, type === 'asset' && styles.typeBtnActiveAsset]}
                onPress={() => handleTypeChange('asset')}
              >
                <Ionicons
                  name="trending-up"
                  size={18}
                  color={type === 'asset' ? '#FFFFFF' : '#9E9E9E'}
                />
                <Text style={[styles.typeBtnText, type === 'asset' && styles.typeBtnTextActive]}>
                  Asset
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeBtn, type === 'liability' && styles.typeBtnActiveLiability]}
                onPress={() => handleTypeChange('liability')}
              >
                <Ionicons
                  name="trending-down"
                  size={18}
                  color={type === 'liability' ? '#FFFFFF' : '#9E9E9E'}
                />
                <Text
                  style={[styles.typeBtnText, type === 'liability' && styles.typeBtnTextActive]}
                >
                  Liability
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Name */}
          <View style={styles.field}>
            <Text style={styles.label}>ACCOUNT NAME</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder={type === 'asset' ? 'e.g., Chase Savings, Vanguard IRA' : 'e.g., Chase Visa, Student Loan'}
              placeholderTextColor="#C5C5C5"
              returnKeyType="next"
            />
          </View>

          {/* Value */}
          <View style={styles.field}>
            <Text style={styles.label}>CURRENT VALUE ($)</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={[styles.input, styles.inputWithSymbol]}
                value={value}
                onChangeText={setValue}
                placeholder="0.00"
                placeholderTextColor="#C5C5C5"
                keyboardType="decimal-pad"
                returnKeyType="done"
              />
            </View>
            {type === 'liability' && (
              <Text style={styles.inputHint}>Enter the balance you owe (positive number).</Text>
            )}
          </View>

          {/* Category */}
          <View style={styles.field}>
            <Text style={styles.label}>CATEGORY</Text>
            <View style={styles.chipGrid}>
              {categories.map((cat) => {
                const isSelected = category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.chip,
                      isSelected && { backgroundColor: activeColor, borderColor: activeColor },
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8E8E8',
  },
  backBtn: { padding: 4, width: 44 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1A1A1A' },
  saveBtn: { padding: 4, width: 44, alignItems: 'flex-end' },
  saveBtnText: { fontSize: 17, fontWeight: '700' },

  scroll: { flex: 1, padding: 20 },

  field: { marginBottom: 28 },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9E9E9E',
    letterSpacing: 1.2,
    marginBottom: 10,
  },

  // Type toggle
  typeRow: { flexDirection: 'row', gap: 12 },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 2,
    borderColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  typeBtnActiveAsset: { backgroundColor: '#1B5E20', borderColor: '#1B5E20' },
  typeBtnActiveLiability: { backgroundColor: '#C62828', borderColor: '#C62828' },
  typeBtnText: { fontSize: 15, fontWeight: '700', color: '#9E9E9E' },
  typeBtnTextActive: { color: '#FFFFFF' },

  // Text input
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#EEEEEE',
  },
  inputWrapper: { position: 'relative', justifyContent: 'center' },
  currencySymbol: {
    position: 'absolute',
    left: 16,
    fontSize: 16,
    color: '#757575',
    zIndex: 1,
  },
  inputWithSymbol: { paddingLeft: 28 },
  inputHint: { fontSize: 12, color: '#9E9E9E', marginTop: 6, marginLeft: 4 },

  // Category chips
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  chipText: { fontSize: 13, color: '#424242', fontWeight: '600' },
  chipTextActive: { color: '#FFFFFF' },
});

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@net_worth_tracker_v1';

export async function saveData(data) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save data:', error);
  }
}

export async function loadData() {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (json) {
      return JSON.parse(json);
    }
  } catch (error) {
    console.error('Failed to load data:', error);
  }
  return { accounts: [], snapshots: [] };
}

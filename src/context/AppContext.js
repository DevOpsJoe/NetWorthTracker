import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { saveData, loadData } from '../utils/storage';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

const AppContext = createContext();

const initialState = {
  accounts: [],
  snapshots: [],
  isLoading: true,
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD_DATA':
      return { ...state, ...action.payload, isLoading: false };
    case 'ADD_ACCOUNT':
      return { ...state, accounts: [...state.accounts, action.payload] };
    case 'UPDATE_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.map((a) =>
          a.id === action.payload.id ? action.payload : a
        ),
      };
    case 'DELETE_ACCOUNT':
      return { ...state, accounts: state.accounts.filter((a) => a.id !== action.payload) };
    case 'ADD_SNAPSHOT':
      return { ...state, snapshots: [action.payload, ...state.snapshots] };
    case 'DELETE_SNAPSHOT':
      return { ...state, snapshots: state.snapshots.filter((s) => s.id !== action.payload) };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load from storage on mount
  useEffect(() => {
    async function load() {
      const data = await loadData();
      dispatch({ type: 'LOAD_DATA', payload: data });
    }
    load();
  }, []);

  // Persist to storage on every change
  useEffect(() => {
    if (!state.isLoading) {
      saveData({ accounts: state.accounts, snapshots: state.snapshots });
    }
  }, [state.accounts, state.snapshots, state.isLoading]);

  // --- Derived values ---
  const totalAssets = state.accounts
    .filter((a) => a.type === 'asset')
    .reduce((sum, a) => sum + a.value, 0);

  const totalLiabilities = state.accounts
    .filter((a) => a.type === 'liability')
    .reduce((sum, a) => sum + a.value, 0);

  const netWorth = totalAssets - totalLiabilities;

  // --- Actions ---
  const addAccount = (account) => {
    const newAccount = {
      ...account,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_ACCOUNT', payload: newAccount });
  };

  const updateAccount = (account) => {
    dispatch({
      type: 'UPDATE_ACCOUNT',
      payload: { ...account, updatedAt: new Date().toISOString() },
    });
  };

  const deleteAccount = (id) => {
    dispatch({ type: 'DELETE_ACCOUNT', payload: id });
  };

  const takeSnapshot = () => {
    const snapshot = {
      id: generateId(),
      date: new Date().toISOString(),
      netWorth,
      totalAssets,
      totalLiabilities,
      accounts: [...state.accounts],
    };
    dispatch({ type: 'ADD_SNAPSHOT', payload: snapshot });
    return snapshot;
  };

  const deleteSnapshot = (id) => {
    dispatch({ type: 'DELETE_SNAPSHOT', payload: id });
  };

  return (
    <AppContext.Provider
      value={{
        accounts: state.accounts,
        snapshots: state.snapshots,
        isLoading: state.isLoading,
        netWorth,
        totalAssets,
        totalLiabilities,
        addAccount,
        updateAccount,
        deleteAccount,
        takeSnapshot,
        deleteSnapshot,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

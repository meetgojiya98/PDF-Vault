/**
 * Simple file-based persistent storage for user subscriptions
 * For production, replace with a real database (PostgreSQL, MongoDB, etc.)
 */

import fs from 'fs';
import path from 'path';

export type UserSubscription = {
  email: string;
  customerId: string;
  subscriptionId?: string;
  subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';
  proActive: boolean;
  exportCredits: number;
  currentPeriodEnd?: number; // timestamp
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
};

const DB_PATH = path.join(process.cwd(), 'data', 'subscriptions.json');

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Load all subscriptions from file
function loadSubscriptions(): Map<string, UserSubscription> {
  ensureDataDir();
  
  if (!fs.existsSync(DB_PATH)) {
    return new Map();
  }
  
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    const parsed = JSON.parse(data);
    return new Map(Object.entries(parsed));
  } catch (error) {
    console.error('Error loading subscriptions:', error);
    return new Map();
  }
}

// Save all subscriptions to file
function saveSubscriptions(subscriptions: Map<string, UserSubscription>) {
  ensureDataDir();
  
  try {
    const obj = Object.fromEntries(subscriptions);
    fs.writeFileSync(DB_PATH, JSON.stringify(obj, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving subscriptions:', error);
  }
}

// In-memory cache
let subscriptionsCache: Map<string, UserSubscription> | null = null;

function getCache(): Map<string, UserSubscription> {
  if (!subscriptionsCache) {
    subscriptionsCache = loadSubscriptions();
  }
  return subscriptionsCache;
}

// Get user by email
export function getUserByEmail(email: string): UserSubscription | null {
  const cache = getCache();
  return cache.get(email.toLowerCase()) || null;
}

// Get user by Stripe customer ID
export function getUserByCustomerId(customerId: string): UserSubscription | null {
  const cache = getCache();
  for (const user of cache.values()) {
    if (user.customerId === customerId) {
      return user;
    }
  }
  return null;
}

// Get user by subscription ID
export function getUserBySubscriptionId(subscriptionId: string): UserSubscription | null {
  const cache = getCache();
  for (const user of cache.values()) {
    if (user.subscriptionId === subscriptionId) {
      return user;
    }
  }
  return null;
}

// Create or update user
export function upsertUser(user: UserSubscription) {
  const cache = getCache();
  const email = user.email.toLowerCase();
  const now = Date.now();
  
  const existing = cache.get(email);
  const updated: UserSubscription = {
    ...user,
    email,
    updatedAt: now,
    createdAt: existing?.createdAt || now,
  };
  
  cache.set(email, updated);
  saveSubscriptions(cache);
  
  return updated;
}

// Delete user
export function deleteUser(email: string) {
  const cache = getCache();
  cache.delete(email.toLowerCase());
  saveSubscriptions(cache);
}

// Get all users
export function getAllUsers(): UserSubscription[] {
  const cache = getCache();
  return Array.from(cache.values());
}

// Get active Pro users
export function getActiveProUsers(): UserSubscription[] {
  return getAllUsers().filter(user => user.proActive);
}

// Cleanup expired trials and subscriptions
export function cleanupExpiredSubscriptions() {
  const cache = getCache();
  const now = Date.now();
  let modified = false;
  
  for (const [email, user] of cache.entries()) {
    if (user.currentPeriodEnd && user.currentPeriodEnd < now && user.proActive) {
      // Mark as inactive if period has ended
      user.proActive = false;
      user.subscriptionStatus = 'canceled';
      cache.set(email, user);
      modified = true;
    }
  }
  
  if (modified) {
    saveSubscriptions(cache);
  }
}

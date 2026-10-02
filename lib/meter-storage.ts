'use client';
import { useMemo, useSyncExternalStore } from 'react';
import { loveConfig } from './config';
import { parseMeter, type LoveMeterConfig } from './love-meter';
const key = 'love-test-config';
const event = 'love-test-config-change';
function subscribe(callback: () => void) {
  window.addEventListener('storage', callback); window.addEventListener(event, callback); window.addEventListener('popstate', callback);
  return () => { window.removeEventListener('storage', callback); window.removeEventListener(event, callback); window.removeEventListener('popstate', callback); };
}
function snapshot() {
  const shared = new URLSearchParams(window.location.search).get('meter');
  if (shared) return shared;
  try { return window.localStorage.getItem(key) ?? ''; } catch { return ''; }
}
export function useSavedMeter() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => '');
  return useMemo(() => { try { return parseMeter(JSON.parse(raw).loveMeter, loveConfig.loveMeter); } catch { return loveConfig.loveMeter; } }, [raw]);
}
export function saveMeter(loveMeter: LoveMeterConfig) {
  let existing: Record<string, unknown> = {};
  try { const parsed = JSON.parse(localStorage.getItem(key) ?? '{}'); if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) existing = parsed; } catch { /* Recover invalid saved data. */ }
  localStorage.setItem(key, JSON.stringify({ ...existing, loveMeter }));
  window.dispatchEvent(new Event(event));
}

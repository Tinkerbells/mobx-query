import { describe, expect, it, vi } from 'vitest';
import type {
  MobxQueryDevtoolsEntry,
  MobxQueryDevtoolsState,
} from '@tinkerbells88/mobx-query';
import {
  applyDevtoolsAction,
  filterDevtoolsEntries,
  getDevtoolsStatus,
  getDevtoolsStatusCounts,
  stringifyDevtoolsValue,
} from './core';

const state = (
  overrides: Partial<MobxQueryDevtoolsState> = {},
): MobxQueryDevtoolsState => ({
  data: undefined,
  error: undefined,
  isLoading: false,
  isSuccess: false,
  isError: false,
  isIdle: true,
  background: null,
  ...overrides,
});

const entry = (
  key: string[],
  query: Partial<MobxQueryDevtoolsEntry['query']> = {},
): MobxQueryDevtoolsEntry => ({
  hash: JSON.stringify(key),
  key,
  type: 'query',
  query: {
    getDevtoolsState: () => state(),
    ...query,
  },
  meta: {
    fetchPolicy: 'cache-first',
    enabledAutoFetch: false,
    isBackground: false,
    enabledSynchronization: false,
    retained: false,
  },
});

describe('devtools core', () => {
  it('derives the status with loading taking priority', () => {
    expect(getDevtoolsStatus(state({ isSuccess: true }))).toBe('success');
    expect(getDevtoolsStatus(state({ isError: true }))).toBe('error');
    expect(getDevtoolsStatus(state({ isLoading: true, isError: true }))).toBe('loading');
    expect(getDevtoolsStatus(state())).toBe('idle');
  });

  it('filters query keys case-insensitively and counts each status', () => {
    const entries = [
      entry(['todos', 'active'], { getDevtoolsState: () => state({ isSuccess: true }) }),
      entry(['Users', '42'], { getDevtoolsState: () => state({ isLoading: true }) }),
      entry(['todos', 'failed'], { getDevtoolsState: () => state({ isError: true }) }),
    ];

    expect(filterDevtoolsEntries(entries, 'TODO')).toHaveLength(2);
    expect(getDevtoolsStatusCounts(entries)).toEqual({ loading: 1, error: 1, success: 1, idle: 0 });
  });

  it('serializes values without throwing on undefined and circular values', () => {
    const circular: { self?: unknown } = {};
    circular.self = circular;

    expect(stringifyDevtoolsValue(undefined)).toBe('undefined');
    expect(stringifyDevtoolsValue({ id: 1 })).toContain('"id": 1');
    expect(stringifyDevtoolsValue(circular)).toBe('[object Object]');
    expect(stringifyDevtoolsValue(new Error('network is down'))).toBe(
      'Error: network is down',
    );
  });

  it('forwards inspector commands and parses edited JSON before forceUpdate', () => {
    const sync = vi.fn();
    const invalidate = vi.fn();
    const fetchMore = vi.fn();
    const setDevtoolsOverride = vi.fn();
    const clearDevtoolsOverride = vi.fn();
    const forceUpdate = vi.fn();
    const target = entry(['todos'], { sync, invalidate, fetchMore, setDevtoolsOverride, clearDevtoolsOverride, forceUpdate });

    applyDevtoolsAction(target, 'refetch');
    applyDevtoolsAction(target, 'invalidate');
    applyDevtoolsAction(target, 'more');
    applyDevtoolsAction(target, 'loading');
    applyDevtoolsAction(target, 'error');
    applyDevtoolsAction(target, 'reset');
    applyDevtoolsAction(target, 'apply', '{"done":true}');

    expect(sync).toHaveBeenCalledOnce();
    expect(invalidate).toHaveBeenCalledOnce();
    expect(fetchMore).toHaveBeenCalledOnce();
    expect(setDevtoolsOverride).toHaveBeenCalledWith({ isLoading: true, isSuccess: false, isError: false, isIdle: false });
    expect(setDevtoolsOverride).toHaveBeenLastCalledWith({
      isLoading: false,
      isSuccess: false,
      isError: true,
      isIdle: false,
      error: new Error('DevTools preview error'),
    });
    expect(clearDevtoolsOverride).toHaveBeenCalledOnce();
    expect(forceUpdate).toHaveBeenCalledWith({ done: true });
    expect(() => applyDevtoolsAction(target, 'apply', '{')).toThrow(SyntaxError);
  });
});

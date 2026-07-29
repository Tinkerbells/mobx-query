import type {
  MobxQueryDevtoolsEntry,
  MobxQueryDevtoolsState,
} from '@tinkerbells88/mobx-query';

export type DevtoolsStatus = 'loading' | 'error' | 'success' | 'idle';

export const getDevtoolsStatus = (
  state: MobxQueryDevtoolsState,
): DevtoolsStatus => {
  if (state.isLoading) return 'loading';
  if (state.isError) return 'error';
  if (state.isSuccess) return 'success';
  return 'idle';
};

export const stringifyDevtoolsValue = (value: unknown) => {
  if (value === undefined) return 'undefined';
  if (value instanceof Error) return `${value.name}: ${value.message}`;

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

export const filterDevtoolsEntries = (
  entries: MobxQueryDevtoolsEntry[],
  search: string,
) => {
  const normalizedSearch = search.toLowerCase();

  return entries.filter((entry) =>
    stringifyDevtoolsValue(entry.key).toLowerCase().includes(normalizedSearch),
  );
};

export const getDevtoolsStatusCounts = (
  entries: MobxQueryDevtoolsEntry[],
) =>
  entries.reduce<Record<DevtoolsStatus, number>>(
    (counts, entry) => {
      counts[getDevtoolsStatus(entry.query.getDevtoolsState())] += 1;
      return counts;
    },
    { loading: 0, error: 0, success: 0, idle: 0 },
  );

export const applyDevtoolsAction = (
  entry: MobxQueryDevtoolsEntry,
  action:
    | 'refetch'
    | 'invalidate'
    | 'more'
    | 'loading'
    | 'error'
    | 'reset'
    | 'apply',
  dataDraft?: string,
) => {
  if (action === 'refetch') return entry.query.sync?.();
  if (action === 'invalidate') return entry.query.invalidate?.();
  if (action === 'more') return entry.query.fetchMore?.();
  if (action === 'loading') {
    return entry.query.setDevtoolsOverride?.({
      isLoading: true,
      isSuccess: false,
      isError: false,
      isIdle: false,
    });
  }
  if (action === 'error') {
    return entry.query.setDevtoolsOverride?.({
      isLoading: false,
      isSuccess: false,
      isError: true,
      isIdle: false,
      error: new Error('DevTools preview error'),
    });
  }
  if (action === 'reset') return entry.query.clearDevtoolsOverride?.();
  if (action === 'apply' && dataDraft !== undefined) {
    return entry.query.forceUpdate?.(JSON.parse(dataDraft));
  }
};

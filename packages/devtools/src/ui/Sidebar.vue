<script setup lang="ts">
import { Observer } from 'mobx-vue-lite';

import type { DevToolsStore } from '../core/store';

const props = defineProps<{ store: DevToolsStore }>();

const getStatusColor = (model: {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
}) => {
  if (model.isLoading) return 'var(--mq-fetching)';
  if (model.isError) return 'var(--mq-error)';
  if (model.isSuccess) return 'var(--mq-success)';
  return 'var(--mq-idle)';
};
</script>

<template>
  <Observer>
    <div class="mq-sidebar">
      <div class="mq-sidebar-header">
        <h3>Queries</h3>
        <input
          type="text"
          placeholder="Filter..."
          class="mq-input"
          :value="props.store.searchTerm"
          @input="props.store.setSearch(($event.target as HTMLInputElement).value)"
        />
      </div>

      <div class="mq-query-list mq-scroll-y">
        <div
          v-for="query in props.store.filteredQueries"
          :key="query.hash"
          class="mq-query-item"
          :class="{ active: props.store.selectedQueryHash === query.hash }"
          @click="props.store.selectQuery(query.hash)"
        >
          <span class="mq-status-dot" :style="{ background: getStatusColor(query) }"></span>
          <span class="mq-badge">{{ query.type }}</span>
          <span class="mq-query-key">{{ JSON.stringify(query.key) }}</span>
        </div>
      </div>
    </div>
  </Observer>
</template>

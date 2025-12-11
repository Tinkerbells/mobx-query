<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Observer } from 'mobx-vue-lite';

import type { DevToolsStore } from '../core/store';

const props = defineProps<{ store: DevToolsStore }>();

const query = computed(() => props.store.activeQuery);
const jsonEditText = ref('');
const isEditing = ref(false);
const jsonError = ref<string | null>(null);

watch(
  () => query.value?.hash,
  () => {
    jsonError.value = null;
    isEditing.value = false;
  },
);

watch(
  () => query.value?.data,
  (newData) => {
    if (!isEditing.value) {
      jsonEditText.value =
        newData === undefined ? '' : JSON.stringify(newData, null, 2);
    }
  },
  { immediate: true },
);

const handleSaveData = () => {
  try {
    const parsed = jsonEditText.value ? JSON.parse(jsonEditText.value) : null;
    query.value?.setData(parsed);
    jsonError.value = null;
  } catch (e: any) {
    jsonError.value = e?.message ?? 'Invalid JSON';
  }
};

const toggleLoading = (e: Event) => {
  const val = (e.target as HTMLInputElement).checked;
  query.value?.setIsLoading(val);
};
</script>

<template>
  <Observer>
    <div v-if="!query" class="mq-empty">Select a query to view details</div>

    <div v-else class="mq-inspector mq-scroll-y">
      <div class="mq-toolbar">
        <h2 class="mq-title">Query Details</h2>
        <div class="mq-actions">
          <button class="mq-btn mq-btn-primary" type="button" @click="query.refetch()">
            Refetch
          </button>
          <button class="mq-btn" type="button" @click="query.fetchMore()" :disabled="query.type !== 'infinite'">
            Fetch more
          </button>
          <button class="mq-btn mq-btn-danger" type="button" @click="query.invalidate()">
            Invalidate
          </button>
        </div>
      </div>

      <div class="mq-content">
        <div class="mq-section">
          <label>Query Key</label>
          <code class="mq-code-box">{{ JSON.stringify(query.key) }}</code>
        </div>

        <div class="mq-section">
          <label>State</label>
          <div class="mq-control-grid">
            <label class="mq-checkbox-label">
              <input type="checkbox" :checked="query.isLoading" @change="toggleLoading" />
              <span class="mq-status-text" :class="{ active: query.isLoading }">isLoading</span>
            </label>
            <label class="mq-checkbox-label">
              <input type="checkbox" disabled :checked="query.isSuccess" />
              <span class="mq-status-text success">isSuccess</span>
            </label>
            <label class="mq-checkbox-label">
              <input type="checkbox" disabled :checked="query.isError" />
              <span class="mq-status-text error">isError</span>
            </label>
            <label v-if="query.type === 'infinite'" class="mq-checkbox-label">
              <input type="checkbox" disabled :checked="query.isEndReached" />
              <span class="mq-status-text">isEndReached</span>
            </label>
          </div>
        </div>

        <div class="mq-section">
          <div class="mq-label-row">
            <label>Data</label>
            <button class="mq-xs-btn" type="button" @click="handleSaveData" :disabled="Boolean(jsonError)">
              Apply Changes
            </button>
          </div>
          <div class="mq-editor-container">
            <textarea
              v-model="jsonEditText"
              class="mq-json-textarea"
              spellcheck="false"
              @focus="isEditing = true"
              @blur="isEditing = false"
            ></textarea>
            <div v-if="jsonError" class="mq-json-error">{{ jsonError }}</div>
          </div>
        </div>

        <div class="mq-section">
          <label>Error</label>
          <div class="mq-json-viewer mq-border-error">
            <pre>{{ JSON.stringify(query.error, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </div>
  </Observer>
</template>

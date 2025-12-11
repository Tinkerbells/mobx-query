<script setup lang="ts">
import { Observer } from 'mobx-vue-lite';

import type { DevToolsStore } from '../core/store';
import Inspector from './Inspector.vue';
import Sidebar from './Sidebar.vue';

const props = defineProps<{ store: DevToolsStore }>();
</script>

<template>
  <Observer>
    <div>
      <div v-if="!props.store.isOpen" class="mq-floater">
        <button class="mq-logo-btn" type="button" @click="props.store.toggleOpen()">
          ⚡️
        </button>
      </div>

      <div v-else class="mq-devtools">
        <Sidebar :store="props.store" />
        <Inspector :store="props.store" />

        <button class="mq-close-btn" type="button" @click="props.store.toggleOpen()">×</button>
      </div>
    </div>
  </Observer>
</template>

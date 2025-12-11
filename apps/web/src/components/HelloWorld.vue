<script setup lang="ts">
import { Observer } from 'mobx-vue-lite';
import { CounterStore } from '../stores/counter-store';
import { asyncStore as async } from "../stores/async"

// import { counterStore as ui } from '../stores/counter-store';

console.log(async.isLoading)

defineProps<{ msg: string }>();

const ui = new CounterStore()

</script>

<template>
  <Observer>
    <h1>{{ msg }}</h1>

    <div class="card">
      {{ ui.count }}
      <button type="button" @click="ui.inc()">+</button>
      <button type="button" @click="ui.dec()">-</button>
      <p>
        Edit
        <code>components/HelloWorld.vue</code> to test HMR
      </p>
      <p v-if="async.isLoading">loading...</p>
      <p v-else>
        {{ async.asyncQueryMessage }}
      </p>
    </div>

    <p>
      Check out
      <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank">create-vue</a>, the official Vue + Vite
      starter
    </p>
    <p>
      Learn more about IDE Support for Vue in the
      <a href="https://vuejs.org/guide/scaling-up/tooling.html#ide-support" target="_blank">Vue Docs Scaling up
        Guide</a>.
    </p>
    <p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>
  </Observer>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>

<script setup lang="ts">
const cards = [
  {
    title: 'Mobx Query Devtools',
    description:
      'Инструмент для наблюдения и отладки состояний @tinkerbells/mobx-query. Панель закреплена снизу экрана.',
  },
  {
    title: 'Что можно сделать',
    description:
      'Переключать isLoading, рефетчить, инвалидировать запросы и править data/ошибки вручную через JSON редактор.',
  },
  {
    title: 'Как использовать',
    description:
      'Импортируйте функцию mountMobxQueryDevtools из src/index.ts и передайте ей экземпляр MobxQuery.',
  },
];
</script>

<template>
  <main class="page">
    <header>
      <p class="eyebrow">devtools preview</p>
      <h1>mobx-query devtools</h1>
      <p class="lede">
        Ниже подключена тестовая инстанция MobxQuery. Откройте плавающую кнопку ⚡️, чтобы увидеть панель в действии.
      </p>
    </header>

    <section class="cards">
      <article v-for="card in cards" :key="card.title" class="card">
        <h2>{{ card.title }}</h2>
        <p>{{ card.description }}</p>
      </article>
    </section>
  </main>
</template>

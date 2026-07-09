<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'

const { Layout } = DefaultTheme
const { lang } = useData()

const isRu = () => lang.value === 'ru'
</script>

<template>
  <Layout>
    <template #home-features-after>
      <div class="architecture-banner-wrap">
      <div class="architecture-banner">
        <span class="badge">
          {{ isRu()
            ? '🧩 Состоит из двух библиотек, соблюдает SRP. Спроектировано под DDD/MVVM/SOLID.'
            : '🧩 Two libraries that comply with SRP. Designed to implement DDD/MVVM/SOLID.' }}
        </span>

        <div class="libs">
          <div class="lib">
            <a href="https://www.npmjs.com/package/@vue-modeler/model" target="_blank" rel="noreferrer">
              <code>@vue-modeler/model</code>
            </a>
            <span>
              {{ isRu() ? 'Библиотека для создания моделей - реактивных объектов с состоянием' : 'Library for fast model creation with reactive state, actions, errors, and lifecycle' }}
            </span>
          </div>
          <div class="lib">
            <a href="https://www.npmjs.com/package/@vue-modeler/di" target="_blank" rel="noreferrer">
              <code>@vue-modeler/di</code>
            </a>
            <span>
              {{ isRu() ? 'Библиотека для управления зависимостями (создание, получение, удаление)' : 'Library for dependency management (create, resolve, destroy)' }}
            </span>
          </div>
        </div>
      </div>
      </div>
    </template>
  </Layout>
</template>

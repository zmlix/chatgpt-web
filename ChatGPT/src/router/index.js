import { createRouter, createWebHistory } from 'vue-router'
import ChatGPT from '../views/ChatGPT.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'index',
      component: ChatGPT
    }
  ]
})

export default router

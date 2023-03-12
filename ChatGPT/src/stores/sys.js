import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { env } from '../env'

export const useSysStore = defineStore(
  'sys',
  () => {
    const openSideBar = ref(false)
    const openSettingDialog = ref(false)
    const setting = ref({
      api_key: env.OPENAI_API_KEY,
      api_url: env.apiURL
    })

    const API_KEY = computed(() => setting.value.api_key)
    const API_URL = computed(() => setting.value.api_url)

    function set(key, url) {
      setting.value.api_key = key
      setting.value.api_url = url
    }

    return {
      openSideBar,
      openSettingDialog,
      setting,
      set,
      API_KEY,
      API_URL
    }
  },
  {
    persist: {
      paths: ['setting']
    }
  }
)

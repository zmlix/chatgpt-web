import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { env } from '../env'

export const useSysStore = defineStore(
  'sys',
  () => {
    const openSideBar = ref(false)
    const openSettingDialog = ref(false)
    const creditGrants = ref('需配置OPENAI_API_KEY')
    const setting = ref({
      api_key: env.OPENAI_API_KEY,
      api_url: env.apiURL
    })
    const stream = ref(true)
    const promptList = ref([])

    const API_KEY = computed(() => setting.value.api_key)
    const API_URL = computed(() => setting.value.api_url)

    function setPromptList(webPromptList) {
      promptList.value = promptList.value.filter((item) => item.type === 'user')
      promptList.value = promptList.value.concat(webPromptList)
    }

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
      API_URL,
      stream,
      creditGrants,
      promptList,
      setPromptList
    }
  },
  {
    persist: {
      paths: ['setting', 'stream', 'creditGrants', 'promptList']
    }
  }
)

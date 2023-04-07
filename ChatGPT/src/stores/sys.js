import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { env } from '../env'

export const useSysStore = defineStore(
  'sys',
  () => {
    const sideBar = ref(false)
    const openSideBar = ref(false)
    const openSettingDialog = ref(false)
    const creditGrants = ref('需配置OPENAI_API_KEY')
    const setting = ref({
      api_key: env.OPENAI_API_KEY,
      api_url: env.apiURL
    })
    const stream = ref(true)
    const temperature = ref(1)
    const skipHistoryMessages = ref(false)
    const promptList = ref([])

    const API_KEY = computed(() => setting.value.api_key)
    const API_URL = computed(() => setting.value.api_url)

    function sortPromptList() {
      promptList.value.sort(function (a, b) {
        if (a.type === 'user' && b.type !== 'user') {
          return -1
        } else if (a.type !== 'user' && b.type === 'user') {
          return 1
        } else {
          return 0
        }
      })
    }

    function setPromptList(webPromptList) {
      promptList.value = promptList.value.filter((item) => item.type === 'user')
      promptList.value = promptList.value.concat(webPromptList)
      sortPromptList()
    }

    function addPrompt(prompt) {
      const idx = promptList.value.findIndex((item) => item.id && item.id === prompt.id)
      if (idx !== -1) {
        promptList.value[idx] = prompt
      } else {
        promptList.value.push(prompt)
      }
      sortPromptList()
    }

    function delPrompt(prompt) {
      const idx = promptList.value.findIndex((item) => item.id && item.id === prompt.id)
      if (idx !== -1) {
        promptList.value.splice(idx, 1)
      }
      sortPromptList()
    }

    function set(key, url) {
      setting.value.api_key = key
      setting.value.api_url = url
    }

    return {
      sideBar,
      openSideBar,
      openSettingDialog,
      setting,
      set,
      API_KEY,
      API_URL,
      stream,
      temperature,
      skipHistoryMessages,
      creditGrants,
      promptList,
      setPromptList,
      addPrompt,
      delPrompt
    }
  },
  {
    persist: {
      paths: [
        'sideBar',
        'setting',
        'stream',
        'temperature',
        'skipHistoryMessages',
        'creditGrants',
        'promptList'
      ]
    }
  }
)

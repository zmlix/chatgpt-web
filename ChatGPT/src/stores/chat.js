import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { downloadJson, uploadJson } from '../utils/utils'

export const useChatStore = defineStore(
  'chat',
  () => {
    const openSideBar = ref(false)
    const currentChatIdx = ref(null)
    const chats = ref([])

    const length = computed(() => chats.value.length)

    function getCurrentChat() {
      return getChatByIdx(currentChatIdx.value)
    }

    function getChatByIndex(index) {
      return chats.value.at(index)
    }

    function getChatByIdx(idx) {
      const index = chats.value.findIndex((chat) => chat.idx === idx)
      if (index !== -1) {
        return chats.value[index]
      }
    }

    function saveChat(new_chat) {
      const index = chats.value.findIndex((chat) => chat.idx === new_chat.idx)
      if (index !== -1) {
        chats.value[index].chat = new_chat
      }
    }

    function renameChatByIdx(idx, title) {
      const index = chats.value.findIndex((chat) => chat.idx === idx)
      if (index !== -1) {
        chats.value[index].title = title
      }
    }

    function addNewChat(chat) {
      chats.value.push(chat)
    }

    function delChatByIdx(idx) {
      const index = chats.value.findIndex((chat) => chat.idx === idx)
      if (index !== -1) {
        chats.value.splice(index, 1)
      }
    }

    function exportChats() {
      downloadJson(chats.value)
    }

    function uploadChats(file) {
      uploadJson(file, (r) => {
        return () => {
          const chats_ = JSON.parse(r.result)
          for (let i = 0; i < chats_.length; i++) {
            console.log(chats_[i])
            const index = chats.value.findIndex((chat) => chat.idx === chats_[i].idx)
            if (index === -1) {
              chats.value.push(chats_[i])
            } else {
              chats.value[index].messages = [...chats.value[index].messages, ...chats_[i].messages]
            }
          }
        }
      })
    }

    return {
      length,
      openSideBar,
      currentChatIdx,
      chats,
      getCurrentChat,
      getChatByIndex,
      getChatByIdx,
      addNewChat,
      delChatByIdx,
      saveChat,
      renameChatByIdx,
      exportChats,
      uploadChats
    }
  },
  {
    persist: {
      paths: ['chats', 'currentChatIdx']
    }
  }
)

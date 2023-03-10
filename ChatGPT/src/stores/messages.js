import { computed, reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import { random32BitNumber } from '../utils/utils.js'
import { post_GetMessage } from '../api/api.js'
import { useChatStore } from './chat.js'
import { env } from '../env'

export const useMessagesStore = defineStore(
  'messages',
  () => {
    const chatStore = useChatStore()

    const API_KEY = ref(env.OPENAI_API_KEY || '')
    const mId = ref(random32BitNumber())
    const title = ref('')
    const messages = ref([])

    const length = computed(() => messages.value.length)
    const sending = reactive({
      id: -1,
      isSending: false,
      typ: 'all'
    })

    function setIsSending(val) {
      sending.isSending = val
    }

    function setSendingId(val) {
      sending.id = val
    }

    function setMessages(chat) {
      if (chat) {
        chatStore.currentChatIdx = chat.idx
        messages.value = chat.messages
        mId.value = chat.idx
        title.value = chat.title
      }
    }

    function initMessages() {
      if (chatStore.length === 0) {
        mId.value = random32BitNumber()
        messages.value = []
        chatStore.addNewChat({
          idx: mId.value,
          title: 'New Chat ' + (chatStore.length + 1),
          messages: messages.value
        })
        setMessages(chatStore.getChatByIndex(0))
      }
      setMessages(chatStore.getCurrentChat())
      return messages
    }

    function newMessages() {
      chatStore.addNewChat({
        idx: random32BitNumber(),
        title: 'New Chat ' + (chatStore.length + 1),
        messages: ref([])
      })
      setMessages(chatStore.getChatByIndex(-1))
    }

    function getMessages(idx) {
      setMessages(chatStore.getChatByIdx(idx))
    }

    function delMessages(idx) {
      chatStore.delChatByIdx(idx)
      if (chatStore.length === 0) {
        initMessages()
      } else {
        setMessages(chatStore.getChatByIndex(0))
      }
    }

    async function getMessage(body, params) {
      setIsSending(true)
      try {
        const response = await post_GetMessage(body, API_KEY.value)
        const message = response.data.choices[0].message.content
        pushMessage(message, { typ: 'chatgpt', status: 'success' }, params)
      } catch (error) {
        pushMessage(
          '<font color="red">Error: 请求出错</font>',
          { typ: 'sys', status: 'error' },
          params
        )
        console.log(error)
      } finally {
        setIsSending(false)
      }
    }

    function pushMessage(msg, info, params) {
      push({ ...info, msg }, params)
    }

    function push(msg, params = {}) {
      if (length.value === 0) {
        let title = msg.msg.slice(0, 13) + (msg.msg.length <= 13 ? '' : '...')
        console.log('title', title)
        chatStore.renameChatByIdx(mId.value, title)
      }
      msg.id = random32BitNumber()
      msg.time = Date.now()
      msg.skip = msg.status !== 'success'
      if ('insert' in params) {
        const id = params.insert.id
        const idx = messages.value.findIndex((item) => item.id === id)
        if (idx !== -1) {
          messages.value.splice(idx + 1, 0, msg)
        }
      } else {
        messages.value.push(msg)
      }
      setSendingId(msg.id)
    }

    function del(id) {
      const index = messages.value.findIndex((message) => message.id === id)
      if (index !== -1) {
        messages.value.splice(index, 1)
      }
      return messages
    }

    function set(id, options) {
      const message = messages.value.find((message) => message.id === id)
      if (message) {
        Object.assign(message, options)
      }
      return messages
    }

    function getHistoryMsg(typ, params = {}) {
      sending.typ = typ
      let filteredMessages = messages.value
      if (typ === 'part' && params.id !== undefined) {
        const idIndex = messages.value.findIndex((message) => message.id === params.id)
        filteredMessages = messages.value.slice(0, idIndex + 1)
      }
      filteredMessages = filteredMessages.filter((message) => !message.skip)
      let content = filteredMessages.map((message) => message.msg).join('\n')
      content = content.slice(-4096)
      console.log(typ, content.length, content)
      return content
    }

    return {
      API_KEY,
      messages,
      length,
      initMessages,
      newMessages,
      getMessages,
      delMessages,
      getMessage,
      push,
      del,
      set,
      getHistoryMsg,
      sending,
      setIsSending,
      setSendingId
    }
  },
  {
    persist: {
      paths: ['API_KEY']
    }
  }
)

import { computed, reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import { random32BitNumber } from '../utils/utils.js'
import { post_GetMessage } from '../api/api.js'
import { useChatStore } from './chat.js'
import { useSysStore } from './sys.js'
import axios from 'axios'

const cancelToken = axios.CancelToken
const ChatGPTApiSource = ref(null)
export const useMessagesStore = defineStore('messages', () => {
  const chatStore = useChatStore()
  const sysStore = useSysStore()

  const mId = ref(random32BitNumber())
  const title = ref('')
  const messages = ref([])
  const display = ref('card')

  const length = computed(() => messages.value.length)
  const sending = reactive({
    id: -1,
    isSending: false,
    typ: 'all'
  })

  function setIsSending(val) {
    sending.isSending = val
    if (!val && ChatGPTApiSource.value) {
      ChatGPTApiSource.value.cancel('stoped Api')
    }
  }

  function setSendingId(val) {
    sending.id = val
  }

  function setSendingType(val) {
    sending.typ = val
  }

  function setDisplay(val) {
    display.value = val
    let chat = chatStore.getCurrentChat()
    chat.display = val
    chatStore.saveChat(chat)
  }

  function setMessages(chat) {
    if (chat) {
      chatStore.currentChatIdx = chat.idx
      messages.value = chat.messages
      mId.value = chat.idx
      title.value = chat.title
      display.value = chat.display || 'card'
    }
  }

  function initMessages() {
    if (chatStore.length === 0) {
      mId.value = random32BitNumber()
      messages.value = []
      display.value = sysStore.display
      chatStore.addNewChat({
        idx: mId.value,
        title: 'New Chat ' + (chatStore.length + 1),
        messages: messages.value,
        display: sysStore.display
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
      messages: ref([]),
      display: sysStore.display
    })
    setMessages(chatStore.getChatByIndex(-1))
  }

  function getMessages(idx) {
    setMessages(chatStore.getChatByIdx(idx))
  }

  function getNextMessages(step) {
    const idx = chatStore.getNextChat(step).idx
    console.log(idx)
    getMessages(idx)
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
    body.stream = sysStore.stream
    body.temperature = sysStore.temperature
    body.model = sysStore.model

    if (body.stream) {
      const streamId = pushMessage(
        '',
        {
          role: 'assistant',
          status: 'success',
          skip: sysStore.skipHistoryMessages,
          model: body.model
        },
        params
      )
      const sse = post_GetMessage(body, sysStore.API_KEY, sysStore.API_URL)
      sse.addEventListener('message', (e) => {
        if (e.data == '[DONE]' || !sending.isSending) {
          console.log('stoped SSE', !sending.isSending)
          sse.close()
          return
        }
        var payload
        try {
          payload = JSON.parse(e.data)
        } catch (error) {
          let index = e.data.indexOf('data:')
          if (index >= 0) {
            e.data = e.data.substring(index + 5)
            payload = JSON.parse(e.data)
          } else {
            return
          }
        }
        if ('content' in payload['choices'][0]['delta']) {
          update(streamId, payload['choices'][0]['delta']['content'])
        }
      })
      sse.addEventListener('readystatechange', (e) => {
        if (e.readyState >= 2) {
          setIsSending(false)
        }
      })
      sse.addEventListener('error', (e) => {
        console.log('error ', e)
        sse.close()
        let error_msg
        try {
          error_msg = JSON.parse(e.data)
        } catch (error) {
          if (error.name === 'SyntaxError') {
            console.log('eeeee', error)
            const pattern = /\{[\s\S]*\}/
            const match = e.data.match(pattern)
            if (match) {
              error_msg = JSON.parse(match[0])
            } else {
              error_msg = { details: '未知错误' }
            }
          } else {
            error_msg = { details: '未知错误' }
          }
        }
        del(streamId)
        pushMessage(
          '<font color="red">Error: 请求出错</font>\n' +
            '```json\n' +
            JSON.stringify(error_msg, null, 4) +
            '\n```',
          { status: 'error', role: 'error', skip: true },
          params
        )
      })
      sse.stream()
    } else {
      try {
        ChatGPTApiSource.value = cancelToken.source()
        const response = await post_GetMessage(
          body,
          sysStore.API_KEY,
          sysStore.API_URL,
          ChatGPTApiSource.value.token
        )
        const message = response.data.choices[0].message.content
        pushMessage(
          message,
          {
            role: 'assistant',
            status: 'success',
            skip: sysStore.skipHistoryMessages,
            model: response.data.model || body.model
          },
          params
        )
      } catch (error) {
        if (axios.isCancel(error)) {
          pushMessage(
            '<font color="red">Error: 请求中断</font>',
            { status: 'error', role: 'error', skip: true },
            params
          )
        } else {
          let error_msg
          try {
            error_msg = error.response.data
          } catch (error) {
            error_msg = { details: '未知错误' }
          }
          pushMessage(
            '<font color="red">Error: 请求出错</font>\n' +
              '```json\n' +
              JSON.stringify(error_msg, null, 4) +
              '\n```',
            { status: 'error', role: 'error', skip: true },
            params
          )
        }
        console.log(error)
      } finally {
        setIsSending(false)
      }
    }
  }

  function pushMessage(msg, info, params) {
    return push({ ...info, msg }, params)
  }

  function push(msg, params = {}) {
    if (length.value === 0) {
      let title = msg.msg.slice(0, 25) + (msg.msg.length <= 25 ? '' : '...')
      console.log('title', title)
      chatStore.renameChatByIdx(mId.value, title)
    }
    msg.id = random32BitNumber()
    msg.time = Date.now()
    msg.skip = msg.skip || msg.status !== 'success'
    msg.model = msg.model || sysStore.model
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
    return msg.id
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

  function update(id, msg) {
    const message = messages.value.find((message) => message.id === id)
    if (message) {
      message.msg += msg
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
    filteredMessages = filteredMessages.filter((message) => message.role)
    const _messages = filteredMessages.reduceRight(
      (acc, curr) => {
        acc.total += curr.msg.length
        acc.messages.unshift({ role: curr.role, content: curr.msg })
        return acc
      },
      { total: 0, messages: [] }
    ).messages
    console.log(typ, _messages.length, _messages)
    return _messages
  }

  return {
    title,
    messages,
    display,
    setDisplay,
    length,
    initMessages,
    newMessages,
    getMessages,
    getNextMessages,
    delMessages,
    getMessage,
    push,
    pushMessage,
    del,
    set,
    getHistoryMsg,
    sending,
    setIsSending,
    setSendingId,
    setSendingType
  }
})

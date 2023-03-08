import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'
import { random32BitNumber } from '../utils/utils.js'
import { post_GetMessage } from '../api/api.js'

export const useMessagesStore = defineStore('messages', () => {
  const messages = ref([
    {
      id: 0,
      typ: 'user',
      msg: '正态分布的概率密度函数是什么',
      status: 'success',
      skip: false
    },
    {
      id: 1,
      typ: 'user',
      msg: '给我一段计算它的python代码',
      status: 'success',
      skip: false
    },
    {
      id: 2,
      typ: 'user',
      msg: '使用markdown格式给我一张包含正态分布曲线的图片的链接',
      status: 'success',
      skip: false
    },
    {
      id: 3,
      typ: 'chatgpt',
      msg: '<font color="red">**Error:** 请求出错</font>',
      status: 'error',
      skip: true
    }
  ])

  const length = computed(() => messages.value.length)
  const sending = reactive({
    id: -1,
    isSending: false
  })

  const setIsSending = (val) => {
    sending.isSending = val
  }

  const setSendingId = (val) => {
    sending.id = val
  }

  async function getMessage(body, params) {
    setIsSending(true)

    try {
      const response = await post_GetMessage(body)
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
    return messages.value
  }

  function set(id, options) {
    const message = messages.value.find((message) => message.id === id)
    if (message) {
      Object.assign(message, options, { time: new Date() })
    }
    return messages.value
  }

  function getHistoryMsg(typ, params = {}) {
    let filteredMessages = messages.value.filter((message) => !message.skip)
    if (typ === 'part' && params.id) {
      const idIndex = filteredMessages.findIndex((message) => message.id === params.id)
      filteredMessages = filteredMessages.slice(0, idIndex + 1)
    }
    let content = filteredMessages.map((message) => message.msg).join('\n')
    content = content.slice(-4096)
    console.log(typ, content.length, content)
    return content
  }

  return {
    messages,
    length,
    getMessage,
    push,
    del,
    set,
    getHistoryMsg,
    sending,
    setIsSending,
    setSendingId
  }
})

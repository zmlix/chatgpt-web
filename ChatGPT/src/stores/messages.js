import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { random32BitNumber } from '../utils/utils.js'
import { post_GetMessage } from '../api/api.js'

export const useMessagesStore = defineStore('messages', () => {
  const messages = ref([
    // {
    //   id: 3,
    //   typ: 'chatgpt',
    //   msg: '我是一个人工智能语言处理程序，被称为OpenAI GPT-3。我是由OpenAI开发的一种自然语言处理技术，可以通过分析和理解语言来生成与人类相似的自然语言文本。我可以回答你的问题、提供信息、创作文本，并与你进行互动交流。虽然我不像人类一样有情感和主观思维，但我可以根据输入的指令和语料库中的内容生成语言文本，希望能为您提供帮助。',
    //   status: 'success',
    //   skip: false
    // },
    // {
    //   id: 4,
    //   typ: 'chatgpt',
    //   msg: "\n\n```python\nimport datetime\n\ndef get_weekday():\n    today = datetime.datetime.today().weekday()\n    \n    weekdays = {\n        0: '星期一',\n        1: '星期二',\n        2: '星期三',\n        3: '星期四',\n        4: '星期五',\n        5: '星期六',\n        6: '星期日'\n    }\n    \n    return weekdays[today]\n\n# 调用函数获取今天是星期几\nprint(get_weekday())\n```\n\n输出结果会是今天的星期几，中文格式。",
    //   status: 'success',
    //   skip: false
    // },
    // {
    //   id: 0,
    //   typ: 'chatgpt',
    //   msg: '\n\n正态分布的概率密度函数公式为：\n\n$$f(x) = \\frac{1}{\\sigma \\sqrt{2\\pi}}e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}$$\n\n其中，$\\mu$ 表示正态分布的均值，$\\sigma$ 表示正态分布的标准差，$e$ 为自然对数的底数。',
    //   status: 'success',
    //   skip: false
    // },
    // {
    //   id: 1,
    //   typ: 'chatgpt',
    //   msg: '<font color="red">**Error:** 请求出错</font>',
    //   status: 'error',
    //   skip: true
    // }
  ])

  const length = computed(() => messages.value.length)
  const sending = ref({
    id: -1,
    isSending: false
  })

  function setIsSending(val) {
    sending.value.isSending = val
  }

  function setSendingId(val) {
    sending.value.id = val
  }

  function getMessage(body, params) {
    setIsSending(true)
    body.token = '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'
    return post_GetMessage('http://23.105.196.211:8000/chatgpt', body)
      .then(function (response) {
        console.log(response)
        push(
          {
            typ: 'chatgpt',
            msg: response['data']['choices'][0]['message']['content'],
            status: 'success'
          },
          params
        )
      })
      .catch(function (error) {
        push(
          {
            typ: 'sys',
            msg: '<font color="red">Error: 请求出错</font>',
            status: 'error'
          },
          params
        )
        console.log(error)
      })
      .finally(function () {
        setIsSending(false)
      })
  }

  function push(msg, params) {
    params = params || {}
    msg.id = random32BitNumber()
    if (msg.status != 'success') {
      msg.skip = true
    } else {
      msg.skip = false
    }
    if ('insert' in params) {
      const id = params.insert.id
      for (let i = 0; i < length.value; i++) {
        if (messages.value[i]['id'] == id) {
          messages.value.splice(i + 1, 0, msg)
          break
        }
      }
    } else {
      messages.value.push(msg)
    }
    setSendingId(msg.id)
    console.log(params, msg)
  }

  function del(id) {
    for (let i = 0; i < messages.value.length; i++) {
      if (messages.value[i]['id'] === id) {
        messages.value.splice(i, 1)
        break
      }
    }
    return messages.value
  }

  function set(id, options) {
    for (let i = 0; i < messages.value.length; i++) {
      if (messages.value[i]['id'] === id) {
        for (const key in options) {
          messages.value[i][key] = options[key]
        }
        break
      }
    }
    return messages.value
  }

  function getHistoryMsg(typ, params = {}) {
    var content = ''
    if (typ === 'all') {
      for (let i = messages.value.length - 1; i >= 0; i--) {
        if (messages.value[i].skip) continue
        content = messages.value[i].msg + '\n' + content
      }
    }
    if (typ === 'part') {
      const id = params.id
      for (let i = 0; i < messages.value.length; i++) {
        if (messages.value[i].skip) continue
        content += messages.value[i].msg + '\n'
        if (messages.value[i]['id'] == id) break
      }
    }
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

<script setup>
import { reactive, ref } from 'vue'
import { showMessage } from '../utils/utils'
import { useMessagesStore } from '../stores/messages'
import { useSysStore } from '../stores/sys'
const messagesStore = useMessagesStore()
const sysStore = useSysStore()

const input = ref('')
const sending = messagesStore.sending
const isSearchPrompt = ref(false)
const body = reactive({})

const sendByKey = (event) => {
  const { shiftKey, keyCode } = event
  if (isSearchPrompt.value) {
    return
  }
  if (!shiftKey && keyCode === 13) {
    event.stopPropagation()
    event.preventDefault()
    send()
  }
}

const send = () => {
  console.log(sending)
  if (input.value == '') {
    showMessage('请输入内容', 'error')
    return
  }
  if (sending.isSending) {
    showMessage('请等待回答完毕', 'error')
    return
  }
  const Q_id = messagesStore.push({
    role: 'user',
    msg: input.value,
    status: 'success'
  })
  input.value = ''
  body.messages = messagesStore.getHistoryMsg('all')
  messagesStore.getMessage(body)
  messagesStore.set(Q_id, { skip: sysStore.skipHistoryMessages })
}

const searchPrompts = (queryString, cb) => {
  isSearchPrompt.value = false
  if (queryString[0] === '/') {
    const query = queryString.substring(1)
    isSearchPrompt.value = true
    console.log(query)
    const results = sysStore.promptList.filter(
      (p) =>
        p.act.toLowerCase().indexOf(query.toLowerCase()) >= 0 ||
        p.prompt.toLowerCase().indexOf(query.toLowerCase()) >= 0
    )
    cb(results)
    return
  }
  cb([])
}

const selectPrompt = (prompt) => {
  if (prompt.prompt) {
    input.value = prompt.prompt
  } else if (isSearchPrompt.value) {
    send()
    setTimeout(() => {
      input.value = ''
    }, 301)
  }
  isSearchPrompt.value = false
}
</script>

<template>
  <div class="flex gap-3 w-full">
    <el-autocomplete
      v-model="input"
      :autosize="{ minRows: 1, maxRows: 4 }"
      type="textarea"
      placement="top-start"
      fit-input-width
      :fetch-suggestions="searchPrompts"
      select-when-unmatched
      placeholder="请输入 (使用Shift+Enter换行)"
      resize="none"
      @keydown="sendByKey"
      @select="selectPrompt"
      class="w-full"
    >
      <template #default="{ item }">
        <div class="flex flex-col">
          <span class="font-bold">{{ item.act }}</span>
          <span class="truncate">{{ item.prompt }}</span>
        </div>
      </template>
    </el-autocomplete>
    <el-button color="#626aef" class="w-14 sm:w-24" style="height: 100%" @click="send" round
      >发送</el-button
    >
  </div>
</template>

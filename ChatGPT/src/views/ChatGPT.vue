<script setup>
import { reactive, ref } from 'vue'
import MessageBox from '../components/MessageBox.vue'
import SideBar from '../components/SideBar.vue'
import StopRequest from '../components/StopRequest.vue'
import { useMessagesStore } from '../stores/messages'
import { useSysStore } from '../stores/sys'
import { showMessage } from '../utils/utils'
import { Setting } from '@element-plus/icons-vue'
const messagesStore = useMessagesStore()
const sysStore = useSysStore()
const messages = messagesStore.initMessages()

// const role_list = reactive([
//   {
//     label: '用户',
//     value: 'user'
//   },
//   {
//     label: '助手',
//     value: 'assistant'
//   },
//   {
//     label: '系统',
//     value: 'system'
//   }
// ])

const input = ref('')
const sending = messagesStore.sending

const body = reactive({
  role: 'user',
  content: ''
})

const sendByKey = (event) => {
  const { shiftKey, keyCode } = event
  if (!shiftKey && keyCode === 13) {
    event.stopPropagation()
    event.preventDefault()
    send()
  }
}

const send = () => {
  if (input.value == '') {
    showMessage('请输入内容', 'error')
    return
  }
  console.log(sending)
  if (sending.isSending) {
    showMessage('请等待回答完毕', 'error')
    return
  }
  messagesStore.push({
    typ: 'user',
    msg: input.value,
    status: 'success'
  })
  input.value = ''
  body.content = messagesStore.getHistoryMsg('all')
  messagesStore.getMessage(body)
}

const openSideBarHandle = () => {
  sysStore.openSideBar = !sysStore.openSideBar
}
</script>

<template>
  <div class="chat flex flex-col h-full px-7 py-6">
    <div class="flex flex-col h-full border-0 rounded-3xl shadow-2xl shadow-indigo-900">
      <p class="chat-title m-auto text-6xl font-semibold py-1 bg-clip-text text-transparent">
        ChatGPT
      </p>
      <MessageBox :messages="messages" />
      <StopRequest></StopRequest>
      <div class="flex m-5">
        <div class="flex items-center mr-4">
          <el-button class="" @click="openSideBarHandle" circle :icon="Setting"></el-button>
        </div>
        <div class="flex gap-3 w-full">
          <el-input
            v-model="input"
            :autosize="{ minRows: 1, maxRows: 4 }"
            type="textarea"
            placeholder="请输入 (使用Shift+Enter换行)"
            maxlength="3000"
            clearable
            show-word-limit
            resize="none"
            @keydown="sendByKey"
          />
          <el-button color="#626aef" class="w-24" style="height: 100%" @click="send" round
            >发送</el-button
          >
        </div>
      </div>
    </div>
    <SideBar></SideBar>
  </div>
</template>

<style scoped>
.chat {
  background: linear-gradient(to right bottom, #ab79c2, #8a84bf, #6b91c1);
}

.chat-title {
  font-family: Inter;
  background-image: linear-gradient(135deg, #756aee 53%, #ee756a 10%);
}
</style>

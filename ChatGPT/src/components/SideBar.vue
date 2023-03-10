<script setup>
import { ref } from 'vue'
import { Plus, Download, Upload, Key } from '@element-plus/icons-vue'
import { useChatStore } from '../stores/chat'
import { showMessage } from '../utils/utils'
import { useMessagesStore } from '../stores/messages'
import { ElMessage, ElMessageBox } from 'element-plus'
import draggable from 'vuedraggable'
import ChatCard from './ChatCard.vue'
const chatStore = useChatStore()
const messagesStore = useMessagesStore()

const chats = chatStore.chats
const uploadChatList = ref([])

const newChat = () => {
  if (messagesStore.sending.isSending) {
    showMessage('请等待回答完毕', 'error')
    return
  }
  messagesStore.newMessages()
}

const download = () => {
  chatStore.exportChats()
}

const upload = (_, uploadFile) => {
  chatStore.uploadChats(uploadFile.raw)
}

const size = () => {
  return window.innerWidth <= 768 ? '100%' : '350'
}

const setApiKey = () => {
  ElMessageBox.prompt('请输入OPENAI_API_KEY', '设置API KEY', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPlaceholder: 'OPENAI_API_KEY',
    inputValue: messagesStore.API_KEY,
    inputPattern: /^\s*[^ ]+\s*$/,
    inputErrorMessage: '不合法的OPENAI_API_KEY'
  })
    .then(({ value }) => {
      messagesStore.API_KEY = value
      ElMessage({
        type: 'success',
        message: `您已经成功设置OPENAI_API_KEY:\n${value}`
      })
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '已取消设置OPENAI_API_KEY'
      })
    })
}
</script>

<template>
  <div>
    <el-drawer v-model="chatStore.openSideBar" direction="ltr" :with-header="false" :size="size()">
      <div class="flex flex-col h-full">
        <el-button @click="newChat" :icon="Plus" style="width: 100%">New Chat</el-button>
        <el-scrollbar>
          <draggable :list="chats" handle=".drag-chat" item-key="idx">
            <template #item="{ element }">
              <div>
                <ChatCard :chat="element"></ChatCard>
              </div>
            </template>
          </draggable>
        </el-scrollbar>
        <div class="flex gap-1">
          <el-button type="primary" :icon="Key" style="width: 30%" @click="setApiKey"
            >API KEY</el-button
          >
          <el-button :icon="Download" style="width: 100%" @click="download">导出</el-button>
          <el-upload v-model:file-list="uploadChatList" :on-progress="upload">
            <el-button :icon="Upload" style="width: 100%">导入</el-button>
          </el-upload>
        </div>
      </div>
      <template #footer>
        <div style="flex: auto">
          <el-button @click="chatStore.openSideBar = false" type="danger" style="width: 100%"
            >关闭</el-button
          >
        </div>
      </template>
    </el-drawer>
  </div>
</template>

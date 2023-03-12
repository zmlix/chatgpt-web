<script setup>
import { ref } from 'vue'
import { Plus, Download, Upload } from '@element-plus/icons-vue'
import { showMessage } from '../utils/utils'
import { useChatStore } from '../stores/chat'
import { useSysStore } from '../stores/sys'
import { useMessagesStore } from '../stores/messages'
import draggable from 'vuedraggable'
import ChatCard from './ChatCard.vue'
import SettingDialog from './SettingDialog.vue'
const chatStore = useChatStore()
const messagesStore = useMessagesStore()
const sysStore = useSysStore()

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
</script>

<template>
  <div>
    <el-drawer v-model="sysStore.openSideBar" direction="ltr" :with-header="false" :size="size()">
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
          <SettingDialog></SettingDialog>
          <el-button :icon="Download" style="width: 100%" @click="download">导出</el-button>
          <el-upload v-model:file-list="uploadChatList" :on-progress="upload">
            <el-button :icon="Upload" style="width: 100%">导入</el-button>
          </el-upload>
        </div>
      </div>
      <template #footer>
        <div style="flex: auto">
          <el-button @click="sysStore.openSideBar = false" type="danger" style="width: 100%"
            >关闭</el-button
          >
        </div>
      </template>
    </el-drawer>
  </div>
</template>

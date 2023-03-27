<script setup>
import { onMounted, ref } from 'vue'
import { Plus, Download, Upload, Refresh, ArrowDownBold } from '@element-plus/icons-vue'
import { showMessage } from '../utils/utils'
import { useChatStore } from '../stores/chat'
import { useSysStore } from '../stores/sys'
import { useMessagesStore } from '../stores/messages'
import { get_GetCreditGrants } from '../api/api'
import draggable from 'vuedraggable'
import ChatCard from './ChatCard.vue'
import SettingDialog from './SettingDialog.vue'
import PromptStore from './PromptStore.vue'
const chatStore = useChatStore()
const messagesStore = useMessagesStore()
const sysStore = useSysStore()

const chats = chatStore.chats
const uploadChatList = ref([])
const isGetCreditGrants = ref(false)

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

const getCreditGrants = async () => {
  if (isGetCreditGrants.value) {
    showMessage('正在获取余额中...', 'info')
    return
  }
  sysStore.creditGrants = '获取中...'
  isGetCreditGrants.value = true
  try {
    const response = await get_GetCreditGrants(sysStore.API_URL, sysStore.API_KEY)
    sysStore.creditGrants = response.data.total_available.toFixed(8) + ' USD'
  } catch (error) {
    sysStore.creditGrants = '获取失败'
    console.log(error)
  } finally {
    isGetCreditGrants.value = false
  }
}

const size = ref(document.body.clientWidth <= 640 ? document.body.clientWidth - 16 : 350)
onMounted(() => {
  window.onresize = () => {
    return (() => {
      size.value = document.body.clientWidth <= 640 ? document.body.clientWidth - 16 : 350
    })()
  }
})
</script>

<template>
  <div>
    <el-drawer
      v-model="sysStore.openSideBar"
      direction="ltr"
      :with-header="false"
      :size="size"
      class="mx-2 sm:mx-7 my-4 sm:my-6 rounded-3xl"
      style="height: auto"
    >
      <div class="flex flex-col h-full">
        <div
          class="flex items-center justify-between h-8 mb-2 pb-2 pl-2 border-b border-dashed border-b-gray-400"
        >
          <span class="text-sm">余额: {{ sysStore.creditGrants }}</span>
          <el-button size="small" :icon="Refresh" @click="getCreditGrants">刷新余额</el-button>
        </div>
        <div class="flex items-center">
          <el-button @click="newChat" :icon="Plus" style="width: 100%">New Chat</el-button>
          <el-popover placement="left" trigger="click" width="190">
            <template #reference>
              <el-button :icon="ArrowDownBold" circle />
            </template>
            <template #default>
              <div class="flex gap-2">
                <el-button :icon="Download" @click="download">导出</el-button>
                <el-upload v-model:file-list="uploadChatList" :on-progress="upload" class="flex">
                  <el-button :icon="Upload">导入</el-button>
                </el-upload>
              </div>
            </template>
          </el-popover>
        </div>
        <el-scrollbar>
          <draggable :list="chats" handle=".drag-chat" item-key="idx">
            <template #item="{ element }">
              <ChatCard :chat="element"></ChatCard>
            </template>
          </draggable>
        </el-scrollbar>
        <div class="flex gap-1 relative top-3">
          <SettingDialog :size="size"></SettingDialog>
          <PromptStore :size="size"></PromptStore>
        </div>
      </div>
      <template #footer>
        <div style="flex: auto">
          <el-button @click="() => (sysStore.openSideBar = false)" type="danger" style="width: 100%"
            >关闭</el-button
          >
          <span class="flex items-center justify-center text-sm mt-2 border-2 border-dotted"
            >Star on &nbsp;<a
              href="https://github.com/zmlix/chatgpt-web"
              target="_blank"
              class="text-blue-400"
              >GitHub</a
            >&nbsp; @zmlix
          </span>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

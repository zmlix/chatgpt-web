<script setup>
import { ref } from 'vue'
import { Plus, Download, Upload, Refresh, ArrowDownBold } from '@element-plus/icons-vue'
import { showMessage } from '../utils/utils'
import { useChatStore } from '../stores/chat'
import { useSysStore } from '../stores/sys'
import { useMessagesStore } from '../stores/messages'
import { get_GetCreditGrants, get_GetSubscription, get_GetUsage } from '../api/api'
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

defineProps({
  size: {
    type: Number,
    required: true
  }
})

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
  sysStore.creditGrants = '查询中...'
  isGetCreditGrants.value = true

  const now = new Date()
  const startDate = new Date(now - 90 * 24 * 60 * 60 * 1000)
  const endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000)

  try {
    if (sysStore.API_URL.indexOf('api.openai.com') >= 0) {
      const subscription = await (await get_GetSubscription(sysStore.API_KEY)).data
      const t_now = Math.floor(Date.now() / 1000)
      const t_expire = subscription.access_until
      if (t_now > t_expire) {
        sysStore.creditGrants = '免费额度已过期,查询账户额度中...'
      }

      const totalAmount = subscription.hard_limit_usd
      const is_subsrcibed = subscription.has_payment_method

      let usage = await (await get_GetUsage(sysStore.API_KEY, startDate, endDate)).data
      let totalUsage = usage.total_usage / 100

      if (is_subsrcibed) {
        const startDate = new Date(now - (now.getDate() - 1) * 24 * 60 * 60 * 1000)
        usage = await (await get_GetUsage(sysStore.API_KEY, startDate, endDate)).data
        totalUsage = usage.total_usage / 100
      }
      sysStore.creditGrants = `${(totalAmount - totalUsage).toFixed(5)} USD`
    } else {
      const response = await get_GetCreditGrants(sysStore.API_URL, sysStore.API_KEY)
      sysStore.creditGrants = response.data.total_available.toFixed(8) + ' USD'
    }
  } catch (error) {
    sysStore.creditGrants = '查询失败,请登录OpenAI进行查看'
    console.log(error)
  } finally {
    isGetCreditGrants.value = false
  }
}
</script>

<template>
  <div class="flex flex-col h-full w-full">
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
    <div class="pt-5">
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
  </div>
</template>

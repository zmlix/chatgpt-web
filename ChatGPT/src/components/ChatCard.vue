<script setup>
import { computed, ref } from 'vue'
import { Edit, Delete, Check, ChatDotSquare } from '@element-plus/icons-vue'
import { useChatStore } from '../stores/chat'
import { showMessage } from '../utils/utils'
import { useMessagesStore } from '../stores/messages'
const chatStore = useChatStore()
const messagesStore = useMessagesStore()

const props = defineProps({
  chat: {
    type: Object,
    required: true
  }
})

const title = ref('')
const isRenameChat = ref(false)

const isSelected = computed(() => {
  return props.chat.idx == chatStore.currentChatIdx
})

const getChat = () => {
  if (messagesStore.sending.isSending) {
    showMessage('请等待回答完毕', 'error')
    return
  }
  console.log(chatStore.currentChatIdx)
  messagesStore.getMessages(props.chat.idx)
}

const delChat = () => {
  messagesStore.delMessages(props.chat.idx)
}

const renameChat = () => {
  isRenameChat.value = !isRenameChat.value
  title.value = props.chat.title
}

const rename = () => {
  chatStore.renameChatByIdx(props.chat.idx, title.value)
  isRenameChat.value = false
}
</script>

<template>
  <div
    class="flex items-center my-1 w-full border h-8 hover:cursor-pointer"
    :class="isSelected ? 'bg-gray-200' : ''"
  >
    <el-icon class="mx-1 hover:cursor-move drag-chat">
      <ChatDotSquare />
    </el-icon>
    <span
      v-if="!isRenameChat"
      class="px-3 w-full h-5 text-sm overflow-hidden text-ellipsis whitespace-nowrap"
      @click="getChat"
    >
      {{ chat.title }}</span
    >
    <el-input v-model="title" placeholder="请输入" v-else>
      <template #append>
        <el-button :icon="Check" @click="rename" />
      </template>
    </el-input>
    <div class="flex px-2 gap-2">
      <el-icon @click="renameChat">
        <Edit />
      </el-icon>
      <el-icon @click="delChat">
        <Delete />
      </el-icon>
    </div>
  </div>
</template>

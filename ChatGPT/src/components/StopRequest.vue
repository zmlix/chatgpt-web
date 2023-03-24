<script setup>
import { useMessagesStore } from '../stores/messages'
const messagesStore = useMessagesStore()

const stop = () => {
  console.log('stop...')
  messagesStore.setIsSending(false)
}
</script>

<template>
  <div
    v-show="messagesStore.sending.isSending"
    class="flex items-center justify-center w-full h-0 relative bottom-6"
  >
    <div
      class="flex items-center justify-center w-28 h-8 bg-indigo-500 rounded text-white hover:cursor-pointer active:bg-indigo-600"
    >
      <div class="w-3 h-3 mr-1 border-2 border-white"></div>
      <span class="m-1 text-sm font-sans" @click="stop">停止请求</span>
    </div>
  </div>
</template>

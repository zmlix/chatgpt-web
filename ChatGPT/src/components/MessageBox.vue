<script setup>
import Message from '../components/MessageInfo.vue'
// import { ElLoading } from 'element-plus'
import { watch, ref } from 'vue'
import { useMessagesStore } from '../stores/messages'
const messagesStore = useMessagesStore()
const sending = messagesStore.sending

defineProps({
  messages: {
    type: Array,
    required: true
  }
})

const scrollbarRef = ref(null)
const innerRef = ref(null)

watch(sending, () => {
  setTimeout(() => {
    console.log('scroll...')
    scrollbarRef.value.setScrollTop(innerRef.value.clientHeight)
  }, 200)
})
</script>

<template>
  <el-scrollbar ref="scrollbarRef">
    <div class="message-box" ref="innerRef">
      <Message v-for="(message, key) in messages" :key="key" :message="message"></Message>
    </div>
  </el-scrollbar>
</template>

<style scoped>
.message-box {
  height: 100%;
  margin: 10px 20px;
  padding: 5px;
}
</style>

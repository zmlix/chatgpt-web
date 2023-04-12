<script setup>
import { watch, ref } from 'vue'
import draggable from 'vuedraggable'
import Message from '../components/MessageInfo.vue'
import { useMessagesStore } from '../stores/messages'
const messagesStore = useMessagesStore()
const sending = messagesStore.sending

defineProps({
  messages: {
    type: Array,
    required: true
  },
  display: {
    type: String,
    required: true
  }
})

const scrollbarRef = ref(null)
const innerRef = ref(null)

watch(sending, () => {
  setTimeout(() => {
    console.log('scroll...')
    if (sending.typ === 'all') {
      scrollbarRef.value.setScrollTop(innerRef.value.clientHeight)
    }
  }, 200)
})
</script>

<template>
  <el-scrollbar ref="scrollbarRef" class="grid pl-3 pr-5">
    <div class="message-box h-full my-2" ref="innerRef">
      <draggable :list="messages" handle=".drag-msg" item-key="id">
        <template #item="{ element }">
          <div class="w-full">
            <Message :message="element" :display="display"></Message>
          </div>
        </template>
      </draggable>
    </div>
  </el-scrollbar>
</template>

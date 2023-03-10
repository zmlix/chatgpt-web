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
  <el-scrollbar ref="scrollbarRef">
    <div class="h-full mx-5 my-2" ref="innerRef">
      <draggable :list="messages" handle=".drag-msg" item-key="id">
        <template #item="{ element }">
          <div>
            <Message :message="element"></Message>
          </div>
        </template>
      </draggable>
    </div>
  </el-scrollbar>
</template>

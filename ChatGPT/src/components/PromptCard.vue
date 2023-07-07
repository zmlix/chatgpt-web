<script setup>
import { showMessage } from '../utils/utils'
import { useMessagesStore } from '../stores/messages'
import { useSysStore } from '../stores/sys'
import useClipboard from 'vue-clipboard3'
const messagesStore = useMessagesStore()
const sysStore = useSysStore()
const { toClipboard } = useClipboard()

const emit = defineEmits(['close-store', 'edit-prompt'])
const props = defineProps({
  prompt: {
    type: Object,
    required: true
  }
})

const copy = async () => {
  try {
    await toClipboard(props.prompt.prompt)
    showMessage('复制成功', 'success')
  } catch (e) {
    console.error(e)
    showMessage('复制失败', 'error')
  }
}

const edit = (_) => {
  console.log('editPrompt...')
  emit('edit-prompt', _, { ...props.prompt })
}

const usePrompt = async () => {
  if (messagesStore.sending.isSending) {
    showMessage('请等待回答完毕', 'error')
    return
  }
  emit('close-store')
  sysStore.openSideBar = false
  try {
    messagesStore.newMessages()
    const msg_id = messagesStore.pushMessage(props.prompt.prompt, {
      role: 'system',
      status: 'success'
    })
    await messagesStore.getMessage({
      messages: messagesStore.getHistoryMsg('part', { id: msg_id })
    })
  } catch (error) {
    showMessage('失败', 'error')
    console.log(error)
  }
}
</script>

<template>
  <div class="flex border-t border-t-gray-300 border-dashed pt-2 m-1">
    <el-descriptions :column="1" size="small" border direction="vertical">
      <template #extra>
        <div class="flex w-full items-center justify-between">
          <span class="text-sm whitespace-nowrap overflow-x-auto w-44"> {{ prompt.act }} </span>
          <span class="drag-prompt"></span>
          <div class="flex">
            <el-button size="small" @click="edit" v-show="prompt.type === 'user'">编辑</el-button>
            <el-button size="small" @click="copy" v-show="!(prompt.type === 'user')"
              >复制</el-button
            >
            <el-button size="small" type="success" @click="usePrompt">使用</el-button>
          </div>
        </div>
      </template>
      <el-descriptions-item label="prompt" label-align="center" align="left" width="700px">
        {{ prompt.prompt }}
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<style>
.el-descriptions__extra {
  width: 100%;
}
</style>

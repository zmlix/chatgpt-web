<script setup>
import { ref, watch } from 'vue'
import { get_GetPrompts } from '../api/api'
import { useSysStore } from '../stores/sys'
import { ElLoading } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import draggable from 'vuedraggable'
import PromptCard from './PromptCard.vue'
import axios from 'axios'

defineProps({
  size: {
    type: String,
    required: true
  }
})

const cancelToken = axios.CancelToken
const sysStore = useSysStore()
const isOpen = ref(false)

const promptList = sysStore.promptList
const prompts = ref(promptList)

const source = ref(null)
const getPrompts = async (cancelToken) => {
  const loading = ElLoading.service({
    target: '.prompt-store' || document.querySelector('.prompt-store'),
    fullscreen: false
  })
  try {
    const response = await get_GetPrompts(cancelToken)
    const webPromptList = response.data.map((item) => {
      item.type = 'web'
      return item
    })
    sysStore.setPromptList(webPromptList)
  } catch (error) {
    console.log(error)
  } finally {
    prompts.value = promptList
    loading.close()
  }
}

watch(isOpen, (val) => {
  if (val) {
    setTimeout(() => {
      source.value = cancelToken.source()
      getPrompts(source.value.token)
    }, 500)
  } else {
    setTimeout(() => {
      source.value.cancel()
    }, 500)
  }
})

const input = ref('')
const search = (val) => {
  prompts.value = promptList.filter(
    (item) => item.act.toLowerCase().indexOf(val.toLowerCase()) >= 0
  )
}
</script>

<template>
  <div class="w-full">
    <el-button class="w-full" @click="() => (isOpen = !isOpen)">Prompt 商城</el-button>
    <el-drawer
      :model-value="isOpen"
      direction="ltr"
      :with-header="false"
      :size="size"
      @closed="() => (isOpen = false)"
      class="flex"
    >
      <div class="m-1">
        <el-input v-model="input" placeholder="搜索Prompt" :prefix-icon="Search" @input="search" />
      </div>
      <el-scrollbar class="prompt-store">
        <draggable :list="prompts" handle=".drag-prompt" item-key="idx">
          <template #item="{ element }">
            <PromptCard :prompt="element" @close-store="() => (isOpen = false)"></PromptCard>
          </template>
        </draggable>
      </el-scrollbar>
      <template #footer>
        <div style="flex: auto">
          <el-button @click="() => (isOpen = false)" style="width: 100%">返回</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<style>
.el-drawer__body {
  display: flex;
  flex-direction: column;
}
</style>

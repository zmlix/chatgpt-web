<script setup>
import { ref, onMounted, watch } from 'vue'
import { get_GetPrompts } from '../api/api'
import { useSysStore } from '../stores/sys'
import { ElLoading } from 'element-plus'
import draggable from 'vuedraggable'
import PromptCard from './PromptCard.vue'
const sysStore = useSysStore()
const isOpen = ref(false)

const promptList = sysStore.promptList

const getPrompts = async () => {
  const loading = ElLoading.service({
    target: document.querySelector('.prompt-store'),
    fullscreen: false
  })
  try {
    const response = await get_GetPrompts()
    const webPromptList = response.data.map((item) => {
      item.type = 'web'
      return item
    })
    sysStore.setPromptList(webPromptList)
  } catch (error) {
    console.log(error)
  } finally {
    loading.close()
  }
}

watch(isOpen, (val) => {
  if (val) {
    getPrompts()
  }
})

const size = ref(document.body.clientWidth <= 640 ? '100%' : '350px')
onMounted(() => {
  window.onresize = () => {
    return (() => {
      size.value = document.body.clientWidth <= 640 ? '100%' : '350px'
    })()
  }
})
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
    >
      <el-scrollbar class="prompt-store">
        <draggable :list="promptList" handle=".drag-prompt" item-key="idx">
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

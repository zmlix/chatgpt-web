<script setup>
import { ref, watch } from 'vue'
import { get_GetPrompts } from '../api/api'
import { random32BitNumber, showMessage } from '../utils/utils.js'
import { useSysStore } from '../stores/sys'
import { ElLoading } from 'element-plus'
import { Search, Plus, Check } from '@element-plus/icons-vue'
import draggable from 'vuedraggable'
import PromptCard from './PromptCard.vue'
import axios from 'axios'

defineProps({
  size: {
    type: Number,
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
    showMessage('获取远程Prompt失败', 'error')
    console.log(error)
  } finally {
    prompts.value = sysStore.promptList
    loading.close()
  }
}

const refresh = () => {
  setTimeout(() => {
    source.value = cancelToken.source()
    getPrompts(source.value.token)
  }, 500)
}

watch(isOpen, (val) => {
  console.log(sysStore.promptList.length)
  if (!sysStore.promptList.length) {
    if (val) {
      setTimeout(() => {
        source.value = cancelToken.source()
        getPrompts(source.value.token)
      }, 500)
    } else {
      prompts.value = sysStore.promptList
      setTimeout(() => {
        source.value.cancel()
      }, 500)
    }
  }
})

const input = ref('')
const search = (val) => {
  prompts.value = sysStore.promptList.filter(
    (item) =>
      item.act.toLowerCase().indexOf(val.toLowerCase()) >= 0 ||
      item.prompt.toLowerCase().indexOf(val.toLowerCase()) >= 0
  )
}

const promptForm = ref({
  act: '',
  prompt: '',
  type: '',
  id: random32BitNumber()
})

const isAddPrompt = ref(false)
const addPrompt = (_, p) => {
  console.log('addPrompt...')
  isAddPrompt.value = true
  if (!p) {
    p = {
      act: '',
      prompt: '',
      type: '',
      id: random32BitNumber()
    }
  }
  promptForm.value = p
}

const savePrompt = () => {
  console.log('savePrompt...', promptForm.value)
  if (promptForm.value.act === '' || promptForm.value.prompt === '') {
    showMessage('请正确输入名字和Prompt', 'warning')
    return
  }
  promptForm.value.type = 'user'
  sysStore.addPrompt(promptForm.value)
  prompts.value = sysStore.promptList
  showMessage('保存成功', 'success')
  isAddPrompt.value = false
}

const delPrompt = () => {
  sysStore.delPrompt(promptForm.value)
  showMessage('删除成功', 'success')
  prompts.value = sysStore.promptList
  isAddPrompt.value = false
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
      class="flex mx-2 sm:mx-7 my-4 sm:my-6 rounded-3xl"
      style="height: auto"
    >
      <div class="flex m-1">
        <div class="flex gap-2 w-full" v-show="!isAddPrompt">
          <el-input
            v-model="input"
            placeholder="搜索Prompt"
            :prefix-icon="Search"
            @input="search"
          />
          <el-button type="primary" :icon="Plus" @click="addPrompt">添加</el-button>
        </div>
        <div class="flex gap-2 w-full" v-show="isAddPrompt">
          <el-button type="success" :icon="Check" style="width: 100%" @click="savePrompt"
            >保存</el-button
          >
          <el-button
            type="danger"
            :icon="Check"
            style="width: 100%"
            @click="delPrompt"
            v-show="promptForm.type === 'user'"
            >删除</el-button
          >
        </div>
      </div>
      <el-scrollbar class="prompt-store" v-show="!isAddPrompt">
        <draggable :list="prompts" handle=".drag-prompt" item-key="idx">
          <template #item="{ element }">
            <PromptCard
              :prompt="element"
              @close-store="() => (isOpen = false)"
              @edit-prompt="addPrompt"
            ></PromptCard>
          </template>
        </draggable>
      </el-scrollbar>
      <div class="h-full w-full p-2" v-show="isAddPrompt">
        <el-form :model="promptForm" label-width="auto" label-position="top">
          <el-form-item label="名字">
            <el-input v-model="promptForm.act" placeholder="给你的Prompt起个名字" clearable />
          </el-form-item>
          <el-form-item label="Prompt">
            <el-input
              v-model="promptForm.prompt"
              type="textarea"
              :autosize="{ minRows: 10, maxRows: 25 }"
              resize="none"
              placeholder="请输入"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="flex" v-show="!isAddPrompt">
          <el-button @click="refresh">刷新</el-button>
          <el-button @click="() => (isOpen = false)" style="width: 100%">返回</el-button>
        </div>
        <div>
          <el-button
            @click="() => (isAddPrompt = false)"
            type="danger"
            style="width: 100%"
            v-show="isAddPrompt"
            >取消</el-button
          >
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

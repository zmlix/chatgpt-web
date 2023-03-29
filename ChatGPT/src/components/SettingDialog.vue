<script setup>
import { ref } from 'vue'
import { Operation } from '@element-plus/icons-vue'

import { useSysStore } from '../stores/sys.js'
import { env } from '../env'
const sysStore = useSysStore()

defineProps({
  size: {
    type: Number,
    required: true
  }
})

const setting = ref({
  api_url: '',
  api_key: '',
  stream: true,
  temperature: 1
})

const openSettingDialogHandle = () => {
  sysStore.openSettingDialog = true
  setting.value.api_key = sysStore.API_KEY
  setting.value.api_url = sysStore.API_URL
  setting.value.stream = sysStore.stream
  setting.value.temperature = sysStore.temperature
}

const enter = () => {
  if (setting.value.api_url == '') {
    setting.value.api_url = env.apiURL
  }
  sysStore.set(setting.value.api_key, setting.value.api_url)
  sysStore.stream = setting.value.stream
  sysStore.temperature = setting.value.temperature
  sysStore.openSettingDialog = false
}
</script>

<template>
  <div>
    <el-button :icon="Operation" style="width: 100%" @click="openSettingDialogHandle"
      >配置</el-button
    >
    <el-drawer
      v-model="sysStore.openSettingDialog"
      direction="ltr"
      :with-header="false"
      :size="size"
      class="flex mx-2 sm:mx-7 my-4 sm:my-6 rounded-3xl"
      style="height: auto"
    >
      <div>
        <el-form label-position="top" label-width="100px" :model="setting">
          <el-form-item label="API URL">
            <el-input v-model="setting.api_url" placeholder="默认使用官方API" />
          </el-form-item>
          <el-form-item label="OPENAI_API_KEY">
            <el-input v-model="setting.api_key" placeholder="官方API必须设置此项才能使用" />
          </el-form-item>
        </el-form>
        <el-divider />
        <div class="flex items-center justify-between">
          <label class="el-form-item__label">打字机效果</label>
          <el-switch v-model="setting.stream" />
        </div>
        <el-divider />
        <div class="flex flex-col items-start">
          <label class="el-form-item__label">温度(较高的值将使输出更加随机)</label>
          <el-slider v-model="setting.temperature" :max="2" :step="0.1" />
        </div>
      </div>
      <template #footer>
        <div class="flex">
          <el-button @click="() => (sysStore.openSettingDialog = false)" style="width: 100%"
            >取消</el-button
          >
          <el-button type="primary" @click="enter" style="width: 100%"> 确定 </el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

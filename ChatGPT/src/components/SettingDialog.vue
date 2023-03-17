<script setup>
import { ref } from 'vue'
import { Operation } from '@element-plus/icons-vue'

import { useSysStore } from '../stores/sys.js'
import { env } from '../env'
const sysStore = useSysStore()

const setting = ref({
  api_url: '',
  api_key: '',
  stream: true
})

const openSettingDialogHandle = () => {
  sysStore.openSettingDialog = true
  setting.value.api_key = sysStore.API_KEY
  setting.value.api_url = sysStore.API_URL
  setting.value.stream = sysStore.stream
}

const enter = () => {
  if (setting.value.api_url == '') {
    setting.value.api_url = env.apiURL
  }
  sysStore.set(setting.value.api_key, setting.value.api_url)
  sysStore.stream = setting.value.stream
  sysStore.openSettingDialog = false
}
</script>

<template>
  <div>
    <el-button :icon="Operation" style="width: 100%" @click="openSettingDialogHandle"
      >配置</el-button
    >
    <el-dialog v-model="sysStore.openSettingDialog" title="配置" width="350px" align-center>
      <div>
        <el-form label-position="top" label-width="100px" :model="setting">
          <el-form-item label="API URL">
            <el-input v-model="setting.api_url" placeholder="默认使用官方API" />
          </el-form-item>
          <el-form-item label="OPENAI_API_KEY">
            <el-input v-model="setting.api_key" placeholder="官方API必须设置此项才能使用" />
          </el-form-item>
        </el-form>
        <el-form label-position="left" label-width="270px" :model="setting">
          <el-form-item label="开启打字机效果(stream模式)">
            <el-switch v-model="setting.stream" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span>
          <el-button @click="sysStore.openSettingDialog = false">取消</el-button>
          <el-button type="primary" @click="enter"> 确定 </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

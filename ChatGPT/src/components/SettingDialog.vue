<script setup>
import { ref } from 'vue'
import { Operation } from '@element-plus/icons-vue'

import { useSysStore } from '../stores/sys.js'
const sysStore = useSysStore()

const setting = ref({
  api_url: '',
  api_key: ''
})

const openSettingDialogHandle = () => {
  sysStore.openSettingDialog = true
  setting.value.api_key = sysStore.API_KEY
  setting.value.api_url = sysStore.API_URL
}

const enter = () => {
  sysStore.set(setting.value.api_key, setting.value.api_url)
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
            <el-input v-model="setting.api_url" />
          </el-form-item>
          <el-form-item label="OPENAI_API_KEY">
            <el-input v-model="setting.api_key" placeholder="必须设置此项才能使用" />
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

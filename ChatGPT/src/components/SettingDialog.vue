<script setup>
import { ref } from 'vue'
import { Operation, InfoFilled } from '@element-plus/icons-vue'
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
  temperature: 1,
  skipHistoryMessages: false,
  sideBar: false,
  display: 'card',
  model: 'gpt-3.5-turbo'
})

const openSettingDialogHandle = () => {
  sysStore.openSettingDialog = true
  setting.value.api_key = sysStore.API_KEY
  setting.value.api_url = sysStore.API_URL
  setting.value.stream = sysStore.stream
  setting.value.temperature = sysStore.temperature
  setting.value.skipHistoryMessages = sysStore.skipHistoryMessages
  setting.value.sideBar = sysStore.sideBar
  setting.value.display = sysStore.display
  setting.value.model = sysStore.model
}

const enter = () => {
  if (setting.value.api_url == '') {
    setting.value.api_url = env.apiURL
  }
  sysStore.set(setting.value.api_key, setting.value.api_url)
  sysStore.stream = setting.value.stream
  sysStore.temperature = setting.value.temperature
  sysStore.skipHistoryMessages = setting.value.skipHistoryMessages
  sysStore.sideBar = setting.value.sideBar
  sysStore.openSettingDialog = false
  sysStore.display = setting.value.display
  sysStore.model = setting.value.model
}

const modelOptions = [
  {
    value: 'gpt-3.5-turbo',
    label: 'gpt-3.5-turbo'
  },
  {
    value: 'gpt-3.5-turbo-16k',
    label: 'gpt-3.5-turbo-16k'
  },
  {
    value: 'gpt-3.5-turbo-0613',
    label: 'gpt-3.5-turbo-0613'
  },
  {
    value: 'gpt-3.5-turbo-16k-0613',
    label: 'gpt-3.5-turbo-16k-0613'
  },
  {
    value: 'gpt-4',
    label: 'gpt-4'
  },
  {
    value: 'gpt-4-0613',
    label: 'gpt-4-0613'
  }
]
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
      <div class="flex flex-col gap-2">
        <el-form
          label-position="top"
          label-width="100px"
          :model="setting"
          class="border border-gray-300 p-2 rounded-2xl"
        >
          <el-form-item label="API URL">
            <el-input v-model="setting.api_url" placeholder="默认使用官方API" clearable />
          </el-form-item>
          <el-form-item label="OPENAI_API_KEY">
            <el-input
              v-model="setting.api_key"
              placeholder="官方API必须设置此项才能使用"
              show-password
              clearable
            />
          </el-form-item>
        </el-form>
        <div class="flex flex-col justify-center border border-gray-300 p-2 rounded-2xl">
          <div class="flex items-center justify-between gap-1">
            <el-tooltip effect="dark" content="选择不同聊天模型" placement="top-start">
              <label class="flex items-center px-2 justify-start w-20 gap-1" style="color: #606266"
                >模型<el-icon> <InfoFilled /> </el-icon
              ></label>
            </el-tooltip>

            <el-select v-model="setting.model" placeholder="模型">
              <el-option
                v-for="item in modelOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
                :disabled="item.disabled"
              />
            </el-select>
          </div>
        </div>

        <div class="flex flex-col justify-center border border-gray-300 p-2 rounded-2xl">
          <div class="flex items-center justify-between gap-20">
            <el-tooltip
              effect="dark"
              content="开启后侧边栏可常驻,移动端不支持"
              placement="top-start"
            >
              <label class="flex items-center px-2 justify-start w-30 gap-1" style="color: #606266"
                >常驻侧边栏<el-icon> <InfoFilled /> </el-icon
              ></label>
            </el-tooltip>
            <el-switch v-model="setting.sideBar" :disabled="size !== 350" />
          </div>
          <el-divider style="margin: 10px 0" />
          <div class="flex items-center justify-between gap-20">
            <el-tooltip
              effect="dark"
              content="新建会话默认使用卡片模式,开启后默认使用对话模式"
              placement="top-start"
            >
              <label class="flex items-center px-2 justify-start w-28 gap-1" style="color: #606266"
                >展示方式<el-icon> <InfoFilled /> </el-icon
              ></label>
            </el-tooltip>
            <el-switch v-model="setting.display" :active-value="'chat'" :inactive-value="'card'" />
          </div>
          <el-divider style="margin: 10px 0" />
          <div class="flex items-center justify-between gap-20">
            <el-tooltip
              effect="dark"
              content="关闭后会在消息生成完成后一次性输出"
              placement="top-start"
            >
              <label class="flex items-center px-2 justify-start w-32 gap-1" style="color: #606266"
                >打字机效果<el-icon> <InfoFilled /> </el-icon
              ></label>
            </el-tooltip>
            <el-switch v-model="setting.stream" />
          </div>
          <el-divider style="margin: 10px 0" />
          <div class="flex items-center justify-between gap-20">
            <el-tooltip effect="dark" content="较高的值将使输出更加随机" placement="top-start">
              <label class="flex items-center px-2 justify-start w-32 gap-1" style="color: #606266"
                >温度<el-icon> <InfoFilled /> </el-icon
              ></label>
            </el-tooltip>
            <el-slider v-model="setting.temperature" :max="2" :step="0.1" />
          </div>
          <el-divider style="margin: 10px 0" />
          <div class="flex items-center justify-between gap-20">
            <el-tooltip
              effect="dark"
              content="开启后会自动打开跳过开关,适合问答模式,减少token消耗"
              placement="top-start"
            >
              <label class="flex items-center px-2 justify-start w-28 gap-1" style="color: #606266"
                >自动跳过<el-icon> <InfoFilled /> </el-icon
              ></label>
            </el-tooltip>
            <el-switch v-model="setting.skipHistoryMessages" />
          </div>
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

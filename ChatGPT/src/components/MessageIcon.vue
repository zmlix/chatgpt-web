<script setup>
import { ref } from 'vue'
import chatgpt from '../assets/ChatGPT_white.png'
import { UserFilled, Tools } from '@element-plus/icons-vue'
import chatgpt_black from '../assets/ChatGPT.png'
import { useMessagesStore } from '../stores/messages'
const messagesStore = useMessagesStore()

const props = defineProps({
  message: {
    type: Object,
    required: true
  },
  color: {
    type: String,
    required: true
  }
})

const role = ref(props.message.role)
const roleMap = {
  user: '用户',
  assistant: '助理',
  system: '系统',
  error: '错误'
}
const roleList = [
  { value: 'system', label: '系统' },
  { value: 'user', label: '用户' },
  { value: 'assistant', label: '助理' }
]

const insert = () => {
  messagesStore.setSendingType('part')
  messagesStore.pushMessage(
    '',
    {
      role: 'user',
      status: 'success',
      skip: false
    },
    { insert: { id: props.message.id } }
  )
}

const select = (newRole) => {
  messagesStore.set(props.message.id, { role: newRole })
}
</script>

<template>
  <el-popover
    placement="right-start"
    :title="'消息角色: ' + roleMap[message.role] + ' (' + message.role + ')'"
    :width="250"
    trigger="click"
  >
    <template #reference>
      <div class="hover:cursor-pointer">
        <el-avatar
          v-if="message.role === 'user'"
          :icon="UserFilled"
          :style="{ background: 'transparent', fontSize: '24px', color: color }"
        />
        <el-avatar
          v-else-if="message.role === 'system'"
          :icon="Tools"
          :style="{ background: 'transparent', fontSize: '24px', color: color }"
        />
        <el-avatar
          v-else
          :src="color === 'white' ? chatgpt : chatgpt_black"
          :size="28"
          style="background: transparent; width: 40px"
        />
      </div>
    </template>
    <div class="p-1 flex flex-col gap-1 border rounded">
      <div v-if="message.role !== 'error'">
        <el-select v-model="role" class="w-full" placeholder="更改角色类型" @change="select">
          <el-option
            v-for="item in roleList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
      <div>
        <el-button type="success" style="width: 100%" @click="insert">向下插入一条空消息</el-button>
      </div>
    </div>
  </el-popover>
</template>

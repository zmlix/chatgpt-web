<script setup>
import { InfoFilled } from '@element-plus/icons-vue'
import { getCurrentTime, downloadMarkdown } from '../utils/utils'
import { useMessagesStore } from '../stores/messages'
const messagesStore = useMessagesStore()

defineProps({
  title: {
    type: String,
    required: true
  }
})

const export_markdown = () => {
  console.log('导出markdown', messagesStore.title)
  const messages = messagesStore.getHistoryMsg('all')
  const md =
    `## 导出时间:\`${getCurrentTime()}\`\n---\n` +
    messages
      .map((msg) => `### ${msg.role} \n\`\`\`\`markdown\n${msg.content}\n\`\`\`\``)
      .join('\n---\n')
  downloadMarkdown(md, `${messagesStore.title}.md`)
}
</script>

<template>
  <el-popover placement="top" :width="300" trigger="click" :teleported="false" :persistent="false">
    <template #reference>
      <p
        class="chat-title m-auto text-6xl font-semibold py-1 bg-clip-text text-transparent select-none hover:cursor-pointer"
      >
        <span>{{ title }}</span>
      </p>
    </template>
    <div class="flex flex-col">
      <div class="flex items-center justify-between">
        <label class="flex px-2 justify-start w-28" style="color: #606266"
          >{{ messagesStore.display === 'card' ? '卡片' : '对话' }}模式</label
        >
        <el-switch
          v-model="messagesStore.display"
          :active-value="'chat'"
          :inactive-value="'card'"
          style="--el-switch-on-color: #13ce66; --el-switch-off-color: #409eff"
          @change="(val) => messagesStore.setDisplay(val)"
        />
      </div>
      <div class="flex items-center justify-between">
        <el-tooltip effect="dark" content="跳过的对话将不会被导出" placement="top-start">
          <label class="flex items-center px-2 justify-start w-28 gap-1" style="color: #606266"
            >导出对话<el-icon>
              <InfoFilled /> </el-icon
          ></label>
        </el-tooltip>
        <el-button-group>
          <el-button type="primary">图片</el-button>
          <el-button type="primary" @click="export_markdown">Markdown</el-button>
        </el-button-group>
      </div>
    </div>
  </el-popover>
</template>

<style scoped>
.chat-title {
  font-family: Inter;
  background-image: linear-gradient(135deg, #756aee 53%, #ee756a 10%);
}
</style>

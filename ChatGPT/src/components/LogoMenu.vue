<script setup>
import { reactive } from 'vue'
import { InfoFilled } from '@element-plus/icons-vue'
import { getCurrentTime, showMessage, downloadMarkdown, downloadImg, XSS, MD } from '../utils/utils'
import html2canvas from 'html2canvas'
import { useMessagesStore } from '../stores/messages'
const messagesStore = useMessagesStore()

defineProps({
  title: {
    type: String,
    required: true
  }
})

const Preview = reactive({
  isPreview: false,
  data: '',
  download: null
})

const preview = (data = '', type = 'md') => {
  Preview.isPreview = true
  if (type === 'md') {
    Preview.data = XSS.process(MD.render(data || ''))
    console.log(Preview.data)
    Preview.download = () => {
      downloadMarkdown(data, `${messagesStore.title}.md`)
    }
  } else {
    Preview.data = ''
    Preview.download = () => {
      downloadImg(data, `${messagesStore.title}.png`)
    }
  }
}

const export_img = () => {
  showMessage('正在导出...', 'success')
  html2canvas(document.querySelector('.message-box'), {
    ignoreElements: (element) => {
      if (element.classList.contains('message-info')) {
        if (element.querySelector('.skip-msg')) {
          return (
            element
              .querySelector('.skip-msg')
              .querySelector('input')
              .getAttribute('aria-checked') === 'true'
          )
        } else {
          return true
        }
      }
      return false
    },
    onclone: (dom) => {
      if (messagesStore.display === 'chat') {
        dom.querySelector('.message-box').style.color = 'white'
        dom
          .querySelector('.message-box')
          .querySelectorAll('span')
          .forEach((span) => (span.style.paddingBottom = '5px'))
        dom
          .querySelector('.message-box')
          .querySelectorAll('#showModel')
          .forEach((e) => {
            e.style.color = 'black'
          })
      }
      if (messagesStore.display === 'card') {
        dom
          .querySelector('.message-box')
          .querySelectorAll('span.is-text')
          .forEach((span) => (span.style.paddingBottom = '15px'))
      }
      dom.querySelectorAll('#showModel').forEach((e) => (e.style.paddingBottom = '10px'))
    },
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#374151'
  }).then(function (canvas) {
    console.log(canvas)
    preview(canvas, 'png')
    setTimeout(() => {
      document.querySelector('.preview').appendChild(canvas)
    }, 500)
  })
}

const export_markdown = () => {
  showMessage('正在导出...', 'success')
  console.log('导出markdown', messagesStore.title)
  const messages = messagesStore.getHistoryMsg('all')
  const md =
    `## 导出时间:\`${getCurrentTime()}\`\n---\n` +
    messages
      .map((msg) => `### ${msg.role} \n\`\`\`\`markdown\n${msg.content}\n\`\`\`\``)
      .join('\n---\n')
  preview(md, 'md')
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
          <label class="flex items-center px-2 justify-start w-24 gap-1" style="color: #606266"
            >导出对话<el-icon> <InfoFilled /> </el-icon
          ></label>
        </el-tooltip>
        <el-button-group>
          <el-button type="primary" @click="export_img">图片</el-button>
          <el-button type="primary" @click="export_markdown">Markdown</el-button>
        </el-button-group>
      </div>
    </div>
  </el-popover>
  <el-dialog v-model="Preview.isPreview" title="预览" width="90%" top="5vh" destroy-on-close>
    <div class="preview markdown-body overflow-auto p-2" style="height: 66vh">
      <!-- {{Preview.data}} -->
      <div v-html="Preview.data" ref="showMsgRef" class="markdown-body"></div>
    </div>
    <template #footer>
      <span class="preview-footer">
        <el-button @click="Preview.isPreview = false">取消</el-button>
        <el-button type="primary" @click="Preview.download">下载</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>
.chat-title {
  font-family: Inter;
  background-image: linear-gradient(135deg, #756aee 53%, #ee756a 10%);
}
</style>

<script setup>
import { Refresh, UserFilled } from '@element-plus/icons-vue'
import { ref, computed, watch } from 'vue'
import markdown from 'markdown-it'
import hljs from 'markdown-it-highlightjs'
import katex from 'markdown-it-katex'
import md_tb from 'markdown-it-multimd-table'
import { Edit, Fold, Expand, CloseBold } from '@element-plus/icons-vue'
import chatgpt from '../assets/ChatGPT_white.png'
import chatgpt_black from '../assets/ChatGPT.png'
import useClipboard from 'vue-clipboard3'
import { showMessage, getCurrentTime } from '../utils/utils'
import { useMessagesStore } from '../stores/messages'
const messagesStore = useMessagesStore()
const sending = messagesStore.sending

const props = defineProps({
  message: {
    type: Object,
    required: true
  }
})

const md = markdown({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true
})
  .use(katex)
  .use(hljs)
  .use(md_tb)

const markdown_msg = computed(() => {
  return '<div>' + md.render(props.message.msg || '') + '</div>'
})

const raw_msg = computed(() => {
  return props.message.msg
})

const isMarkdown = ref(true)
const isSkiped = ref(props.message.skip)
const isCollapse = ref(false)

const checkIsSending = () => {
  if (sending.isSending) {
    showMessage('请等待回答完毕', 'error')
    return true
  }
  return false
}

const checkInput = () => {
  if (props.message.msg == '') {
    showMessage('请输入内容', 'error')
    return true
  }
  return false
}

const delMsg = () => {
  if (checkIsSending()) return
  messagesStore.del(props.message.id)
}

const skipMsg = (val) => {
  if (checkIsSending()) {
    isSkiped.value = !isSkiped.value
    return
  }
  console.log(props.message.id, 'skipMsg', val)
  messagesStore.set(props.message.id, { skip: val })
}

const reSendMsg = () => {
  console.log('reSendMsg...')
  if (checkIsSending() || checkInput()) return
  const msg_id = props.message.id
  messagesStore.setSendingId(msg_id)
  messagesStore.set(msg_id, { typ: 'user' })
  messagesStore.getMessage(
    { role: 'user', content: messagesStore.getHistoryMsg('part', { id: msg_id }) },
    { insert: { id: msg_id } }
  )
}

const new_msg = ref('')
const isEdit = ref(false)
const editMsg = () => {
  console.log('editMsg...')
  if (checkIsSending()) return
  new_msg.value = props.message.msg
  isEdit.value = !isEdit.value
}

const editMsgEnter = () => {
  console.log('editMsgEnter...')
  messagesStore.set(props.message.id, { msg: new_msg.value, time: new Date() })
  isEdit.value = false
}

const showMsgRef = ref(null)
const { toClipboard } = useClipboard()
watch(
  () => sending.isSending || showMsgRef.value,
  (isShowMsg) => {
    if (isShowMsg) {
      const hljs_blocks = showMsgRef.value.getElementsByClassName('hljs')
      if (hljs_blocks.length) {
        for (let i = 0; i < hljs_blocks.length; i++) {
          const copyCodeDiv = document.createElement('div')
          copyCodeDiv.classList.add('copy-code')
          const buttonElem = document.createElement('button')
          buttonElem.classList.add('el-button', 'el-button--small')
          buttonElem.innerHTML = '<span>复制代码</span>'
          buttonElem.addEventListener('click', async () => {
            try {
              await toClipboard(hljs_blocks[i])
              console.log(hljs_blocks[i].children)
              showMessage('复制成功', 'success')
            } catch (e) {
              console.error(e)
              showMessage('复制失败', 'error')
            }
          })
          buttonElem.addEventListener('mouseover', () => {
            copyCodeDiv.style.display = 'flex'
          })
          copyCodeDiv.appendChild(buttonElem)
          hljs_blocks[i].insertAdjacentElement('beforeBegin', copyCodeDiv)
          hljs_blocks[i].addEventListener('mouseover', () => {
            copyCodeDiv.style.display = 'flex'
          })
          hljs_blocks[i].addEventListener('mouseout', () => {
            copyCodeDiv.style.display = 'none'
          })
        }
      }
    }
  }
)
</script>

<template>
  <div class="w-full">
    <div class="flex items-start">
      <div class="mx-1 hidden md:flex">
        <el-avatar
          v-if="message.typ == 'user'"
          :icon="UserFilled"
          style="background: transparent; font-size: 24px"
        />
        <el-avatar v-else :src="chatgpt" style="background: transparent" />
      </div>
      <div class="flex flex-col justify-center w-full message-body">
        <div class="flex justify-between items-end">
          <div class="flex items-center gap-2 mx-1 md:hidden">
            <el-avatar
              v-if="message.typ == 'user'"
              :icon="UserFilled"
              style="background: transparent; font-size: 24px; color: black"
            />
            <el-avatar
              v-else
              :src="chatgpt_black"
              :size="28"
              style="background: transparent; width: 48px"
            />
            <div class="flex w-full">{{ getCurrentTime(message.time) }}</div>
          </div>
          <div class="w-full hidden md:flex">{{ getCurrentTime(message.time) }}</div>
          <div class="w-full hover:cursor-move h-6 drag-msg"></div>
          <div class="flex">
            <el-switch
              v-if="message.status != 'error'"
              class="flex mt-3 p-1"
              v-model="isMarkdown"
              size="small"
              inline-prompt
              active-text="渲染"
              inactive-text="渲染"
              style="height: 5px"
            />
            <el-switch
              class="flex mt-3 p-1"
              v-model="isSkiped"
              size="small"
              inline-prompt
              active-text="跳过"
              inactive-text="跳过"
              style="height: 5px"
              @change="skipMsg"
            />
            <div class="p-1">
              <el-link
                :underline="false"
                :icon="isCollapse ? Expand : Fold"
                @click="isCollapse = !isCollapse"
              />
            </div>
            <div class="p-1">
              <el-link :underline="false" :icon="Edit" @click="editMsg" />
            </div>
            <div class="p-1">
              <el-link :underline="false" :icon="Refresh" @click="reSendMsg" />
            </div>
            <div class="p-1">
              <el-link :underline="false" :icon="CloseBold" @click="delMsg" />
            </div>
          </div>
        </div>
        <div class="mt-2 mb-1" v-show="!isCollapse">
          <el-divider style="margin: 0 0 5px 0"></el-divider>
          <div v-if="!isMarkdown" class="whitespace-pre-wrap">{{ raw_msg }}</div>
          <div v-else v-html="markdown_msg" ref="showMsgRef"></div>
        </div>
        <el-row :gutter="10" v-show="isEdit" class="mb-2">
          <el-col :span="21">
            <el-input
              v-model="new_msg"
              :autosize="{ minRows: 1, maxRows: 10 }"
              type="textarea"
              maxlength="3000"
              clearable
              show-word-limit
              resize="none"
              @keyup.shift.enter="editMsgEnter"
            />
          </el-col>
          <el-col :span="3">
            <el-button type="success" @click="editMsgEnter" style="width: 100%; height: 100%"
              >修改</el-button
            >
          </el-col>
        </el-row>
      </div>
    </div>
    <div
      class="message-box-loading h-16"
      v-loading="sending.isSending"
      v-show="sending.isSending && sending.id == message.id"
    ></div>
  </div>
</template>

<style>
.message-box-loading .el-loading-spinner .path {
  stroke: white;
}

.message-box-loading .el-loading-mask {
  background-color: transparent;
}

.message-body {
  padding: 1px 10px;
  margin: 3px 0;
  background: linear-gradient(to right bottom, #ece9e6, #ffffff);
  border-radius: 5px;
  font-size: 14px;
  max-width: 100%;
  min-height: 30px;
}

.copy-code {
  display: flex;
  justify-content: flex-end;
  position: relative;
  top: 12px;
  right: 5px;
  height: 0px;
}
</style>

<script setup>
import { Refresh } from '@element-plus/icons-vue'
import { ref, computed, watch } from 'vue'
import 'github-markdown-css'
import { Edit, Fold, Expand, CloseBold } from '@element-plus/icons-vue'
import MessageIcon from './MessageIcon.vue'
import useClipboard from 'vue-clipboard3'
import { showMessage, getCurrentTime, XSS, MD } from '../utils/utils'
import { useMessagesStore } from '../stores/messages'
const messagesStore = useMessagesStore()
const sending = messagesStore.sending

const props = defineProps({
  message: {
    type: Object,
    required: true
  },
  display: {
    type: String,
    required: true
  }
})

const menu = ref(false)

const markdown_msg = computed(() => {
  return XSS.process(MD.render(props.message.msg || ''))
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
  if (props.message.role === 'assistant') {
    messagesStore.set(msg_id, { role: 'user' })
  }
  messagesStore.getMessage(
    { messages: messagesStore.getHistoryMsg('part', { id: msg_id }) },
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
  if (isEdit.value) {
    isCollapse.value = true
  } else {
    isCollapse.value = false
  }
}

const editMsgEnter = () => {
  console.log('editMsgEnter...')
  messagesStore.set(props.message.id, { msg: new_msg.value, time: new Date() })
  isEdit.value = false
  isCollapse.value = false
}

const showMsgRef = ref(null)
const { toClipboard } = useClipboard()
watch(
  () => sending.isSending || showMsgRef.value,
  (isShowMsg) => {
    if (isShowMsg && showMsgRef) {
      try {
        const hljs_blocks = showMsgRef.value.getElementsByClassName('hljs')
        if (hljs_blocks.length) {
          for (let i = 0; i < hljs_blocks.length; i++) {
            const pre = hljs_blocks[i].parentElement
            const copyCodeDiv = document.createElement('div')
            copyCodeDiv.classList.add('copy-code')
            const buttonElem = document.createElement('button')
            buttonElem.classList.add('el-button', 'el-button--small')
            buttonElem.innerHTML = '<span>复制代码</span>'
            buttonElem.addEventListener('click', async () => {
              try {
                await toClipboard(pre)
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
            pre.insertAdjacentElement('beforeBegin', copyCodeDiv)
            pre.addEventListener('mouseover', () => {
              copyCodeDiv.style.display = 'flex'
            })
            pre.addEventListener('mouseout', () => {
              copyCodeDiv.style.display = 'none'
            })
          }
        }
      } catch (error) {
        console.log(error)
      }
    }
  }
)

const chatMode = ref(props.display === 'chat')
watch(
  () => props.display,
  (val) => {
    if (val === 'card') {
      chatMode.value = false
    } else if (val === 'chat') {
      chatMode.value = true
    }
  }
)
</script>

<template>
  <div :class="{ 'mb-5': chatMode }" class="message-info px-1">
    <span
      v-if="chatMode"
      class="flex text-xs"
      :class="message.role == 'user' ? 'flex-row-reverse pr-12' : 'pl-12'"
      >{{ getCurrentTime(message.time) }}</span
    >
    <div
      class="flex items-start"
      :class="{ 'flex-row-reverse': chatMode && message.role == 'user' }"
    >
      <div class="mx-1 md:flex" :class="{ hidden: !chatMode }">
        <MessageIcon :message="message" color="white"></MessageIcon>
      </div>
      <div
        class="grid px-2.5 py-px my-0.5 mx-0 bg-white rounded-md text-sm"
        :style="chatMode ? 'max-width: 75%;' : 'width:100%'"
      >
        <div class="flex justify-between items-end" v-show="!chatMode || menu">
          <div class="flex items-center md:hidden">
            <div :class="{ hidden: chatMode }">
              <MessageIcon :message="message" color="black"></MessageIcon>
            </div>
            <div class="flex w-full">{{ getCurrentTime(message.time) }}</div>
          </div>
          <div class="w-full hidden md:flex">{{ getCurrentTime(message.time) }}</div>
          <div class="w-full hover:cursor-move h-6 drag-msg"></div>
          <div class="flex flex-col-reverse items-center sm:flex-row sm:items-start">
            <div class="flex" v-if="message.status != 'error'">
              <el-switch
                class="flex sm:mt-3 my-1 p-1"
                v-model="isMarkdown"
                size="small"
                inline-prompt
                active-text="渲染"
                inactive-text="渲染"
                style="height: 5px"
              />
              <el-switch
                class="skip-msg flex sm:mt-3 my-1 p-1"
                v-model="isSkiped"
                size="small"
                inline-prompt
                active-text="跳过"
                inactive-text="跳过"
                style="height: 5px"
                @change="skipMsg"
              />
            </div>
            <div class="flex">
              <div class="p-1">
                <el-link
                  :underline="false"
                  :icon="isCollapse ? Expand : Fold"
                  @click="isCollapse = !isCollapse"
                />
              </div>
              <div class="p-1" v-if="message.status != 'error'">
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
        </div>
        <el-divider style="margin: 5px" v-show="!chatMode || menu"></el-divider>
        <div
          class="mt-2 mb-1 overflow-x-auto"
          style="min-height: 20px"
          v-show="!isCollapse"
          @click="() => (menu = !menu)"
        >
          <div v-if="!isMarkdown" class="whitespace-pre-wrap">{{ raw_msg }}</div>
          <div v-else v-html="markdown_msg" ref="showMsgRef" class="markdown-body"></div>
        </div>
        <el-row :gutter="10" v-show="isEdit" class="mb-2">
          <el-col :span="21">
            <el-input
              v-model="new_msg"
              :autosize="{ minRows: 1, maxRows: 10 }"
              type="textarea"
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
        <div id="showModel" class="flex justify-end" v-show="message.role === 'assistant'">
          {{ message.model || 'gpt-3.5-turbo' }}
        </div>
      </div>
    </div>
    <div
      class="message-box-loading h-16 z-0"
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

.copy-code {
  display: flex;
  justify-content: flex-end;
  position: relative;
  top: 12px;
  right: 5px;
  height: 0px;
}
</style>

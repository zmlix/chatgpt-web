<script setup>
import { ref } from 'vue'
import MessageBox from '../components/MessageBox.vue'
import { useMessagesStore } from '../stores/messages'
import { showMessage } from '../utils/utils'
const messagesStore = useMessagesStore()
const messages = messagesStore.messages
const msgbox = ref(null)
const role_list = ref([
  {
    label: '用户',
    value: 'user'
  },
  {
    label: '助手',
    value: 'assistant'
  },
  {
    label: '系统',
    value: 'system'
  }
])

const input = ref('')
const sending = messagesStore.sending

const body = ref({
  role: 'user',
  content: ''
})

const send = () => {
  if (input.value == '') {
    showMessage('请输入内容', 'error')
    return
  }
  console.log(sending)
  if (sending.isSending) {
    showMessage('请等待回答完毕', 'error')
    return
  }
  messagesStore.push({
    typ: 'user',
    msg: input.value,
    status: 'success'
  })
  // const loading = msgbox.value.loadingStart()
  input.value = ''
  body.value.content = messagesStore.getHistoryMsg('all')
  messagesStore.getMessage(body.value)
}
</script>

<template>
  <div class="chat">
    <p>ChatGPT</p>
    <MessageBox ref="msgbox" :messages="messages" />
    <div class="input">
      <el-row :gutter="10">
        <el-col :span="2">
          <el-select v-model="body.role" placeholder="角色">
            <el-option
              v-for="item in role_list"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-col>
        <el-col :span="18">
          <el-input
            v-model="input"
            :autosize="{ minRows: 1, maxRows: 4 }"
            type="textarea"
            placeholder="请输入"
            maxlength="3000"
            clearable
            show-word-limit
            resize="none"
            @keyup.shift.enter="send"
          />
        </el-col>
        <el-col :span="4">
          <el-button color="#626aef" style="width: 100%; height: 100%" @click="send"
            >发送</el-button
          >
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<style scoped>
.chat {
  width: 100%;
  height: 100%;
  background: linear-gradient(to right bottom, #ab79c2, #8a84bf, #6b91c1);
  display: flex;
  flex-direction: column;
}

.chat > p {
  margin: 0 auto;
  font-size: 60px;
  font-family: Inter;
  font-weight: 600;
  padding: 10px;
  background-image: linear-gradient(135deg, #756aee 52%, #ee756a 10%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.input {
  margin: 10px 20px;
  padding-bottom: 30px;
}
</style>

<script setup>
import { ref } from "vue";
import { ElMessage } from 'element-plus'
import MessageBox from "../components/MessageBox.vue";
import axios from 'axios'

const input = ref("")
const messages = ref([
  // {
  //   typ: 'chatgpt',
  //   msg: "我是一个人工智能语言处理程序，被称为OpenAI GPT-3。我是由OpenAI开发的一种自然语言处理技术，可以通过分析和理解语言来生成与人类相似的自然语言文本。我可以回答你的问题、提供信息、创作文本，并与你进行互动交流。虽然我不像人类一样有情感和主观思维，但我可以根据输入的指令和语料库中的内容生成语言文本，希望能为您提供帮助。"
  // },
  // {
  //   typ: 'chatgpt',
  //   msg: "\n\n```python\nimport datetime\n\ndef get_weekday():\n    today = datetime.datetime.today().weekday()\n    \n    weekdays = {\n        0: '星期一',\n        1: '星期二',\n        2: '星期三',\n        3: '星期四',\n        4: '星期五',\n        5: '星期六',\n        6: '星期日'\n    }\n    \n    return weekdays[today]\n\n# 调用函数获取今天是星期几\nprint(get_weekday())\n```\n\n输出结果会是今天的星期几，中文格式。"
  // },
  // {
  //   typ: 'user',
  //   msg: "hhhhh"
  // }
])
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
const isSending = ref(false)

const body = ref({
  token: "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",
  role: 'user'
})

const send = () => {
  console.log(input.value)
  if (input.value == "") {
    ElMessage(
      {
        message: "请输入内容",
        type: 'error'
      }
    )
    return
  }

  if (isSending.value) {
    ElMessage(
      {
        message: "请等待回答完毕",
        type: 'error'
      }
    )
    return
  }

  messages.value.push({
    typ: 'user',
    msg: input.value
  },)
  isSending.value = true
  const content = get_content()
  console.log(content)
  body.value.content = content
  input.value = ""
  axios.post("http://23.105.196.211:8000/chatgpt", body.value).then(function (response) {
    // 处理成功情况
    console.log(response);
    messages.value.push({
      typ: 'chatgpt',
      msg: response['data']['choices'][0]['message']['content']
    },)
  })
    .catch(function (error) {
      // 处理错误情况
      messages.value.push({
        typ: 'sys',
        msg: '<font color="red">**Error:** 请求出错</font>'
      },)
      console.log(error);
    }).finally(function () {
      // 总是会执行
      isSending.value = false
    });
}


const get_content = () => {
  var content = ""
  for (let i = messages.value.length - 1; i >= 0; i--) {
    content = messages.value[i].msg + '\n' + content
  }
  console.log(content.length)
  return content
}

</script>

<template>
  <div class="chat">
    <p>ChatGPT</p>
    <MessageBox :messages="messages" />
    <div class="input">
      <el-row :gutter="10">
        <el-col :span="2">
          <el-select v-model="body.role" placeholder="角色">
            <el-option v-for="item in role_list" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-col>
        <el-col :span="18">
          <el-input v-model="input" :autosize="{ minRows: 1, maxRows: 4 }" type="textarea" placeholder="请输入"
            maxlength="3000" clearable show-word-limit resize="none" @keyup.shift.enter="send" />
        </el-col>
        <el-col :span="4">
          <el-button color="#626aef" style="width: 100%;height: 100%" @click="send">发送</el-button>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<style scoped>
.chat {
  width: 100%;
  height: 100%;
  /* background-color: blue; */
  display: flex;
  flex-direction: column;
}

.chat>p {
  margin: 0 auto;
  font-size: 40px;
  font-weight: bolder;
  padding: 10px;
  /* background-color: green; */
}

.input {
  margin: 10px 20px;
}
</style>
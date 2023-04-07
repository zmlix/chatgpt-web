<script setup>
import MessageBox from '../components/MessageBox.vue'
import SideBar from '../components/SideBar.vue'
import StopRequest from '../components/StopRequest.vue'
import AutoInput from '../components/AutoInput.vue'
import { useMessagesStore } from '../stores/messages'
import { useSysStore } from '../stores/sys'
import { House, ArrowRightBold, ArrowLeftBold } from '@element-plus/icons-vue'
const messagesStore = useMessagesStore()
const sysStore = useSysStore()
const messages = messagesStore.initMessages()

// const role_list = reactive([
//   {
//     label: '用户',
//     value: 'user'
//   },
//   {
//     label: '助手',
//     value: 'assistant'
//   },
//   {
//     label: '系统',
//     value: 'system'
//   }
// ])

const openSideBarHandle = () => {
  sysStore.openSideBar = !sysStore.openSideBar
}
</script>

<template>
  <div class="chat flex flex-col h-full px-2 sm:px-7 py-4 sm:py-6">
    <div class="flex flex-col h-full border-0 rounded-3xl shadow-2xl shadow-indigo-900">
      <p class="chat-title m-auto text-6xl font-semibold py-1 bg-clip-text text-transparent">
        ChatGPT
      </p>
      <MessageBox :messages="messages" />
      <StopRequest></StopRequest>
      <div class="flex m-5">
        <div class="flex items-center mr-4">
          <el-button color="#f1f5f9" @click="openSideBarHandle" circle :icon="House"></el-button>
        </div>
        <AutoInput></AutoInput>
      </div>
    </div>
    <SideBar></SideBar>
    <div class="absolute sm:right-3 sm:top-1/2 right-9 top-9">
      <el-button
        :icon="ArrowRightBold"
        color="#626aef"
        circle
        plain
        @click="() => messagesStore.getNextMessages(1)"
      />
    </div>
    <div class="absolute sm:left-3 sm:top-1/2 left-9 top-9">
      <el-button
        :icon="ArrowLeftBold"
        color="#626aef"
        circle
        plain
        @click="() => messagesStore.getNextMessages(-1)"
      />
    </div>
  </div>
</template>

<style scoped>
.chat {
  background: linear-gradient(to right bottom, #ab79c2, #8a84bf, #6b91c1);
}

.chat-title {
  font-family: Inter;
  background-image: linear-gradient(135deg, #756aee 53%, #ee756a 10%);
}
</style>

<script setup>
import LogoMenu from '../components/LogoMenu.vue'
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
  <div class="chat flex w-full h-full px-2 sm:px-7 py-4 sm:py-6 gap-2">
    <SideBar></SideBar>
    <div class="flex h-full w-full">
      <div class="relative w-0 h-0 sm:top-1/2 sm:-left-4 top-5 left-6 z-50">
        <el-button
          :icon="ArrowLeftBold"
          color="#626aef"
          circle
          plain
          @click="() => messagesStore.getNextMessages(-1)"
        />
      </div>
      <div class="flex flex-col w-full h-full border-0 rounded-3xl shadow-2xl shadow-indigo-900">
        <LogoMenu title="ChatGPT"></LogoMenu>
        <MessageBox :messages="messages" :display="messagesStore.display" />
        <StopRequest></StopRequest>
        <div class="flex m-5">
          <div class="flex items-center mr-4">
            <el-button color="#f1f5f9" @click="openSideBarHandle" circle :icon="House"></el-button>
          </div>
          <AutoInput></AutoInput>
        </div>
      </div>
      <div class="relative w-0 h-0 sm:top-1/2 sm:right-4 top-5 right-14 z-50">
        <el-button
          :icon="ArrowRightBold"
          color="#626aef"
          circle
          plain
          @click="() => messagesStore.getNextMessages(1)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat {
  background: linear-gradient(to right bottom, #ab79c2, #8a84bf, #6b91c1);
}
</style>

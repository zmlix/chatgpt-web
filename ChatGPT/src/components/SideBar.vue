<script setup>
import { onMounted, ref } from 'vue'
import { useSysStore } from '../stores/sys'
import SideBar2 from '../components/SideBar2.vue'
const sysStore = useSysStore()

const size = ref(document.body.clientWidth <= 640 ? document.body.clientWidth - 16 : 350)
onMounted(() => {
  window.onresize = () => {
    return (() => {
      size.value = document.body.clientWidth <= 640 ? document.body.clientWidth - 16 : 350
      if (document.body.clientWidth <= 640) {
        sysStore.sideBar = false
      }
    })()
  }
})
</script>

<template>
  <el-drawer
    v-if="!sysStore.sideBar"
    v-model="sysStore.openSideBar"
    direction="ltr"
    :with-header="false"
    :size="size"
    class="mx-2 sm:mx-7 my-4 sm:my-6 rounded-3xl"
    style="height: auto"
  >
    <SideBar2 :size="size"></SideBar2>
  </el-drawer>
  <div
    class="flex p-7 bg-white rounded-3xl"
    :style="'min-width: ' + size + 'px;'"
    v-else
    v-show="sysStore.openSideBar"
  >
    <SideBar2 :size="size"></SideBar2>
  </div>
</template>

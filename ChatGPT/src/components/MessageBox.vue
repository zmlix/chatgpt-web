<script setup>
import Message from '../components/MessageInfo.vue'
import { onUpdated } from 'vue'

defineProps({
  messages: {
    type: Array,
    required: true
  }
})

onUpdated(() => {
  var element = document.getElementsByClassName('message-box')[0]
  element.scrollTop = element.scrollHeight
})
</script>

<template>
  <div class="message-box">
    <Message v-for="(item, key) in messages" :key="key" :msg="item.msg" :typ="item.typ"></Message>
  </div>
</template>

<style scoped>
.message-box {
  height: 100%;
  margin: 10px 20px;
  padding: 5px;
  border-style: solid;
  border-radius: 5px;
  border-width: 5px;
  border-color: green;
  overflow: auto;
  /* background-color: blue; */
}
</style>

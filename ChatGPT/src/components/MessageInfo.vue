<script setup>
import { ChatLineRound } from '@element-plus/icons-vue'
import { ref, computed } from 'vue'
import markdown from 'markdown-it'
import hljs_plugin from 'markdown-it-highlightjs'

const props = defineProps({
  typ: {
    type: String,
    required: true
  },
  msg: {
    type: String,
    required: true
  }
})

const md = markdown({
  html: true,
  linkify: true,
  typographer: true
}).use(hljs_plugin)

const markdown_msg = computed(() => {
  return '<div>' + md.render(props.msg || '') + '</div>'
})

const isMarkdown = ref(true)
</script>

<template>
  <div class="message">
    <div>
      <el-avatar
        v-if="typ == 'user'"
        src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
      />
      <el-avatar v-else :icon="ChatLineRound" />
    </div>
    <div>
      <div v-if="typ != 'user'">
        <el-switch v-model="isMarkdown" size="small" style="height: 5px" />
      </div>
      <div v-if="typ == 'user' || !isMarkdown">{{ msg }}</div>
      <div v-else v-html="markdown_msg"></div>
    </div>
  </div>
</template>

<style scoped>
.message {
  display: flex;
  align-items: flex-start;
}

.message div:first-child {
  padding: 3px;
}

.message div:last-child {
  padding: 1px 10px;
  margin: 3px 0;
  background-color: antiquewhite;
  border-radius: 5px;
  font-size: 14px;
  max-width: 100%;
  min-height: 30px;
  display: flex;
  align-items: flex-end;
  flex-direction: column;
  justify-content: center;
}

.message div:last-child div:first-child {
  /* max-height: 25px; */
  padding: 0;
  margin: 0;
}
</style>

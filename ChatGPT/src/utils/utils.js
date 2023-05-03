import { ElMessage } from 'element-plus'
import markdown from 'markdown-it'
import hljs from 'markdown-it-highlightjs'
import katex from 'markdown-it-katex'
import md_tb from 'markdown-it-multimd-table'
import xss from 'xss'

const whiteList = (() => {
  let wl = xss.getDefaultWhiteList()
  let mathML = [
    'math',
    'mi',
    'mn',
    'mo',
    'ms',
    'msup',
    'msub',
    'mfrac',
    'mroot',
    'msqrt',
    'mtable',
    'mtr',
    'mtd',
    'mrow',
    'mmultiscripts',
    'semantics',
    'annotation'
  ]
  for (var i = 0; i < mathML.length; i++) {
    wl[mathML[i]] = []
  }
  for (var key in wl) {
    wl[key].push('class', 'style')
  }
  wl.annotation.push('encoding')
  wl.ol.push('start')
  return wl
})()

export const XSS = new xss.FilterXSS({
  whiteList: whiteList,
  css: false
})

export const MD = markdown({
  html: true,
  linkify: true,
  typographer: false,
  breaks: true
})
  .use(katex)
  .use(hljs)
  .use(md_tb)

export const random32BitNumber = () => {
  const maxInt32 = 0xffffffff
  return Math.floor(Math.random() * maxInt32)
}

export const getCurrentTime = (t) => {
  var currentDateTime = new Date(t || new Date())
  var year = currentDateTime.getFullYear()
  var month = (currentDateTime.getMonth() + 1).toString().padStart(2, '0')
  var day = currentDateTime.getDate().toString().padStart(2, '0')
  var hours = currentDateTime.getHours().toString().padStart(2, '0')
  var minutes = currentDateTime.getMinutes().toString().padStart(2, '0')
  var seconds = currentDateTime.getSeconds().toString().padStart(2, '0')
  return year + '/' + month + '/' + day + ' ' + hours + ':' + minutes + ':' + seconds
}

export const showMessage = (msg, type) => {
  ElMessage({ message: msg, type: type })
}

export const downloadImg = (data, name) => {
  const canvas = data
  const dataURL = canvas.toDataURL('image/png')
  const downloadLink = document.createElement('a')
  downloadLink.href = dataURL
  downloadLink.download = name
  document.body.appendChild(downloadLink)
  downloadLink.click()
  setTimeout(() => {
    document.body.removeChild(downloadLink)
  }, 1000)
}

export const downloadMarkdown = (data, name) => {
  const fileContent = data
  const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' })
  const downloadLink = document.createElement('a')
  downloadLink.href = URL.createObjectURL(blob)
  downloadLink.download = name
  document.body.appendChild(downloadLink)
  downloadLink.click()
  setTimeout(() => {
    document.body.removeChild(downloadLink)
  }, 1000)
}

export const downloadJson = (data) => {
  const jsonString = JSON.stringify(data)
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' })
  const downloadLink = document.createElement('a')
  downloadLink.href = URL.createObjectURL(blob)
  downloadLink.download = 'chats.json'
  document.body.appendChild(downloadLink)
  downloadLink.click()
  setTimeout(() => {
    document.body.removeChild(downloadLink)
  }, 1000)
}

export const uploadJson = (file, fn) => {
  const reader = new FileReader()
  reader.readAsText(file)
  reader.onload = fn(reader)
}

export const formatDate = (date) => {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

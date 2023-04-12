import { ElMessage } from 'element-plus'

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
  document.body.removeChild(downloadLink)
}

export const downloadMarkdown = (data, name) => {
  const fileContent = data
  const blob = new Blob([fileContent], { type: 'text/plain' })
  const downloadLink = document.createElement('a')
  downloadLink.href = URL.createObjectURL(blob)
  downloadLink.download = name
  document.body.appendChild(downloadLink)
  downloadLink.click()
  document.body.removeChild(downloadLink)
}

export const downloadJson = (data) => {
  const jsonString = JSON.stringify(data)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const downloadLink = document.createElement('a')
  downloadLink.href = URL.createObjectURL(blob)
  downloadLink.download = 'chats.json'
  document.body.appendChild(downloadLink)
  downloadLink.click()
  document.body.removeChild(downloadLink)
}

export const uploadJson = (file, fn) => {
  const reader = new FileReader()
  reader.readAsText(file)
  reader.onload = fn(reader)
}

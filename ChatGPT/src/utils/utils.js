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

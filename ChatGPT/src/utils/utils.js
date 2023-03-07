import { ElMessage } from 'element-plus'

export const random32BitNumber = () => {
  const maxInt32 = 0xffffffff
  return Math.floor(Math.random() * maxInt32)
}

export const showMessage = (msg, type) => {
  ElMessage({ message: msg, type: type })
}

import axios from 'axios'
import { SSE } from 'sse'
import { env } from '../env'

const DEFAULT_TIMEOUT = 60 * 1000
const chatRequest = (data) => {
  const req = {
    model: 'gpt-3.5-turbo',
    messages: [{ role: data.role || 'user', content: data.content }],
    temperature: data.temperature || 1,
    top_p: data.top_p || 1,
    n: data.n || 1,
    stream: data.stream || false,
    presence_penalty: data.presence_penalty || 0,
    frequency_penalty: data.frequency_penalty || 0
  }
  return JSON.stringify(req)
}

const axiosConfig = {
  headers: {
    'Content-Type': 'application/json'
  },
  proxy: env.proxy || {}
}

const ChatGPTApi = axios.create(axiosConfig)

export const post_GetMessage = (
  data,
  api_key = '',
  api_url = env.apiURL,
  timeout = DEFAULT_TIMEOUT
) => {
  if (data.stream) {
    return new SSE(env.apiURL, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + api_key
      },
      payload: chatRequest(data),
      method: 'POST'
    })
  } else {
    return ChatGPTApi.post('', data, {
      baseURL: api_url,
      transformRequest: [chatRequest],
      timeout: timeout,
      headers: {
        Authorization: 'Bearer ' + api_key
      }
    })
  }
}

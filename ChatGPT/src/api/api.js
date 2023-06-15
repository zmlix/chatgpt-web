import axios from 'axios'
import { SSE } from 'sse'
import { env } from '../env'
import { formatDate } from '../utils/utils'

const DEFAULT_TIMEOUT = 60 * 1000
const chatRequest = (data) => {
  const req = {
    model: data.model || 'gpt-3.5-turbo',
    messages: data.messages || [],
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
  proxy: env.proxy || {},
  baseURL: env.apiURL.match(/^(https?:\/\/[^/]+\/)/)[1]
}

const ChatGPTApi = axios.create(axiosConfig)
const ChatGPTSSEApi = (data, conf) => {
  const headers =
    'headers' in conf
      ? {
          'Content-Type': 'application/json',
          Authorization: conf.headers.Authorization
        }
      : { 'Content-Type': 'application/json' }

  const payload = conf.transformRequest.reduce((acc, transform) => transform(acc), data)

  return new SSE(conf.baseURL, {
    headers,
    payload,
    method: 'POST'
  })
}

export const post_GetMessage = (
  data,
  api_key = '',
  api_url = env.apiURL,
  cancelToken = null,
  timeout = DEFAULT_TIMEOUT
) => {
  const commonConf = {
    baseURL: api_url,
    transformRequest: [chatRequest],
    timeout: timeout
  }
  const conf = api_key
    ? {
        ...commonConf,
        headers: { Authorization: 'Bearer ' + api_key }
      }
    : commonConf

  if (data.stream) {
    return ChatGPTSSEApi(data, conf)
  } else {
    return ChatGPTApi.post('', data, { ...conf, cancelToken })
  }
}

const SubscriptionApi = axios.create(axiosConfig)
export const get_GetSubscription = (api_key) => {
  return SubscriptionApi.get('/v1/dashboard/billing/subscription', {
    headers: {
      Authorization: 'Bearer ' + api_key
    }
  })
}

const CreditGrantsApi = axios.create(axiosConfig)
export const get_GetCreditGrants = (api_url, api_key) => {
  return CreditGrantsApi.get(api_url, {
    headers: {
      Authorization: 'Bearer ' + api_key
    }
  })
}

const UsageApi = axios.create(axiosConfig)
export const get_GetUsage = (api_key, start_date, end_date) => {
  return UsageApi.get(
    `/v1/dashboard/billing/usage?start_date=${formatDate(start_date)}&end_date=${formatDate(
      end_date
    )}`,
    {
      headers: {
        Authorization: 'Bearer ' + api_key
      }
    }
  )
}

const PromptApi = axios.create(axiosConfig)
export const get_GetPrompts = (cancelToken) => {
  return PromptApi.get(
    'https://raw.githubusercontent.com/PlexPt/awesome-chatgpt-prompts-zh/main/prompts-zh.json',
    {
      cancelToken: cancelToken,
      timeout: DEFAULT_TIMEOUT
    }
  )
}

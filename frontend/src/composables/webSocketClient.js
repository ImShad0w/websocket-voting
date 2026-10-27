import { ref } from 'vue'

const DEFAULT_URL = import.meta.env.VITE_BACKEND_URL ?? 'ws://localhost:3000' //Use the container name since it will be in a container

const message = ref(null)
const connected = ref(false)
const error = ref(null)
const client = ref(null)

let socket = null
let reconnectTimer = null
let reconnectAttempts = 0
let shouldReconnect = true

function scheduleReconnect(url) {
  const delay = Math.min(1000 * 2 ** reconnectAttempts, 10000)
  reconnectAttempts += 1
  reconnectTimer = setTimeout(() => connect(url), delay)
}

function connect(url = DEFAULT_URL) {
  if (typeof WebSocket === 'undefined') return
  if (
    socket &&
    (socket.readyState === WebSocket.OPEN ||
      socket.readyState === WebSocket.CONNECTING)
  ) {
    return
  }

  shouldReconnect = true
  clearTimeout(reconnectTimer)
  reconnectTimer = null

  const ws = new WebSocket(url)
  socket = ws
  client.value = ws

  ws.addEventListener('open', () => {
    connected.value = true
    error.value = null
    reconnectAttempts = 0
  })

  ws.addEventListener('message', (event) => {
    try {
      message.value = JSON.parse(event.data)
    } catch {
      message.value = event.data
    }
  })

  ws.addEventListener('error', (event) => {
    error.value = event
    console.error('[ws] error', event)
  })

  ws.addEventListener('close', () => {
    if (socket === ws) {
      socket = null
      connected.value = false
    }
    if (client.value === ws) client.value = null

    if (shouldReconnect) scheduleReconnect(url)
  })
}

function sendMessage(payload) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.warn('[ws] cannot send message: socket is not open')
    return false
  }

  socket.send(typeof payload === 'string' ? payload : JSON.stringify(payload))
  return true
}

function disconnect() {
  shouldReconnect = false
  clearTimeout(reconnectTimer)
  reconnectTimer = null
  reconnectAttempts = 0

  socket?.close()
  socket = null
  client.value = null
  connected.value = false
}

export function useWsClient() {
  return { message, client, connected, error, connect, disconnect, sendMessage }
}

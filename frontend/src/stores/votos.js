import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { useWsClient } from '@/composables/webSocketClient'

export const useAppStore = defineStore('app', () => {
  const loginInfo = ref({
    loggedIn: false,
    username: '',
    image: '',
  })
  const votos = ref([0, 0, 0, 0]) // Un array per a 4 opcions

  const {
    message: wsMessage,
    connected: wsConnected,
    error: wsError,
    connect: connectWs,
    disconnect: disconnectWs,
    sendMessage,
  } = useWsClient()

  watch(wsMessage, (data) => {
    if (Array.isArray(data)) setVotos(data)
  }, { immediate: true })

  const isLoggedIn = computed(() => loginInfo.value.loggedIn)
  const totalVotes = computed(() =>
    votos.value.reduce((total, count) => total + count, 0)
  )

  function setLoginInfo({ loggedIn, username, image }) {
    loginInfo.value = { loggedIn, username, image }
  }

  function setVotos(nousVots) {
    votos.value = [...nousVots]
  }

  function connect() {
    connectWs()
  }

  function disconnect() {
    disconnectWs()
  }

  function votar(index) {
    if (!Number.isInteger(index) || index < 0 || index >= votos.value.length) {
      console.warn(`[votar] invalid option index: ${index}`)
      return false
    }

    return sendMessage({ vote: index })
  }

  return {
    loginInfo,
    votos,
    isLoggedIn,
    connected: wsConnected,
    wsError,
    totalVotes,
    setLoginInfo,
    setVotos,
    connect,
    disconnect,
    votar,
  }
})

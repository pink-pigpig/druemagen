import { createStore } from 'vuex'

export default createStore({
  state: {
    user: null,
    token: localStorage.getItem('token') || ''
  },
  getters: {
    isAuthenticated: state => !!state.token,
    getUser: state => state.user
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user
    },
    SET_TOKEN(state, token) {
      state.token = token
      localStorage.setItem('token', token)
    },
    CLEAR_AUTH(state) {
      state.user = null
      state.token = ''
      localStorage.removeItem('token')
    }
  },
  actions: {
    login({ commit }, { token, user }) {
      commit('SET_TOKEN', token)
      commit('SET_USER', user)
    },
    logout({ commit }) {
      commit('CLEAR_AUTH')
    },
    initializeAuth({ commit }) {
      const token = localStorage.getItem('token')
      if (token) {
        console.log('=== Store 初始化：从 localStorage 加载 token ===')
        console.log('Token 长度:', token.length)
        commit('SET_TOKEN', token)
        // 这里可以调用 API 获取用户信息并设置
        // authService.getProfile().then(user => {
        //   commit('SET_USER', user)
        // }).catch(() => {
        //   // 如果 token 无效，清除认证信息
        //   commit('CLEAR_AUTH')
        // })
      } else {
        console.log('=== Store 初始化：localStorage 中没有 token ===')
      }
    }
  },
  modules: {
  }
})
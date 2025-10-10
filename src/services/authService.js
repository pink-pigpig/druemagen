import axios from 'axios'

const API_BASE_URL = '' // 根据实际情况设置基础URL

export const authService = {
  async login(username, password) {
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        username,
        password
      })
      return response.data
    } catch (error) {
      throw error
    }
  }
}
import axios from 'axios'
import { handleError } from '@/api/errorHandler'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || 'http://localhost:4000/api',
})

function handleResponse(response) {
  return response.data
}

export const toolParamApi = {
  // Обновить параметр инструмента
  updateToolParam: async (id, updatedParam) =>
    axiosInstance
      .put(`/tools-params/${id}`, updatedParam)
      .then(handleResponse)
      .catch(handleError),

  // Удалить параметр инструмента
  deleteToolParam: async (id) =>
    axiosInstance
      .delete(`/tools-params/${id}`)
      .then(handleResponse)
      .catch(handleError),

  // Добавить новый параметр инструмента
  addToolParam: async (newParam) =>
    axiosInstance
      .post(`/tools-params`, newParam)
      .then(handleResponse)
      .catch(handleError),
}

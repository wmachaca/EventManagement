import axios from 'axios'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', 
  // or whatever your backend URL is
  timeout: 5000,
})

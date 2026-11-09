const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.detail || 'Something went wrong. Please try again.')
  return data
}
export const api = {
  health: () => request('/health'),
  parseOrder: (message) => request('/ai/parse-order', { method: 'POST', body: JSON.stringify({ message }) }),
  createOrder: (customer_name, items) => request('/payments/create-order', { method: 'POST', body: JSON.stringify({ customer_name, items }) }),
  capture: (order_id) => request('/payments/capture', { method: 'POST', body: JSON.stringify({ order_id }) }),
  transactions: () => request('/payments/transactions'),
}

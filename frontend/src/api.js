// In dev mode, Vite proxy handles /api requests (see vite.config.js)
// In production, set VITE_API_URL to the backend URL
const API_BASE = import.meta.env.VITE_API_URL || '';
export default API_BASE;

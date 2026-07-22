const API_BASE_URL = import.meta.env.VITE_API_URL || "https://corn-pdf.onrender.com";

export const buildApiUrl = (path) => `${API_BASE_URL}${path}`;
export default API_BASE_URL;

// Frontend configuration
// In production, VITE_BACKEND_URL should be set to your Render backend URL
export const config = {
    backendUrl: import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:4000',
}

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Replace '<repository-name>' with the actual name of your GitHub repository.
// For example, if your repo is 'my-react-app', then base: '/my-react-app/'
export default defineConfig({
  plugins: [react()],
  base: '/<repository-name>/',
})

import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { OpenCvProvider } from 'opencv-react';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <OpenCvProvider>
    <App />
  </OpenCvProvider>
)

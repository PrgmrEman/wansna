
import {HelmetProvider} from "react-helmet-async";
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import { BrowserRouter } from 'react-router-dom'
import { Analytics } from "@vercel/analytics/react";

ReactDOM.createRoot(document.getElementById('root')).render(
  <HelmetProvider>
  <BrowserRouter>  
      <App />
      <Analytics />
  </BrowserRouter>
  </HelmetProvider>
)
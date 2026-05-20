import { Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'

function App() {
  return (
    <Routes>
      <Route path="/*" element={<AppLayout />} />
    </Routes>
  )
}
export default App

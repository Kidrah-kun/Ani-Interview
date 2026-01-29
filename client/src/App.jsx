import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Dungeons from './pages/Dungeons'
import Interview from './pages/Interview'
import Records from './pages/Records'
import HallOfFame from './pages/HallOfFame'

function App() {
    return (
        <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dungeons" element={<Dungeons />} />
            <Route path="/interview" element={<Interview />} />
            <Route path="/records" element={<Records />} />
            <Route path="/hall-of-fame" element={<HallOfFame />} />
        </Routes>
    )
}

export default App

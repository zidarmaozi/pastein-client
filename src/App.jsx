import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ViewPaste from './components/ViewPaste';
import { motion } from 'framer-motion';

import LandingPage from './components/LandingPage';
import CreatePaste from './components/CreatePaste';

function App() {
  return (
    <Router>
      <div className="app-background"></div>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/create" element={<CreatePaste />} />
        <Route path="/:code" element={<ViewPaste />} />
      </Routes>
    </Router>
  );
}

export default App;

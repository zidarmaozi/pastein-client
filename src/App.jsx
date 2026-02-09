import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import RedirectHandler from './components/RedirectHandler';
import VerifyPage from './components/VerifyPage';
import ContentPage from './components/ContentPage';
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
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/content" element={<ContentPage />} />
        <Route path="/:code" element={<RedirectHandler />} />
      </Routes>
    </Router>
  );
}

export default App;

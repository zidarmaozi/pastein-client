
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const RedirectHandler = () => {
  const { code } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (code) {
      // Store the code in localStorage
      localStorage.setItem('paste_code', code);
      // Clear previous verification session
      sessionStorage.removeItem('is_verified');
      sessionStorage.removeItem('verified_paste_data');
      // Redirect to the verify page
      navigate('/verify');
    } else {
      // If no code, go home
      navigate('/');
    }
  }, [code, navigate]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-gray-500">Redirecting...</div>
    </div>
  );
};

export default RedirectHandler;

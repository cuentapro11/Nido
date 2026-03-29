import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Settings has been replaced by Configuracion
// This redirect ensures any old links still work
export default function Settings() {
  const navigate = useNavigate();
  useEffect(() => { navigate('/configuracion', { replace: true }); }, []);
  return null;
}

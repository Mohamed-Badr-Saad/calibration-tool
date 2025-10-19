import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';

export const useAuthRedirect = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        const redirectPath = user.role === 'admin' ? '/admin' : '/user';
        navigate(redirectPath, { replace: true });
      } else {
        navigate('/auth', { replace: true });
      }
    }
  }, [user, isLoading, navigate]);

  return { isLoading };
};

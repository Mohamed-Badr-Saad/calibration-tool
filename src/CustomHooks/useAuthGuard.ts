import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';

export const useAuthGuard = (requiredRole?: 'admin' | 'user') => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate('/auth', { replace: true });
        return;
      }

      if (requiredRole && user.role !== requiredRole) {
        const redirectPath = user.role === 'admin' ? '/admin' : '/user';
        navigate(redirectPath, { replace: true });
      }
    }
  }, [user, isLoading, requiredRole, navigate]);

  return { user, isLoading };
};

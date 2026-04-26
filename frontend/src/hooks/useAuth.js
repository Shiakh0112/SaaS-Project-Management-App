import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMe } from '../app/slices/authSlice';
import { connectSocket, disconnectSocket } from '../services/socket';

const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading, error, accessToken } = useSelector((s) => s.auth);

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      dispatch(fetchMe());
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      connectSocket();
    } else {
      disconnectSocket();
    }
    return () => {};
  }, [isAuthenticated, accessToken]);

  return { user, isAuthenticated, loading, error };
};

export default useAuth;

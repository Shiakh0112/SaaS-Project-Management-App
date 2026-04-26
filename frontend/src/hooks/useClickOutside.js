import { useEffect, useRef, useCallback } from 'react';

const useClickOutside = (callback) => {
  const ref = useRef(null);
  const callbackRef = useRef(callback);

  useEffect(() => { callbackRef.current = callback; }, [callback]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) callbackRef.current();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []); // stable — no re-register on every render

  return ref;
};

export default useClickOutside;

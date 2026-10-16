import { useEffect, useRef } from 'react';
import { mountGoogleSignIn } from './googleIdentity';

export const GoogleSignInButton = ({ onCredential, disabled, onLoadError }) => {
  const elementRef = useRef(null);
  const callbacksRef = useRef({ onCredential, onLoadError, disabled });
  const clientId = window.__PBMAPP_CONFIG__?.GOOGLE_CLIENT_ID || import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    callbacksRef.current = { onCredential, onLoadError, disabled };
  }, [onCredential, onLoadError, disabled]);

  useEffect(() => {
    if (!clientId || !elementRef.current) return;
    return mountGoogleSignIn(elementRef.current, clientId, {
      onCredential: response => {
        if (!callbacksRef.current.disabled) callbacksRef.current.onCredential(response);
      },
      onLoadError: error => callbacksRef.current.onLoadError?.(error),
    });
  }, [clientId]);

  if (!clientId) return null;
  return <div ref={elementRef} style={{ display: 'flex', justifyContent: 'center', opacity: disabled ? 0.6 : 1, pointerEvents: disabled ? 'none' : 'auto' }} />;
};

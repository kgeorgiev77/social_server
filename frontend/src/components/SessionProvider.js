import { useState, useEffect } from 'react';
import { SessionContext } from './SessionContext';

const SessionProvider = ({ children }) => {
  const [sessionData, setSessionData] = useState(() => {
    const storedSessionData = localStorage.getItem('sessionData');
    return storedSessionData ? JSON.parse(storedSessionData) : {};
  });

  useEffect(() => {
    localStorage.setItem('sessionData', JSON.stringify(sessionData));
  }, [sessionData]);

  return (
    <SessionContext.Provider value={{ sessionData, setSessionData }}>
      {children}
    </SessionContext.Provider>
  );
};

export default SessionProvider;

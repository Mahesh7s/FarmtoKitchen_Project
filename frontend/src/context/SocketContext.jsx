import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, token } = useAuth();

  useEffect(() => {
    let newSocket;
    
    const initializeSocket = async () => {
      try {
        // Dynamic import to avoid build errors
        const io = (await import('socket.io-client')).default;
        
        if (user && token) {
          // Use environment variable or fallback
        const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
          
          newSocket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            timeout: 10000
          });

          newSocket.on('connect', () => {
            console.log('✅ Socket connected:', newSocket.id);
            setIsConnected(true);
            
            // Join user's personal room and order rooms
            newSocket.emit('join_user', user._id);
            console.log(`👤 User ${user._id} joined their room`);
          });

          newSocket.on('disconnect', (reason) => {
            console.log('❌ Socket disconnected:', reason);
            setIsConnected(false);
          });

          newSocket.on('connect_error', (error) => {
            console.error('❌ Socket connection error:', error);
            setIsConnected(false);
          });

          newSocket.on('error', (error) => {
            console.error('❌ Socket error:', error);
          });

          setSocket(newSocket);
        }
      } catch (error) {
        console.warn('⚠️ Socket.io client not available:', error);
        // Create mock socket for development
        const mockSocket = {
          on: () => {},
          off: () => {},
          emit: () => {},
          close: () => {},
          connected: false
        };
        setSocket(mockSocket);
        setIsConnected(false);
      }
    };

    initializeSocket();

    return () => {
      if (newSocket) {
        console.log('🧹 Cleaning up socket connection');
        newSocket.close();
      }
    };
  }, [user, token]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
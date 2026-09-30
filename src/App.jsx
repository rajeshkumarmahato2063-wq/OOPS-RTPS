import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ParkingProvider } from './context/ParkingContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ParkingProvider>
          <AppRoutes />
        </ParkingProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

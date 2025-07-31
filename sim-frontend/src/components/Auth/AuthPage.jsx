// src/components/Auth/AuthPage.jsx
import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';

export default function AuthPage() {
  const [registerMode, setRegisterMode] = useState(false);

  const toggleMode = () => {
    setRegisterMode(prev => !prev);
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow">
      {registerMode ? <Register /> : <Login />}
      <div className="text-center mt-4">
        <button
          type="button"
          onClick={toggleMode}
          className="text-blue-600 hover:underline"
        >
          {registerMode
            ? "Already have an account? Login"
            : "Don't have an account? Create one"}
        </button>
      </div>
    </div>
  );
}

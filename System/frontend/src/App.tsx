import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StudentListPage } from './pages/students/StudentListPage';
import { StudentCreatePage } from './pages/students/StudentCreatePage';

function App(): JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/students" replace />} />
        <Route path="/students" element={<StudentListPage />} />
        <Route path="/students/new" element={<StudentCreatePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

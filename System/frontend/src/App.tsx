import { type JSX } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components';
import { StudentListPage } from './pages/students/StudentListPage';
import { StudentCreatePage } from './pages/students/StudentCreatePage';
import { StudentEditPage } from './pages/students/StudentEditPage';
import { ClassCreatePage } from './pages/classes/ClassCreatePage';
import { ClassListPage } from './pages/classes/ClassListPage';
import { ClassEditPage } from './pages/classes/ClassEditPage';

const ClassDetailPage = (): JSX.Element => (
  <div>
    <h1 className="font-display font-bold text-2xl text-neutral-800">Class Detail</h1>
  </div>
);

const EvaluationsPage = (): JSX.Element => (
  <div>
    <h1 className="font-display font-bold text-2xl text-neutral-800">Evaluations</h1>
  </div>
);

function App(): JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout appName="EduEval" />}>
          <Route path="/" element={<Navigate to="/students" replace />} />
          <Route path="/students" element={<StudentListPage />} />
          <Route path="/students/new" element={<StudentCreatePage />} />
          <Route path="/students/:id/edit" element={<StudentEditPage />} />
          <Route path="/classes" element={<ClassListPage />} />
          <Route path="/classes/new" element={<ClassCreatePage />} />
          <Route path="/classes/:id" element={<ClassDetailPage />} />
          <Route path="/classes/:id/edit" element={<ClassEditPage />} />
          <Route path="/evaluations" element={<EvaluationsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

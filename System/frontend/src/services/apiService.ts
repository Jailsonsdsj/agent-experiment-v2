import axios from 'axios';
import type { Student, CreateInput } from '../types/index';

// ─── Shared Axios instance ────────────────────────────────────────────────────

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export default api;

// ─── Student endpoints ────────────────────────────────────────────────────────

export const getStudents = (): Promise<Student[]> =>
  api.get<Student[]>('/students').then((r) => r.data);

export const getStudentById = (id: string): Promise<Student> =>
  api.get<Student>(`/students/${id}`).then((r) => r.data);

export const createStudent = (input: CreateInput<Student>): Promise<Student> =>
  api.post<Student>('/students', input).then((r) => r.data);

export const updateStudent = (
  id: string,
  input: Partial<CreateInput<Student>>,
): Promise<Student> =>
  api.put<Student>(`/students/${id}`, input).then((r) => r.data);

export const deleteStudent = (id: string): Promise<void> =>
  api.delete(`/students/${id}`).then(() => undefined);

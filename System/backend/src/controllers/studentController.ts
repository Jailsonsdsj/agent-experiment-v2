import type { Request, Response, NextFunction } from 'express';
import * as studentService from '../services/studentService';
import { DomainError } from '../services/studentService';

export const getAllStudents = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const students = await studentService.getStudents();
    res.status(200).json(students);
  } catch (error) {
    next(error);
  }
};

export const getStudentById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const student = await studentService.getStudentById(id);
    res.status(200).json(student);
  } catch (error) {
    if (error instanceof DomainError && error.code === 'NOT_FOUND') {
      res.status(404).json({ error: error.message });
      return;
    }
    next(error);
  }
};

export const createStudent = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { name, cpf, email } = req.body as Record<string, unknown>;

    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({ error: 'Field "name" is required.' });
      return;
    }
    if (!cpf || typeof cpf !== 'string' || !cpf.trim()) {
      res.status(400).json({ error: 'Field "cpf" is required.' });
      return;
    }
    if (!email || typeof email !== 'string' || !email.trim()) {
      res.status(400).json({ error: 'Field "email" is required.' });
      return;
    }

    const student = await studentService.saveStudent({ name, cpf, email });
    res.status(201).json(student);
  } catch (error) {
    if (error instanceof DomainError && error.code === 'CPF_DUPLICATE') {
      res.status(400).json({ error: error.message });
      return;
    }
    next(error);
  }
};

export const updateStudent = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, cpf, email } = req.body as Record<string, unknown>;

    const input: { name?: string; cpf?: string; email?: string } = {};
    if (name !== undefined) input.name = String(name);
    if (cpf !== undefined) input.cpf = String(cpf);
    if (email !== undefined) input.email = String(email);

    const student = await studentService.updateStudent(id, input);
    res.status(200).json(student);
  } catch (error) {
    if (error instanceof DomainError) {
      switch (error.code) {
        case 'NOT_FOUND':
          res.status(404).json({ error: error.message });
          return;
        case 'CPF_DUPLICATE':
          res.status(400).json({ error: error.message });
          return;
        default:
          res.status(400).json({ error: error.message });
          return;
      }
    }
    next(error);
  }
};

export const deleteStudent = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || !id.trim()) {
      res.status(400).json({ error: 'Student id is required.' });
      return;
    }

    await studentService.deleteStudent(id);
    res.status(204).send();
  } catch (error) {
    if (error instanceof DomainError) {
      switch (error.code) {
        case 'NOT_FOUND':
          res.status(404).json({ error: error.message });
          return;
        case 'STUDENT_ENROLLED':
          res.status(409).json({ error: error.message });
          return;
        default:
          res.status(400).json({ error: error.message });
          return;
      }
    }
    next(error);
  }
};

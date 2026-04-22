import type { Request, Response, NextFunction } from 'express';
import * as classService from '../services/classService';
import { DomainError } from '../services/studentService';
import type { Class, CreateInput } from '../types/index';

export const getAllClasses = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const classes = await classService.getClasses();
    res.status(200).json(classes);
  } catch (error) {
    next(error);
  }
};

export const getClassById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const classDetail = await classService.getClassById(id);
    res.status(200).json(classDetail);
  } catch (error) {
    if (error instanceof DomainError && error.code === 'NOT_FOUND') {
      res.status(404).json({ error: error.message });
      return;
    }
    next(error);
  }
};

export const createClass = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { topic, year, semester, studentIds } = req.body as Record<string, unknown>;

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      res.status(400).json({ error: 'Field "topic" is required.' });
      return;
    }
    if (typeof year !== 'number' || !isFinite(year)) {
      res.status(400).json({ error: 'Field "year" must be a finite number.' });
      return;
    }
    if (semester !== 1 && semester !== 2) {
      res.status(400).json({ error: 'Field "semester" must be 1 or 2.' });
      return;
    }
    if (!Array.isArray(studentIds)) {
      res.status(400).json({ error: 'Field "studentIds" must be an array.' });
      return;
    }

    const newClass = await classService.saveClass({
      topic: topic.trim(),
      year,
      semester: semester as 1 | 2,
      studentIds: studentIds as string[],
    });

    res.status(201).json(newClass);
  } catch (error) {
    if (error instanceof DomainError) {
      switch (error.code) {
        case 'INVALID_REFERENCE':
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

export const updateClass = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { topic, year, semester, studentIds } = req.body as Record<string, unknown>;

    const input: Partial<CreateInput<Class>> = {};
    if (topic !== undefined) input.topic = String(topic);
    if (year !== undefined) input.year = Number(year);
    if (semester !== undefined) {
      if (semester !== 1 && semester !== 2) {
        res.status(400).json({ error: 'Field "semester" must be 1 or 2.' });
        return;
      }
      input.semester = semester as 1 | 2;
    }
    if (studentIds !== undefined) {
      if (!Array.isArray(studentIds)) {
        res.status(400).json({ error: 'Field "studentIds" must be an array.' });
        return;
      }
      input.studentIds = studentIds as string[];
    }

    const updated = await classService.updateClass(id, input);
    res.status(200).json(updated);
  } catch (error) {
    if (error instanceof DomainError) {
      switch (error.code) {
        case 'NOT_FOUND':
          res.status(404).json({ error: error.message });
          return;
        case 'INVALID_REFERENCE':
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

/**
 * DELETE /classes/:id
 * Deletes a class and cascades to remove all associated evaluation records.
 * This operation cannot be undone.
 * Returns 204 on success, 404 if not found.
 */
export const deleteClass = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = String(req.params.id);

    if (!id || !id.trim()) {
      res.status(400).json({ error: 'Class id is required.' });
      return;
    }

    await classService.deleteClass(id);
    res.status(204).send();
  } catch (error) {
    if (error instanceof DomainError) {
      switch (error.code) {
        case 'NOT_FOUND':
          res.status(404).json({ error: error.message });
          return;
        default:
          res.status(400).json({ error: error.message });
          return;
      }
    }
    next(error);
  }
};

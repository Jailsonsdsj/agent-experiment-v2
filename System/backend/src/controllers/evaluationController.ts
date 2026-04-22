import type { Request, Response, NextFunction } from 'express';
import * as evaluationService from '../services/evaluationService';
import { DomainError } from '../services/studentService';
import type { EvaluationConcept, Goal } from '../types/index';

export const patchEvaluation = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { studentId, classId, goal, concept } = req.body as Record<string, unknown>;

    if (!studentId || typeof studentId !== 'string') {
      res.status(400).json({ error: 'Field "studentId" is required and must be a string.' });
      return;
    }
    if (!classId || typeof classId !== 'string') {
      res.status(400).json({ error: 'Field "classId" is required and must be a string.' });
      return;
    }
    if (!goal || typeof goal !== 'string') {
      res.status(400).json({ error: 'Field "goal" is required and must be a string.' });
      return;
    }
    if (!concept || typeof concept !== 'string') {
      res.status(400).json({ error: 'Field "concept" is required and must be a string.' });
      return;
    }

    const evaluation = await evaluationService.patchEvaluation({
      studentId,
      classId,
      goal: goal as Goal,
      concept: concept as EvaluationConcept,
    });

    res.status(200).json(evaluation);
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
    if (error instanceof Error && error.message.startsWith('Invalid')) {
      res.status(400).json({ error: error.message });
      return;
    }
    next(error);
  }
};

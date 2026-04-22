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

    const evaluation = await evaluationService.upsertEvaluation({
      studentId,
      classId,
      goal: goal as Goal,
      concept: concept as EvaluationConcept,
    });

    res.status(200).json(evaluation);
  } catch (error) {
    if (error instanceof DomainError) {
      switch (error.code) {
        case 'VALIDATION_ERROR':
          res.status(400).json({ error: error.message });
          return;
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

export const getEvaluationSummary = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const summary = await evaluationService.getEvaluationSummary();
    res.status(200).json(summary);
  } catch (error) {
    next(error);
  }
};

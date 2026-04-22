import { useState, useEffect, type JSX } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { getClassById } from '../../services/apiService';
import { PageHeader, Card, Button } from '../../components/index';
import { EvaluationMatrixTable } from './EvaluationMatrixTable';
import type { ClassDetail } from '../../types/index';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const semesterLabel = (semester: 1 | 2): string =>
  semester === 1 ? '1st Semester' : '2nd Semester';

// ─── Component ────────────────────────────────────────────────────────────────

export const ClassDetailPage = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [classData, setClassData] = useState<ClassDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    setIsLoading(true);
    setLoadError(null);

    getClassById(id)
      .then((data) => {
        setClassData(data);
        setIsLoading(false);
      })
      .catch((err) => {
        if (isAxiosError<{ error?: string }>(err) && err.response?.status === 404) {
          setLoadError('Class not found.');
        } else {
          setLoadError('Failed to load class. Please try again.');
        }
        setIsLoading(false);
      });
  }, [id]);

  // ── Loading ─────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="h-8 bg-neutral-200 rounded animate-pulse mb-2 w-64" />
        <div className="h-4 bg-neutral-200 rounded animate-pulse mb-8 w-40" />
        <div className="h-28 bg-neutral-200 rounded animate-pulse mb-6" />
        <div className="h-64 bg-neutral-200 rounded animate-pulse" />
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────────

  if (loadError || !classData) {
    return (
      <div className="text-center py-12">
        <p className="text-functional-danger text-sm mb-4">
          {loadError ?? 'Class could not be loaded.'}
        </p>
        <Button
          label="Back to Classes"
          variant="secondary"
          onClick={() => navigate('/classes')}
        />
      </div>
    );
  }

  // ── Stats ───────────────────────────────────────────────────────────────────

  const enrolledCount = classData.students.length;
  const evaluationsCount = classData.evaluations.length;
  const totalPossible = enrolledCount * 5;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <PageHeader
        title={classData.topic}
        subtitle={`${classData.year} — ${semesterLabel(classData.semester)}`}
        action={
          <div className="flex gap-2">
            <Button
              label="Back to List"
              variant="ghost"
              onClick={() => navigate('/classes')}
            />
            <Button
              label="Edit Class"
              variant="secondary"
              onClick={() => navigate(`/classes/${id}/edit`)}
            />
          </div>
        }
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <div className="p-4 text-center">
            <div className="text-3xl font-bold text-primary-600">{enrolledCount}</div>
            <div className="text-xs text-neutral-500 mt-1 uppercase tracking-wide font-medium">
              Students enrolled
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4 text-center">
            <div className="text-3xl font-bold text-primary-600">{evaluationsCount}</div>
            <div className="text-xs text-neutral-500 mt-1 uppercase tracking-wide font-medium">
              Evaluations recorded
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4 text-center">
            <div className="text-3xl font-bold text-primary-600">{totalPossible}</div>
            <div className="text-xs text-neutral-500 mt-1 uppercase tracking-wide font-medium">
              Total possible
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="px-4 pt-4 pb-2">
          <h2 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide mb-3">
            Evaluation Matrix
          </h2>
        </div>
        <EvaluationMatrixTable
          classId={id!}
          students={classData.students}
          evaluations={classData.evaluations}
        />
      </Card>
    </div>
  );
};

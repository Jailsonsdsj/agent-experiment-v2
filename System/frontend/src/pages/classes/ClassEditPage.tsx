import { useState, useEffect, type JSX } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { getClassById } from '../../services/apiService';
import { useClassEditForm } from '../../hooks/useClassEditForm';
import { useStudents } from '../../hooks/useStudents';
import {
  PageHeader,
  Card,
  FormLayout,
  Input,
  Select,
  Button,
} from '../../components/index';
import { StudentEnrollmentList } from './StudentEnrollmentList';
import type { ClassDetail } from '../../types/index';

// ─── Constants ────────────────────────────────────────────────────────────────

const SEMESTER_OPTIONS = [
  { value: '1', label: '1st Semester' },
  { value: '2', label: '2nd Semester' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export const ClassEditPage = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    fields,
    isSubmitting,
    isInitialized,
    error,
    initialize,
    setField,
    toggleStudent,
    submit,
  } = useClassEditForm();

  const { students, isLoading: studentsLoading, fetchError: studentsFetchError } =
    useStudents();

  // ── Class fetch state ───────────────────────────────────────────────────────

  const [classData, setClassData] = useState<ClassDetail | null>(null);
  const [classIsLoading, setClassIsLoading] = useState(true);
  const [classLoadError, setClassLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchClass = async (): Promise<void> => {
      setClassIsLoading(true);
      setClassLoadError(null);
      try {
        const cls = await getClassById(id);
        setClassData(cls);
        initialize(cls);
      } catch (err) {
        if (isAxiosError<{ error?: string }>(err) && err.response?.status === 404) {
          setClassLoadError('Class not found.');
        } else {
          setClassLoadError('Failed to load class. Please try again.');
        }
      } finally {
        setClassIsLoading(false);
      }
    };

    fetchClass();
  }, [id, initialize]);

  // ── Submit handler ──────────────────────────────────────────────────────────

  const handleSubmit = async (): Promise<void> => {
    const succeeded = await submit(id!);
    if (succeeded) {
      navigate(`/classes/${id}`);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {classIsLoading ? (
        <>
          <PageHeader title="Edit Class" />
          <Card>
            <div className="p-2">
              <div className="h-10 bg-neutral-200 rounded animate-pulse mb-4" />
              <div className="h-10 bg-neutral-200 rounded animate-pulse mb-4" />
              <div className="h-10 bg-neutral-200 rounded animate-pulse mb-4" />
            </div>
          </Card>
        </>
      ) : classLoadError ? (
        <div className="text-center py-12">
          <p className="text-functional-danger text-sm mb-4">{classLoadError}</p>
          <Button
            label="Back to Classes"
            variant="secondary"
            onClick={() => navigate('/classes')}
          />
        </div>
      ) : isInitialized ? (
        <>
          <PageHeader title="Edit Class" subtitle={classData?.topic} />

          {error && (
            <div
              role="alert"
              className="rounded-md bg-functional-danger/10 border border-functional-danger text-functional-danger text-sm px-4 py-3 mb-4"
            >
              {error}
            </div>
          )}

          <Card>
            <FormLayout title="Class Information" onSubmit={handleSubmit}>
              <Input
                label="Topic"
                name="topic"
                value={fields.topic}
                onChange={(e) => setField('topic', e.target.value)}
                placeholder="e.g. Introduction to Programming"
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Year"
                  name="year"
                  type="number"
                  value={String(fields.year)}
                  onChange={(e) => setField('year', e.target.value)}
                  required
                />

                <Select
                  label="Semester"
                  name="semester"
                  value={String(fields.semester)}
                  onChange={(e) => setField('semester', e.target.value)}
                  options={SEMESTER_OPTIONS}
                  required
                />
              </div>

              <div className="mt-2">
                <p className="text-sm font-medium text-neutral-700 mb-2">
                  Enrolled Students
                </p>
                <StudentEnrollmentList
                  students={students}
                  selectedIds={fields.studentIds}
                  onToggle={toggleStudent}
                  isLoading={studentsLoading}
                  error={studentsFetchError}
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <Button
                  label="Cancel"
                  variant="ghost"
                  onClick={() => navigate(`/classes/${id}`)}
                />
                <Button
                  label="Save Changes"
                  variant="primary"
                  type="submit"
                  onClick={handleSubmit}
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                />
              </div>
            </FormLayout>
          </Card>
        </>
      ) : null}
    </div>
  );
};

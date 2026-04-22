import { useState, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudents } from '../../hooks/useStudents';
import {
  PageHeader,
  Card,
  Table,
  Button,
  Modal,
} from '../../components/index';
import type { TableColumn } from '../../components/index';
import type { Student } from '../../types/index';

// Table requires T extends Record<string, unknown>.
// Student is an interface without an index signature, so we widen it here.
// The intersection preserves all Student property types in render functions.
type StudentRow = Student & Record<string, unknown>;

export const StudentListPage = (): JSX.Element => {
  const navigate = useNavigate();
  const {
    students,
    isLoading,
    isDeleting,
    fetchError,
    deleteError,
    removeStudent,
  } = useStudents();

  // ── Delete confirmation state ───────────────────────────────────────────────

  const [pendingDelete, setPendingDelete] = useState<Student | null>(null);

  const handleDeleteClick = (student: Student): void => {
    setPendingDelete(student);
  };

  const handleDeleteCancel = (): void => {
    setPendingDelete(null);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!pendingDelete) return;
    const success = await removeStudent(pendingDelete.id);
    if (success) setPendingDelete(null);
    // Keep modal open on failure so deleteError is visible to the user.
  };

  // ── Table column definitions ────────────────────────────────────────────────

  const columns: Array<TableColumn<StudentRow>> = [
    {
      key: 'name',
      header: 'Full Name',
    },
    {
      key: 'cpf',
      header: 'CPF',
      render: (row) => (
        <span className="font-mono text-sm text-neutral-700">{row.cpf}</span>
      ),
    },
    {
      key: 'email',
      header: 'Email',
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex gap-2 justify-end">
          <Button
            label="Edit"
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/students/${row.id}/edit`)}
          />
          <Button
            label="Delete"
            variant="danger"
            size="sm"
            disabled={isDeleting}
            onClick={() => handleDeleteClick(row)}
          />
        </div>
      ),
    },
  ];

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <PageHeader
        title="Students"
        subtitle="Manage enrolled students"
        action={
          <Button
            label="New Student"
            variant="primary"
            onClick={() => navigate('/students/new')}
          />
        }
      />

      {fetchError && (
        <div
          role="alert"
          className="rounded-md bg-functional-danger/10 border border-functional-danger text-functional-danger text-sm px-4 py-3 mb-4"
        >
          {fetchError}
        </div>
      )}

      <Card>
        <Table<StudentRow>
          columns={columns}
          data={students as StudentRow[]}
          isLoading={isLoading}
          emptyMessage="No students registered yet. Click 'New Student' to get started."
        />
      </Card>

      {/* ── Delete confirmation modal ─────────────────────────────────────── */}

      <Modal
        isOpen={pendingDelete !== null}
        onClose={handleDeleteCancel}
        title="Delete Student"
        size="sm"
        footer={
          <div className="flex gap-3 justify-end">
            <Button
              label="Cancel"
              variant="ghost"
              onClick={handleDeleteCancel}
            />
            <Button
              label="Delete"
              variant="danger"
              isLoading={isDeleting}
              disabled={isDeleting}
              onClick={handleDeleteConfirm}
            />
          </div>
        }
      >
        <p className="text-neutral-700 text-sm">
          Are you sure you want to delete{' '}
          <span className="font-semibold">{pendingDelete?.name}</span>? This
          action cannot be undone.
        </p>

        {deleteError && (
          <div
            role="alert"
            className="mt-3 rounded-md bg-functional-danger/10 border border-functional-danger text-functional-danger text-sm px-3 py-2"
          >
            {deleteError}
          </div>
        )}
      </Modal>
    </div>
  );
};

import { useState, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClasses } from '../../hooks/useClasses';
import {
  PageHeader,
  Card,
  Table,
  Button,
  Modal,
} from '../../components/index';
import type { TableColumn } from '../../components/index';
import type { Class } from '../../types/index';

// Table requires T extends Record<string, unknown>.
// Class is an interface without an index signature, so we widen it here.
type ClassRow = Class & Record<string, unknown>;

export const ClassListPage = (): JSX.Element => {
  const navigate = useNavigate();
  const {
    classes,
    isLoading,
    isDeleting,
    fetchError,
    deleteError,
    removeClass,
  } = useClasses();

  // ── Delete confirmation state ───────────────────────────────────────────────

  const [pendingDelete, setPendingDelete] = useState<Class | null>(null);

  const handleDeleteClick = (cls: Class): void => {
    setPendingDelete(cls);
  };

  const handleDeleteCancel = (): void => {
    setPendingDelete(null);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!pendingDelete) return;
    const success = await removeClass(pendingDelete.id);
    if (success) setPendingDelete(null);
  };

  // ── Table column definitions ────────────────────────────────────────────────

  const columns: Array<TableColumn<ClassRow>> = [
    {
      key: 'topic',
      header: 'Topic',
    },
    {
      key: 'year',
      header: 'Year',
    },
    {
      key: 'semester',
      header: 'Semester',
      render: (row) => (
        <span className="text-sm text-neutral-700">
          {row.semester === 1 ? '1st Semester' : '2nd Semester'}
        </span>
      ),
    },
    {
      key: 'enrolled',
      header: 'Enrolled',
      render: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700">
          {row.studentIds.length}{' '}
          {row.studentIds.length === 1 ? 'student' : 'students'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex items-center gap-1.5 justify-end">
          <Button
            label="View"
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/classes/${row.id}`)}
          />
          <Button
            label="Edit"
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/classes/${row.id}/edit`)}
          />
          <Button
            label="Delete"
            variant="danger"
            size="sm"
            disabled={isDeleting}
            onClick={() => handleDeleteClick(row as Class)}
          />
        </div>
      ),
    },
  ];

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <PageHeader
        title="Classes"
        subtitle="Manage academic classes"
        action={
          <Button
            label="New Class"
            variant="primary"
            onClick={() => navigate('/classes/new')}
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
        <Table<ClassRow>
          columns={columns}
          data={classes as ClassRow[]}
          isLoading={isLoading}
          emptyMessage="No classes registered yet. Click 'New Class' to get started."
        />
      </Card>

      {/* ── Delete confirmation modal ─────────────────────────────────────── */}

      <Modal
        isOpen={pendingDelete !== null}
        onClose={handleDeleteCancel}
        title="Delete Class"
        size="sm"
        footer={
          <div className="flex gap-3 justify-end">
            <Button
              label="Cancel"
              variant="ghost"
              onClick={handleDeleteCancel}
            />
            <Button
              label="Delete Class"
              variant="danger"
              isLoading={isDeleting}
              disabled={isDeleting}
              onClick={handleDeleteConfirm}
            />
          </div>
        }
      >
        <div className="space-y-3">
          <p className="text-neutral-700 text-sm">
            Are you sure you want to delete{' '}
            <span className="font-semibold">{pendingDelete?.topic}</span>?
          </p>
          <div className="rounded-md bg-yellow-50 border border-yellow-200 px-3 py-2">
            <p className="text-yellow-800 text-xs font-medium">
              ⚠ Warning: all evaluation records for this class will be
              permanently deleted. This action cannot be undone.
            </p>
          </div>
          {deleteError && (
            <div
              role="alert"
              className="rounded-md bg-functional-danger/10 border border-functional-danger text-functional-danger text-sm px-3 py-2"
            >
              {deleteError}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

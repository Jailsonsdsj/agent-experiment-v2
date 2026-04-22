import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Card, Button } from '../../components/index';

export const ClassListPage = (): JSX.Element => {
  const navigate = useNavigate();

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

      <Card>
        <p className="text-sm text-neutral-500 text-center py-6">
          No classes registered yet. Click 'New Class' to get started.
        </p>
      </Card>
    </div>
  );
};

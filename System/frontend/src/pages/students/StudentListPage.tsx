import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Button } from '../../components/index';

export const StudentListPage = (): JSX.Element => {
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <PageHeader
        title="Students"
        subtitle="Manage enrolled students"
        action={
          <Button
            label="New Student"
            onClick={() => navigate('/students/new')}
          />
        }
      />
      <p className="text-neutral-500 text-sm">
        Student list will be implemented here.
      </p>
    </div>
  );
};

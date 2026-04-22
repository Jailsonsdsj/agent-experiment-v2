import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentForm } from '../../hooks/useStudentForm';
import {
  PageHeader,
  Card,
  FormLayout,
  Input,
  Button,
} from '../../components/index';

export const StudentCreatePage = (): JSX.Element => {
  const navigate = useNavigate();
  const { fields, isSubmitting, error, setField, submit } = useStudentForm();

  const handleSubmit = async (): Promise<void> => {
    const succeeded = await submit();
    if (succeeded) {
      navigate('/students');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <PageHeader title="New Student" />

      <Card>
        <FormLayout title="Student Information" onSubmit={handleSubmit}>
          <Input
            label="Full Name"
            name="name"
            value={fields.name}
            onChange={(e) => setField('name', e.target.value)}
            placeholder="Enter student's full name"
            required
          />

          <Input
            label="CPF"
            name="cpf"
            value={fields.cpf}
            onChange={(e) => setField('cpf', e.target.value)}
            placeholder="000.000.000-00"
            required
          />

          <Input
            label="Email Address"
            name="email"
            type="email"
            value={fields.email}
            onChange={(e) => setField('email', e.target.value)}
            placeholder="student@example.com"
            required
          />

          {error && (
            <div
              role="alert"
              className="rounded-md bg-functional-danger/10 border border-functional-danger text-functional-danger text-sm px-4 py-3"
            >
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              label="Cancel"
              variant="ghost"
              onClick={() => navigate('/students')}
            />
            <Button
              label="Save Student"
              variant="primary"
              type="submit"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              disabled={isSubmitting}
            />
          </div>
        </FormLayout>
      </Card>
    </div>
  );
};

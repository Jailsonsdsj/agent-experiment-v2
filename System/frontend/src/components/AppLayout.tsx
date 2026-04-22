import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';

export interface AppLayoutProps {
  appName?: string;
}

export const AppLayout = ({ appName }: AppLayoutProps): JSX.Element => (
  <div className="min-h-screen bg-neutral-50">
    <Header appName={appName} />
    <main className="max-w-7xl mx-auto px-6 py-8">
      <Outlet />
    </main>
  </div>
);

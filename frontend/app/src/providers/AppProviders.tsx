import { useState, type ReactNode } from 'react';
import { RecordProvider } from './RecordContext';
import { CollectionProvider } from './CollectionContext';

const AppProvider = ({ children }: { children: ReactNode }) => {
  return (
    <CollectionProvider>
      <RecordProvider>{children}</RecordProvider>
    </CollectionProvider>
  );
};

export default AppProvider;

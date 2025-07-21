import { createContext, type ReactNode, useContext, useState } from 'react';
import { bird } from '../lib/lib';

export type RecordContextType = {
  records: any[];
  isDrawerOpen: boolean;
  isNew: boolean;
  selectedRecord: Record<string, any>;
  toggle: () => void;
  toggleEdit: (id: string, collectionName: string) => Promise<void>;
  toggleCreate: () => void;
  refreshRecords: (collectionName: string) => Promise<void>;
  deleteRecord: (id: string, collectionName: string) => Promise<void>;
};

const RecordContext = createContext<RecordContextType | null>(null);

export const RecordProvider = ({ children }: { children: ReactNode }) => {
  const [records, setRecords] = useState<any[]>([]);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [isNew, setIsNew] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<Record<string, any>>({});

  const toggle = () => setDrawerOpen(!isDrawerOpen);

  const toggleEdit = async (id: string, collectionName: string) => {
    setIsNew(false);
    const record = await bird.collection(collectionName).getOne(id);
    setSelectedRecord(record);
    setDrawerOpen(!isDrawerOpen);
  };

  const toggleCreate = () => {
    setIsNew(true);
    setSelectedRecord({});
    setDrawerOpen(!isDrawerOpen);
  };

  const refreshRecords = async (collectionName: string) => {
    if (collectionName === '') return;
    const response = await fetch(`/api/collections/${collectionName}/records`);
    const data = await response.json();

    setRecords(data.records);
  };

  const deleteRecord = async (id: string, collectionName: string) => {
    await bird.collection(collectionName!).delete(id);

    await refreshRecords(collectionName);
  };

  return (
    <RecordContext.Provider
      value={{
        records,
        isDrawerOpen,
        isNew,
        selectedRecord,
        toggle,
        toggleEdit,
        toggleCreate,
        refreshRecords,
        deleteRecord,
      }}
    >
      {children}
    </RecordContext.Provider>
  );
};

export const useRecord = () => {
  const ctx = useContext(RecordContext);
  if (!ctx) throw new Error('Must use within RecordProvider');
  return ctx;
};

import { createContext, type ReactNode, useContext, useState } from 'react';
import { bird } from '../lib/lib';

export type CollectionContextType = {
  collections: any[];
  isDrawerOpen: boolean;
  isNew: boolean;
  activeCollection: string;
  setActiveCollection: (collection: string) => void;
  toggle: () => void;
  toggleEdit: () => Promise<void>;
  toggleCreate: () => void;
  refreshCollections: () => Promise<void>;
  deleteCollection: (name: string) => Promise<void>;
};

const CollectionContext = createContext<CollectionContextType | null>(null);

export const CollectionProvider = ({ children }: { children: ReactNode }) => {
  const [isNew, setIsNew] = useState<boolean>(true);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [activeCollection, setActiveCollection] = useState<string>('');

  const [collections, setCollections] = useState<any[]>([]);

  const toggle = () => setDrawerOpen(!isDrawerOpen);

  const toggleEdit = async () => {
    setIsNew(false);
    setDrawerOpen(!isDrawerOpen);
  };

  const toggleCreate = () => {
    setIsNew(true);
    setDrawerOpen(!isDrawerOpen);
  };

  const refreshCollections = async () => {
    const data = await bird.collections.list();
    setCollections(data);
    if (activeCollection === '') {
      setActiveCollection(data[0]);
    }
  };

  const deleteCollection = async (name: string) => {
    await bird.collections.delete(name);
    await refreshCollections();
  };

  return (
    <CollectionContext.Provider
      value={{
        collections,
        isDrawerOpen,
        isNew,
        activeCollection,
        setActiveCollection,
        toggle,
        toggleCreate,
        toggleEdit,
        refreshCollections,
        deleteCollection,
      }}
    >
      {children}
    </CollectionContext.Provider>
  );
};

export const useCollection = () => {
  const ctx = useContext(CollectionContext);
  if (!ctx) throw new Error('Must use within CollectionProvider');
  return ctx;
};

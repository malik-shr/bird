import { createContext, type ReactNode, useContext, useState } from 'react';
import { bird } from '../lib/lib';
import type { Collection } from '../types/types';

export type CollectionContextType = {
  collections: Collection[];
  isDrawerOpen: boolean;
  isNew: boolean;
  activeCollection: Collection | null;
  setActiveCollection: (collection: Collection | null) => void;
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
  const [activeCollection, setActiveCollection] = useState<Collection | null>(
    null
  );

  const [collections, setCollections] = useState<Collection[]>([]);

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
    try {
      const data = await bird.collections.list();
      setCollections(data);

      if (!activeCollection) {
        setActiveCollection(data[0]);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const deleteCollection = async (name: string) => {
    await bird.collections.delete(name);
    setActiveCollection(collections[0]);
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

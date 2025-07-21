import { useEffect, useState } from 'react';
import { bird } from '../lib/lib';
import CollectionSidebar from './drawer/CollectionSidebar';

interface TableBarProps {
  activeCollection: string;
  setActiveCollection: (collection: string) => void;
  refreshCollections: () => void;
  collections: any[];
}

const TableBar = ({
  activeCollection,
  setActiveCollection,
  collections,
  refreshCollections,
}: TableBarProps) => {
  const [isNew, setIsNew] = useState<boolean>(true);
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const toggle = () => setDrawerOpen(!isDrawerOpen);

  const toggleEdit = async (name: string) => {
    setIsNew(false);
    setSelectedCollection(name);
    setDrawerOpen(!isDrawerOpen);
  };

  const toggleCreate = () => {
    setIsNew(true);
    setSelectedCollection('');
    setDrawerOpen(!isDrawerOpen);
  };

  return (
    <div className="flex flex-col gap-2 p-5 border-1 border-gray-300 rounded-2xl shadow-sm">
      {collections.map((collection) => (
        <div
          key={collection}
          className={`flex gap-5 py-2 px-6 rounded-lg  cursor-pointer text-left ${
            collection === activeCollection
              ? 'bg-gray-300'
              : 'bg-transparent hover:bg-gray-200'
          }`}
        >
          <button onClick={() => setActiveCollection(collection)}>
            {collection}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => toggleEdit(collection)}
          >
            Settings
          </button>
        </div>
      ))}

      <CollectionSidebar
        refreshCollections={refreshCollections}
        setActiveCollection={setActiveCollection}
        toggle={toggle}
        toggleCreate={toggleCreate}
        isDrawerOpen={isDrawerOpen}
        isNew={isNew}
        selectedCollection={selectedCollection}
      />
    </div>
  );
};

export default TableBar;

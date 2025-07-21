import { useEffect, useState } from 'react';
import { useCollection } from '../../providers/CollectionContext';
import CollectionSidebar from './CollectionSidebar';

interface TableBarProps {}

const TableBar = ({}: TableBarProps) => {
  const { collections, activeCollection, setActiveCollection, toggleEdit } =
    useCollection();

  return (
    <div className="flex flex-col gap-2 p-5 border-1 border-gray-300 rounded-2xl shadow-sm">
      {collections.map((collection) => (
        <button
          onClick={() => setActiveCollection(collection)}
          key={collection}
          className={`flex gap-5 py-2 px-6 rounded-lg  cursor-pointer text-left ${
            collection === activeCollection
              ? 'bg-gray-300'
              : 'bg-transparent hover:bg-gray-200'
          }`}
        >
          {collection}
        </button>
      ))}

      <CollectionSidebar />
    </div>
  );
};

export default TableBar;

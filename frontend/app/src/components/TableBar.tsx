import { useEffect, useState } from 'react';
import { bird } from '../lib/lib';

interface TableBarProps {
  activeCollection: string;
  setActiveCollection: (param: string) => void;
}

const TableBar = ({ activeCollection, setActiveCollection }: TableBarProps) => {
  const [collections, setCollections] = useState<any[]>([]);

  const refreshCollections = async () => {
    const data = await bird.collections.list();
    setCollections(data);
    console.log(activeCollection);
    if (activeCollection === '') {
      setActiveCollection(data[0]);
    }
  };

  useEffect(() => {
    refreshCollections();
  }, []);

  return (
    <div className="flex flex-col gap-2 p-5 border-1 border-gray-300 rounded-2xl shadow-sm">
      {collections.map((collection) => (
        <button
          key={collection}
          onClick={() => setActiveCollection(collection)}
          className={`py-2 px-6 rounded-lg  cursor-pointer text-left ${
            collection === activeCollection
              ? 'bg-gray-300'
              : 'bg-transparent hover:bg-gray-200'
          }`}
        >
          {collection}
        </button>
      ))}

      <button className="btn btn-primary text-white">Create Collection</button>
    </div>
  );
};

export default TableBar;

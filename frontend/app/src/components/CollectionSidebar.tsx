import { useEffect, useState } from 'react';
import { bird } from '../lib/lib';

interface CollectionSidebarProps {
  collectionName: string;
}

const CollectionSidebar = ({ collectionName }: CollectionSidebarProps) => {
  const [columns, setColumns] = useState();

  const getColumns = async () => {
    const data = await bird.collections.columns(collectionName);
    setColumns(data);
  };

  useEffect(() => {
    getColumns();
  }, []);
  return (
    <div className="drawer-side">
      <label
        htmlFor="my-drawer-4"
        aria-label="close sidebar"
        className="drawer-overlay"
      ></label>
      <ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4">
        {/* Sidebar content here */}
        <li>
          <a>Sidebar Item 1</a>
        </li>
        <li>
          <a>Sidebar Item 2</a>
        </li>
      </ul>
    </div>
  );
};

export default CollectionSidebar;

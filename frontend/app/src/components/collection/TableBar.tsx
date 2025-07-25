import { useState } from 'react';
import { useCollection } from '../../providers/CollectionContext';
import CollectionSidebar from './CollectionSidebar';
import { Icon } from '@iconify/react/dist/iconify.js';
import { TableBarItem } from './TableBarItem';

interface TableBarProps {}

const TableBar = ({}: TableBarProps) => {
  const { collections, activeCollection, setActiveCollection } =
    useCollection();

  const [systemOpen, setSystemOpen] = useState<boolean>(false);

  if (!activeCollection) return null;

  return (
    <div className="flex flex-col gap-2 p-5 border-1 border-gray-300 rounded-2xl shadow-sm">
      <h3 className="text-xl font-bold mb-5">Collections</h3>
      {collections
        .filter((collection) => !collection.system)
        .map((collection) => (
          <TableBarItem key={collection.id} collection={collection} />
        ))}

      <div className="collapse p-0 m-0 ">
        <input
          type="checkbox"
          id="system"
          checked={systemOpen}
          onChange={() => {
            setSystemOpen(!systemOpen);
          }}
        />
        <label className="collapse-title flex gap-2 items-center font-semibold text-gray-600">
          <span>System</span>
          <span>
            <Icon
              icon={systemOpen ? 'ri:arrow-up-s-line' : 'ri:arrow-down-s-line'}
            />
          </span>
        </label>
        <div className="collapse-content flex flex-col justify-start p-0">
          {collections
            .filter((collection) => collection.system)
            .map((collection) => (
              <TableBarItem key={collection.id} collection={collection} />
            ))}
        </div>
      </div>

      <div className="drawer-content">
        <label
          htmlFor="collection-drawer"
          className="drawer-button btn btn-primary w-full mt-5 flex items-center gap-2"
        >
          <Icon icon="ri:add-line" />
          <span>Create Collection</span>
        </label>
      </div>
      <CollectionSidebar />
    </div>
  );
};

export default TableBar;

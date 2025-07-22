import { Icon } from '@iconify/react/dist/iconify.js';
import { useCollection } from '../../providers/CollectionContext';
import type { Collection } from '../../types/types';
import { collectionIconMap } from '../../utils/utils';

type TableBarItemProps = {
  collection: Collection;
};

export const TableBarItem = ({ collection }: TableBarItemProps) => {
  const { activeCollection, setActiveCollection } = useCollection();
  return (
    <button
      onClick={() => setActiveCollection(collection)}
      key={collection.id}
      className={`flex py-2 px-6 rounded-lg  cursor-pointer text-left w-full items-center gap-2 text-gray-600 ${
        collection === activeCollection
          ? 'bg-gray-300'
          : 'bg-transparent hover:bg-gray-200'
      }`}
    >
      <Icon icon={collectionIconMap[collection.type]} className="text-lg" />
      <span>{collection.name}</span>
    </button>
  );
};

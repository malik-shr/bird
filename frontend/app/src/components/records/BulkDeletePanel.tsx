import { useCollection } from '../../providers/CollectionContext';
import { useRecord } from '../../providers/RecordContext';

type BulkDeletePanelType = {
  checkedItems: string[];
  setCheckedItems: (checkedItems: string[]) => void;
  setIsCheckAll: (isCheckAll: boolean) => void;
};

const BulkDeletePanel = ({
  checkedItems,
  setCheckedItems,
  setIsCheckAll,
}: BulkDeletePanelType) => {
  const { deleteRecord } = useRecord();
  const { activeCollection } = useCollection();

  const deleteRecords = async () => {
    for (const id of checkedItems) {
      deleteRecord(id, activeCollection);
    }
    setCheckedItems([]);
    setIsCheckAll(false);
  };
  return (
    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 border-1 border-gray-300 text-center py-2 px-4 rounded-lg flex justify-between gap-26">
      <div className="flex items-center gap-2 text-sm">
        <div>
          Selected <strong>{checkedItems.length}</strong> records
        </div>
        <button className="btn btn-ghost btn-xs">Reset</button>
      </div>

      <button
        className="btn btn-xs btn-ghost text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
        onClick={deleteRecords}
      >
        Delete
      </button>
    </div>
  );
};

export default BulkDeletePanel;

import { useEffect, useState } from 'react';
import RecordSidebar from './RecordSidebar';
import { getFieldIcon, type IField } from '../../utils/utils';
import { useRecord } from '../../providers/RecordContext';
import { useCollection } from '../../providers/CollectionContext';
import { Icon } from '@iconify/react/dist/iconify.js';
import RecordItem from './RecordItem';
import BulkDeletePanel from './BulkDeletePanel';
import { bird } from '../../lib/lib';

interface RecordTableProps {}

const RecordTable = ({}: RecordTableProps) => {
  const [columns, setColumns] = useState<IField[]>([]);

  const [isCheckAll, setIsCheckAll] = useState(false);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  const { records, refreshRecords } = useRecord();
  const { activeCollection, toggleEdit } = useCollection();

  const getColumns = async () => {
    if (activeCollection) {
      const data = await bird.collections.columns(activeCollection.name);

      setColumns(data);
    }
  };

  const handleSelectAll = () => {
    setIsCheckAll(!isCheckAll);
    if (!records) return;
    setCheckedItems(records.map((record) => String(record.id)));

    if (isCheckAll) {
      setCheckedItems([]);
    }
  };

  const handleCheck = (e: any) => {
    const { id, checked } = e.target;
    const newCheckedItems = [...checkedItems, String(id)];
    setCheckedItems(newCheckedItems);

    if (!checked) {
      setCheckedItems(checkedItems.filter((item) => item !== id));
      setIsCheckAll(false);
    }

    if (newCheckedItems.length === records.length) {
      setIsCheckAll(true);
    }
  };

  useEffect(() => {
    if (activeCollection) {
      getColumns();
      refreshRecords(activeCollection.name);
    }
  }, [activeCollection]);

  if (!columns || !activeCollection) return null;

  return (
    <div className="w-full p-5 border-1 border-gray-300 rounded-2xl shadow-sm">
      <div className="flex items-center gap-2 mb-10">
        <h2 className="text-2xl font-bold">{activeCollection.name}</h2>
        <button onClick={toggleEdit}>
          <div className="rounded-full hover:bg-gray-300 p-2">
            <Icon icon="ri:settings-3-line" className="text-2xl" />
          </div>
        </button>
      </div>
      <div className="drawer-content flex justify-end m-5">
        <label
          htmlFor="record-drawer"
          aria-label="close sidebar"
          className="drawer-button btn btn-secondary flex items-center gap-2"
        >
          <Icon icon="ri:add-line" />
          Create Record
        </label>
      </div>
      <RecordSidebar collectionName={activeCollection.name} />

      <div>
        <table className="w-full">
          <thead>
            <tr></tr>
          </thead>
          <tbody className="divide-y divide-gray-200"></tbody>
        </table>
        <div className="overflow-auto">
          <table className="table">
            {/* head */}
            <thead>
              <tr>
                <th>
                  <label>
                    <input
                      type="checkbox"
                      className="checkbox"
                      onChange={handleSelectAll}
                      id="selectAll"
                      name="selectAll"
                      checked={isCheckAll}
                    />
                  </label>
                </th>
                {columns
                  .filter((col) => !col.is_hidden)
                  .map((column) => (
                    <th key={column.name}>
                      <div className="flex gap-2 items-center">
                        <span>
                          <Icon icon={getFieldIcon(column)} />
                        </span>
                        <span>{column.name}</span>
                      </div>
                    </th>
                  ))}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {records.map((record, index) => (
                <RecordItem
                  key={index}
                  columns={columns}
                  record={record}
                  handleCheck={handleCheck}
                  checkedItems={checkedItems}
                  collectionName={activeCollection.name}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {checkedItems.length > 0 && (
        <BulkDeletePanel
          checkedItems={checkedItems}
          setCheckedItems={setCheckedItems}
          setIsCheckAll={setIsCheckAll}
        />
      )}
    </div>
  );
};
export default RecordTable;

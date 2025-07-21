import { useEffect, useState } from 'react';
import { bird } from '../lib/lib';
import RecordSidebar from './drawer/RecordSidebar';

interface IColumn {
  name: string;
  type: string;
  nullable: boolean;
  primary_key: boolean;
}

interface CollectionProps {
  collectionName: string;
}

const Collection = ({ collectionName }: CollectionProps) => {
  const [records, setRecords] = useState<any[]>([]);
  const [columns, setColumns] = useState<IColumn[]>([]);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [isNew, setIsNew] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<Record<string, any>>({});

  const toggle = () => setDrawerOpen(!isDrawerOpen);

  const toggleEdit = async (id: string) => {
    setIsNew(false);
    const record = await bird.collection(collectionName).getOne(id);
    setSelectedRecord(record);
    setDrawerOpen(!isDrawerOpen);
  };

  const toggleCreate = () => {
    setIsNew(true);
    setSelectedRecord({});
    setDrawerOpen(!isDrawerOpen);
  };

  const getColumns = async () => {
    const response = await fetch(`/api/collections/${collectionName}`);
    const data = await response.json();

    setColumns(data.columns);
  };

  const refreshRecords = async () => {
    const response = await fetch(`/api/collections/${collectionName}/records`);
    const data = await response.json();

    setRecords(data.records);
  };

  const deleteRecord = async (id: string) => {
    await bird.collection(collectionName!).delete(id);

    await refreshRecords();
  };

  useEffect(() => {
    getColumns();
    refreshRecords();
  }, [collectionName]);

  if (columns.length === 0) return null;

  return (
    <div className="w-full p-5 border-1 border-gray-300 rounded-2xl shadow-sm">
      <h1 className="text-3xl font-bold mb-10">{collectionName}</h1>

      <RecordSidebar
        collectionName={collectionName}
        refreshRecords={refreshRecords}
        isDrawerOpen={isDrawerOpen}
        toggleCreate={toggleCreate}
        toggle={toggle}
        isNew={isNew}
        selectedRecord={selectedRecord}
      />

      <div>
        <table className="w-full">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.name}>{column.name}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {records.map((record, index) => (
              <tr key={index}>
                {columns.map((column) => (
                  <td key={column.name} className="px-4 py-3 text-sm">
                    {record[column.name] !== null &&
                    record[column.name] !== undefined ? (
                      String(record[column.name])
                    ) : (
                      <span className="text-gray-400">null</span>
                    )}
                  </td>
                ))}
                <td className="px-4 py-3 text-sm flex gap-5">
                  <button
                    onClick={() => {
                      const primaryKeyColumn = columns.find(
                        (col) => col.primary_key
                      );
                      if (primaryKeyColumn) {
                        deleteRecord(record[primaryKeyColumn.name]);
                      }
                    }}
                    className="text-red-600 hover:text-red-800 font-medium cursor-pointer"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => toggleEdit(record.id)}
                    className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default Collection;

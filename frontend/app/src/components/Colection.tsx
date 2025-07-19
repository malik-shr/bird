import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { bird } from '../lib/lib';
import RecordSidebar from './RecordSidebar';

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
    <div>
      <h1 className="text-3xl font-bold mb-10">{collectionName}</h1>

      <div className="drawer drawer-end">
        <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex justify-end m-5">
          <label
            htmlFor="my-drawer-4"
            className="drawer-button btn btn-primary"
          >
            Create Record
          </label>
        </div>
        <RecordSidebar
          collectionName={collectionName}
          refreshRecords={refreshRecords}
        />
      </div>

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
                <td className="px-4 py-3 text-sm">
                  <button
                    onClick={() => {
                      const primaryKeyColumn = columns.find(
                        (col) => col.primary_key
                      );
                      if (primaryKeyColumn) {
                        deleteRecord(record[primaryKeyColumn.name]);
                      }
                    }}
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Delete
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

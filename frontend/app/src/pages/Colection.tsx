import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { bird } from '../lib/lib';

interface IColumn {
  name: string;
  type: string;
  nullable: boolean;
  primary_key: boolean;
}

const Collection = () => {
  const { collectionName } = useParams();

  const [records, setRecords] = useState<any[]>([]);
  const [columns, setColumns] = useState<IColumn[]>([]);
  const [formData, setFormData] = useState<any>();

  const getColumns = async () => {
    const response = await fetch(`/api/collections/${collectionName}`);
    const data = await response.json();

    const initialFormData: Record<string, any> = {};
    data.columns.forEach((column: IColumn) => {
      if (column.name !== 'id') {
        initialFormData[column.name] = '';
      }
    });
    setFormData(initialFormData);

    setColumns(data.columns);
  };

  const refreshRecords = async () => {
    const response = await fetch(`/api/collections/${collectionName}/records`);
    const data = await response.json();

    setRecords(data.records);
  };

  const getInputType = (columnType: string) => {
    const type = columnType.toLowerCase();
    if (
      type.includes('int') ||
      type.includes('numeric') ||
      type.includes('decimal')
    ) {
      return 'number';
    }
    if (type.includes('date')) {
      return 'date';
    }
    if (type.includes('datetime') || type.includes('timestamp')) {
      return 'datetime-local';
    }
    if (type.includes('bool')) {
      return 'checkbox';
    }
    return 'text';
  };

  const createRecord = async (record: any) => {
    await bird.collection(collectionName!).create(record);

    await refreshRecords();
  };

  const deleteRecord = async (id: string) => {
    await bird.collection(collectionName!).delete(id);

    await refreshRecords();
  };

  const handleInputChange = (columnName: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [columnName]: value,
    }));
  };

  useEffect(() => {
    getColumns();
    refreshRecords();
  }, []);

  const renderInput = (column: IColumn) => {
    const inputType = getInputType(column.type);

    if (inputType === 'checkbox') {
      return (
        <input
          type="checkbox"
          className="input"
          checked={formData[column.name] || false}
          onChange={(e) =>
            handleInputChange(column.name, e.target.checked.toString())
          }
          disabled={column.primary_key}
        />
      );
    }

    if (column.name === 'id') {
      return (
        <input
          type="text"
          className="input"
          placeholder="Autogeneration"
          disabled={true}
        />
      );
    }

    return (
      <input
        type={inputType}
        className="input"
        value={formData[column.name] || ''}
        onChange={(e) => handleInputChange(column.name, e.target.value)}
        placeholder={column.nullable ? 'Optional' : 'Required'}
        disabled={column.primary_key}
      />
    );
  };

  if (columns.length === 0) return null;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-10">{collectionName}</h1>
      <div className="p-2 mb-20 flex flex-col">
        {columns.map((column) => (
          <div className="flex gap-5" key={'input' + column.name}>
            <label>{column.name}</label>
            {renderInput(column)}
          </div>
        ))}
        <button className="btn mt-5" onClick={() => createRecord(formData)}>
          Create Record
        </button>
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

import { useEffect, useState } from 'react';
import { bird } from '../lib/lib';

const Collections = () => {
  const [collections, setCollections] = useState<any[]>([]);

  const [columns, setColumns] = useState<any[]>([
    { name: 'id', type: 'String', nullable: false, primary_key: true },
  ]);
  const [tableName, setTableName] = useState('');

  const columnTypes = ['Integer', 'String', 'Float', 'Boolean'];

  const refreshCollections = async () => {
    const data = await bird.collections.list();

    setCollections(data);
  };

  const deleteCollection = async (collectionName: string) => {
    await bird.collections.delete(collectionName);

    await refreshCollections();
  };

  const addColumn = () => {
    setColumns([
      ...columns,
      { name: '', type: 'String', nullable: false, primary_key: false },
    ]);
  };

  const removeColumn = (index: number) => {
    if (columns.length > 1) {
      setColumns(columns.filter((_, i) => i !== index));
    }
  };

  const updateColumn = (index: number, property: any, value: any) => {
    const updatedFields = columns.map((field, i) =>
      i === index ? { ...field, [property]: value } : field
    );
    setColumns(updatedFields);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const tableData = {
      table_name: tableName,
      columns: columns,
      type: 'base',
    };

    await bird.collections.create(
      tableData.table_name,
      tableData.columns.slice(1, tableData.columns.length),
      tableData.type
    );

    console.log(tableData);

    await refreshCollections();
  };

  useEffect(() => {
    refreshCollections();
  }, []);

  return (
    <>
      <h1 className="text-3xl font-bold mb-10">Collections</h1>
      <div className="p-2 mb-20">
        <div>
          <div className="mb-4">
            <label htmlFor="tableName">Table Name:</label>
            <input
              type="text"
              id="tableName"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder="Enter table name"
              required
            />
          </div>

          <div className="mb-4">
            <h3>Fields:</h3>

            {columns.map((column, index) => (
              <div key={index} className="mb-2 p-2 border">
                <div className="flex gap-2 items-center">
                  <div>
                    <label htmlFor={`fieldName-${index}`}>Field Name:</label>
                    <input
                      type="text"
                      id={`fieldName-${index}`}
                      value={column.name}
                      onChange={(e) =>
                        updateColumn(index, 'name', e.target.value)
                      }
                      placeholder="Field name"
                      required
                      disabled={column.name === 'id'}
                    />
                  </div>

                  <div>
                    <label htmlFor={`fieldType-${index}`}>Type:</label>
                    <select
                      id={`fieldType-${index}`}
                      value={column.type}
                      onChange={(e) =>
                        updateColumn(index, 'type', e.target.value)
                      }
                      className="font-black bg-base-200"
                      disabled={column.name === 'id'}
                    >
                      {columnTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor={`nullable-${index}`}>Nullable:</label>
                    <select
                      id={`nullable-${index}`}
                      value={column.nullable.toString()}
                      onChange={(e) =>
                        updateColumn(
                          index,
                          'nullable',
                          e.target.value === 'true'
                        )
                      }
                      className="font-black bg-base-200"
                      disabled={column.name === 'id'}
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor={`primary_key-${index}`}>Primary Key:</label>
                    <select
                      id={`primary_key-${index}`}
                      value={column.primary_key.toString()}
                      onChange={(e) =>
                        updateColumn(
                          index,
                          'primary_key',
                          e.target.value === 'true'
                        )
                      }
                      className="font-black bg-base-200"
                      disabled={column.name === 'id'}
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeColumn(index)}
                    disabled={columns.length === 1}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <button type="button" onClick={addColumn}>
              Add Field
            </button>
          </div>

          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-4 py-2"
          >
            Create Table
          </button>
        </div>
      </div>
      <div>
        {collections.map((collection) => (
          <div className="flex gap-10 items-center p-2" key={collection}>
            <a href={`/collections/${collection}`}>{collection}</a>
            <button
              className="btn"
              onClick={() => deleteCollection(collection)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

export default Collections;

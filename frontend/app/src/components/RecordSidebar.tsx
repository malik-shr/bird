import { useEffect, useState } from 'react';
import { bird } from '../lib/lib';

interface RecordSidebarProps {
  collectionName: string;
  refreshRecords: () => void;
}

interface IColumn {
  name: string;
  type: string;
  nullable: boolean;
  primary_key: boolean;
}

const RecordSidebar = ({
  collectionName,
  refreshRecords,
}: RecordSidebarProps) => {
  const [columns, setColumns] = useState<IColumn[]>([]);
  const [formData, setFormData] = useState<any>({});

  const getColumns = async () => {
    const data = await bird.collections.columns(collectionName);
    setColumns(data);

    // Initialize formData, skipping the "id" column
    const initialFormData = data.reduce((acc: any, column: any) => {
      if (column.name !== 'id') {
        acc[column.name] = ''; // or null, or a default value
      }
      return acc;
    }, {});

    setFormData(initialFormData);
  };

  const handleChange = (event: any) => {
    const name = event.target.name;
    const value = event.target.value;
    setFormData((values: any) => ({ ...values, [name]: value }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    refreshRecords();
    bird.collection(collectionName).create(formData);
  };

  useEffect(() => {
    const fetchColumns = async () => {
      const data = await bird.collections.columns(collectionName);
      setColumns(data);

      const initialFormData = data.reduce((acc: any, column: any) => {
        if (column.name !== 'id') {
          acc[column.name] = '';
        }
        return acc;
      }, {});
      setFormData(initialFormData);
    };

    if (collectionName) {
      fetchColumns();
    }
  }, [collectionName]);

  const renderInput = (column: IColumn) => {
    if (column.name === 'id') {
      return (
        <li>
          <label htmlFor={column.name}>{column.name}</label>
          <input
            className="input"
            id={column.name}
            name={column.name}
            disabled={true}
          />
        </li>
      );
    } else if (column.type === 'String') {
      return (
        <li>
          <label htmlFor={column.name}>{column.name}</label>
          <input
            className="input"
            id={column.name}
            name={column.name}
            value={formData[column.name] ?? ''}
            type="text"
            onChange={handleChange}
          />
        </li>
      );
    } else if (column.type === 'Integer') {
      return (
        <li>
          <label htmlFor={column.name}>{column.name}</label>
          <input
            className="input"
            id={column.name}
            name={column.name}
            value={formData[column.name] ?? ''}
            type="number"
            onChange={handleChange}
          />
        </li>
      );
    } else if (column.type === 'Boolean') {
      return (
        <li>
          <label htmlFor={column.name}>{column.name}</label>
          <input
            className="checkbox"
            id={column.name}
            name={column.name}
            type="checkbox"
            checked={!!formData[column.name]} // convert to boolean
            onChange={(e) =>
              setFormData((values: any) => ({
                ...values,
                [column.name]: e.target.checked,
              }))
            }
          />
        </li>
      );
    }
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
      <form
        className="menu bg-base-200 text-base-content min-h-full w-80 p-4"
        onSubmit={handleSubmit}
      >
        {columns.map((column) => (
          <div key={column.name}>{renderInput(column)}</div>
        ))}

        <input
          className="btn btn-primary text-white mt-10"
          value="Create Record"
          type="submit"
        />
      </form>
    </div>
  );
};

export default RecordSidebar;

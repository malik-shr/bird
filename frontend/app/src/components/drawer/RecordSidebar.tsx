import { useEffect, useState } from 'react';
import { bird } from '../../lib/lib';
import Input from '../Input';

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
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const toggle = () => setDrawerOpen(!isDrawerOpen);

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

  const handleChange = (e: any) => {
    const name = e.target.name;
    const value = e.target.value;
    setFormData((values: any) => ({ ...values, [name]: value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    await bird.collection(collectionName).create(formData);
    await refreshRecords();
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

  const getInputType = (type: string) => {
    if (type === 'Integer' || type == 'Float') {
      return 'number';
    }
    return 'text';
  };

  const renderInput = (column: IColumn) => {
    if (
      column.type == 'Integer' ||
      column.type === 'String' ||
      column.type === 'Float'
    ) {
      return (
        <Input
          value={formData[column.name]}
          type={getInputType(column.type)}
          name={column.name}
          id={column.name}
          label={column.name}
          handleChange={column.name !== 'id' ? handleChange : undefined}
          placeholder={column.name === 'id' ? 'Autogeneration' : ''}
          disabled={column.name === 'id'}
        />
      );
    } else if (column.type === 'Boolean') {
      return <></>;
    }
  };

  useEffect(() => {
    getColumns();
  }, []);
  return (
    <div className="drawer drawer-end">
      <input
        id="my-drawer-4"
        type="checkbox"
        className="drawer-toggle"
        checked={isDrawerOpen}
        onClick={toggle}
      />
      <div className="drawer-content flex justify-end m-5">
        <label
          htmlFor="my-drawer-4"
          aria-label="close sidebar"
          className="drawer-button btn btn-secondary"
        >
          Create Record
        </label>
      </div>
      <div className="drawer-side">
        <label
          htmlFor="my-drawer-4"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <form
          className="menu bg-base-200 text-base-content min-h-full w-lg p-4 flex flex-col justify-between"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col mt-5 gap-10">
            <h3 className="text-xl font-bold">+ Create Record</h3>
            <ul className="flex flex-col gap-5 overflow-auto max-h-[calc(100vh-150px)]">
              {columns.map((column) => (
                <div key={column.name} className="w-full">
                  {renderInput(column)}
                </div>
              ))}
            </ul>
          </div>

          <div className="mb-5">
            <input
              className="btn btn-secondary text-white w-full"
              value="Create Record"
              type="submit"
              onClick={toggle}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordSidebar;

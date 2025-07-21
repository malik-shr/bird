import { useEffect, useState } from 'react';
import { bird } from '../../lib/lib';
import Input from '../Input';

interface RecordSidebarProps {
  collectionName: string;
  refreshRecords: () => void;
  isDrawerOpen: boolean;
  toggle: () => void;
  toggleCreate: () => void;
  isNew: boolean;
  selectedRecord: Record<string, any>;
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
  isDrawerOpen,
  toggle,
  isNew,
  toggleCreate,
  selectedRecord,
}: RecordSidebarProps) => {
  const [columns, setColumns] = useState<IColumn[]>([]);
  const [formData, setFormData] = useState<any>({});

  const getColumns = async () => {
    const data = await bird.collections.columns(collectionName);
    setColumns(data);

    // Initialize formData, skipping the "id" column
    const initialFormData = data.reduce((acc: any, column: any) => {
      if (!isNew && selectedRecord) {
        acc[column.name] = selectedRecord[column.name];
        return acc;
      }
      if (column.name !== 'id') {
        acc[column.name] = ''; // or null, or a default value
      }
      if (column.type === 'Boolean') {
        acc[column.name] = false;
      }
      return acc;
    }, {});

    setFormData(initialFormData);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = event.target;

    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    console.log(formData);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      if (selectedRecord.id && selectedRecord) {
        await bird
          .collection(collectionName)
          //@ts-ignore
          .update(selectedRecord.id, selectedRecord);
      } else {
        await bird.collection(collectionName).create(formData);
      }
      await refreshRecords();
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (collectionName) {
      getColumns();
    }
  }, [collectionName, selectedRecord]);

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
      return (
        <div className="flex gap-2">
          <input
            id={column.name}
            name={column.name}
            type="checkbox"
            className="toggle"
            checked={formData[column.name]}
            onChange={handleChange}
          />
          <label htmlFor={column.name}>{column.name}</label>
        </div>
      );
    }
  };

  return (
    <div className="drawer drawer-end">
      <input
        id="my-drawer-4"
        type="checkbox"
        className="drawer-toggle"
        checked={isDrawerOpen}
        onChange={toggleCreate}
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
            <h3 className="text-xl font-bold">
              {isNew ? '+ Create Record' : 'Edit Record'}
            </h3>
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
              value={isNew ? 'Create Record' : 'Update Record'}
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

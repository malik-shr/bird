import { useEffect, useState } from 'react';
import { bird } from '../../lib/lib';
import Input from '../Input';
import { fieldIconMap, getFieldIcon, type IField } from '../../utils/utils';
import { useRecord } from '../../providers/RecordContext';
import { getIcon, Icon } from '@iconify/react/dist/iconify.js';
import Sidebar from '../Sidebar';

interface RecordSidebarProps {
  collectionName: string;
}

const RecordSidebar = ({ collectionName }: RecordSidebarProps) => {
  const [columns, setColumns] = useState<IField[]>([]);
  const [formData, setFormData] = useState<any>({});

  const {
    selectedRecord,
    isNew,
    refreshRecords,
    isDrawerOpen,
    toggle,
    toggleCreate,
  } = useRecord();

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
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      if (selectedRecord.id && selectedRecord) {
        await bird
          .collection(collectionName)
          //@ts-ignore
          .update(selectedRecord.id, formData);
      } else {
        await bird.collection(collectionName).create(formData);
      }
      await refreshRecords(collectionName);
    } catch (e) {
      console.log(e);
    }
  };

  const handleCancel = (e: any) => {
    e.preventDefault();
    toggle();
  };

  useEffect(() => {
    if (collectionName) {
      getColumns();
    }
  }, [collectionName, selectedRecord]);

  const getInputType = (field: IField) => {
    if (field.secure) {
      return 'password';
    }
    if (field.type === 'Integer' || field.type == 'Float') {
      return 'number';
    }
    return 'text';
  };

  const renderInput = (field: IField) => {
    if (
      field.type == 'Integer' ||
      field.type === 'String' ||
      field.type === 'Float'
    ) {
      return (
        <Input
          value={formData[field.name]}
          type={getInputType(field)}
          name={field.name}
          id={field.name}
          label={field.name}
          handleChange={field.name !== 'id' ? handleChange : undefined}
          placeholder={field.name === 'id' ? 'Autogeneration' : ''}
          disabled={field.name === 'id'}
          icon={getFieldIcon(field)}
          required={field.required}
        />
      );
    } else if (field.type === 'Boolean') {
      return (
        <div className="flex gap-2">
          <input
            id={field.name}
            name={field.name}
            type="checkbox"
            className="toggle"
            checked={formData[field.name]}
            onChange={handleChange}
          />
          <label htmlFor={field.name}>{field.name}</label>
        </div>
      );
    }
  };

  return (
    <Sidebar id="record-drawer" isOpen={isDrawerOpen} toggleOpen={toggleCreate}>
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

        <div className="mb-5 flex gap-5">
          <button className="btn btn-base flex-1" onClick={handleCancel}>
            Cancel
          </button>
          <input
            className="btn btn-secondary text-white flex-1"
            value={isNew ? 'Create Record' : 'Update Record'}
            type="submit"
            onClick={toggle}
          />
        </div>
      </form>
    </Sidebar>
  );
};

export default RecordSidebar;

import { useEffect, useState } from 'react';
import { bird } from '../../lib/lib';
import Input from '../Input';
import { fieldIconMap, getFieldIcon, type IField } from '../../utils/utils';
import { useRecord } from '../../providers/RecordContext';
import Sidebar from '../Sidebar';
import Select from '../Select';

interface RecordSidebarProps {
  collectionName: string;
}

const RecordSidebar = ({ collectionName }: RecordSidebarProps) => {
  const [columns, setColumns] = useState<IField[]>([]);
  const [formData, setFormData] = useState<any>({});
  const [relationRecords, setRelationRecords] = useState<Map<string, any>>(
    new Map()
  );

  const {
    selectedRecord,
    isNew,
    refreshRecords,
    isDrawerOpen,
    toggle,
    toggleCreate,
  } = useRecord();

  const handleSelectChange = (event: any) => {
    const { name, value } = event.target;

    setFormData((prev: any) => ({
      ...prev,
      [name]: parseInt(value),
    }));
  };

  const handleChange = (event: any) => {
    const { name, type, checked, value } = event.target;

    let val = value;

    if (type === 'checkbox') {
      val = checked;
    }

    setFormData((prev: any) => ({
      ...prev,
      [name]: val,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      if (selectedRecord.id) {
        await bird
          .collection(collectionName)
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

  const getData = async () => {
    const columnsResponse = await bird.collections.columns(collectionName);
    setColumns(columnsResponse);

    // Initialize formData, skipping the "id" column
    const initialFormData = columnsResponse.reduce((acc: any, column: any) => {
      if (!isNew && selectedRecord) {
        acc[column.name] = selectedRecord[column.name];
        return acc;
      }
      if (column.type === 'Select') {
        acc[column.name] = 0;
      }
      if (column.type === 'Boolean') {
        acc[column.name] = false;
      }
      if (column.name !== 'id') {
        acc[column.name] = ''; // or null, or a default value
      }

      return acc;
    }, {});

    setFormData(initialFormData);

    const relations = new Map();
    console.log(columnsResponse);
    for (const field of columnsResponse) {
      if (field.relationCollection) {
        const relationsRecordsResponse = await bird
          .collection(field.relationCollection)
          .getList();

        const relationRecordArr = [];

        for (const relationRecord of relationsRecordsResponse) {
          relationRecordArr.push({
            value: relationRecord.id,
            text: relationRecord.name,
          });
        }

        relations.set(field.name, relationRecordArr);
      }
    }

    setRelationRecords(relations);
  };

  useEffect(() => {
    if (collectionName) {
      getData();
    }
  }, [collectionName, selectedRecord]);

  const getInputType = (field: IField) => {
    if (field.is_secure) {
      return 'password';
    }
    if (field.type === 'Integer' || field.type == 'Float') {
      return 'number';
    }
    if (field.type === 'Date') {
      return 'date';
    }
    return 'text';
  };

  const renderInput = (field: IField) => {
    if (
      field.type == 'Integer' ||
      field.type === 'String' ||
      field.type === 'Float' ||
      field.type === 'Date'
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
          required={field.is_required}
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
    } else if (field.type === 'Select' && field.options) {
      return (
        <div className="flex gap-2">
          <Select
            value={formData[field.name]}
            id={`select-${field.name}`}
            name={field.name}
            required={field.is_required}
            handleChange={handleSelectChange}
            options={field.options}
            label={field.name}
            icon={fieldIconMap[field.type]}
          />
        </div>
      );
    } else if (field.type === 'Relation') {
      return (
        <div className="flex gap-2">
          {relationRecords && relationRecords.size > 0 && (
            <Select
              value={formData[field.name]}
              id={`relation-${field.name}`}
              name={field.name}
              required={field.is_required}
              handleChange={handleChange}
              options={relationRecords.get(field.name)}
              label={field.name}
              icon={fieldIconMap[field.type]}
            />
          )}
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

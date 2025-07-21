import { useEffect, useState } from 'react';
import { bird } from '../../lib/lib';
import Dropdown from './Dropdown';
import { type IField } from '../../utils/utils';
import CollectionCreateInput from '../CollectionCreateInput';
import Input from '../Input';

interface CollectionSidebarType {
  refreshCollections: () => void;
  setActiveCollection: (collection: string) => void;
  isDrawerOpen: boolean;
  toggle: () => void;
  toggleCreate: () => void;
  isNew: boolean;
  selectedCollection: string;
}

const CollectionSidebar = ({
  refreshCollections,
  setActiveCollection,
  isDrawerOpen,
  toggle,
  toggleCreate,
  isNew,
  selectedCollection,
}: CollectionSidebarType) => {
  const [fields, setFields] = useState<IField[]>([]);
  const [tableName, setTableName] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const handleChange = async (e: any, index: number) => {
    const { name, value, type, checked } = e.target;

    setFields((prevFields) => {
      const newFields = [...prevFields];
      newFields[index] = {
        ...newFields[index],
        [name]: type === 'checkbox' ? checked : value,
      };
      return newFields;
    });
  };

  const handleChangeName = (e: any) => {
    setTableName(e.target.value);
  };

  const handleChangeDescription = (e: any) => {
    setDescription(e.target.value);
  };

  const handleSubmit = async (e: any) => {
    try {
      e.preventDefault();
      const tableData = {
        table_name: tableName,
        fields: fields,
        type: 'base', //TODO
      };

      const newFields = [];

      for (const field of fields) {
        if (field.name !== 'id') {
          newFields.push(field);
        }
      }

      await bird.collections.create(
        tableData.table_name,
        newFields,
        tableData.type
      );

      console.log(tableData);

      await refreshCollections();
      setActiveCollection(tableData.table_name);
    } catch (e) {
      console.log(e);
    }
  };

  const deleteCollection = async (name: string) => {
    await bird.collections.delete(name);
    await refreshCollections();
  };

  useEffect(() => {
    const fetchFields = async () => {
      if (selectedCollection !== '') {
        console.log(selectedCollection);
        const collectionFields = await bird.collections.columns(
          selectedCollection
        );
        setFields(collectionFields);
      } else {
        setFields([
          {
            name: 'id',
            primary_key: true,
            type: 'String',
            required: true,
            secure: false,
            hidden: false,
          },
        ]);
      }
    };

    fetchFields();
  }, [selectedCollection]);

  return (
    <div className="drawer drawer-end">
      <input
        id="my-drawer-6"
        type="checkbox"
        className="drawer-toggle"
        checked={isDrawerOpen}
        onChange={toggleCreate}
      />
      <div className="drawer-content">
        {/* Page content here */}
        <label htmlFor="my-drawer-6" className="drawer-button btn btn-primary">
          Create Collection
        </label>
      </div>
      <div className="drawer-side ">
        <label
          htmlFor="my-drawer-6"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <form
          className="menu bg-base-200 text-base-content min-h-full w-xl p-6 flex flex-col justify-between"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col mt-5 gap-10">
            <div className="flex justify-between">
              <h3 className="text-xl font-bold mb-3">
                {isNew ? '+ Create Collection' : 'Edit Collection'}
              </h3>
              <button
                className="text-red-500 hover:text-red-600 cursor-pointer"
                onClick={() => deleteCollection(selectedCollection)}
              >
                Delete
              </button>
            </div>

            <ul className="flex flex-col justify-center items-start">
              <div className="flex flex-col mb-8 w-full gap-4">
                <Input
                  value={tableName}
                  name="tableName"
                  type="text"
                  id="tableName"
                  handleChange={handleChangeName}
                  label="Name"
                />
                <Input
                  value={description}
                  name="description"
                  type="text"
                  id="description"
                  handleChange={handleChangeDescription}
                  label="Description"
                />
              </div>
              <div className="flex flex-col mb-5 w-full">
                {fields.map((field, i) => (
                  <CollectionCreateInput
                    key={field.name}
                    field={field}
                    index={i}
                    handleChange={handleChange}
                    disabled={field.name === 'id'}
                  />
                ))}
              </div>

              <Dropdown fields={fields} setFields={setFields} />
            </ul>
          </div>

          <div className="mb-5">
            <input
              type="submit"
              className="btn btn-primary w-full"
              onClick={toggle}
              value={isNew ? 'Create Collection' : 'Update Collection'}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default CollectionSidebar;

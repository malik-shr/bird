import { useEffect, useState } from 'react';
import { bird } from '../../lib/lib';
import Dropdown from './Dropdown';
import { type IField } from '../../utils/utils';
import Input from '../Input';
import { useCollection } from '../../providers/CollectionContext';
import CollectionCreateField from './CollectionCreateField';
import { Icon } from '@iconify/react/dist/iconify.js';

interface CollectionSidebarType {}

const CollectionSidebar = ({}: CollectionSidebarType) => {
  const [fields, setFields] = useState<IField[]>([]);
  const [tableName, setTableName] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const {
    refreshCollections,
    setActiveCollection,
    activeCollection,
    isDrawerOpen,
    isNew,
    toggleCreate,
    toggle,
    deleteCollection,
  } = useCollection();

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

      const newCollection = await bird.collections.create(
        tableData.table_name,
        newFields,
        tableData.type
      );

      await refreshCollections();
      setActiveCollection(newCollection);
    } catch (e) {
      console.log(e);
    }
  };

  const handleCancel = (e: any) => {
    e.preventDefault();
    toggle();
  };

  const handleDelete = (e: any, name: string) => {
    e.preventDefault();
    deleteCollection(name);
    toggle();
  };

  useEffect(() => {
    const fetchFields = async () => {
      if (activeCollection && !isNew) {
        const collectionFields = await bird.collections.columns(
          activeCollection.name
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
  }, [activeCollection, isNew]);

  if (!activeCollection) return null;
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
        <label
          htmlFor="my-drawer-6"
          className="drawer-button btn btn-primary w-full mt-5 flex items-center gap-2"
        >
          <Icon icon="ri:add-line" />
          <span>Create Collection</span>
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
              <h3 className="text-lg mb-3">
                {isNew ? (
                  <span>+ Create Collection</span>
                ) : (
                  <span>
                    Edit <b>{activeCollection.name}</b> Collection
                  </span>
                )}
              </h3>
              <button
                className="text-red-500 hover:text-red-600 cursor-pointer"
                onClick={(e) => handleDelete(e, activeCollection.name)}
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
                  required={true}
                  icon={''}
                />
                <Input
                  value={description}
                  name="description"
                  type="text"
                  id="description-create"
                  handleChange={handleChangeDescription}
                  label="Description"
                  required={false}
                  icon={''}
                />
              </div>
              <div className="flex flex-col mb-5 w-full">
                {fields.map((field, i) => (
                  <CollectionCreateField
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

          <div className="mb-5 flex gap-5">
            <button className="btn btn-base flex-1" onClick={handleCancel}>
              Cancel
            </button>
            <input
              type="submit"
              className="btn btn-neutral flex-1"
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

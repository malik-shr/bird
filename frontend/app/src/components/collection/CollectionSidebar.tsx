import { useEffect, useState } from 'react';
import { bird } from '../../lib/lib';
import Dropdown from './Dropdown';
import { type IField } from '../../utils/utils';
import Input from '../Input';
import { useCollection } from '../../providers/CollectionContext';
import CollectionCreateField from './CollectionCreateField';
import Sidebar from '../Sidebar';
import AuthRules from './AuthRules';

const CollectionSidebar = () => {
  const [fields, setFields] = useState<IField[]>([]);
  const [tableName, setTableName] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const [ruleData, setRuleData] = useState({
    viewRule: 0,
    createRule: 0,
    updateRule: 0,
    deleteRule: 0,
  });

  const handleRuleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRuleData((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

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
    console.log(fields);
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

      const newFields = [];

      for (const field of fields) {
        if (field.name !== 'id') {
          newFields.push(field);
        }
      }

      const newCollection = await bird.collections.create(
        tableName,
        newFields,
        'base',
        ruleData
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
            type: 'String',
            primary_key: true,
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
    <Sidebar
      id="collection-drawer"
      isOpen={isDrawerOpen}
      toggleOpen={toggleCreate}
    >
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
          <div className="tabs tabs-lift">
            <input
              type="radio"
              name="my_tabs_3"
              className="tab"
              aria-label="Fields"
              defaultChecked
            />
            <div className="tab-content bg-base-100 border-base-300 p-6">
              <div className="flex flex-col mb-5 w-full">
                {fields.map((field, i) => (
                  <CollectionCreateField
                    key={i}
                    field={field}
                    index={i}
                    handleChange={handleChange}
                    disabled={field.name === 'id'}
                  />
                ))}
              </div>

              <Dropdown fields={fields} setFields={setFields} />
            </div>

            <input
              type="radio"
              name="my_tabs_3"
              className="tab"
              aria-label="Auth Rules"
            />
            <div className="tab-content bg-base-100 border-base-300 p-6">
              <AuthRules
                handleRuleChange={handleRuleChange}
                ruleData={ruleData}
              />
            </div>
          </div>
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
    </Sidebar>
  );
};

export default CollectionSidebar;

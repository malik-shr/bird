import { useState } from 'react';
import { bird } from '../../lib/lib';
import Dropdown from './Dropdown';
import { type IField } from '../../utils/utils';
import CollectionCreateInput from '../CollectionCreateInput';
import Input from '../Input';

interface CollectionSidebarType {
  refreshCollections: () => void;
}

const CollectionSidebar = ({ refreshCollections }: CollectionSidebarType) => {
  const [fields, setFields] = useState<IField[]>([]);
  const [tableName, setTableName] = useState<string>('');
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const toggle = () => setDrawerOpen(!isDrawerOpen);

  const handleChange = (e: any, index: number) => {
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

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const tableData = {
      table_name: tableName,
      fields: fields,
      type: 'base', //TODO
    };

    await bird.collections.create(
      tableData.table_name,
      tableData.fields,
      tableData.type
    );

    await refreshCollections();
  };

  return (
    <div className="drawer drawer-end">
      <input
        id="my-drawer-6"
        type="checkbox"
        className="drawer-toggle"
        checked={isDrawerOpen}
        onClick={toggle}
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
            <h3 className="text-xl font-bold mb-3">+ Create Collection</h3>
            <ul className="flex flex-col justify-center items-start">
              <div className="mb-6 w-full">
                <Input
                  value={tableName}
                  name="tableName"
                  type="text"
                  id="tableName"
                  handleChange={handleChangeName}
                  label="Name"
                />
              </div>
              <div className="w-full">
                <CollectionCreateInput
                  field={{
                    name: 'id',
                    primary_key: true,
                    type: 'String',
                    required: true,
                    secure: false,
                    hidden: false,
                  }}
                  disabled={true}
                />
              </div>
              <div className="flex flex-col mb-5 w-full">
                {fields.map((field, i) => (
                  <CollectionCreateInput
                    field={field}
                    index={i}
                    handleChange={handleChange}
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
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default CollectionSidebar;

import { Icon } from '@iconify/react/dist/iconify.js';
import { useState } from 'react';
import { getFieldIcon, type IField } from '../../utils/utils';
import { useCollection } from '../../providers/CollectionContext';

interface CollectionCreateFieldProps {
  field: IField;
  index?: number;
  handleChange?: (e: any, index: number) => void;
  disabled?: boolean;
}

const CollectionCreateField = ({
  field,
  index = -1,
  handleChange,
  disabled = false,
}: CollectionCreateFieldProps) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const handleSettingsChange = (e: any) => {
    setIsCollapsed(e.target.checked);
  };

  const renderCheckbox = (
    field: IField,
    attr: keyof IField,
    index: number,
    label: string
  ) => {
    return (
      <div className="flex gap-2">
        <input
          type="checkbox"
          className="toggle"
          id={`${attr}-${index}`}
          name={attr}
          checked={Boolean(field[attr])}
          onChange={handleChange && ((e) => handleChange(e, index))}
        />
        <label htmlFor={`${attr}-${index}`}>{label}</label>
      </div>
    );
  };

  const { collections } = useCollection();

  const onOptionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const texts = value.split(',');

    field.options = [];

    for (let i = 0; i < texts.length; i++) {
      field.options.push({ value: i, text: texts[i] });
    }
  };

  return (
    <div
      className={`rounded-lg ${
        isCollapsed ? 'border-1 border-gray-400 my-4' : ''
      }`}
      key={index}
    >
      <div
        className={`flex items-center gap-2 w-full p-1 bg-gray-200 ${
          disabled ? 'text-gray-400' : ''
        } ${isCollapsed ? 'rounded-t-lg' : ''}`}
      >
        <div className="flex items-center gap-2 w-full">
          <div className="w-full text-md p-2 flex items-center gap-2 focus-within:bg-gray-300 rounded">
            <label htmlFor={`name-${index}`}>
              <Icon icon={getFieldIcon(field)} />
            </label>
            <input
              disabled={disabled}
              value={field.name}
              type="text"
              id={`name-${index}`}
              className="outline-none w-full"
              name="name"
              onChange={handleChange && ((e) => handleChange(e, index))}
            />
          </div>
          {field.type === 'Select' && (
            <div>
              <label>choices</label>
              <input type="text" onChange={onOptionsChange} />
            </div>
          )}
          {field.type === 'Relation' && (
            <div>
              <select
                onChange={handleChange && ((e) => handleChange(e, index))}
                value={field.relation_collection || ''}
                name="relation"
              >
                <option value="" disabled>
                  --- Select ---
                </option>
                {collections.map((collection) => (
                  <option key={collection.id} value={collection.name}>
                    {collection.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <input
              id={`settings-${index}`}
              type="checkbox"
              className="hidden"
              disabled={disabled}
              onChange={(e) => handleSettingsChange(e)}
            />
            <label htmlFor={`settings-${index}`}>
              <div
                className={`rounded-full ${
                  !disabled && 'hover:bg-gray-300'
                } p-2`}
              >
                <Icon icon="ri:settings-3-line" className="text-lg" />
              </div>
            </label>
          </div>
        </div>
      </div>

      {index !== -1 && (
        <div
          className={`flex flex-col gap-2 p-2 m-2 transition ${
            isCollapsed ? 'flex' : 'hidden'
          }`}
        >
          <div className="flex gap-10">
            {renderCheckbox(field, 'is_required', index, 'Required')}
            {renderCheckbox(field, 'is_primary_key', index, 'Primary Key')}
            {renderCheckbox(field, 'is_secure', index, 'Secure')}
          </div>
          <div className="flex gap-10">
            {renderCheckbox(field, 'is_hidden', index, 'Hidden')}
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionCreateField;

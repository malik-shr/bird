import { Icon } from '@iconify/react/dist/iconify.js';
import { useState } from 'react';
import { fieldIconMap, type IField } from '../../utils/utils';

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
              <Icon icon={fieldIconMap[field.type]} />
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
            {renderCheckbox(field, 'required', index, 'Required')}
            {renderCheckbox(field, 'primary_key', index, 'Primary Key')}
            {renderCheckbox(field, 'secure', index, 'Secure')}
          </div>
          <div className="flex gap-10">
            {renderCheckbox(field, 'hidden', index, 'Hidden')}
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionCreateField;

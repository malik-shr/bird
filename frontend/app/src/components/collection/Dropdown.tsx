import { useState } from 'react';
import { Icon } from '@iconify/react';
import { fieldIconMap, type IField } from '../../utils/utils';

const types = [
  'String',
  'Integer',
  'Float',
  'Boolean',
  'Date',
  'Select',
  'Relation',
];

interface DropdownProps {
  fields: IField[];
  setFields: (field: IField[]) => void;
}

const Dropdown = ({ fields, setFields }: DropdownProps) => {
  const [open, setOpen] = useState(false);

  const toggleDropdown = (e: any) => {
    e.preventDefault();
    setOpen(!open);
  };

  const addField = (e: any, type: string) => {
    e.preventDefault();
    setFields([
      ...fields,
      {
        name: 'field',
        type: type,
        is_required: false,
        is_primary_key: false,
        is_secure: false,
        is_hidden: false,
      },
    ]);

    setOpen(false);
  };

  return (
    <div className="relative inline-block w-full">
      <button
        onClick={toggleDropdown}
        className="border py-2 px-2 w-full cursor-pointer bg-white"
      >
        + Add Field
      </button>

      {open && (
        <ul className="absolute z-10 bg-white border rounded w-full shadow">
          {types.map((type) => (
            <div
              key={type}
              onClick={(e) => addField(e, type)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
            >
              <Icon icon={fieldIconMap[type]} />
              <span>{type}</span>
            </div>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dropdown;

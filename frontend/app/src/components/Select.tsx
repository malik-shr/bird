import { Icon } from '@iconify/react/dist/iconify.js';

export type Options = {
  value: number;
  text: string;
};

export type SelectType = {
  value: number;
  id: string;
  name: string;
  label: string;
  disabled?: boolean;
  required: boolean;
  handleChange?: (e: any) => void;
  options: Options[];
};

const Select = ({
  value,
  id,
  name,
  label,
  disabled,
  required,
  handleChange,
  options,
}: SelectType) => {
  return (
    <div
      className={`bg-gray-200 py-2 px-4 focus-within:bg-gray-300 w-full rounded-md" ${
        disabled ? 'text-gray-500' : ''
      }`}
    >
      <label htmlFor={id} className="flex items-center gap-1">
        <Icon icon="ri:list-check" />
        <span>{label} </span>
        <span className="text-red-600">{required ? '*' : ''}</span>
      </label>
      <select
        id={id}
        value={value}
        name={name}
        onChange={handleChange}
        className="outline-none w-full"
      >
        {options.map((option) => (
          <option value={option.value} className="w-full" key={option.value}>
            {option.text}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;

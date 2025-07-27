import { Icon } from '@iconify/react/dist/iconify.js';

interface InputType {
  value: string;
  type: string;
  id: string;
  name: string;
  label: string;
  disabled?: boolean;
  placeholder?: string;
  required: boolean;
  handleChange?: (e: any) => void;
  icon: string;
}

const Input = ({
  value,
  type,
  id,
  label,
  name,
  handleChange,
  disabled,
  placeholder,
  required,
  icon,
}: InputType) => {
  return (
    <div
      className={`bg-gray-200 py-2 px-4 focus-within:bg-gray-300 w-full rounded-md" ${
        disabled ? 'text-gray-500' : ''
      }`}
    >
      <label htmlFor={id} className="flex items-center gap-1">
        <Icon icon={icon} />
        <span>{label} </span>
        <span className="text-red-600">{required ? '*' : ''}</span>
      </label>
      <input
        value={value || ''}
        type={type}
        name={name}
        id={id}
        placeholder={placeholder}
        className="outline-none w-full"
        onChange={handleChange ? handleChange : undefined}
        disabled={disabled}
      />
    </div>
  );
};

export default Input;

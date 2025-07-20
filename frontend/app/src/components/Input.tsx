interface InputType {
  value: string;
  type: string;
  id: string;
  name: string;
  label: string;
  disabled?: boolean;
  placeholder?: string;
  handleChange?: (e: any) => void;
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
}: InputType) => {
  return (
    <div className="bg-gray-200 py-2 px-4 focus-within:bg-gray-300 w-full rounded-md">
      <label htmlFor={id}>{label}</label>
      <input
        value={value}
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

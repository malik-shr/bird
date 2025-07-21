import { Icon } from '@iconify/react/dist/iconify.js';
import { useRecord } from '../../providers/RecordContext';
import type { IField } from '../../utils/utils';

interface RecordItemType {
  columns: IField[];
  record: any;
  handleCheck: (e: any) => void;
  checkedItems: string[];
  collectionName: string;
}

const RecordItem = ({
  columns,
  record,
  handleCheck,
  checkedItems,
  collectionName,
}: RecordItemType) => {
  const { deleteRecord, toggleEdit } = useRecord();
  return (
    <tr>
      <th>
        <label>
          <input
            id={record!.id}
            type="checkbox"
            className="checkbox"
            onChange={handleCheck}
            name={record!.id}
            checked={checkedItems.includes(record!.id)}
          />
        </label>
      </th>
      {columns.map((column: any) => (
        <td key={column.name} className="px-4 py-3 text-sm">
          {record[column.name] !== null && record[column.name] !== undefined ? (
            String(record[column.name])
          ) : (
            <span className="text-gray-400">null</span>
          )}
        </td>
      ))}
      <td className="text-sm">
        <button onClick={() => toggleEdit(record.id, collectionName)}>
          <div className="rounded-full hover:bg-gray-300 p-2">
            <Icon icon="ri:arrow-right-line" className="text-lg" />
          </div>
        </button>
      </td>
    </tr>
  );
};

export default RecordItem;

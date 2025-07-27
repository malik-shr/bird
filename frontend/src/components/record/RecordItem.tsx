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
  const { toggleEdit } = useRecord();
  return (
    <tr
      className="hover:bg-gray-200 cursor-pointer"
      onClick={() => toggleEdit(record.id, collectionName)}
    >
      <th>
        <label>
          <input
            id={record!.id}
            type="checkbox"
            className="checkbox"
            onChange={handleCheck}
            onClick={(e) => e.stopPropagation()}
            name={record!.id}
            checked={checkedItems.includes(record!.id)}
          />
        </label>
      </th>
      {columns
        .filter((col) => !col.is_hidden)
        .map((column: IField) => (
          <td key={column.name} className="px-4 py-3 text-sm">
            {record[column.name] !== null &&
            record[column.name] !== undefined ? (
              String(record[column.name])
            ) : (
              <span className="text-gray-400">null</span>
            )}
          </td>
        ))}
      <td className="text-sm">
        <Icon icon="ri:arrow-right-line" className="text-lg" />
      </td>
    </tr>
  );
};

export default RecordItem;

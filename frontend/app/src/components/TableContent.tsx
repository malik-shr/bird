import Collection from './Colection';

interface TableContentProps {
  activeCollection: string;
}

const TableContent = ({ activeCollection }: TableContentProps) => {
  const renderContent = () => {
    if (!activeCollection) return <p>Please select a collection</p>;

    return <Collection collectionName={activeCollection} />;
  };

  return (
    <div className="w-full p-5 border-1 border-gray-300 rounded-2xl shadow-sm">
      {renderContent()}
    </div>
  );
};

export default TableContent;

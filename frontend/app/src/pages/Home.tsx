import { useEffect, useState } from 'react';
import RecordTable from '../components/record/RecordTable';
import { useCollection } from '../providers/CollectionContext';
import TableBar from '../components/collection/TableBar';

const Home = () => {
  const [loading, setLoading] = useState<boolean>(true);

  const { refreshCollections } = useCollection();

  useEffect(() => {
    refreshCollections();
    setLoading(false);
  }, []);

  {
    if (loading) return <div>Loading...</div>;
  }

  return (
    <div className="w-full">
      <div className="flex gap-5">
        <TableBar />
        <RecordTable />
      </div>
    </div>
  );
};

export default Home;

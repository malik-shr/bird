import { useEffect, useState } from 'react';
import TableBar from '../components/TableBar';
import Collection from '../components/Collection';
import { bird } from '../lib/lib';

const Home = () => {
  const [activeCollection, setActiveCollection] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [collections, setCollections] = useState<any[]>([]);

  const refreshCollections = async () => {
    const data = await bird.collections.list();
    setCollections(data);
    if (activeCollection === '') {
      setActiveCollection(data[0]);
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCollections();
  }, []);

  {
    if (loading) return <div>Loading...</div>;
  }

  return (
    <div className="w-full">
      <div className="flex gap-5">
        <TableBar
          activeCollection={activeCollection}
          setActiveCollection={setActiveCollection}
          collections={collections}
          refreshCollections={refreshCollections}
        />
        <Collection collectionName={activeCollection} />
      </div>
    </div>
  );
};

export default Home;

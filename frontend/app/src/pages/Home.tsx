import { useState } from 'react';
import Header from '../components/Header';
import TableBar from '../components/TableBar';
import TableContent from '../components/TableContent';

const Home = () => {
  const [activeCollection, setActiveCollection] = useState<string>('');
  return (
    <div className="w-full">
      <div className="flex gap-5">
        <TableBar
          activeCollection={activeCollection}
          setActiveCollection={setActiveCollection}
        />
        <TableContent activeCollection={activeCollection} />
      </div>
    </div>
  );
};

export default Home;

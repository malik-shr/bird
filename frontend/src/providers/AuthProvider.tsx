import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { bird } from '../lib/lib';
import { useNavigate } from 'react-router';
import { type User } from '../types/types';

export type CollectionContextType = {
  currentUser: User | null;
};

const AuthContext = createContext<CollectionContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const verify = async () => {
      try {
        const result = await bird.auth.verify(); // should return user object
        setCurrentUser(result);
        setLoading(false);
        navigate('/');
      } catch (e) {
        setCurrentUser(null);
        setLoading(false); // fixed!
        navigate('/login');
      }
    };
    verify();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('Must use within AuthProvider');
  return ctx;
};

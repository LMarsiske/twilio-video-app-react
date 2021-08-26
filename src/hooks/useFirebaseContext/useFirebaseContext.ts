import { useContext } from 'react';
import { FirebaseContext } from '../../components/FirebaseProvider';

export default function useFirebaseContext() {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useVideoContext must be used within a VideoProvider');
  }
  return context;
}

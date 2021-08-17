import { useContext } from 'react';
import { OverlayContext } from '../../components/OverlayProvider';

export default function useOverlayContext() {
  const context = useContext(OverlayContext);
  if (!context) {
    throw new Error('useOverlayContext must be used within an OverlayProvider');
  }
  return context;
}

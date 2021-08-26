import React, { createContext, ReactNode } from 'react';
import useFirebaseAuth from '../../state/useFirebaseAuth/useFirebaseAuth';

/*
 *  The hooks used by the VideoProvider component are different than the hooks found in the 'hooks/' directory. The hooks
 *  in the 'hooks/' directory can be used anywhere in a video application, and they can be used any number of times.
 *  the hooks in the 'VideoProvider/' directory are intended to be used by the VideoProvider component only. Using these hooks
 *  elsewhere in the application may cause problems as these hooks should not be used more than once in an application.
 */

export interface IFirebaseContext {
  isAdmin: boolean;
}

export const FirebaseContext = createContext<IFirebaseContext>(null!);

interface FirebaseProviderProps {
  children: ReactNode;
}

export function FirebaseProvider({ children }: FirebaseProviderProps) {
  const { isAdmin } = useFirebaseAuth();
  return (
    <FirebaseContext.Provider
      value={{
        isAdmin,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
}

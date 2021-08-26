import { useCallback, useEffect, useState } from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firebase-firestore';
import 'firebase/storage';

const firebaseConfig = {
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
};

export default function useFirebaseAuth() {
  const [user, setUser] = useState<firebase.User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const getToken = useCallback(
    async (user_identity: string, room_name: string) => {
      const headers = new window.Headers();

      const idToken = await user!.getIdToken();
      headers.set('Authorization', idToken);
      headers.set('content-type', 'application/json');

      const endpoint = process.env.REACT_APP_TOKEN_ENDPOINT || '/token';

      return fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          user_identity,
          room_name,
          create_conversation: process.env.REACT_APP_DISABLE_TWILIO_CONVERSATIONS !== 'true',
        }),
      }).then(res => {
        console.log('RES: ', res);
        return res.json();
      });
    },
    [user]
  );

  const updateRecordingRules = useCallback(
    async (room_sid, rules) => {
      const headers = new window.Headers();

      const idToken = await user!.getIdToken();
      headers.set('Authorization', idToken);
      headers.set('content-type', 'application/json');

      return fetch('/recordingrules', {
        method: 'POST',
        headers,
        body: JSON.stringify({ room_sid, rules }),
      }).then(async res => {
        const jsonResponse = await res.json();

        if (!res.ok) {
          const recordingError = new Error(
            jsonResponse.error?.message || 'There was an error updating recording rules'
          );
          recordingError.code = jsonResponse.error?.code;
          return Promise.reject(recordingError);
        }

        return jsonResponse;
      });
    },
    [user]
  );

  useEffect(() => {
    firebase.initializeApp(firebaseConfig);
    firebase.auth().onAuthStateChanged(newUser => {
      setUser(newUser);
      setIsAuthReady(true);
    });
  }, []);

  const signInWithGoogle = useCallback(() => {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/plus.login');

    return firebase
      .auth()
      .signInWithPopup(provider)
      .then(newUser => {
        setUser(newUser.user);
      });
  }, []);

  const firebaseSignIn = useCallback((email: string, password: string) => {
    return firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(newUser => {
        setUser(newUser.user);
        getUserRole(newUser?.user?.uid || '');
        console.log('User authenticated.');
      });
  }, []);

  const signOut = useCallback(() => {
    return firebase
      .auth()
      .signOut()
      .then(() => {
        setUser(null);
      });
  }, []);

  // Firestore methods
  const verifySessionId = useCallback(async (sessionId: string) => {
    const docRef = firebase
      .firestore()
      .collection('videoSessions')
      .doc(sessionId);
    const doc = await docRef.get().catch(e => {
      console.log(e);
      return Promise.reject(false);
    });
    if (!doc.exists) {
      return false;
    } else {
      console.log('Document data:', doc.data());
      return true;
    }
  }, []);

  const getUserRole = useCallback(async (userId: string) => {
    if (userId) {
      setIsAdmin(false);
      return;
    }
    const docRef = firebase
      .firestore()
      .collection('users')
      .doc(userId);
    const doc = await docRef.get().catch(e => {
      console.log(e);
      return Promise.reject(false);
    });
    if (!doc.exists) {
      setIsAdmin(false);
    } else {
      let roles = doc?.data()?.roles || [];
      if (roles.includes('ADMIN')) setIsAdmin(true);
      else setIsAdmin(false);
    }
  }, []);

  // const saveVirtualGridOverlay = useCallback(async (userId: string) => {
  //   const docRef = firebase
  //     .storage()
  //     .collection('users')
  //     .doc(userId);
  //   const doc = await docRef.get().catch(e => {
  //     console.log(e);
  //     return Promise.reject(false);
  //   });
  //   if (!doc.exists) {
  //     return [];
  //   } else {
  //     let roles = doc?.data()?.roles || [];
  //     return roles;
  //   }
  // }, []);

  return { user, firebaseSignIn, signOut, isAuthReady, getToken, updateRecordingRules, verifySessionId, isAdmin };
}

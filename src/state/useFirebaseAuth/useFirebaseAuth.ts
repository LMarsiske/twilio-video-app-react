import { useCallback, useEffect, useState } from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firebase-firestore';
import 'firebase/storage';
import Konva from 'konva';
import { isNull } from 'util';

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
  const [sessionData, setSessionData] = useState<firebase.firestore.DocumentData | null>(null);

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
      console.log(newUser);
      setUser(newUser);
      getUserRole(newUser?.uid || '');
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
        console.log(newUser);
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
      setSessionData(doc?.data() || null);
      return true;
    }
  }, []);

  const getUserRole = async (userId: string) => {
    console.log('USER ID: ', userId);
    if (userId === '') {
      console.log('userId is empty string');
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
  };

  const saveVirtualGridOverlay = async (uid: string, fileName: string, group: Konva.Group) => {
    console.log('Saving virtual overlay: ', sessionData);
    if (!sessionData) {
      return;
    }

    let fileRef = firebase.storage().ref(`profileDocs/${sessionData!.traineeId}/teletrainingDataGrids/${fileName}.png`);
    let url = group.toDataURL({ pixelRatio: 2 });
    let blob = convertURLToBlob(url);
    if (blob) {
      fileRef
        .put(blob)
        .then(() => console.log('uploaded a blob'))
        .catch(e => console.log(e));
    }
  };

  const convertURLToBlob = (url: string | undefined) => {
    if (url) {
      let byteString = atob(url.split(',')[1]);

      // separate out the mime component
      let mimeString = url
        .split(',')[0]
        .split(':')[1]
        .split(';')[0];

      // write the bytes of the string to an ArrayBuffer
      let ab = new ArrayBuffer(byteString.length);

      // create a view into the buffer
      let ia = new Uint8Array(ab);

      // set the bytes of the buffer to the correct values
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }

      // write the ArrayBuffer to a blob, and you're done
      let blob = new Blob([ab], { type: mimeString });
      return blob;
    }
  };

  return {
    user,
    firebaseSignIn,
    signOut,
    isAuthReady,
    getToken,
    updateRecordingRules,
    verifySessionId,
    isAdmin,
    saveVirtualGridOverlay,
  };
}

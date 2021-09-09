import { useCallback, useEffect, useState } from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firebase-firestore';
import 'firebase/storage';
import Konva from 'konva';
import { isNull } from 'util';
import { AlternateEmail } from '@material-ui/icons';

const firebaseConfig =
  process.env.REACT_APP_STAGE == 'prod'
    ? {
        apiKey: process.env.REACT_APP_PROD_API_KEY,
        authDomain: process.env.REACT_APP_PROD_AUTH_DOMAIN,
        databaseURL: process.env.REACT_APP_PROD_DATABASE_URL,
        projectId: process.env.REACT_APP_PROD_PROJECT_ID,
        storageBucket: process.env.REACT_APP_PROD_STORAGE_BUCKET,
        messagingSenderId: process.env.REACT_APP_PROD_MESSAGING_SENDER_ID,
        appId: process.env.REACT_APP_PROD_APP_ID,
      }
    : {
        apiKey: process.env.REACT_APP_DEV_API_KEY,
        authDomain: process.env.REACT_APP_DEV_AUTH_DOMAIN,
        databaseURL: process.env.REACT_APP_DEV_DATABASE_URL,
        projectId: process.env.REACT_APP_DEV_PROJECT_ID,
        storageBucket: process.env.REACT_APP_DEV_STORAGE_BUCKET,
        messagingSenderId: process.env.REACT_APP_DEV_MESSAGING_SENDER_ID,
        appId: process.env.REACT_APP_DEV_APP_ID,
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

      let correctEndpoint =
        process.env.REACT_APP_STAGE === 'prod'
          ? process.env.REACT_APP_PROD_TOKEN_ENDPOINT
          : process.env.REACT_APP_DEV_TOKEN_ENDPOINT;

      const endpoint = correctEndpoint || '/token';

      return fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          user_identity,
          room_name,
          create_conversation: process.env.REACT_APP_DISABLE_TWILIO_CONVERSATIONS !== 'true',
        }),
      }).then(res => {
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
      console.log('NEWUSER: ', newUser);
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
        setUser(newUser.user);
        getUserRole(newUser?.user?.uid || '');
        console.log('User authenticated: ', newUser.user);
      })
      .catch(e => {
        alert(e.message);
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
  const verifySessionId = useCallback(
    async (sessionId: string) => {
      if (user?.uid) {
        const docRef = firebase.firestore().collection('videoSessions');

        const snapshot = await docRef.where('sessionId', '==', sessionId).get();
        if (snapshot.empty) {
          return false;
        } else {
          if (
            snapshot.size == 1 &&
            !snapshot.docs[0]?.data().disabled &&
            (snapshot.docs[0]?.data().hostId == user?.uid || snapshot.docs[0]?.data().traineeId == user?.uid)
          ) {
            setSessionData(snapshot.docs[0]?.data() || null);
            return true;
          } else if (snapshot.size > 1) {
            alert('Mutliple sessions found. Contact MammaCare Trainer.');
            return false;
          } else alert('Unable to join this session. Contact MammaCare Trainer.');
          return false;
        }
      } else {
        alert('User not yet authenticated.');
        return false;
      }
    },
    [user]
  );

  const getUserRole = async (userId: string) => {
    if (userId === '') {
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

  const saveVirtualGridOverlay = async (fileName: string, url: string) => {
    console.log('Saving virtual overlay: ', sessionData);
    let result: Promise<{ status: string; message: string }>;
    result = new Promise((resolve, reject) => {
      if (!sessionData) {
        reject({ status: 'failed', message: 'Invalid session data' });
      }

      let fileRef = firebase
        .storage()
        .ref(
          `profileDocs/${sessionData!.traineeId}/teletrainingDataGrids/${
            sessionData!.traineeId
          }_${fileName}_${Date.now()}.png`
        );

      const metadata = {
        contentType: 'image/png',
        createdBy: user?.uid || 'unavailable',
      };

      let blob = convertURLToBlob(url);
      if (blob) {
        fileRef
          .put(blob, metadata)
          .then(() => {
            console.log('uploaded a blob');
            reject({ status: 'failed', message: 'Testing rejection handling.' });
            resolve({ status: 'success', message: 'File upload complete.' });
          })
          .catch(e => {
            console.log(e);
            reject({ status: 'failed', message: e.message });
          });
      }
    });
    return result;
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

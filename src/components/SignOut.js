import { signOut } from 'firebase/auth';
import React from 'react'
import { auth } from '../config/FirebaseConfig';

export default function SignOut() {

    const handleSignOut = async () => {
        try {
          await signOut(auth);
          console.log('User signed out');
        } catch (error) {
          console.error('Error signing out:', error.message);
        }
      };
  return (
    <>
        {auth.currentUser && ( <button className='sign-out' onClick={handleSignOut}>SignOut</button> )}
    </>
  )
}

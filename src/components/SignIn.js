import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import React from 'react'
import { auth } from '../config/FirebaseConfig';

export default function SignIn() {

    const SignInWithGoogle = () => {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider);
    };
  return (
    <div className="sign-in-container">
        <h1 className="sign-in-title">BaatChit - A Private Chat App</h1>
        <p className="sign-in-text">Sign in to start chatting</p>
        <button className="sign-in-button" onClick={SignInWithGoogle}>Sign In</button>
    </div>
  )
}

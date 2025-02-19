import React from 'react'
import { auth } from '../config/FirebaseConfig';

export default function ChatMessage(props) {
    const { text, uid } = props.message;

    const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';
    return (
        <div className={`message ${messageClass}`}>
            <p>{text}</p>
        </div>
    );
}

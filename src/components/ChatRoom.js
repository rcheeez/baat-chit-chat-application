import { arrayUnion, collection, deleteDoc, doc, getDocs, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useState, useRef } from 'react';
import { auth, firestore } from '../config/FirebaseConfig';
import SignOut from './SignOut';
import ChatMessage from './ChatMessage';
import { useParams } from 'react-router';
import { Link, useNavigate } from 'react-router-dom'
import PendingApproval from './PendingApproval';

export default function ChatRoom() {
  const { roomId } = useParams();
  const [roomName, setRoomName] = useState('');
  const [messages, setMessages] = useState([]);
  const [formValue, setFormValue] = useState('');
  const [isApproved, setIsApproved] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isRoomOwner, setIsRoomOwner] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const navigate = useNavigate();

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const deleteHandlePopup = () => {
    setIsClicked(true);
  }

  const deleteRoomHandle = async (roomId) => {
    try {
      const roomRef = collection(firestore, "chatRooms");
      const q = query(roomRef, where("roomId", '==', roomId));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const docRef = snapshot.docs[0].ref;
        await deleteDoc(docRef);
        navigate('/all-chats', { state: { message: `Room Deleted Successfully!` } });
      } else {
        console.log(`Room ${roomName} not found!`);
      }
    } catch (error) {
      console.error(error);
    }

  }

  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  const showNotification = (title, body) => {
    if (Notification.permission === "granted") {
      new Notification(title, { body });
    }
  };

  useEffect(() => {
    const chatRoomsRef = collection(firestore, 'chatRooms');
    const q = query(chatRoomsRef, where('roomId', '==', roomId));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (!snapshot.empty) {
        const roomData = snapshot.docs[0].data();
        setRoomName(roomData.name);
        setMessages(roomData.messages);

        const { uid, displayName } = auth.currentUser;
        const isOwner = roomData.uids[0].uid === uid;
        setIsRoomOwner(isOwner);

        if (roomData.uids.some(user => user.uid === uid)) {
          setIsApproved(true);
          setIsPending(false);
        } else if (roomData.pending.some(user => user.uid === uid)) {
          setIsPending(true);
          setIsApproved(false);
        } else {
          await updateDoc(snapshot.docs[0].ref, {
            pending: arrayUnion({ uid, displayName })
          });
          setIsPending(true);
          showNotification('New User Request', `${displayName} has requested to join the room ${roomData.name}`);
        }
      } else {
        console.log("Room does not exists!");
      }
    });

    return () => unsubscribe();
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!isApproved) {
      alert("You are not approved to send messages in this chat room!");
      return;
    }

    try {
      const { uid, displayName } = auth.currentUser;
      const newMessage = {
        text: formValue,
        uid,
        displayName,
        timestamp: new Date()
      };

      if (formValue.length === 0) {
        return;
      }

      const chatRoomsRef = collection(firestore, 'chatRooms');
      const q = query(chatRoomsRef, where('roomId', '==', roomId));
      const roomDoc = await getDocs(q);

      if (!roomDoc.empty) {
        const roomData = roomDoc.docs[0];
        const roomRef = doc(firestore, 'chatRooms', roomData.id);

        await updateDoc(roomRef, {
          messages: arrayUnion(newMessage)
        });

        showNotification('New Message', `${displayName} in ${roomName}: ${formValue}`);
        setFormValue('');
      }
    } catch (error) {
      console.error('Error sending message: ', error);
    }
  };

  return (
    <div className="chat-room-container">
      <div className='chat-room-upper'>
        <p>
        <Link to={'/all-chats'}>&#10094;</Link> &nbsp; &nbsp; &nbsp;
          {roomName}</p>
        <button onClick={deleteHandlePopup} className='chat-room-delete'>Delete Room</button>
        <SignOut />
      </div>
      {isRoomOwner && <PendingApproval roomId={roomId} />}
      {isClicked && (
        <div className='delete-popup'>
          <p>Are you sure you want to delete this room?</p>
          <button className='yes-btn' onClick={() => deleteRoomHandle(roomId)}>Yes</button>
          <button className='no-btn' onClick={() => setIsClicked(false)}>No</button>
        </div>
      ) }
      {isPending ? (
        <div className='pending-approval'>
          <p>Waiting for approval...</p>
        </div>
      ) : (
        <div className="message-container">
          {messages && messages.map((msg, index) => <ChatMessage key={index} message={msg} />)}
          <div ref={messagesEndRef} />
        </div>
      )}
      {isApproved && (
        <form className="message-form" onSubmit={sendMessage}>
          <input
            type="text"
            value={formValue}
            onChange={(e) => setFormValue(e.target.value)}
            placeholder="Message"
            className="message-input"
          />
          <button type="submit" disabled={formValue.length === 0} className="send-button">&#10148;</button>
        </form>
      )}
    </div>
  );
}

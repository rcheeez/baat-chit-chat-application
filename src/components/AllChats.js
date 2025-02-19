import React, { useEffect, useState } from 'react';
import { auth, firestore } from '../config/FirebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { Link, useLocation } from 'react-router-dom';
import { getHostName } from '../utils/getHostname';

export default function AllChats() {
  const [chatRooms, setChatRooms] = useState([]);
  const [visible, setVisible] = useState(false);

  const location = useLocation();
  const { message } = location.state || [];
  const hostname = getHostName();

  useEffect(() => {
    const allChatRooms = async () => {
      const { uid } = auth.currentUser;
      const roomRef = collection(firestore, 'chatRooms');
      const snapshot = await getDocs(roomRef);

      const rooms = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((room) => room.uids.some((user) => user.uid === uid));

      setChatRooms(rooms);
    };

    allChatRooms();

    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const CreateRoomRedirectHandle = () => {
    window.location.href = '/';
  };

  return (
    <div className='all-chat-main'>
      <div className='all-chat-header'>
        <h2>Chat Rooms</h2>
        <button onClick={CreateRoomRedirectHandle} className='new-chat-btn'>
          &#10011;
        </button>
      </div>
      {visible && <div className='alert alert-danger'>{message}</div>}
      <div className='all-chat-body'>
        {chatRooms.length > 0 ? (
          chatRooms.map((room) => (
            <div key={room.id} className='chat-room-item'>
              <img
                src={`${hostname}/images/avatar/user-1.svg`}
                alt='avatar'
                className='avatar'
              />
              <Link to={`/chat/${room.roomId}`}>{room.name ? room.name : 'Unnamed Room'}</Link>
            </div>
          ))
        ) : (
          <p style={{ color: '#252525' }}>No Chats found!</p>
        )}
      </div>
    </div>
  );
}

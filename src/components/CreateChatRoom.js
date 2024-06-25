import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { auth, firestore } from '../config/FirebaseConfig';
import { addDoc, collection } from 'firebase/firestore';
import SignOut from './SignOut';
import { getHostName } from '../utils/getHostname';

const generateRoomId = () => {
    const randomLetter = () =>  String.fromCharCode(Math.floor(Math.random() * 26) + 97);
    const segments = Array.from({ length: 3 }, () => randomLetter() + randomLetter());
    return segments.join('-');
}
export default function CreateChatRoom() {

    const [roomName, setRoomName] = useState('');
    const [roomLink, setRoomLink] = useState('');
   // const navigate = useNavigate();

   const hostname = getHostName();

    const handleCreateRoom = async (e) => {
        e.preventDefault();

        const { uid, displayName } = auth.currentUser;
        try {
            const roomId = generateRoomId();
            const roomRef = await collection(firestore, 'chatRooms');
            await addDoc(roomRef,{
                roomId: roomId,
                name: roomName,
                messages: [],
                uids: [{ uid, displayName }],
                pending: []
            })
             
            const roomLink = `${hostname}/chat/${roomId}`;
            
            setRoomLink(roomLink);
           // navigate(`${roomLink}`);
        } catch (error) {
            console.error('Error creating chat room:', error);
        }
    }; 

    const handleShareLink = () => {
        navigator.clipboard.writeText(roomLink);
        alert('Link copied to clipboard!');
    }
  return (
    <div className='chat-room-body'>
        <div className='chat-room-header'>
            <h2>BaatChit</h2>
            <SignOut/>
        </div>
        <div className='create-chat-room'>
            <h1>Create your own Chat Room!</h1>
            <form className='chat-room-form' onSubmit={handleCreateRoom}>
                <input type='text' className='room-name' value={roomName} placeholder='Enter Room Name' onChange={(e) => setRoomName(e.target.value)} />
                <button type='submit' className='room-btn'>Create Room</button>
            </form>
            <Link to={'/all-chats'} style={{color: 'black', textAlign:'center', paddingTop: '3%'}}>Your Chat Rooms</Link>
        </div>
        {
            roomLink && (<div className='room-link-section'>
                <h2>Room Created! Share the link</h2>
                <form className='room-link-form'>
                    <input type='text' value={roomLink} readOnly className='room-link-input'/>
                    <button onClick={handleShareLink} className='copy-link-btn'>Copy Link</button>
                </form>
                <p><Link to={roomLink} className='room-link'>Join Room</Link></p>
            </div>)
        }
    </div>
  )
}

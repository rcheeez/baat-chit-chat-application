import { arrayRemove, arrayUnion, collection, doc, getDocs, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { auth, firestore } from '../config/FirebaseConfig';

export default function PendingApproval({ roomId }) {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const chatRoomsRef = collection(firestore, 'chatRooms');
    const q = query(chatRoomsRef, where('roomId', '==', roomId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const { uid } = auth.currentUser;
        const roomData = snapshot.docs[0].data();
        setIsOwner(roomData.uids[0].uid === uid);
        setPendingUsers(roomData.pending);
      }
    });

    return () => unsubscribe();
  }, [roomId]);

  const approveUser = async (user) => {
    const chatRoomsRef = collection(firestore, 'chatRooms');
    const q = query(chatRoomsRef, where('roomId', '==', roomId));
    const roomDoc = await getDocs(q);

    if (!roomDoc.empty) {
      const roomData = roomDoc.docs[0];
      const roomRef = doc(firestore, 'chatRooms', roomData.id);

      await updateDoc(roomRef, {
        uids: arrayUnion(user),
        pending: arrayRemove(user)
      });
    }
  };

  return (
    <div className="pending-approval-container">
      {isOwner && (
        <div>
          {pendingUsers.map(user => (
            <div key={user.uid} className='pending-user'>
              <p>{user.displayName} wants to join the room</p>
              <button className='pending-btn' onClick={() => approveUser(user)}>Approve</button>
            </div>
          ))}
        </div>
      )}
      {!isOwner && (
        <div>
          <p>Waiting for approval...</p>
        </div>
      )}
    </div>
  );
}

import './App.css';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './config/FirebaseConfig';
import ChatRoom from './components/ChatRoom';
import SignIn from './components/SignIn';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import CreateChatRoom from './components/CreateChatRoom';
import AllChats from './components/AllChats';

function App() {

  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <>
      <BrowserRouter>
      <Routes>
        <Route path='/' exact Component={user ? CreateChatRoom : SignIn}/>
        <Route path='/chat/:roomId' Component={user ? ChatRoom: SignIn} />
        <Route path='/all-chats' Component={user ? AllChats : SignIn} />
      </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

import Home from './Pages/Home/Home';
import ChatSetting from './Pages/ChatSetting/ChatSetting';
import UserNoteDetail from './Pages/UserNoteDetail/UserNoteDetail';
import UserNoteWrite from './Pages/UserNoteWrite';
import LikeUserNote from './Pages/LikeUserNote';
import ChattingUserNote from './Pages/ChattingUserNote';
import ChatRoom from './Pages/ChatRoom';
import UserNoteSelectPriorityBeforeMerging from './Pages/UserNoteSelectPriorityBeforeMerging';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Home" element={<Home />} />
          <Route path="/ChatSetting" element={<ChatSetting />} />
          <Route path="/UserNoteDetail" element={<UserNoteDetail />} />
          <Route path="/UserNoteWrite" element={<UserNoteWrite />} />
          <Route path="/LikeUserNote" element={<LikeUserNote />} />
          <Route path="/ChattingUserNote" element={<ChattingUserNote />} />

          <Route path="/UserNoteSelectPriorityBeforeMerging" element={<UserNoteSelectPriorityBeforeMerging />} />
          <Route path="/ChatRoom" element={<ChatRoom />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
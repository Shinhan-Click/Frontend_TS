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
import UserNoteMergeResult from './Pages/UserNoteMergeResult';
import UserNoteMergeLoading from './Pages/UserNoteMergeLoading';

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

          <Route path="/ChatRoom" element={<ChatRoom />} />

          <Route path="/UserNoteSelectPriorityBeforeMerging" element={<UserNoteSelectPriorityBeforeMerging />} />
          <Route path="/UserNoteMergeResult" element={<UserNoteMergeResult />} />
          <Route path="/UserNoteMergeLoading" element={<UserNoteMergeLoading />} /> {/*병합하기 페이지에서 선택된게 있을 경우 해당 페이지 이동하게 해야 됨.*/}
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
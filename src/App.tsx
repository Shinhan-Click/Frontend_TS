import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';   // ✅ 추가

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
import HomeToUserNote from './Pages/HomeToUserNote';
import FutureNoteWrite from './Pages/FutureNoteWrite';
import FutureNoteLoading from './Pages/FutureNoteLoading';



const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Home" element={<Home />} />
          <Route path="/ChatSetting" element={<ChatSetting />} />
          <Route path="/UserNoteDetail/:userNoteId" element={<UserNoteDetail />} />
          <Route path="/UserNoteWrite" element={<UserNoteWrite />} />
          <Route path="/LikeUserNote" element={<LikeUserNote />} />
          <Route path="/ChattingUserNote" element={<ChattingUserNote />} />
          <Route path="/ChatRoom/:chatId" element={<ChatRoom />} />
          <Route path="/UserNoteSelectPriorityBeforeMerging" element={<UserNoteSelectPriorityBeforeMerging />} />
          <Route path="/UserNoteMergeResult" element={<UserNoteMergeResult />} />
          <Route path="/UserNoteMergeLoading" element={<UserNoteMergeLoading />} />
          <Route path="/HomeToUserNote" element={<HomeToUserNote />} />
          <Route path="/FutureNoteWrite" element={<FutureNoteWrite />} />
          <Route path="/FutureNoteLoading" element={<FutureNoteLoading />} />

        </Routes>

        {/*토스트 컨테이너 */}
        <Toaster position="bottom-center" reverseOrder={false} />
      </Router>
    </AuthProvider>
  );
};

export default App;

import { Navigate, Route, Routes } from 'react-router-dom';
import TabsLayout from './layouts/TabsLayout';
import AuthLayout from './layouts/AuthLayout';
import Home from './pages/Home';
import Calendar from './pages/Calendar';
import Analysis from './pages/Analysis';
import MyPage from './pages/MyPage';
import Notification from './pages/Notification';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import RegisterProfile from './pages/auth/RegisterProfile';
import FindPassword from './pages/auth/FindPassword';

// TODO: replace with real auth state
const isLoggedIn = true;

export default function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-profile" element={<RegisterProfile />} />
        <Route path="/find-password" element={<FindPassword />} />
      </Route>

      <Route element={<TabsLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/mypage" element={<MyPage />} />
      </Route>

      <Route path="/notification" element={<Notification />} />

      <Route
        path="*"
        element={<Navigate to={isLoggedIn ? '/' : '/login'} replace />}
      />
    </Routes>
  );
}

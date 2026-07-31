import { Navigate, Route, Routes } from 'react-router-dom';
import TabsLayout from './layouts/TabsLayout';
import AuthLayout from './layouts/AuthLayout';
import Home from './pages/Home';
import Calendar from './pages/Calendar';
import Analysis from './pages/Analysis';
import CategoryList from './pages/analysis/CategoryList';
import CategoryDetail from './pages/analysis/CategoryDetail';
import BudgetSetting from './pages/budget/BudgetSetting';
import BudgetWeekly from './pages/budget/BudgetWeekly';
import Notification from './pages/Notification';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import RegisterProfile from './pages/auth/RegisterProfile';
import FindPassword from './pages/auth/FindPassword';
import MyPage from './pages/mypage/MyPage';
import EditProfile from './pages/mypage/EditProfile';
import EditNickname from './pages/mypage/EditNickname';
import EditIncome from './pages/mypage/EditIncome';
import EditResidence from './pages/mypage/EditResidence';
import EditPassword from './pages/mypage/EditPassword';
import Settings from './pages/mypage/Settings';
import DataReset from './pages/mypage/DataReset';
import TodayExpenses from './pages/TodayExpenses';
import AddExpense from './pages/AddExpense';
import AddIncome from './pages/AddIncome';
import DayTransactions from './pages/DayTransactions';

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
        <Route path="/expenses/today" element={<TodayExpenses />} />
        <Route path="/expenses/add" element={<AddExpense />} />
        <Route path="/income/add" element={<AddIncome />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/day/:date" element={<DayTransactions />} />
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/analysis/categories" element={<CategoryList />} />
        <Route path="/analysis/categories/:category" element={<CategoryDetail />} />
        <Route path="/budget" element={<BudgetSetting />} />
        <Route path="/budget/weekly" element={<BudgetWeekly />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/mypage/settings" element={<Settings />} />
        <Route path="/mypage/settings/reset" element={<DataReset />} />
        <Route path="/mypage/edit" element={<EditProfile />} />
        <Route path="/mypage/edit/nickname" element={<EditNickname />} />
        <Route path="/mypage/edit/income" element={<EditIncome />} />
        <Route path="/mypage/edit/residence" element={<EditResidence />} />
        <Route path="/mypage/edit/password" element={<EditPassword />} />
        <Route path="/notification" element={<Notification />} />
      </Route>

      

      <Route path="*" element={<Navigate to={isLoggedIn ? '/' : '/login'} replace />} />
    </Routes>
  );
}
import { NavLink, Outlet } from 'react-router-dom';
import homeIcon from '../../assets/images/home_icon.svg';
import homeColor from '../../assets/images/home_color.svg';
import calendarIcon from '../../assets/images/calendar_icon.svg';
import calendarColor from '../../assets/images/calendar_color.svg';
import chartIcon from '../../assets/images/chart_icon.svg';
import chartColor from '../../assets/images/chart_color.svg';
import mypageIcon from '../../assets/images/mypage_icon.svg';
import mypageColor from '../../assets/images/mypage_color.svg';
import './TabsLayout.css';

const TABS = [
  { to: '/', label: '가계부', end: true, icon: homeIcon, activeIcon: homeColor },
  { to: '/calendar', label: '캘린더', end: false, icon: calendarIcon, activeIcon: calendarColor },
  { to: '/analysis', label: '리포트', end: false, icon: chartIcon, activeIcon: chartColor },
  { to: '/mypage', label: '마이페이지', end: false, icon: mypageIcon, activeIcon: mypageColor },
];

export default function TabsLayout() {
  return (
    <div className="tabs-layout">
      <main className="tabs-layout__content">
        <Outlet />
      </main>
      <nav className="tabs-layout__nav">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) => `tabs-layout__tab${isActive ? ' is-active' : ''}`}
          >
            {({ isActive }) => (
              
                <img
                  src={isActive ? tab.activeIcon : tab.icon}
                  alt=""
                  className="tabs-layout__tab-icon"
                />
                
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

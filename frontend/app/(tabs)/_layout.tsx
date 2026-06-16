import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import HomeIcon from '@/assets/icons/home_icon.svg';
import HomeColorIcon from '@/assets/icons/home_color.svg';
import CalendarIcon from '@/assets/icons/calendar_icon.svg';
import CalendarColorIcon from '@/assets/icons/calendar_color.svg';
import ChartIcon from '@/assets/icons/chart_icon.svg';
import ChartColorIcon from '@/assets/icons/chart_color.svg';
import MypageIcon from '@/assets/icons/mypage_icon.svg';
import MypageColorIcon from '@/assets/icons/mypage_color.svg';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: false,
        tabBarIconStyle: { marginTop: 8 },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ focused }) =>
            focused ? <HomeColorIcon width={28} height={28} /> : <HomeIcon width={28} height={28} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: '캘린더',
          tabBarIcon: ({ focused }) =>
            focused ? <CalendarColorIcon width={28} height={28} /> : <CalendarIcon width={28} height={28} />,
        }}
      />
      <Tabs.Screen
        name="analysis"
        options={{
          title: '내 소비 분석',
          tabBarIcon: ({ focused }) =>
            focused ? <ChartColorIcon width={28} height={28} /> : <ChartIcon width={28} height={28} />,
        }}
      />
      <Tabs.Screen
        name="mypage"
        options={{
          title: '마이페이지',
          tabBarIcon: ({ focused }) =>
            focused ? <MypageColorIcon width={28} height={28} /> : <MypageIcon width={28} height={28} />,
        }}
      />
      <Tabs.Screen name="notification" options={{ href: null }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
      {/* calendar 하위 */}
      <Tabs.Screen name="calendar/[id]" options={{ href: null }} />
      {/* analysis 하위 */}
      <Tabs.Screen name="analysis/detail" options={{ href: null }} />
      <Tabs.Screen name="analysis/impulse" options={{ href: null }} />
      <Tabs.Screen name="analysis/categories" options={{ href: null }} />
      <Tabs.Screen name="analysis/category/[id]" options={{ href: null }} />
      {/* mypage 하위 */}
      <Tabs.Screen name="mypage/settings" options={{ href: null }} />
      <Tabs.Screen name="mypage/edit-profile" options={{ href: null }} />
      <Tabs.Screen name="mypage/edit-nickname" options={{ href: null }} />
      <Tabs.Screen name="mypage/edit-residence" options={{ href: null }} />
      <Tabs.Screen name="mypage/edit-income" options={{ href: null }} />
      <Tabs.Screen name="mypage/edit-password" options={{ href: null }} />
      <Tabs.Screen name="mypage/budget" options={{ href: null }} />
      <Tabs.Screen name="mypage/budget-weekly" options={{ href: null }} />
    </Tabs>
  );
}

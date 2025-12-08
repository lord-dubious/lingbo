import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, usePathname } from 'expo-router';
import { ArrowLeft, Home, BookOpen, Gamepad2, User } from 'lucide-react-native';
import { styled } from 'nativewind';

const StyledSafeAreaView = styled(SafeAreaView);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  backPath?: string; // In expo router this is just a path string
  isKidsMode?: boolean;
  hideBottomNav?: boolean;
}

const Layout = ({
  children, 
  title, 
  showBack = false, 
  backPath,
  isKidsMode = false,
  hideBottomNav = false 
}: LayoutProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleBack = () => {
    if (backPath) {
      router.push(backPath);
    } else {
      router.back();
    }
  };

  const navItems = [
    { icon: Home, label: 'Hub', path: '/hub' },
    { icon: BookOpen, label: 'Learn', path: '/adults' },
    { icon: Gamepad2, label: 'Kids', path: '/kids' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <StyledSafeAreaView className={`flex-1 ${isKidsMode ? 'bg-sky-200' : 'bg-gray-50'}`}>
      {/* Header */}
      {(title || showBack) && (
        <StyledView className={`px-4 py-3 flex-row items-center justify-between ${isKidsMode ? 'bg-sky-200' : 'bg-white border-b border-gray-100'}`}>
          <StyledView className="flex-row items-center">
             {showBack && (
               <StyledTouchableOpacity onPress={handleBack} className="mr-3 p-2 rounded-full bg-white/50">
                 <ArrowLeft size={24} color={isKidsMode ? '#0ea5e9' : '#374151'} />
               </StyledTouchableOpacity>
             )}
             {title && (
               <StyledText className={`font-bold text-xl ${isKidsMode ? 'text-sky-700 font-kids' : 'text-gray-800'}`}>
                 {title}
               </StyledText>
             )}
          </StyledView>
        </StyledView>
      )}

      {/* Content */}
      <StyledView className="flex-1">
         <ScrollView contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 16, paddingTop: 16 }}>
            {children}
         </ScrollView>
      </StyledView>

      {/* Bottom Navigation */}
      {!hideBottomNav && (
        <StyledView className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex-row justify-around py-3 pb-6">
           {navItems.map((item) => {
             const isActive = pathname.startsWith(item.path) && (item.path !== '/hub' || pathname === '/hub');
             return (
               <StyledTouchableOpacity
                  key={item.path}
                  onPress={() => router.push(item.path)}
                  className="items-center"
               >
                  <item.icon
                    size={24}
                    color={isActive ? '#FF6B00' : '#9CA3AF'}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <StyledText className={`text-xs mt-1 ${isActive ? 'text-primary font-bold' : 'text-gray-400'}`}>
                    {item.label}
                  </StyledText>
               </StyledTouchableOpacity>
             );
           })}
        </StyledView>
      )}
    </StyledSafeAreaView>
  );
};

export default Layout;

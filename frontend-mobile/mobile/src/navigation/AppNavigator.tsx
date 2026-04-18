import React, { useEffect, useRef, useCallback, createContext, useContext, useState } from 'react';
import { Animated, TouchableWithoutFeedback, View, StyleSheet, Dimensions } from 'react-native';
import { NavigationContainer, DefaultTheme, useFocusEffect } from '@react-navigation/native';
import { createBottomTabNavigator, BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme';

// Ekrany
import MapScreen from '../screens/MapScreen';
import ChatScreen from '../screens/ChatScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');

const TabDirectionContext = createContext<number>(1);

const DarkTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.accentCyan,
    background: Colors.bgPrimary,
    card: Colors.bgSecondary,
    text: Colors.textPrimary,
    border: Colors.borderSubtle,
    notification: Colors.accentRose,
  },
};

const AnimatedScreen = ({ children }: { children: React.ReactNode }) => {
  const direction = useContext(TabDirectionContext);
  
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;

  useFocusEffect(
    useCallback(() => {
      translateX.setValue(width * 0.35 * direction);
      opacity.setValue(0);
      scale.setValue(0.92);

      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          tension: 65,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          tension: 65,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        })
      ]).start();

      return () => {
        // Czyszczenie przy wyjściu
      };
    }, [direction, translateX, opacity, scale])
  );

  return (
    <Animated.View style={{ flex: 1, opacity, transform: [{ translateX }, { scale }] }}>
      {children}
    </Animated.View>
  );
};

const MapWrapper = (props: any) => <AnimatedScreen><MapScreen {...props} /></AnimatedScreen>;
const ChatWrapper = (props: any) => <AnimatedScreen><ChatScreen {...props} /></AnimatedScreen>;
const AnalyticsWrapper = (props: any) => <AnimatedScreen><AnalyticsScreen {...props} /></AnimatedScreen>;
const SettingsWrapper = (props: any) => <AnimatedScreen><SettingsScreen {...props} /></AnimatedScreen>;

const AnimatedTabButton = (props: BottomTabBarButtonProps) => {
  const { children, onPress, accessibilityState } = props;
  const focused = accessibilityState?.selected;
  const scaleValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleValue, {
      toValue: focused ? 1.15 : 1,
      friction: 5,
      tension: 70,
      useNativeDriver: true,
    }).start();
  }, [focused, scaleValue]);

  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <Animated.View style={[styles.tabButton, { transform: [{ scale: scaleValue }] }]}>
        {children}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

export default function AppNavigator() {
  const [direction, setDirection] = useState(1);
  const prevIndexRef = useRef(0);

  return (
    <TabDirectionContext.Provider value={direction}>
      <NavigationContainer theme={DarkTheme}>
        <Tab.Navigator
          screenListeners={{
            state: (e) => {
              const newIndex = e.data.state?.index;
              if (newIndex !== undefined) {
                if (newIndex > prevIndexRef.current) {
                  setDirection(1);
                } else if (newIndex < prevIndexRef.current) {
                  setDirection(-1);
                }
                prevIndexRef.current = newIndex;
              }
            }
          }}
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: {
              backgroundColor: Colors.bgSecondary,
              borderTopColor: Colors.borderSubtle,
              borderTopWidth: 1,
              height: 60,
              paddingBottom: 8,
              paddingTop: 4,
            },
            tabBarActiveTintColor: Colors.accentCyan,
            tabBarInactiveTintColor: Colors.textMuted,
            tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
            tabBarButton: (props) => <AnimatedTabButton {...props} />,
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: keyof typeof Ionicons.glyphMap = 'map-outline';
              if (route.name === 'Map') iconName = focused ? 'map' : 'map-outline';
              else if (route.name === 'Chat') iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              else if (route.name === 'Analytics') iconName = focused ? 'bar-chart' : 'bar-chart-outline';
              else if (route.name === 'Settings') iconName = focused ? 'settings' : 'settings-outline';
              
              return <Ionicons name={iconName} size={size} color={color} />;
            },
          })}
        >
          <Tab.Screen name="Map" component={MapWrapper} />
          <Tab.Screen name="Chat" component={ChatWrapper} />
          <Tab.Screen name="Analytics" component={AnalyticsWrapper} />
          <Tab.Screen name="Settings" component={SettingsWrapper} />
        </Tab.Navigator>
      </NavigationContainer>
    </TabDirectionContext.Provider>
  );
}

const styles = StyleSheet.create({
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
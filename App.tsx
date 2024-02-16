import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Asegúrate de tener @react-native-async-storage/async-storage instalado
import MainScreen from './screens/main';
import SplashScreen from './screens/splashScreem';
import Login from './screens/login';
import Register from './screens/register';
import Home from './screens/home';
import Profile from './screens/profile';
import Categories from './screens/Folder';
import Favoritos from './screens/favoritos';
import { NoteProvider } from './screens/notecontext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();


const BottomTabNavigator = () => (
  <Tab.Navigator
  screenOptions={({ route }) => ({
    tabBarIcon: ({ focused, color, size }) => {
      let iconName;

      if (route.name === 'Home') {
        iconName = focused ? 'ios-home' : 'ios-home-outline';
      } else if (route.name === 'Profile') {
        iconName = focused ? 'ios-person' : 'ios-person-outline';
      } else if (route.name === 'Categories') {
        iconName = focused ? 'ios-list' : 'ios-list-outline';
      } else if (route.name === 'Favoritos') {
        iconName = focused ? 'ios-heart' : 'ios-heart-outline';
      }

      // Puedes retornar cualquier componente aquí, como un icono por ejemplo
      return <Ionicons name={iconName} size={size} color={color} />;
    },
    tabBarActiveTintColor: '#007bff', // Azul eléctrico
    tabBarInactiveTintColor: 'gray',
    tabBarShowLabel: false, // Oculta los textos para un diseño más minimalista
    tabBarStyle: { backgroundColor: '#fff' }, // Puedes ajustar el estilo aquí
  })}
>
  <Tab.Screen name="Home" component={Home} />
  <Tab.Screen name="Profile" component={Profile} />
  <Tab.Screen name="Categories" component={Categories} />
  <Tab.Screen name="Favoritos" component={Favoritos} />
</Tab.Navigator>
);

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkLoggedInStatus();
  }, []);

  const checkLoggedInStatus = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      setIsLoggedIn(!!userToken);
    } catch (error) {
      console.error('Error checking login status:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }

    // Después de cerrar sesión, redirige al usuario a la pantalla de inicio de sesión.
    navigation.navigate('Login');
  };

  return (
    <NoteProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Splash">
          <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Main" component={MainScreen} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen
            name="Home"
            component={BottomTabNavigator}
            options={{
              headerShown: false,
              headerRight: () => (
                <Ionicons
                  name="log-out-outline"
                  size={30}
                  color="#007bff"
                  style={{ marginRight: 20 }}
                  onPress={handleLogout}
                />
              ),
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </NoteProvider>
  );
};

export default App;
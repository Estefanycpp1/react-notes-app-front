import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const SplashScreen = () => {
  const navigation = useNavigation();
  const opacityAnim = useRef(new Animated.Value(0)).current; // Inicialmente opacidad 0
  const scaleAnim = useRef(new Animated.Value(0)).current; // Inicialmente escala 0

  useEffect(() => {
    // Animación para el logo
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.elastic(1.2), // Añade un poco de elasticidad al final
        useNativeDriver: true,
      }),
    ]).start();

    // Temporizador para cambiar de vista
    const timer = setTimeout(() => {
      navigation.navigate('Main');
    }, 4000); // Se espera a que la animación termine antes de cambiar de vista

    return () => clearTimeout(timer);
  }, [opacityAnim, scaleAnim, navigation]);

  return (
    <Animated.View style={[styles.container]}>
      <Animated.Image
        source={require('../assets/logo3.png')}
        style={[
          styles.logo,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20, // Añade algo de padding alrededor del logo si es necesario
   
  },
  logo: {
    width: '45%', // Ajusta esto según la anchura deseada del logo en la pantalla
    height: '30%', // Esto se ajustará automáticamente para mantener la relación de aspecto
    aspectRatio: 1, // Ajusta esto según la relación de aspecto de tu logo
    // Añade una sombra para elevar visualmente el logo
    // Ten en cuenta que las sombras en React Native pueden comportarse diferente en iOS y Android
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 10, // Solo funciona en Android
  }
});

export default SplashScreen;

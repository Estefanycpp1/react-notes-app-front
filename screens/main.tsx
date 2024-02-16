import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/navigationTypes';

type MainScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

type Props = {
  navigation: MainScreenNavigationProp;
};

const MainScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Fondo más claro para el contenedor principal */}
      <View style={styles.card}>
        <Text style={styles.title}>Bienvenido a la App</Text>
        <Text style={styles.subtitle}>Tu aplicación para tomar notas</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>Iniciar Sesión</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.buttonText}>Registrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

    card: {
      width: '80%',
      borderRadius: 25,
      padding: 25,
      alignItems: 'center',
      backgroundColor: '#333', // Un gris oscuro para que los colores neón destaquen
      shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10, // Un valor más pequeño para un efecto más definido
    },
    shadowOpacity: 0.5, // Aumentar para una sombra más oscura
    shadowRadius: 20, // Un valor más pequeño para un efecto más nítido
    elevation: 30, // Incrementar para Android
  },
  
  title: {
    fontSize: 30,
    color: '#5ce4e4', // Usamos el color turquesa claro para el título
    fontWeight: 'bold',
    marginBottom: 30,
  },
  subtitle: {
    fontSize: 18,
    color: '#5ce4e4', // También para el subtítulo para mantener la coherencia
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#5ce4e4', // El botón también llevará el color turquesa claro
    borderRadius: 25,
    padding: 15,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  buttonText: {
    color: 'black', // Un color oscuro para el texto del botón para garantizar legibilidad
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});

export default MainScreen;

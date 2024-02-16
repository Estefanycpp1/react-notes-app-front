import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, Text, Image, TouchableOpacity} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/navigationTypes';
import { useRoute } from '@react-navigation/native';


interface LoginScreenProps {
  navigation: NavigationProp<RootStackParamList, 'Login'>;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordCorrect, setIsPasswordCorrect] = useState(true);

  const route = useRoute();
  const registrationSuccess = route.params?.registrationSuccess;

  
  
  const handleLogin = () => {
    fetch('https://react-notes-app-back-production-c147.up.railway.app/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })
    .then(response => {
      if (!response.ok) {
        setIsPasswordCorrect(false); // Aquí asumimos que la contraseña es incorrecta si la respuesta no está bien
        // Si el servidor responde con un error, capturarlo aquí
        return response.json().then(data => {
          // Suponiendo que el servidor envía un mensaje de error en el cuerpo de la respuesta
          throw new Error(data.message || 'Error desconocido');
        });
      }
      setIsPasswordCorrect(true); // Restablecer el estado si la respuesta está bien
      return response.json();
    })
    .then(data => {
      AsyncStorage.setItem('userToken', data.token);
      navigation.navigate('Home');
    })
    .catch(error => {
      Alert.alert('Error de Inicio de Sesión', error.message);
    });
  };
  return (
    <View style={styles.container}>
    {registrationSuccess && (
      <Text style={styles.successMessage}>¡Registro exitoso! Por favor, inicia sesión.</Text>
    )}
      <View style={styles.card}>
        <Text style={styles.title}>Bienvenido</Text>
        <View style={styles.inputContainer}>
          <Image
            source={require('../assets/iconos/mail.png')} // Asegúrate de que la ruta es correcta
            style={styles.icon}
          />
          <TextInput
            placeholder="Email ID"
            placeholderTextColor="#FFFFFF"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        <View style={styles.inputContainer}>
          <Image
            source={require('../assets/iconos/lock.png')} // Asegúrate de que la ruta es correcta
            style={styles.icon}
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#FFFFFF"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry
          />
        </View>
        <TouchableOpacity style={styles.buttonContainer} onPress={handleLogin}>
          <Text style={styles.buttonText}>LOG IN</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
    color: '#cc6ce4', // El lila claro como color principal para el título
    fontWeight: 'bold',
    marginBottom: 30,
  },
  inputContainer: {
    width: '70%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    paddingLeft: 10,
    borderBottomWidth: 2, // Hacer un poco más grueso el borde para resaltar
    borderBottomColor: '#cc6ce4', // Usar el lila claro para la línea debajo del input
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: '#cc6ce4', // El lila claro también para los íconos
  },
  buttonContainer: {
    width: '100%',
    backgroundColor: '#cc6ce4', // El lila claro para el fondo del botón
    borderRadius: 25,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  buttonText: {
    color: '#000000', // Mantener el texto del botón en negro para contraste
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#cc6ce4', // El lila claro también para el texto de enlace
    textDecorationLine: 'underline',
  },
  successMessage: {
    color: 'green',
    fontSize: 24, // Haciendo el texto más grande
    fontWeight: 'bold',
    fontFamily: 'RobotoBold', // Asegúrate de que el nombre de la fuente coincida con cómo lo has declarado en tu proyecto
    textAlign: 'center',
    marginTop: 20,
    marginHorizontal: 20,
    padding: 10,
    borderRadius: 10,
  },
});



export default LoginScreen;

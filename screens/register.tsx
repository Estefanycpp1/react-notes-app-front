import React, { useState } from 'react';
import {
  View,
  TextInput,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage'; // Descomenta si lo necesitas
import { useNavigation } from '@react-navigation/native';
// import { RootStackParamList } from '../navigation/navigationTypes'; // Descomenta si lo necesitas

const Register = () => {
  // Estados para los inputs del formulario
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Hook de navegación
  const navigation = useNavigation();

  const handleRegister = () => {
    const userDetails = {
      name,
      lastName,
      email,
      username,
      password,
    };

    fetch('https://react-notes-app-back-production-c147.up.railway.app/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userDetails),
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(`Failed to register. Status: ${response.status}`);
      }
    })
    .then(data => {
      Alert.alert('Registration Successful', `Welcome ${data.username}`);
      navigation.navigate('Login', { registrationSuccess: true });

    })
    .catch(error => {
      Alert.alert('Registration Failed', error.message);
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Título opcional, quítalo si no lo necesitas */}
        <Text style={styles.title}>Registro</Text>
        {/* Inputs con iconos, ajusta las rutas de los iconos según tus archivos */}
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Name"
            placeholderTextColor="#FFFFFF"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Last Name"
            placeholderTextColor="#FFFFFF"
            value={lastName}
            onChangeText={setLastName}
            style={styles.input}
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Email"
            placeholderTextColor="#FFFFFF"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Username"
            placeholderTextColor="#FFFFFF"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Password"
            placeholderTextColor="#FFFFFF"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry
          />
        </View>
        {/* Usa TouchableOpacity en lugar de Button para un estilo coherente */}
        <TouchableOpacity style={styles.buttonContainer} onPress={handleRegister}>
          <Text style={styles.buttonText}>REGISTER</Text>
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
    backgroundColor: '#fffff',
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
    color: '#fcdb5e', // Aplicamos el nuevo tono dorado claro al título
    fontWeight: 'bold',
    marginBottom: 30,
  },
  inputContainer: {
    width: '90%', 
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    paddingLeft: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#fcdb5e', // El nuevo color también se aplica a la línea del input
  },
  buttonContainer: {
    width: '100%',
    backgroundColor: '#fcdb5e', // Y al fondo del botón para mantener la coherencia
    borderRadius: 25,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Register;
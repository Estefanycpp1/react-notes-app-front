import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/navigationTypes'; // Asegúrate de importar tu tipo de RootStackParamList
import { TouchableOpacity } from 'react-native';


interface UserData {
  name: string;
  lastName: string;
  username: string;
  email: string;
}


interface Note {
  _id: string;
  title: string;
  desc: string;
  color: string;
}

const ProfileScreen: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [newPassword, setNewPassword] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          Alert.alert('Authentication Error', 'No token found.');
          return;
        }

        const response = await axios.get('https://react-notes-app-back-production-c147.up.railway.app/obtenerdatosusuario', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
          setUserData(response.data);
        } else {
          Alert.alert('Error', 'Unable to fetch user data.');
        }
      } catch (error) {
        console.error(error);
        Alert.alert('Error', `An error occurred: `);
      }
    };

    fetchUserData();
  }, []);

  const handleUpdateProfile = async () => {
    if (!userData) {
      Alert.alert('Error', 'No user data to update.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'Authentication token is not available.');
        return;
      }

      const updatedData = {
        newName: userData.name,
        newLastName: userData.lastName,
        newEmail: userData.email,
        newUsername: userData.username,
      };

      const response = await axios.put('https://react-notes-app-back-production-c147.up.railway.app/modificarnombre', updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        Alert.alert('Success', 'Your profile has been updated.');
        setUserData({
          ...userData,
          name: updatedData.newName,
          lastName: updatedData.newLastName,
          username: updatedData.newUsername,
          email: updatedData.newEmail,
        });
      } else {
        Alert.alert('Error', 'There was a problem updating your profile.');
      }
    } catch (error) {
      Alert.alert('Error', `An error occurred: `);
    }
  };

  interface ApiResponse {
    message: string;
  }

  const handleDeleteAllNotes = async () => {
    setIsDeleting(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'Authentication token is not available.');
        setIsDeleting(false);
        return;
      }

      const response = await axios.delete<ApiResponse>('https://react-notes-app-back-production-c147.up.railway.app/borrarnotasdeusuario', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        Alert.alert('Success', 'All your notes have been deleted.');
      } else {
        Alert.alert('Error', 'Failed to delete notes.');
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', `An error occurred: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsDeleting(false);
      navigation.navigate("Main");
    }
  };
  
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'Authentication token is not available.');
        setIsDeleting(false);
        return;
      }
  
      const response = await axios.delete('https://react-notes-app-back-production-c147.up.railway.app/borrarusuario', {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (response.status === 200) {
        await AsyncStorage.removeItem('userToken');
        Alert.alert('Success', 'Your account has been deleted.');
        navigation.navigate('Login'); // Asegúrate de que 'Login' esté definido en tu RootStackParamList
      } else {
        Alert.alert('Error', 'Failed to delete account.');
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', `An error occurred: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };
  if (!userData) {
    return (
      <View style={styles.container}>
        <Text>Loading user data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={userData.username}
        onChangeText={(newUsername) => setUserData({ ...userData, username: newUsername })}
      />
      <TextInput
        style={styles.input}
        value={userData.email}
        onChangeText={(newEmail) => setUserData({ ...userData, email: newEmail })}
      />
      <TextInput
        style={styles.input}
        value={userData.name}
        onChangeText={(newName) => setUserData({ ...userData, name: newName })}
      />
      <TextInput
        style={styles.input}
        value={userData.lastName}
        onChangeText={(newLastName) => setUserData({ ...userData, lastName: newLastName })}
      />
      <TextInput
        secureTextEntry
        style={styles.input}
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="New Password"
      />
      
      {/* Botón 'Save' personalizado */}
      <TouchableOpacity style={styles.button} onPress={handleUpdateProfile}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
      
      {/* Botón 'Change Password' personalizado */}
      {/* <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
        <Text style={styles.buttonText}>Change Password</Text>
      </TouchableOpacity> */}
      
      {/* Botón 'Delete All Notes' personalizado */}
      <TouchableOpacity style={styles.button} onPress={handleDeleteAllNotes} disabled={isDeleting}>
        <Text style={styles.buttonText}>
          {isDeleting ? "Deleting Notes..." : "Delete All Notes"}
        </Text>
      </TouchableOpacity>
      
      {/* Botón 'Delete Account' personalizado con estilo adicional para el fondo rojo */}
      <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDeleteAccount} disabled={isDeleting}>
        <Text style={[styles.buttonText, styles.deleteButtonText]}>
          {isDeleting ? "Deleting Account..." : "Delete Account"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f7f7f7', // Mantenemos un fondo neutro pero elegante
  },
  input: {
    height: 40,
    borderColor: '#bbbbbb', // Un gris claro para el borde, más sofisticado
    borderWidth: 1,
    marginBottom: 12,
    padding: 10,
    width: '100%',
    borderRadius: 20, // Bordes más redondeados para una apariencia suave
    backgroundColor: '#fff',
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', // Sombra sutil para profundidad
  },
  button: {
    backgroundColor: '#007BFF', // Cambiamos a un azul moderno y vibrante
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 12,
    width: '100%',
    borderRadius: 20, // Bordes más redondeados
    borderWidth: 0, // Eliminamos el borde para un look más limpio
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)', // Sombra para dar sensación de elevación
    transition: 'all 0.3s ease', // Transición suave al interactuar
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#DC3545', // Un tono de rojo más moderno y menos agresivo
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)', // Consistente con el estilo de sombra de los botones
  },
  deleteButtonText: {
    color: '#fff',
  },
  // Aquí puedes agregar estilos adicionales según sea necesario
});

export default ProfileScreen;

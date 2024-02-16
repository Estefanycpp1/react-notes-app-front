import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, FlatList, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Folder {
  _id: string;
  folderName: string;
}

interface Note {
  _id: string;
  title: string;
  desc: string;
}

const Categories = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const getTokenAndLoadFolders = async () => {
      const storedToken = await AsyncStorage.getItem('userToken');
      setToken(storedToken);
      if (storedToken) {
        loadFolders(storedToken);
      }
    };

    getTokenAndLoadFolders();
  }, []);

  const loadFolders = async (authToken: string) => {
    try {
      const response = await axios.get<Folder[]>('https://react-notes-app-back-production-c147.up.railway.app/obtenercarpetausuario', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setFolders(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Unable to fetch folders');
    }
  };

  const createFolder = async () => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) return;

    try {
      const response = await axios.post('https://react-notes-app-back-production-c147.up.railway.app/crearcarpeta', { folderName: newFolderName }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 201) {
        setFolders([...folders, response.data]);
        Alert.alert('Success', 'Folder created successfully');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Unable to create folder');
    }
  };

  const deleteFolder = async (folderId: string) => {
    if (!token) return;

    try {
      await axios.delete(`https://react-notes-app-back-production-c147.up.railway.app/borrarcarpeta`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { folderId },
      });
      loadFolders(token);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Unable to delete folder');
    }
  };

  const deleteUserFolders = async () => {
    if (!token) return;

    try {
      await axios.delete('https://react-notes-app-back-production-c147.up.railway.app/borrartodaslascarpetas', {
        headers: { Authorization: `Bearer ${token}` },
      });
      loadFolders(token);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Unable to delete all folders');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="New category"
        value={newFolderName}
        onChangeText={setNewFolderName}
        style={styles.input}
      />
      <TouchableOpacity style={styles.button} onPress={createFolder}>
        <Text style={styles.buttonText}>Create category</Text>
      </TouchableOpacity>
      <FlatList
        data={folders}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.folder}>
            <Text>{item.folderName}</Text>
            <TouchableOpacity style={styles.button} onPress={() => deleteFolder(item._id)}>
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={deleteUserFolders}>
        <Text style={styles.buttonText}>Delete All Categories</Text>
      </TouchableOpacity>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2', // Un fondo claro para realzar los elementos de la UI
    padding: 20,
  },
  folder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff', // Blanco para resaltar los elementos tipo 'folder'
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0', // Un color más suave para la línea de división
    marginBottom: 20, // Aumentamos la separación entre elementos
    borderRadius: 10, // Bordes redondeados para una apariencia más moderna
    shadowColor: '#000', // Sombra para dar profundidad
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3, // Aumentamos la elevación para un efecto más pronunciado
    marginHorizontal: 5, // Añadimos margen horizontal para dar espacio en los lados
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0', // Color de borde más suave
    backgroundColor: '#fff', // Fondo blanco para el input
    borderRadius: 10, // Bordes redondeados para un look más moderno
    marginBottom: 20, // Aumentamos la separación
    padding: 10,
    fontSize: 16,
    shadowColor: '#000', // Sombra para dar profundidad
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3, // Elevación para un efecto de profundidad
  },
  button: {
    padding: 10,
    backgroundColor: '#007bff', // Color azul estándar para botones
    borderRadius: 5,
    shadowColor: '#000', // Sombra para dar profundidad
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2, // Elevación leve para efecto al levantar
    justifyContent: 'center', // Centrar contenido en el botón
    alignItems: 'center',
    marginVertical: 10, // Separación vertical para no estar muy pegado a otros elementos
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#ff4444', // Color rojo para acciones de eliminar
  },

});



export default Categories;

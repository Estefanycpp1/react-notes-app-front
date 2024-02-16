import React, { useState, useEffect, useMemo } from 'react';
import {View,TextInput,Button,Text,StyleSheet,Alert,ScrollView,Modal,TouchableOpacity,FlatList,Image} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/navigationTypes';
import { SafeAreaView } from 'react-native';
import { HomeScreenNavigationProp } from '../navigation/navigationTypes';
import { useIsFocused } from '@react-navigation/native';



// Define la URL base de la API
const API_BASE_URL = 'http://react-notes-app-back-production-c147.up.railway.app';

interface Note {
  _id: string;
  title: string;
  desc: string;
  noteFolder?: string;
  priority: 'high' | 'medium' | 'low'; // Campo nuevo para la prioridad
  isFavorite: boolean;
}

interface Folder {
  _id: string;
  folderName: string;
  color: string; // Campo nuevo para el color de la carpeta
}


interface ApiResponse<T> {
  data: T;
}

const Home: React.FC = () => {
  const Focused = useIsFocused();
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [folderNotes, setFolderNotes] = useState<Note[]>([]);
  const [selectednoteFolder, setSelectednoteFolder] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  //modal de create
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  //variables de notas
  const [noteName, setNoteName] = useState<string>('');
  const [noteDescription, setNoteDescription] = useState<string>('');
  const [notePriority, setNotePriority] = useState('low'); // Default to 'low'

  //navegacion
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null); // Nuevo estado para la nota seleccionada

  //modal de edit
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  

  useEffect(() => {
  fetchFoldersAndNotes();
  }, []);


  useEffect(() =>{
    if(Focused){
      fetchFoldersAndNotes();
    }
  } ,[Focused])
  


// Esta función se asegura de cargar tanto las notas sin carpetas como las de cada carpeta.
const fetchFoldersAndNotes = async () => {
  setIsLoading(true);
  const token = await AsyncStorage.getItem('userToken');
  if (!token) {
    setIsLoading(false);
    return;
  }

  try {
    // Carga las carpetas
    const foldersResponse = await axios.get<Folder[]>('https://react-notes-app-back-production-c147.up.railway.app/obtenercarpetausuario', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setFolders(foldersResponse.data);

    // Carga todas las notas sin carpeta
    const noFolderNotesResponse = await axios.get<Note[]>('https://react-notes-app-back-production-c147.up.railway.app/obtenernotas', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotes(noFolderNotesResponse.data);

    // Carga las notas de cada carpeta y las añade al estado de notas
    for (const folder of foldersResponse.data) {
      const folderNotesResponse = await axios.get<Note[]>(`https://react-notes-app-back-production-c147.up.railway.app/obtenernotasdecarpeta/${folder._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(prevNotes => [...prevNotes, ...folderNotesResponse.data]);
    }
  } catch (error) {
    console.error(error);
    Alert.alert('Error', 'Failed to fetch data');
  } finally {
    setIsLoading(false);
  }
};


  const handleEditPress = (note: Note) => {
    // Establecemos la nota actual en el estado y abrimos el modal para editar
    setSelectedNote(note);
    setNoteName(note.title);
    setNoteDescription(note.desc);
    setEditModalVisible(true);
  };

  const handleUpdateNote = async () => {

    if (!selectedNote) return;
  
    const token = await AsyncStorage.getItem('userToken');
    if (!token) return;
  
    let isUpdateSuccessful = true;
  
    // Actualizar el título si ha cambiado
    if (selectedNote.title !== noteName) {
      try {
        const updateTitleResponse = await axios.put(`https://react-notes-app-back-production-c147.up.railway.app/modificartitulo`, {
          noteId: selectedNote._id,
          newTitle: noteName,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (updateTitleResponse.status !== 200) {
          isUpdateSuccessful = false;
          Alert.alert('Error', 'Failed to update title');
        }
      } catch (error) {
        console.error(error);
        isUpdateSuccessful = false;
        Alert.alert('Error', 'Unable to update title');
      }
    }
  
    // Actualizar la descripción si ha cambiado y el título fue actualizado con éxito
    if (selectedNote.desc !== noteDescription && isUpdateSuccessful) {
      try {
        const updateContentResponse = await axios.put(`https://react-notes-app-back-production-c147.up.railway.app/modifynotecontenido`, {
          noteId: selectedNote._id,
          newContent: noteDescription,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (updateContentResponse.status !== 200) {
          isUpdateSuccessful = false;
          Alert.alert('Error', 'Failed to update content');
        }
      } catch (error) {
        console.error(error);
        isUpdateSuccessful = false;
        Alert.alert('Error', 'Unable to update content');
      }
    }

    // Si alguna de las actualizaciones falló, no proceder a actualizar el estado
    if (!isUpdateSuccessful) return;
  
    // Actualizar el estado solo si todas las actualizaciones fueron exitosas
    const updatedNotes = notes.map((note) => {
      if (note._id === selectedNote._id) {
        return { ...note, title: noteName, desc: noteDescription };
      }
      return note;
    });
  
    setNotes(updatedNotes);
  
    // Reset states and close modal
    setSelectedNote(null);
    setNoteName('');
    setNoteDescription('');
    setEditModalVisible(false);
  };
  



  
 

  
// Función para manejar la eliminación de notas
const handleDeleteNote = async (noteId: string) => {
  const token = await AsyncStorage.getItem('userToken');
  if (!token) return;

  try {
    const response = await axios.delete(`https://react-notes-app-back-production-c147.up.railway.app/borrarnotaid`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { noteId }, // axios necesita el campo `data` para las peticiones DELETE
    });

    if (response.status === 200) {
      setNotes(notes.filter(note => note._id !== noteId));
      Alert.alert('Success', 'Note deleted successfully');
    } else {
      Alert.alert('Error', 'Note not deleted');
    }
  } catch (error) {
    console.error(error);
    Alert.alert('Error', 'Unable to delete note');
  }
};

 
  const handleCreateNote = async () => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) return;
    try {
      const response = await axios.post<Note>('https://react-notes-app-back-production-c147.up.railway.app/crearnota', {
        noteName,
        noteDescription,
        noteColor: "E2DCC6",
        priority:notePriority,
        noteFolder: selectednoteFolder,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSelectedNote(null);
      setNoteName('');
      setNoteDescription('');
      setNotePriority('low');
      setSelectednoteFolder(undefined);
      setModalVisible(false);

      if (response.status === 201) {
        setNotes([...notes, response.data]);
        setNoteName('');
        setNoteDescription('');
        setNotePriority('low');
        setSelectednoteFolder(undefined);
        setModalVisible(false);
        Alert.alert('Success', 'Note created successfully');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Unable to create note');
    }
  };

// Asigna un valor numérico a las prioridades para la ordenación
const getPriorityValue = (priority: 'high' | 'medium' | 'low'): number => {
  const priorityValues: { [key: string]: number } = {
    high: 1,
    medium: 2,
    low: 3,
  };
  return priorityValues[priority];
};

// Utiliza useMemo para ordenar las notas por prioridad
const sortedNotesByFolder = useMemo(() => {
  const grouped = new Map<string, Note[]>();

  notes.forEach(note => {
    const folderKey = note.noteFolder || 'No Folder';
    if (!grouped.has(folderKey)) {
      grouped.set(folderKey, []);
    }
    grouped.get(folderKey)!.push(note);
  });

  // Ordena las notas dentro de cada carpeta por prioridad
  grouped.forEach((notesArray, folderKey) => {
    grouped.set(folderKey, notesArray.sort((a, b) => getPriorityValue(a.priority) - getPriorityValue(b.priority)));
  });

  return Array.from(grouped.entries());
}, [notes]);
  
  




const closeModal = () => {
  setModalVisible(false); // Cierra el modal
  // Restablece los estados a valores predeterminados
  setNoteName('');
  setNoteDescription('');
  setSelectednoteFolder(undefined); // Si estás manejando la selección de carpetas
};

const closeEditModal = () => {
  setEditModalVisible(false); // Cierra el modal de edición
  // Restablece los estados a valores predeterminados
  setSelectedNote(null); // Asegúrate de limpiar la nota seleccionada para editar
  setNoteName('');
  setNoteDescription('');
  // No necesitas restablecer selectednoteFolder aquí si solo se usa para crear notas
};


const toggleFavorite = async (noteId: string) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      Alert.alert('Error', 'Debes estar conectado para actualizar los favoritos');
      return;
    }

    // Actualiza el estado de manera optimista asumiendo que la llamada a la API será exitosa
    setNotes((currentNotes) =>
      currentNotes.map((note) => {
        if (note._id === noteId) {
          return { ...note, isFavorite: !note.isFavorite };
        }
        return note;
      })
    );

    const response = await axios.post(`https://react-notes-app-back-production-c147.up.railway.app/togglefavorite/${noteId}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Verifica si la llamada a la API realmente falló y revierte la actualización del estado
    if (response.status !== 200) {
      // Revierte la actualización optimista
      setNotes((currentNotes) =>
        currentNotes.map((note) => {
          if (note._id === noteId) {
            return { ...note, isFavorite: !note.isFavorite };
          }
          return note;
        })
      );
      Alert.alert('Error', 'Fallo al actualizar el estado de favorito');
    }
  } catch (error) {
    // Revierte la actualización optimista en caso de error
    setNotes((currentNotes) =>
      currentNotes.map((note) => {
        if (note._id === noteId) {
          return { ...note, isFavorite: !note.isFavorite };
        }
        return note;
      })
    );
    console.error(error);
    Alert.alert('Error', 'Ocurrió un error al actualizar el estado de favorito');
  }

};

const handleLogOut = async () => {
  await AsyncStorage.removeItem('userToken');
  navigation.navigate('Login'); // Asegúrate de que 'Login' corresponda al nombre de tu ruta de inicio de sesión
};


return (

  <SafeAreaView style={styles.safeArea}>
    <View style={styles.container}>
       <TouchableOpacity onPress={handleLogOut} style={styles.logOutButton}>
        <Text style={styles.logOutButtonText}>Log Out</Text>
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {sortedNotesByFolder.map(([folderId, notes]) => (
          <View key={folderId} style={styles.folderSection}>
            <Text style={styles.folderTitle}>
              {folderId === 'No Folder' ? 'Sin Carpeta' : folders.find(folder => folder._id === folderId)?.folderName || 'Carpeta Desconocida'}
            </Text>
            <View style={styles.notesContainer}>
              {notes.map(note => (
                <View key={note._id} style={styles.note}>
                  <Text style={styles.title}>{note.title}</Text>
                  <Text style={styles.noteDescription}>{note.desc}</Text>
                  <View style={styles.noteActions}>
                  <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => handleEditPress(note)}>
                    <Image source={require('../assets/iconos/pencil.png')} style={styles.icon} />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.actionButton} onPress={() => toggleFavorite(note._id)}>
                    <Text style={note.isFavorite ? styles.favoriteIconActive : styles.favoriteIcon}>
                        ♥
                    </Text>
                  </TouchableOpacity>



                  <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => handleDeleteNote(note._id)}>
                    <Image source={require('../assets/iconos/trash.png')} style={styles.icon} />
                  </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
            
          </View>
        ))}
      </ScrollView>
  
        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalView}>
            <TextInput
              placeholder="Note Title"
              value={noteName}
              onChangeText={setNoteName}
              style={styles.input}
            />
            <TextInput
              placeholder="Note Description"
              value={noteDescription}
              onChangeText={setNoteDescription}
              style={styles.input}
              multiline
            />
            
          <Picker
          style={styles.picker}
               selectedValue={selectednoteFolder}
               onValueChange={(itemValue: string, itemIndex: number) =>
                 setSelectednoteFolder(itemValue)
               }>
              <Picker.Item label="No Folder" value={undefined} />
              {folders.map((folder) => (
                <Picker.Item key={folder._id} label={folder.folderName} value={folder._id} />
              ))}
            </Picker>
            <Picker
        selectedValue={notePriority}
        onValueChange={(itemValue) => setNotePriority(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Alta" value="high" />
        <Picker.Item label="Media" value="medium" />
        <Picker.Item label="Baja" value="low" />
      </Picker>
      // Botones en el modal
  <TouchableOpacity style={[styles.modalButton, styles.createButton]} onPress={handleCreateNote}>
    <Text>Create Note</Text>
  </TouchableOpacity>
  
  <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={closeModal}>
    <Text>Cancel</Text>
  </TouchableOpacity>
          </View>
        </Modal>
  
  
        <Modal visible={editModalVisible} animationType="slide" transparent>
          {/* Contenido del modal para editar una nota existente */}
          <View style={styles.modalView}>
            <TextInput
              placeholder="Note Title"
              value={noteName}
              onChangeText={setNoteName}
              style={styles.input}
            />
            <TextInput
              placeholder="Note Description"
              value={noteDescription}
              onChangeText={setNoteDescription}
              style={styles.input}
              multiline
            />
            <Button title="Update Note" onPress={handleUpdateNote} color="#5cb85c" />
            <Button title="Cancel" onPress={closeEditModal} color="#f0ad4e" />
           
          </View>
          
        </Modal>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Image source={require('../assets/iconos/notas.png')} style={styles.icon} />
        </TouchableOpacity>


      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalView}>
          <TextInput
            placeholder="Note Title"
            value={noteName}
            onChangeText={setNoteName}
            style={styles.input}
          />
          <TextInput
            placeholder="Note Description"
            value={noteDescription}
            onChangeText={setNoteDescription}
            style={styles.input}
            multiline
          />
          
        <Picker
        style={styles.picker}
             selectedValue={selectednoteFolder}
             onValueChange={(itemValue: string, itemIndex: number) =>
               setSelectednoteFolder(itemValue)
             }>
            <Picker.Item label="No Folder" value={undefined} />
            {folders.map((folder) => (
              <Picker.Item key={folder._id} label={folder.folderName} value={folder._id} />
            ))}
          </Picker>
          <Picker
      selectedValue={notePriority}
      onValueChange={(itemValue) => setNotePriority(itemValue)}
      style={styles.picker}
    >
      <Picker.Item label="Alta" value="high" />
      <Picker.Item label="Media" value="medium" />
      <Picker.Item label="Baja" value="low" />
    </Picker>
    // Botones en el modal
<TouchableOpacity style={[styles.modalButton, styles.createButton]} onPress={handleCreateNote}>
  <Text>Create Note</Text>
</TouchableOpacity>

<TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={closeModal}>
  <Text>Cancel</Text>
</TouchableOpacity>
        </View>
      </Modal>


      <Modal visible={editModalVisible} animationType="slide" transparent>
        {/* Contenido del modal para editar una nota existente */}
        <View style={styles.modalView}>
          <TextInput
            placeholder="Note Title"
            value={noteName}
            onChangeText={setNoteName}
            style={styles.input}
          />
          <TextInput
            placeholder="Note Description"
            value={noteDescription}
            onChangeText={setNoteDescription}
            style={styles.input}
            multiline
          />
          <Button title="Update Note" onPress={handleUpdateNote} color="#5cb85c" />
          <Button title="Cancel" onPress={closeEditModal} color="#f0ad4e" />
         
         
        </View>
        
      </Modal>
      

    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Fondo claro para todo el área segura
  },
  container: {
    flex: 1,
    paddingHorizontal: 10, // Reducido para evitar que los elementos lleguen a los bordes
    paddingTop: 10, // Reducido para mantener la uniformidad
  },
  scrollViewContent: {
    paddingBottom: 10, // Reducido para evitar demasiado espacio en la parte inferior
  },
  folderSection: {
    marginBottom: 10, // Reducido para una mejor distribución del espacio
  },
  folderTitle: {
    fontSize: 18, // Ligeramente reducido para adaptarse mejor en pantallas pequeñas
    fontWeight: 'bold',
    color: '#000000',
    paddingVertical: 10, // Reducido para una mejor distribución del espacio
    borderBottomWidth: 1,
    borderBottomColor: '#373737',
  },
  notesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  note: {
    backgroundColor: '#1E1E1E',
    padding: 15, // Ligeramente reducido para que quepa más contenido
    borderRadius: 8, // Esquinas ligeramente menos redondeadas
    marginVertical: 8,
    marginHorizontal: 5, // Menor margen para más notas por fila
    width: '47%', // Ancho ligeramente aumentado para llenar el espacio
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4, // Elevación ligeramente reducida
  },
  title: {
    fontSize: 16, // Reducido para manejar mejor el espacio
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  noteDescription: {
    color: '#999999',
    fontSize: 14, // Ligeramente más pequeño para mejorar la legibilidad
  },
  noteActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8, // Espaciado superior reducido
  },
  actionButton: {
    padding: 6,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 0, // Sin bordes para un aspecto más limpio
  },
  editButton: {
    backgroundColor: '#4ecca3',
  },
  deleteButton: {
    backgroundColor: '#f76f6d',
  },
  favoriteIcon: {
    fontSize: 20, // Tamaño ligeramente reducido
    color: 'grey',
  },
  favoriteIconActive: {
    fontSize: 20,
    color: 'red',
  },
  modalButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    elevation: 2,
    minWidth: 90, // Reducido para ajustarse a diferentes tamaños de pantalla
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  createButton: {
    backgroundColor: '#4285F4',
  },
  cancelButton: {
    backgroundColor: '#FBBC05',
  },
  modalView: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
    marginHorizontal: 15,
  },
  input: {
    height: 40, // Altura reducida
    borderColor: '#ddd',
    borderWidth: 1,
    width: '100%',
    marginBottom: 10, // Espaciado
    paddingHorizontal: 15,
    borderRadius: 25,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25,
    paddingHorizontal: 15,
  },
  icon:{
    height:20,
    width:20,

  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10, // Ajusta este valor según sea necesario
    backgroundColor: '#1E1E1E', // Este color debería coincidir con el de tu barra superior
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  addButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#4285F4',
    borderRadius: 8,
    padding: 15,
    width: '15%',
    alignSelf: 'flex-start',
  },
  logOutButton: {
    position: 'absolute',
    bottom: 0, // Ajusta este valor para alinear el botón de "Log Out" con el botón de "Crear"
    right: 20,
    backgroundColor: '#f44336',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  logOutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  

});


export default Home;

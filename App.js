
// api Libraries
import axios from 'axios';

// expo libraries

import { Video, AVPlaybackStatus } from 'expo-av';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as FileSystem from 'expo-file-system';

// react Libraries and react Libraries
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Button, View, SafeAreaView, Text, TouchableOpacity, Alert, Image, TouchableHighlight, TextInput, ActivityIndicator} from 'react-native';
import { Dimensions } from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StackActions } from '@react-navigation/native';


export default function App() {

  // Orientation calls
  let statusOrientation = Dimensions.get('screen').width > Dimensions.get('screen').height ? 'landscape' : 'portrait'
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('screen').width);
  const [screenHeight, setScreenHeight] = useState(Dimensions.get('screen').height);
  const [orientation, setOrientation] = useState(statusOrientation);

  const [isLogin, setIsLogin] = useState(false)

  const onChange = result => {
    setScreenWidth(result.screen.width);
    setScreenHeight(result.screen.height);
    setOrientation(result.screen.width > result.screen.height ? 'landscape' : 'portrait');
  };

  useEffect(() => {
    Dimensions.addEventListener('change', onChange);
  }, []);

  // Load fonts
  const [loaded] = useFonts({
    'Roboto-Bold': require('./assets/fonts/Roboto-Bold.ttf'),
    'Roboto-Regular': require('./assets/fonts/Roboto-Regular.ttf'),

  });
  if (!loaded) {
    return null;
  }
  // load stack
  const Stack = createNativeStackNavigator();
  
  let directoryPath = FileSystem.cacheDirectory + 'videos/'
  //create folder if doesnt
  FileSystem.getInfoAsync(directoryPath)
  .then((result) => {
    if (result.exists && result.isDirectory) {
      console.log('Directory exists!');
    } else {
      FileSystem.makeDirectoryAsync(directoryPath, { intermediates: true })
        .then(() => {
          console.log('Directory created successfully!');
        })
        .catch((error) => {
          console.log(`Error creating directory: ${error}`);
        });
    }
  })
  .catch((error) => {
    console.log(`Error checking directory: ${error}`);
  });
    
  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@userData')

      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch(e) {
      // error reading value
    }
  }
  const storeData = async (value) => {
    try {
      const jsonValue = JSON.stringify(value)
      await AsyncStorage.setItem('@userData', jsonValue)
    } catch (e) {
      // saving error
    }
  }
  const removeItemValue = async (key) =>{
    try {
        await AsyncStorage.removeItem(key);
        return true;
    }
    catch(exception) {
        return false;
    }
  }

  const downloadVideo = async (videos, fileName) => {


    videos.forEach(async element => {
      return new Promise(resolve => {
        // do some long-running work
        console.log(resolve)
        const url = element;
        const fileName = url.substring(url.lastIndexOf('/') + 1);
  
        const fileUri = FileSystem.cacheDirectory+ 'videos/'+ fileName;
        // Check if the file already exists
        const fileInfo =  FileSystem.getInfoAsync(fileUri);
    
        if (fileInfo.exists) {
          return fileUri;
        }
        const downloadResumable =  FileSystem.createDownloadResumable(url, fileUri);
    
        console.log(downloadResumable)
    
        try {
          const { uri } = downloadResumable.downloadAsync();
          return uri;
        } catch (error) {
          console.error(error);
        }
      });
    });

  }

  const deleteNonListedVideos = async (videoList) => {
    // Get a list of all files in the videos directory
    const cacheDirectory = FileSystem.cacheDirectory + 'videos/';
    const directoryContent = await FileSystem.readDirectoryAsync(cacheDirectory);
  
    // Filter out any non-video files
    const videoFiles = directoryContent.filter(file => file.endsWith('.mp4'));

  
    // Delete any video files that are not in the video list
    const filesToDelete = videoFiles.filter(file => !videoList.includes(file));

    for (const file of filesToDelete) {
      const fileUri = `${cacheDirectory}${file}`;
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
    }
  }

  getData().then((e)=> {
    if (e == null) {
      return
    }
    if(e.message == 'Ok') {
      setIsLogin(true)
    }else {
      setIsLogin(false)
    }
  }) 
  

  let MainContent = ({navigation}) => {

    const styles = StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: '#F5FFF9',
        justifyContent: 'center',
      },
      titleMain: {
        fontFamily: "Roboto-Bold",
        fontSize: 60, 
        textAlign: "center"
      },
      descriptionMain: {
        textAlign: "center",
        width: "100%",
        padding: 20,
        fontFamily: "Roboto-Regular",
        fontSize: 15
      },
      fixToText: {
        flexDirection: 'row',
        padding: 20,
        justifyContent: 'center',
      },
      button1: {
        alignItems: 'center',
        backgroundColor: '#2EFFC6',
        paddingHorizontal: 30,
        paddingVertical: 20,
        borderRadius: 50,
      },
      button2: {
        alignItems: 'center',
        backgroundColor: '#FAD97C',
        paddingHorizontal: 30,
        paddingVertical: 20,
        borderRadius: 50,
      },
      image: {
        width: screenWidth,
        height: screenHeight
      }
    });
    return (
      <View style={styles.container}>
        <View style={{position: "absolute", left: 100, top: 20, zIndex: -1}}>
            <Image source={require('./assets/img/home.png')} style={styles.image}/>
        </View>
        <View>
          <Text style={styles.titleMain}> ¡Bienvenido </Text>
          <Text style={styles.titleMain}> a&nbsp;
            <Text style={{textDecorationLine: "underline", textDecorationColor: "orange"}} height="20%">
              TiendaTV!
            </Text> 
          </Text>
        </View>
        <View>
          <Text style={styles.descriptionMain}>
            {'\n'}
            {'\n'}
            Ganar puntos es tan fácil como proyectar publicidad en el televisor de su tienda.
          </Text>
        </View>
        <View style={styles.fixToText}>
          <TouchableOpacity style={styles.button1} onPress={() => { navigation.navigate('Login'); }}>
            <Text>Inicia sesion</Text>
          </TouchableOpacity>
          {/* <Text>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</Text>
          <TouchableOpacity style={styles.button2} onPress={() => navigation.navigate('Register')}>
            <Text>&nbsp;&nbsp;Registrate&nbsp;</Text>
          </TouchableOpacity> */}
        </View>

        <StatusBar style="auto" />
      </View>
    )
  }

  let LoginContent = ({navigation}) => {
    const style = StyleSheet.create({
      image: {
        width: 50,
        height: 50,
      },
      titleMain: {
        fontFamily: "Roboto-Bold",
        fontSize: 40, 
        textAlign: "center"
      },
      container: {
        flex: 1,
        backgroundColor: '#F5FFF9',
        justifyContent: 'center',

      },
      input: {
        height: 50,
        borderWidth: 1,
        width: "70%",
        textAlign: 'center', alignSelf: 'center',
        borderColor: "#707070",
        borderRadius: 40  ,
        fontSize: 15,
        backgroundColor: "white",
      },
      button1: {
        alignItems: 'center',
        width: screenWidth / 2, 
        alignSelf: 'center',
        backgroundColor: '#2EFFC6',
        paddingHorizontal: 5,
        paddingVertical: 20,
        borderRadius: 50,
      },
      image1: {
        width: screenWidth ,
        height: screenHeight / 3,
        resizeMode: "contain",
        position: "absolute",
        top: 20
      },
      image2: {
        width: screenWidth,
        height: screenHeight,
        resizeMode: "contain",
        position: "absolute",
        left: 200
      }
    })

    const [loginData, setLoginData] = useState('')

    let submitLogin = () => {

      if (loginData == '') {
        Alert.alert('Mensaje', 'Campo vacio')
        return
      }

      const fetchData = async () => {
        try {
          console.log(loginData)
          const querystring = require('querystring');
          let response = await axios.post('https://tiendatv.qinaya.co/TiendaTV/api/api.asp?action=login', querystring.stringify({ device_code: loginData }))

          if (response.data.message == 'Ok') {
            storeData(response.data)
            setIsLogin(true)
            let videoList = []

            downloadVideo(response.data.videos)

            console.log('finish')
            // response.data.videos.forEach(element => {
            //   const url = element;
            //   const fileName = url.substring(url.lastIndexOf('/') + 1);
            //   videoList.push(fileName)
            //   downloadVideo(url, fileName)
            // });

            deleteNonListedVideos(videoList)
            navigation.navigate('Index')

          }else {
            Alert.alert('Mensaje',response.data.message)

          }
          return
          // const data = response.data;
          // return data;
        } catch (error) {
          console.error(error);
        }
      };
      fetchData()
    }

    return (
      
      <View style={style.container}>
        <View style={{position: "absolute", left: 100, top: 20, zIndex: -1}}>
            <Image source={require('./assets/img/login-2.png')} style={style.image1}/>
            <Image source={require('./assets/img/login-1.png')} style={style.image2}/>
        </View>
        <View style={{position: "absolute", top: "5%", left: 20, zIndex: 3}}>
          <TouchableHighlight onPress={() => navigation.navigate('Home')} underlayColor='none'>
            <Image source={require('./assets/img/arrow2.png')} style={style.image}/>
          </TouchableHighlight>
        </View>

        <View>
          <Text style={style.titleMain}> ¡Hola, vecino! </Text>
        </View>
        <Text>{'\n'}</Text>
        <TextInput style={style.input} placeholder="Escriba su codigo o correo aquí" defaultValue={loginData} onChangeText={(nextText) => {setLoginData(nextText); console.log(nextText)}}/>
        <Text>{'\n'}</Text>
        {/* <TextInput style={style.input} placeholder="Escriba su contraseña aquí" secureTextEntry={true}/>
        <Text>{'\n'}</Text> */}
        <TouchableOpacity style={style.button1} onPress={() => submitLogin()}>
        
            <Text style={{fontFamily: "Roboto-Bold",}}>&nbsp;&nbsp;Ingrese a su cuenta&nbsp;</Text>
        </TouchableOpacity>


      </View>
    )
  }

  let RegisterContent = ({navigation}) => {
    const style = StyleSheet.create({
      image: {
        width: 50,
        height: 50,
      },
      container: {
        flex: 1,
        backgroundColor: '#F5FFF9',
        justifyContent: 'center',
        backgroundColor: "#A7EFBB",
      },
      titleMain: {
        fontFamily: "Roboto-Bold",
        fontSize: 40, 
        textAlign: "center"
      },
      titleMain2: {
        fontFamily: "Roboto-Regular",
        fontSize: 20, 
        textAlign: "center"
      },
      inputLandscape: {
        height: screenWidth / 20,
        width: screenWidth / 2,
        textAlign: 'center', 
        alignSelf: 'center',
        borderColor: "#707070",
        borderRadius: "5px",
        backgroundColor: "white",
        marginVertical: 5,
        fontWeight: "bold",
        color: "#707070",
        fontSize: 15,
      },
      inputPortrait: {
        height: screenHeight / 20,
        width: screenWidth / 1.4,
        textAlign: 'center', 
        alignSelf: 'center',
        borderColor: "#707070",
        borderRadius: "5px",
        backgroundColor: "white",
        marginVertical: 5,
        fontWeight: "bold",
        color: "#707070",
        fontSize: 15,

      },
      inputFormPortrait: {
        marginVertical: 10,
        width: screenWidth / 1.2 ,
        alignSelf: 'center',
        paddingVertical: 20,
        backgroundColor: "#5CF085",

        
      },
      inputFormLandscape: {
        marginVertical: 10,
        width: screenWidth / 1.8 ,
        alignSelf: 'center',
        paddingVertical: 20,
        backgroundColor: "#5CF085",
        
      },
      button1: {
        alignItems: 'center',
        width: screenWidth / 2, 
        alignSelf: 'center',
        backgroundColor: '#0ACD40',
        paddingHorizontal: 5,
        paddingVertical: screenHeight / 30,
        borderRadius: 5,
      },
      image1: {
        width: screenWidth,
        height: screenHeight,
        resizeMode: "contain",
        position: "absolute",
        // top: 100,
        left: 180
      },
      image2: {
        width: screenWidth,
        height: screenHeight,
        resizeMode: "contain",
        position: "absolute",
        left: -200
      }
    })

    return (
      <View style={style.container}>
        <View style={{position: "absolute", left: 100, top: 20, zIndex: -1}}>
            <Image source={require('./assets/img/register-2.png')} style={style.image1}/>
            <Image source={require('./assets/img/register-1.png')} style={style.image2}/>

        </View>
        <View style={{position: "absolute", top: "5%", left: 20, zIndex: 3,}}>
          <TouchableHighlight onPress={() => navigation.navigate('Home')} underlayColor='none'>
            <Image source={require('./assets/img/arrow1.png')} style={style.image}/>
          </TouchableHighlight>
        </View>
        {/* Titulo */}
        <View>
          <Text style={style.titleMain}> ¡Bienvenido! </Text>
          <Text style={style.titleMain2}> Ingrese sus datos aquí </Text>
        </View>
        {/* Register form content */}
        <View style={orientation === 'portrait' ? style.inputFormPortrait : style.inputFormLandscape}>

          <TextInput style={orientation === 'portrait' ? style.inputPortrait : style.inputLandscape} placeholder="Escriba su correo aquí" />
          <TextInput style={orientation === 'portrait' ? style.inputPortrait : style.inputLandscape} placeholder="Escriba su contraseña aquí" secureTextEntry={true}/>
          <TextInput style={orientation === 'portrait' ? style.inputPortrait : style.inputLandscape} placeholder="Escriba su contraseña aquí" secureTextEntry={true}/>
          <TextInput style={orientation === 'portrait' ? style.inputPortrait : style.inputLandscape} placeholder="Escriba su telefono aquí" />
        </View>

        <TouchableOpacity style={style.button1} onPress={() => Alert.alert('Simple Button pressed')}>
            <Text style={{fontFamily: "Roboto-Bold", color: "white"}}>&nbsp;&nbsp;Ingrese a su cuenta&nbsp;</Text>
        </TouchableOpacity>
      </View>
    )
  }

  let Index = ({navigation}) => {
    const [imagen1, setImagen1] = useState(0);
    const [selectedImagen, setSelectedImage] = useState(1);
    const [imagen2, setImagen2] = useState(2);

    const [store, setStore] = useState([])
    const [videos, setVideos] = useState([])
    const [videoCounter, setVideoCounter] = useState(0)
    const [forceUpdate, setForceUpdate] = useState(false);
    const [code, setCode] = useState('');


    const [videoPosition, setVideoPosition] = useState(0)

    const [playVideo, setPlayVideo] = useState(false)

    const [points, setPoints] = useState(0)
    const [cycle, setCycle] = useState(0)
    

    const video = React.useRef(null);
    const [status, setStatus] = React.useState({});

    let nextImage = (value) => {
      if(value == 1) {
        setImagen2(selectedImagen)
        setSelectedImage(imagen1)
        if ( imagen1 == 0) {
          setImagen1(store.length - 1)
        } else {
          setImagen1(imagen1 - 1)
        }
      } else {
        setImagen1(selectedImagen)
        setSelectedImage(imagen2)
        if (imagen2 == store.length - 1) {
          setImagen2(0)
        } else {
          setImagen2(imagen2 + 1)
        }
      }
    }

    useEffect(() => {

      getData().then((e)=> {
        if (e == null) {
          return
        }
        if(e.message == 'Ok') {

          setStore(e.brands)
          setCode(e.device)
          setVideoCounter(e.videos.length)
          setCycle(e.cicles)
          setPoints(e.points)
        }else {
          setIsLogin(false)
        }
      })

      const cacheDirectory = FileSystem.cacheDirectory + 'videos/';

      const directoryContent = FileSystem.readDirectoryAsync(cacheDirectory).then( (e) => {
        const videoFiles = e.filter(file => file.endsWith('.mp4'));

        if (videoFiles.length != videoCounter ) {
          console.log('???????')
          if(videos.length == 0) {
            videoFiles.forEach(element => {
              setVideos(prevMovies => ([...prevMovies, `${cacheDirectory}${element}`]));
            });

          }
        }

      });
      setForceUpdate(false)
    },[])

    const style = StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: '#F5FFF9',
        justifyContent: 'center',
        alignItems: 'center',
      },
      video: {
        position: "absolute",
        zIndex: 100,
        width: screenWidth,
        height: screenHeight
      },
      background: {
        width: screenWidth,
        height: screenHeight,
        resizeMode: "cover",
      },
      image: {
        width: 50,
        height: 50,
      },
      informationContent: {
        width: screenWidth / 3, 
        height: 50, 
        backgroundColor: 'white',
        borderWidth: 1,
        borderRadius: 40,
        justifyContent: "center",
      },
      startButtonContainerPortrait: {
        top: "80%", 
        position: "absolute"
      },
      startButtonContainerLandscape: {
        top: "80%", 
        position: "absolute"
      },
      startButtonPortrait: {
        width: screenWidth / 1.5, 
        height: screenHeight / 15, 
        backgroundColor: '#FAD97C',
        borderRadius: 40,
        justifyContent: "center"
      },
      startButtonLandscape: {
        width: screenWidth / 2, 
        height: screenWidth / 15, 
        backgroundColor: '#FAD97C',
        borderRadius: 40,
        justifyContent: "center"
      },
      arrows: {
        width: 200,
        height: screenHeight / 10,
        transform: [{ rotate: '180deg'}],
        resizeMode: "cover"
      },
      arrows1: {
        width: 200,
        height: screenHeight / 10,
        resizeMode: "cover"
      },

      // Selector company responsive
      arrowLeftContainerPortrait: {
        position: "absolute", top: "35%", left: -60, zIndex: 3
      },
      arrowRightContainerPortrait: {
        position: "absolute", top: "35%", right: -60, zIndex: 3
      },

      arrowLeftContainerLandscape: {
        position: "absolute", top: "47%", left: -40, zIndex: 3
      },
      arrowRightContainerLandscape: {
        position: "absolute", top: "47%", right: -40, zIndex: 3
      },

      logoContentPortrait: {
        position: "absolute",
        zIndex: 4,
        top: "30%",
        flexDirection: "row",
        justifyContent: "space-between",
        width: screenWidth / 1.4 ,
        alignItems: "center"
      },
      logoContentLandscape: {
        position: "absolute",
        flexDirection: "row",
        justifyContent: "space-between",
        width: screenWidth / 1.2
      },

      logoPortrait: {
        width: screenHeight / 25,
        height: screenHeight / 25,
        resizeMode: "stretch"
      },
      logoMaxPortrait: {
        width: screenHeight / 5,
        height: screenHeight / 5,
        resizeMode: "stretch"
      },

      logoLandscape: {
        width: screenWidth / 12,
        height: screenWidth / 12,
        resizeMode: "stretch"
      },
      logoMaxLandscape: {
        width: screenWidth / 5,
        height: screenWidth / 5,
        resizeMode: "stretch"
      }
    })

    const onPlaybackStatusUpdate = (status) => {
      if (status.didJustFinish) {
        setVideoPosition((videoPosition + 1) % videos.length);

        video.current.loadAsync({
          uri: videos[videoPosition],
        });
        video.current.playAsync()
        console.log((videoPosition  + 1)% videos.length, (videoPosition  + 1) % videos.length == 0)
        if ((videoPosition + 1) % videos.length == 0) {
          const fetchData = async () => {
            try {
              const querystring = require('querystring');
              let response = await axios.post('https://tiendatv.qinaya.co/TiendaTV/api/api.asp?action=cicle', querystring.stringify({ device_code: code }))
    
              if (response.data.message == 'Ok') {
                console.log('code')
                setCycle(response.data.cicles)
                setPoints(response.data.points)
              }else {
                Alert.alert('Mensaje',response.data.message)
    
              }
              return
              // const data = response.data;
              // return data;
            } catch (error) {
              console.error(error);
            }
          };
          fetchData()
        }
      }
    };

    let unLogin = () => {
      Alert.alert('Cerrar sesion', 'Seguro deseas cerrar la sesion?', [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {text: 'Cerrar sesion', onPress: () => {
          removeItemValue('@userData')
          setIsLogin(false)
          navigation.navigate('Home')
        }},
      ]);
    }

    let startPlay = () => {
      console.log(videos)

      const cacheDirectory = FileSystem.cacheDirectory + 'videos/';
      const directoryContent = FileSystem.readDirectoryAsync(cacheDirectory).then( (e) => {
        const videoFiles = e.filter(file => file.endsWith('.mp4'));

        let x = true
        if (videoFiles.length == videoCounter && videos.length == 0){
          console.log('start, start')
          videoFiles.forEach(element => {
            setVideos(prevMovies => ([...prevMovies, `${cacheDirectory}${element}`]));
          });
          setPlayVideo(true);
          x = false
        }
        console.log(videos.length, videoCounter)
        if (videos.length == videoCounter) {
          x = false
        }
        if (!x) {
          setPlayVideo(true);
        } else {
          alert('Estamos configurando la aplicacion por favor espera unos minutos')
        }
      });

    }

    if (store.length != 0 ) {
      // console.log(videos, videos[videoPosition], videoPosition)
      return (
        <View style={style.container}>
          <Image source={require('./assets/img/background.png')} style={style.background}/>
          {playVideo && (
            <>
              <View style={{position: "absolute", top: "5%", left: 20, zIndex: 101}}>
                <TouchableHighlight onPress={() => setPlayVideo(false)} underlayColor='none'>
                  <Image source={require('./assets/img/casa.png')} style={style.image}/>
                </TouchableHighlight>
              </View>
              <View style={{position: "absolute", width: screenWidth, height: screenHeight, backgroundColor: "black",top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', zIndex: 20}}>
                <ActivityIndicator size="large" color="#A7EFBB"/>
              </View>
              <Video
                ref={video}
                style={style.video}
                source={{
                  uri: videos[videoPosition],
                }}
                resizeMode="cover"
                shouldPlay
                positionMillis={0}
                onPlaybackStatusUpdate={onPlaybackStatusUpdate}
                volume={50}
              />
            
            </>

          )}

          <View style={{position: "absolute", top: "5%", left: 20, zIndex: 3}}>
            <TouchableHighlight onPress={unLogin} underlayColor='none'>
              <Image source={require('./assets/img/casa.png')} style={style.image}/>
            </TouchableHighlight>
          </View>
  
          <View style={orientation === 'portrait' ? style.arrowLeftContainerPortrait : style.arrowLeftContainerLandscape}>
            <TouchableHighlight onPress={() => nextImage(1)} underlayColor='none'>
              <Image source={require('./assets/img/arrow.png')} style={style.arrows}/>
            </TouchableHighlight>
          </View>
  
          <View style={orientation === 'portrait' ? style.arrowRightContainerPortrait : style.arrowRightContainerLandscape}>
            <TouchableHighlight onPress={() => nextImage(0)} underlayColor='none'>
              <Image source={require('./assets/img/arrow.png')} style={style.arrows1}/>
            </TouchableHighlight>
          </View>
  
  
          <View style={{position: "absolute", top: "15%", zIndex: 3, flexDirection: "row", justifyContent: "space-between", width: screenWidth / 1.4,}}>
            <View style={style.informationContent}>
              <Text style={{textAlign: "center", fontFamily: "Roboto-Bold"}}>Puntos: {points}</Text>
            </View>
            <View style={style.informationContent}>
              <Text style={{textAlign: "center", fontFamily: "Roboto-Bold" }}>Ciclo: {cycle}</Text>
            </View>
          </View>
  
          <View style={style.logoContentPortrait}>
  
              <Image source={{uri: store[imagen1].logo }} style={orientation === 'portrait' ? style.logoPortrait : style.logoLandscape}/>
  
              <Image source={{uri: store[selectedImagen].logo}} style={orientation === 'portrait' ? style.logoMaxPortrait : style.logoMaxLandscape}/>
  
              <Image source={{uri: store[imagen2].logo}} style={orientation === 'portrait' ? style.logoPortrait : style.logoLandscape}/>
  
          </View>
  
          <View style={orientation === 'portrait' ? style.startButtonContainerPortrait : style.startButtonContainerLandscape}>
            <TouchableHighlight onPress={startPlay} underlayColor='none'>
              <View style={orientation === 'portrait' ? style.startButtonPortrait : style.startButtonLandscape}>
                {/* <Text style={{textAlign: "center", fontFamily: "Roboto-Bold"}}>¡Haga click aquí para iniciar!</Text> */}
                <Text style={{textAlign: "center", fontFamily: "Roboto-Bold"}}>¡Haga click aquí para iniciar!</Text>
  
              </View>
            </TouchableHighlight>
            
          </View>
  
        </View>
  
        
      )
    }

  }

  return (
    // Main view

    <NavigationContainer>
      <Stack.Navigator>
        {isLogin ? (<Stack.Screen name="Index" component={Index} options={{ headerShown: false, orientation: 'portrait' }}/>) : (<Stack.Screen name="Home" component={MainContent} options={{ headerShown: false, orientation: 'portrait' }}/>)}

        {/* <Stack.Screen name="Home" component={MainContent} options={{ headerShown: false, orientation: 'portrait' }} /> */}
        <Stack.Screen name="Login" component={LoginContent} options={{ headerShown: false, orientation: 'portrait' }} />
        <Stack.Screen name="Register" component={RegisterContent} options={{ headerShown: false, orientation: 'portrait' }} />
        {/* <Stack.Screen name="Index" component={Index} options={{ headerShown: false, orientation: 'portrait' }} /> */}
      </Stack.Navigator>

    </NavigationContainer>
  );
}

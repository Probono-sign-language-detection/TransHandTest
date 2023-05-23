import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Pressable } from 'react-native';
import { AutoFocus, Camera, CameraType } from 'expo-camera';
import {useState, useRef} from 'react';

export default function App() {
    const [type, setType] = useState(CameraType.back);

    function toggleCameraType() {
      setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
    }
  
    const cameraRef = useRef(null);
  
    const [cameraType, setCameraType] = useState(CameraType.back);
  
    const [zoomLevel,setZoomLevel] = useState(0);
  
    const openCameraHandler = async () => { 
      // 카메라에 대한 접근 권한을 얻을 수 있는지 묻는 함수입니다.
        const { status } = await Camera.requestCameraPermissionsAsync();
     
     // 권한을 획득하면 status가 granted 상태가 됩니다.
        if (status === 'granted') {
     // Camera 컴포넌트가 있는 CameraScreen으로 이동합니다.
          navigation.navigate('CameraScreen',{
            title: route.params.title
          });
        } else {
          Alert.alert('카메라 접근 허용은 필수입니다.');
        }
    };
  
    const takePictureHandler = async () => { 
      // cameraRef가 없으면 해당 함수가 실행되지 않게 가드
      if (!cameraRef.current) return (
        alert("no")
      );
      
      // takePictureAsync를 통해 사진을 찍습니다.
      // 찍은 사진은 base64 형식으로 저장합니다.
      await cameraRef.current
        .takePictureAsync({
          base64: true,
        })
        .then((data) => {
          setPreviewVisible(true);
          setCapturedImage(data);
        });
    };
  return (
    <View style={styles.container}>
        <Camera
        ref={cameraRef}
        type={cameraType}
        zoom={zoomLevel}
        autoFocus={AutoFocus.on}
        // whiteBalance={toggleWhiteBalance}
      />
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={takePictureHandler}>
            <Text>Click Me!</Text>  
          </TouchableOpacity>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
    backgroundColor: "blue"
  },
  buttonContainer: {
    backgroundColor: "white"
  },
  button: {
    bordereRadius: "25px",
    backgroundColor: "white"
  },
  text: {
    color: "red",
    fontSize: "24px"
  }

});

import React, {useState, useEffect, useRef} from 'react';
import { StyleSheet, Text, View, Button, Image } from 'react-native';
import { Camera } from 'expo-camera';
import { Video } from 'expo-av';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';


export default function RealTimeImg() {
  //마이크 허가 요청
  const [hasAudioPermission, setHasAudioPermission] = useState(null);
  //카메라 허가 요청
  const [hasCameraPermission, setHasCameraPersmission] = useState(null);
  const [camera, setCamera] = useState(null);
  const [record, setRecord] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const video = React.useRef(null);
  const [status, setStatus] = React.useState({});

  const [isRecording, setIsRecording] = useState(false);
  const timerRef = useRef(null);

  const [firstCapturedFrameUri, setFirstCapturedFrameUri] = useState(null);
  const [isFirstFrameDisplayed, setIsFirstFrameDisplayed] = useState(false);


  // 캡처한 프레임의 URI를 상태 변수에 저장
  const [capturedFrameUri, setCapturedFrameUri] = useState(null);

  useEffect(() => {
    (async () => {
        // 카메라 권한 요청
        const cameraStatus = await Camera.requestCameraPermissionsAsync();
        setHasCameraPersmission(cameraStatus.status === 'granted');

        // 마이크 권한 요청
        const audioStatus = await Camera.requestMicrophonePermissionsAsync();
        setHasAudioPermission(audioStatus.status === 'granted');
    })();
  }, []);

  const captureAndSendFrame = async () => {
    if (camera) {
      try {
        const photo = await camera.takePictureAsync({ format: 'jpeg' });
        console.log("Captured frame:", photo.uri);
        setFirstCapturedFrameUri(photo.uri);
        setIsFirstFrameDisplayed(true);

        // 이미지 파일을 서버로 전송
        const formData = new FormData();
        formData.append('image', {
          uri: photo.uri,
          type: 'image/jpeg',
          name: 'image.jpg',
        });

        // await axios.post(
        //   '3.34.132.42/video/process-frame/',
        //   formData,
        //   {
        //     headers: {
        //       'Content-Type': 'multipart/form-data',
        //     },
        //   }
        // );
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleTakeVideo = () => {
    if (isRecording) {
      clearInterval(timerRef.current);
      setIsRecording(false);
    } else {
      setIsRecording(true);
      timerRef.current = setInterval(captureAndSendFrame, 1000);
    }
  };

  const handleStopVideo = () => {
    clearInterval(timerRef.current);
    setIsRecording(false);
  };

  if(hasCameraPermission === null || hasAudioPermission === null) {
    return <View />;
  }

  if (hasCameraPermission === false || hasAudioPermission === false) {
    return <Text>No access to camera</Text>
  }


  return (
    <>
      <View style={{flex:1}}>
        <View style={styles.cameraContainer} >
          <Camera
            ref = {ref => setCamera(ref)}
            style = {styles.fixedRatio}
            type = {type}
            ratio = {'4:3'} />
        </View>
          <View styles={styles.buttons}>

            <Button 
              title = {status.isPlaying ? 'Pause' : 'Play'}
              onPress={() => 
              status.isPlaying ? video.current.pauseAsync() : video.current.playAsync()
            }
            />
          </View>
          <Button
          title = 'Flip Video'
          onPress={()=>{
            setType(
              type === Camera.Constants.Type.back
              ? Camera.Constants.Type.front
              : Camera.Constants.Type.back
            );
          }}
          />
          <Button title="Take Video" onPress={()=>handleTakeVideo()} />
          <Button title="Stop Video" onPress={()=>handleStopVideo()} />
          {isFirstFrameDisplayed && (
            <View style={styles.box}>
            <Image
                style={styles.capturedImage}
                source={{ uri: firstCapturedFrameUri }}
            />
            </View>
          )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  cameraContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  fixedRatio: {
    flex: 1,
    aspectRatio: 1
  },
  video: {
    alignSelf: 'center',
    width: 350,
    height: 350,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: "center",
    alignItems: 'center',
  },
  capturedImage: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginTop: 10,
  },
  box: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  }
})
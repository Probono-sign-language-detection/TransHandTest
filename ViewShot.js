import ViewShot from "react-native-view-shot";
import { StyleSheet, Text, View, Button, Image } from 'react-native';
import React, {useState, useEffect, useRef} from 'react';
import { Camera } from 'expo-camera';
import axios from 'axios';
import base64 from 'react-native-base64'
import * as FileSystem from 'expo-file-system';


export default function Viewshot() {
    //마이크 허가 요청
    const [hasAudioPermission, setHasAudioPermission] = useState(null);
    //카메라 허가 요청
    const [hasCameraPermission, setHasCameraPersmission] = useState(null);
    const [camera, setCamera] = useState(null);
    // const [record, setRecord] = useState(null);
    const [type, setType] = useState(Camera.Constants.Type.back);
    const video = React.useRef(null);
    const [status, setStatus] = React.useState({});
  
    const [isRecording, setIsRecording] = useState(false);
    const timerRef = useRef(null);
  
    // const [firstCapturedFrameUri, setFirstCapturedFrameUri] = useState(null);
    // const [isFirstFrameDisplayed, setIsFirstFrameDisplayed] = useState(false);


    //viewshot!!!!!!!!!!!!!!!!!!!!!!!!!!!~~~~~~~~~~~
    const ref = useRef();
 
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
          uri = await ref.current.capture();
          console.log("do something with ", uri);

          // 이미지 파일을 base64로 인코딩
          const base64Image = await convertToBase64(uri);


          //이미지를 base64로 인코딩하는 함수
          async function convertToBase64(uri) {
            // const fileUri = uri.replace(/^\/private\/var\/mobile\/Containers\/Data\/Application\/639/, '');
            // console.log("나는 fileuri: ", fileUri)
            //1
            const b64 = await FileSystem.readAsStringAsync(uri, {
              encoding: FileSystem.EncodingType.Base64,
            });

            //2
            // const b64 = base64.encode(fileUri)
          return b64;
          }
          // console.log(base64Image);

  
          // 서버에 전송
          await axios.post(
            'http://43.202.22.173/video/process-video/',
            {
              image: base64Image
            }
          );
  
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
        timerRef.current = setInterval(captureAndSendFrame, 500); 
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
        <View style={{flex:0.9}}>
          <View style={styles.cameraContainer} >
            <ViewShot ref={ref} options={{ fileName: "sendFrame", format: "jpg", quality: 0.9 }}>
              <Camera
                  ref = {ref => setCamera(ref)}
                  style = {styles.fixedRatio}
                  type = {type}
                  ratio = {'4:3'} />
            </ViewShot>
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
            <View style={{height: 100}}>
            <Text>hi</Text>
            </View>
            {/* {isFirstFrameDisplayed && (
              <View style={styles.box}>
              <Image
                  style={styles.capturedImage}
                  source={{ uri: firstCapturedFrameUri }}
              />
              </View>
            )} */}
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
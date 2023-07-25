import React, {useState, useEffect, useRef} from 'react';
import { StyleSheet, Text, View, Button, Image } from 'react-native';
import { Camera } from 'expo-camera';
import { Video } from 'expo-av';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';


export default function RealTimeCamera() {
  const [hasAudioPermission, setHasAudioPermission] = useState(null);
  const [hasCameraPermission, setHasCameraPersmission] = useState(null);
  const [camera, setCamera] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const video = React.useRef(null);
  const [status, setStatus] = React.useState({});

  const [isRecording, setIsRecording] = useState(false);
  const timerRef = useRef(null);

  // 캡처한 프레임의 URI를 상태 변수에 저장
  const [currentVideoUri, setCurrentVideoUri] = useState(null);

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

  //영상 1초 단위로 캡쳐해서 저장
  const captureAndSendFrame = async () => {
    // 카메라가 존재하는 경우 실행
    if (camera) {
        // try-catch 문으로 오류 처리 시작
      try {
        const data = await camera.recordAsync({
          maxDuration: 1,
        });
        // 영상 촬영을 시작하고 최대 1초 동안 녹화

        // 캡처한 프레임의 URI를 콘솔에 출력
        console.log("Captured frame:", data.uri);

        // 첫 번째 캡처된 프레임의 URI를 저장하고 플래그를 설정하여 화면에 표시
        if (!isFirstFrameDisplayed) {
          setCurrentVideoUri(data.uri); 
        }

        // 촬영된 영상을 FormData에 첨부하기 위해 FormData 객체 생성
        const formData = new FormData();
        formData.append('video', {
          uri: data.uri,
          type: 'video/mp4',
          name: 'video.mp4',
        });

        //Axios를 사용하여 백엔드로 Multi-part form data를 전송하는 POST 요청을 보냄
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
        // 오류가 발생한 경우 오류를 콘솔에 출력
        console.error(e);
      }
    }
  };

  // Take Video 클릭시
  const handleTakeVideo = () => {
    if (isRecording) {
      clearInterval(timerRef.current);
      setIsRecording(false);
    } else {
      setIsRecording(true);
      //1초마다 한 번씩 captureAndSendFrame 실행.
      timerRef.current = setInterval(captureAndSendFrame, 1000);
    }
  };

  //Stop Video 클릭시
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
            ratio = {'4:3'} 
            whiteBalance={Camera.Constants.WhiteBalance.auto}/>
        </View>
        <Video
          ref={video}
          style={styles.video}
          source={{
            uri: currentVideoUri,
          }}
          useNativeControls
          resizeMode='contain'
          isLooping
          onPlaybackStatusUpdate={status => setStatus(()=>status)}
          />
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
  }
})
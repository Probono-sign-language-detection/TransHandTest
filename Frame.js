import React, {useState, useEffect} from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { Camera } from 'expo-camera';
import { Video } from 'expo-av';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { ExternalDirectoryPath } from 'react-native-fs';


export default function Frame() {
  const [hasAudioPermission, setHasAudioPermission] = useState(null);
  const [hasCameraPermission, setHasCameraPersmission] = useState(null);
  const [camera, setCamera] = useState(null);
  const [record, setRecord] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const video = React.useRef(null);
  const [status, setStatus] = React.useState({});

  useEffect(() => {
    (async () => {
        const cameraStatus = await Camera.requestCameraPermissionsAsync();
        setHasCameraPersmission(cameraStatus.status === 'granted');

        const audioStatus = await Camera.requestMicrophonePermissionsAsync();
        setHasAudioPermission(audioStatus.status === 'granted');
    })();
  }, []);


  const TakeVideo = async () => {
    const uploadVideoFrames = async(videoUri) => {
        const {uri} = await FileSystem.getInfoAsync(videoUri);
        const frames = await extractFrames(uri);

        frames.forEach(async (frame, index) => {
            try {
                const formData = new FormData();
                formData.append('frame', {
                    uri: frame.uri,
                    type: 'image/jpeg',
                    name: 'frame_${index}.jpg',
                });

                const response = await axios.post(
                    '3.34.132.42/video/process-video/',
                    formData,
                    {
                      headers: {
                        'Content-Type': 'multipart/form-data',
                      },
                    }
                  );
                  await FileSystem.deleteAsync(frame.uri);
                  console.log(response);
            } catch(error) {
                console.log(error);
            }
        })
    }
    if (camera) {
      try {
        const data = await camera.recordAsync({
          maxDuration: 5,
        })
        uploadVideoFrames(data.uri)
        console.log("takeVideo: " + data.uri);


      const result = response.data;
      console.log("결과입니다...." + result);
    } catch (e) {
      console.error(e);
    }
  }
};


  const stopVideo = async () => {
    camera.stopRecording();
    // camera.current.stopRecording();
    console.log("끝")
  }

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
        <Video
          ref = {video}
          style = {styles.video}
          source = {{
            uri: record,
          }}
          useNativeControls
          resizeMode='contain'
          isLooping
          onPlaybackStatusUpdate={status => setStatus(()=>status)}
          />
          <View styles={styles.buttons}>
          {/* <Button title="데이터 전송" onPress={sendDataToServer} /> */}
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
          <Button title="Take Video" onPress={()=>TakeVideo()} />
          <Button title="Stop Video" onPress={()=>stopVideo()} />
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
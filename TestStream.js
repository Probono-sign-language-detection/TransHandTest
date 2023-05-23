import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { Camera } from 'expo-camera';
import { Video } from 'expo-av';
import WS from 'react-native-websocket';

export default function TestStream() {
  const [hasAudioPermission, setHasAudioPermission] = useState(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [camera, setCamera] = useState(null);
  const [record, setRecord] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const video = useRef(null);
  const [status, setStatus] = useState({});

  useEffect(() => {
    (async () => {
      const cameraStatus = await Camera.requestCameraPermissions();
      setHasCameraPermission(cameraStatus === 'authorized');

      const audioStatus = await Camera.requestMicrophonePermissions();
      setHasAudioPermission(audioStatus === 'authorized');
    })();
  }, []);

  useEffect(() => {
    if (isConnected && socket) {
      // WebSocket이 연결되었을 때 실행할 로직
      console.log('WebSocket connected');
  
      // WebSocket 메시지 수신 이벤트 핸들러 등록
      socket.on('message', handleMessage);
    } else {
      // WebSocket이 연결이 해제되었을 때 실행할 로직
      console.log('WebSocket disconnected');
  
      // WebSocket 메시지 수신 이벤트 핸들러 제거
      if (socket) {
        socket.off('message', handleMessage);
      }
    }
  }, [isConnected, socket]);
  

  const handleMessage = (event) => {
    // 서버로부터 메시지를 수신한 경우 실행할 로직
    console.log('Received message:', event.data);
  };

  const connectWebSocket = () => {
    // WebSocket 서버 주소
    const serverUrl = 'ws://example.com/websocket'; // WebSocket 서버 주소로 변경해야 합니다.

    try {
      // WebSocket 연결
      const newSocket = new WS(serverUrl);
      setSocket(newSocket);

      // WebSocket이 연결되었음을 표시
      setIsConnected(true);
    } catch (error) {
      console.error('WebSocket connection failed:', error);
    }
  };

  const disconnectWebSocket = () => {
    if (socket) {
      // WebSocket 연결 해제
      socket.close();
      setSocket(null);

      // WebSocket이 연결 해제되었음을 표시
      setIsConnected(false);
    }
  };

  const takeVideo = async () => {
    if (Camera) {
      try {
        const data = await camera.recordAsync({
          maxDuration: 10,
        });
        setRecord(data.uri);
        console.log('takeVideo: ' + data.uri);

        if (socket && isConnected) {
          // 영상 데이터를 서버로 전송
          socket.send(data.uri);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const stopVideo = async () => {
    camera.stopRecording();
    console.log('끝');
  };

  if (hasCameraPermission === null || hasAudioPermission === null) {
    return <View />;
  }

  if (hasCameraPermission === false || hasAudioPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <>
      <View style={{ flex: 1 }}>
        <View style={styles.cameraContainer}>
          <Camera
            ref={(ref) => setCamera(ref)}
            style={styles.fixedRatio}
            type={type}
            ratio={'4:3'}
          />
        </View>
        <Video
          ref={video}
          style={styles.video}
          source={{
            uri: record,
          }}
          resizeMode="contain"
          repeat={true}
          onPlaybackStatusUpdate={(status) => setStatus(() => status)}
        />
        <View style={styles.buttons}>
          <Button
            title={status.isPlaying ? 'Pause' : 'Play'}
            onPress={() =>
              status.isPlaying ? video.current.pauseAsync() : video.current.playAsync()
            }
          />
        </View>
        <Button
          title="Flip Video"
          onPress={() => {
            setType(
              type === Camera.Constants.Type.back
                ? Camera.Constants.Type.front
                : Camera.Constants.Type.back
            );
          }}
        />
        <Button title="Take Video" onPress={takeVideo} />
        <Button title="Stop Video" onPress={stopVideo} />
        {isConnected ? (
          <Button title="Disconnect WebSocket" onPress={disconnectWebSocket} />
        ) : (
          <Button title="Connect WebSocket" onPress={connectWebSocket} />
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
    aspectRatio: 1,
  },
  video: {
    alignSelf: 'center',
    width: 350,
    height: 350,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

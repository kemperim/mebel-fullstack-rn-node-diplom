import React, { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { GLView } from "expo-gl";
import * as THREE from "three";
import ExpoTHREE from "expo-three";
import { Camera } from "expo-camera";
import { useFrame } from "@react-three/fiber";
import { AR } from "expo-three"; // Для AR-сессии

const ARScene = () => {
  const glRef = useRef(null);
  const sceneRef = useRef(new THREE.Scene());
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const cubeRef = useRef(null);
  const arSessionRef = useRef(null);

  useEffect(() => {
    (async () => {
      // Запрашиваем разрешение на камеру
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status !== "granted") {
        console.error("Доступ к камере не разрешен!");
        return;
      }

      if (glRef.current) {
        await setupARScene(glRef.current);
      }
    })();
  }, []);

  const setupARScene = async (gl) => {
    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;

    // 1. Создаем сцену Three.js
    const scene = sceneRef.current;

    // 2. Инициализируем AR-сессию
    const arSession = await AR.startARSessionAsync();
    arSessionRef.current = arSession;

    // 3. Настраиваем AR-камеру
    const camera = ExpoTHREE.createARCamera(
      arSession,
      width,
      height,
      0.01,
      1000
    );
    cameraRef.current = camera;

    // 4. Создаем рендерер Three.js
    const renderer = ExpoTHREE.createRenderer({ gl });
    renderer.setSize(width, height);
    rendererRef.current = renderer;

    // 5. Устанавливаем AR-фон (реальный мир)
    scene.background = ExpoTHREE.createARBackgroundTexture(arSession, renderer);

    // 6. Добавляем 3D-объект (куб)
    const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.z = -0.5; // Размещаем перед камерой
    scene.add(cube);
    cubeRef.current = cube;

    // 7. Запускаем анимацию
    const animate = () => {
      requestAnimationFrame(animate);

      if (cubeRef.current) {
        cubeRef.current.rotation.x += 0.01;
        cubeRef.current.rotation.y += 0.01;
      }

      renderer.render(scene, camera);
      gl.endFrameEXP();
    };

    animate();
  };

  return (
    <View style={styles.container}>
      <GLView
        style={{ flex: 1 }}
        onContextCreate={glRef.current ? undefined : (gl) => (glRef.current = gl)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ARScene;
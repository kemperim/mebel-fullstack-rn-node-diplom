import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { GLView } from 'expo-gl';
import * as THREE from 'three';

const ARScene = () => {
  const onContextCreate = async (gl) => {
    try {
      // Создаем сцену
      const scene = new THREE.Scene();
      
      // Создаем камеру
      const { width, height } = Dimensions.get('window');
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.z = 0.5;
      
      // Создаем рендерер
      const renderer = new THREE.WebGLRenderer({
        canvas: {
          width: width,
          height: height,
          style: {},
          addEventListener: () => {},
          removeEventListener: () => {},
          clientHeight: height,
        },
        context: gl,
        alpha: true,
      });
      renderer.setSize(width, height);
      renderer.setClearColor(0x000000, 0);
      
      // Создаем куб
      const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
      const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const cube = new THREE.Mesh(geometry, material);
      scene.add(cube);
      
      // Добавляем освещение
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);
      
      const pointLight = new THREE.PointLight(0xffffff, 1);
      pointLight.position.set(10, 10, 10);
      scene.add(pointLight);
      
      // Функция анимации
      const animate = () => {
        requestAnimationFrame(animate);
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        renderer.render(scene, camera);
        gl.endFrameEXP();
      };
      
      animate();
      
    } catch (err) {
      console.error("Ошибка создания сцены:", err);
    }
  };

  return (
    <View style={styles.container}>
      <GLView
        style={StyleSheet.absoluteFill}
        onContextCreate={onContextCreate}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
});

export default ARScene;
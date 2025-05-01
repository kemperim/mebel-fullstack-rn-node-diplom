import React from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

const WebViewScreen = () => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Three.js Scene</title>
        <style>
            body { margin: 0; }
            canvas { display: block; }
        </style>
    </head>
    <body>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
        <script>
            // Создаем сцену
            const scene = new THREE.Scene();
            scene.background = new THREE.Color(0x87CEEB); // Голубой фон
            
            // Создаем камеру
            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.z = 5;
            
            // Создаем рендерер
            const renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            document.body.appendChild(renderer.domElement);
            
            // Создаем объекты
            const geometries = [
                new THREE.BoxGeometry(1, 1, 1),
                new THREE.SphereGeometry(0.5, 32, 32),
                new THREE.ConeGeometry(0.5, 1, 32),
                new THREE.TorusGeometry(0.5, 0.2, 16, 32)
            ];
            
            const materials = [
                new THREE.MeshPhongMaterial({ color: 0xff0000, specular: 0x111111, shininess: 30 }),
                new THREE.MeshPhongMaterial({ color: 0x00ff00, specular: 0x111111, shininess: 30 }),
                new THREE.MeshPhongMaterial({ color: 0x0000ff, specular: 0x111111, shininess: 30 }),
                new THREE.MeshPhongMaterial({ color: 0xffff00, specular: 0x111111, shininess: 30 })
            ];
            
            const meshes = [];
            geometries.forEach((geometry, index) => {
                const mesh = new THREE.Mesh(geometry, materials[index]);
                mesh.position.x = (index - 1.5) * 2;
                scene.add(mesh);
                meshes.push(mesh);
            });
            
            // Добавляем освещение
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
            scene.add(ambientLight);
            
            const pointLight1 = new THREE.PointLight(0xffffff, 1);
            pointLight1.position.set(2, 2, 2);
            scene.add(pointLight1);
            
            const pointLight2 = new THREE.PointLight(0xffffff, 0.5);
            pointLight2.position.set(-2, -2, -2);
            scene.add(pointLight2);
            
            // Анимация
            function animate() {
                requestAnimationFrame(animate);
                
                // Вращаем каждый объект по-разному
                meshes.forEach((mesh, index) => {
                    mesh.rotation.x += 0.01;
                    mesh.rotation.y += 0.01 + (index * 0.005);
                    // Добавляем небольшое движение вверх-вниз
                    mesh.position.y = Math.sin(Date.now() * 0.001 + index) * 0.5;
                });
                
                renderer.render(scene, camera);
            }
            animate();
            
            // Обработка изменения размера окна
            window.addEventListener('resize', () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            });
        </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        source={{ html: htmlContent }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});

export default WebViewScreen;
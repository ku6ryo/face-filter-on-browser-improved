import * as tf from "@tensorflow/tfjs-core"
import "@tensorflow/tfjs-backend-webgl"
import * as detection from "@tensorflow-models/face-landmarks-detection"
import * as THREE from "three"
import { TRIANGLES } from "./triangle"
import { UVs } from "./uv"
import { uniforms, rainbowChecker as mat } from "./materials"
import { OrthographicCamera } from "three"
import Stats from 'three/examples/jsm/libs/stats.module';

const stats = new (Stats as any)();
stats.showPanel(0);
document.body.appendChild(stats.dom);


window.addEventListener("DOMContentLoaded", async () => {
  await tf.setBackend("webgl")
  let time = 0
  let camera: null | OrthographicCamera = null
  const model = await detection.load(detection.SupportedPackages.mediapipeFacemesh)
  const update = async () => {
    stats.begin();
    time += 0.1
    threeRenderer.render(scene, camera!)
    stats.end()
    requestAnimationFrame(() => update())
  }
  const videoElem = document.createElement("video")
  videoElem.style.position = "absolute"
  videoElem.style.top = "0"
  videoElem.style.left = "0"
  videoElem.style.zIndex = "1"
  videoElem.autoplay = true
  videoElem.addEventListener("playing", () => {
    const vw = videoElem.videoWidth
    const vh = videoElem.videoHeight
    threeRenderer.setSize(videoElem.videoWidth, videoElem.videoHeight)
    camera = new THREE.OrthographicCamera(-vw / 2, vw / 2, vh / 2, -vh / 2, 1, 10000)
    camera.position.setZ(1000)
    camera.lookAt(0, 0, 0)
    update()
    startDetection()
  })
  document.body.appendChild(videoElem)
  const stream = await navigator.mediaDevices.getUserMedia({ video: true })
  videoElem.srcObject = stream

  const threeCanvas = document.createElement("canvas")
  threeCanvas.style.position = "absolute"
  threeCanvas.style.top = "0"
  threeCanvas.style.left = "0"
  threeCanvas.style.zIndex = "1"
  document.body.appendChild(threeCanvas)

  const threeRenderer = new THREE.WebGLRenderer({ alpha: true, canvas: threeCanvas })
  threeRenderer.setPixelRatio(2)
  const scene = new THREE.Scene();
  const light = new THREE.DirectionalLight(0xffffff)
  light.position.set(1, 1, 1);
  scene.add(light)
  const positions = new Float32Array(468 * 3)
  const uvs = new Float32Array(468 * 2);
  for (let j = 0; j < 468; j++) {
    uvs[j * 2] = UVs[j][0]
    uvs[j * 2 + 1] = 1 - UVs[j][1]
  }
  const faceGeometry = new THREE.BufferGeometry()
  faceGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3))
  faceGeometry.getAttribute("position").needsUpdate = true
  faceGeometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2))
  faceGeometry.getAttribute("uv").needsUpdate = true
  faceGeometry.setIndex(TRIANGLES)
  faceGeometry.computeVertexNormals()
  scene.add(new THREE.Mesh(faceGeometry, mat));

  const startDetection = async () => {
    while (true) {
      const predictions = await model.estimateFaces({
        input: videoElem
      })
      if (predictions.length > 0) {
        const prediction = predictions[0]
        const mesh = (prediction as any).scaledMesh as number[][]
        mesh.forEach((v, i) => {
          positions[3 * i] = v[0] - 320
          positions[3 * i + 1] = - v[1] + 240
          positions[3 * i + 2] = v[2]
        })
        faceGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
        faceGeometry.getAttribute("position").needsUpdate = true;
        faceGeometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2))
        faceGeometry.getAttribute("uv").needsUpdate = true;
        faceGeometry.computeVertexNormals()
      }
      uniforms.iResolution.value.set(threeCanvas.width, threeCanvas.height, 1);
      uniforms.iTime.value = time;
    }
  }
})

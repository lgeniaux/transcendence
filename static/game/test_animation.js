import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

function render(p) {
	const delta = p.clock.getDelta();
	p.cameraMixer.update(delta);
	p.lookatMixer.update(delta);
	// p.controls.update();
	p.camera.lookAt(p.model.getObjectByName('CameraLookat').position);
	p.renderer.render(p.scene, p.camera);
	console.log(p.camera.position, p.model.getObjectByName('CameraLookat').position);
	requestAnimationFrame(() => render(p));
}

async function test_animation() {
	const canvas = document.querySelector('#canvas');
	const renderer = new THREE.WebGLRenderer({ canvas });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
	renderer.shadowMap.enabled = true;
	const aspect = canvas.clientWidth / canvas.clientHeight;
	let camera = new THREE.PerspectiveCamera(30, aspect, 0.1, 1000);
	camera.position.x = 15;
	camera.position.y = 15;
	camera.position.z = 15;

	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0xFFFFFF);

	const loader = new GLTFLoader();
	let cameraMixer;
	let lookatMixer;
	loader.load('static/models/arcade_room.gltf', (gltf) => {
		const model = gltf.scene;
		model.position.set(0, 0, 0);
		const animations = gltf.animations;
		const cameraAnimation = animations[0];

		camera.lookAt(model.getObjectByName('CameraLookat').position);

		if (cameraAnimation) {
			cameraMixer = new THREE.AnimationMixer(camera);
			lookatMixer = new THREE.AnimationMixer(model.getObjectByName('CameraLookat'));
			
	
			cameraAnimation.tracks.forEach((track) => {
				if (track.name.includes('GameIsoCam.')) {
					track.name = track.name.replace('GameIsoCam', camera.uuid);
				}
			});

			let action = cameraMixer.clipAction(cameraAnimation);
			action.play();
			action.repetitions = 1;
			action.clampWhenFinished = true;
			action = lookatMixer.clipAction(animations[1]);
			action.play();
			action.repetitions = 1;
			action.clampWhenFinished = true;
		};


		scene.add(model);
		const rectLight = new THREE.RectAreaLight(0xFEB9FF, 5, 10, 10);
		rectLight.position.set(0, 6.76781, 0);
		rectLight.lookAt(0, 0, 0);
		scene.add(rectLight);

		const mat = model.getObjectByName('Screen').material
		mat.color.r = 1;
		mat.color.g = 0;
		mat.color.b = 1;
		console.log(mat);

		model.traverse((child) => {
			if (child.isLight) {
				child.intensity = 0;
			}
		});

		let p = {
			camera: camera,
			canvas: canvas,
			scene: scene,
			renderer: renderer,
			clock: new THREE.Clock(),
			// controls: new OrbitControls(camera, canvas),
			cameraMixer: cameraMixer,
			lookatMixer: lookatMixer,
			model: model,
		};
		requestAnimationFrame(() => render(p));
	}, (xhr) => {
		console.log((xhr.loaded / xhr.total * 100) + '% loaded');
	}, (error) => {
		console.error('An error happened', error);
	});
}

test_animation();
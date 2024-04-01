import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import { RenderPixelatedPass } from 'three/addons/postprocessing/RenderPixelatedPass.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { InvertShader } from './shaders/invertShader.js';
import { createMeshes } from './createMeshes.js';
import { createEventListeners } from './eventListeners.js';
import { render, renderOnce } from './render.js';
import { loadContent } from '../utils.js';

/**
 * @returns {Object}: An object with the properties of the game:
 * 	- clock: a THREE.Clock object
 * 	- animations: an array of THREE.AnimationClip objects
 * 	- meshes: an object with the meshes of the game
 * 	- renderer: a THREE.WebGLRenderer object
 * 	- composer: a THREE.EffectComposer object
 * 	- scene: a THREE.Scene object
 * 	- camera: a THREE.PerspectiveCamera object
 * 	- rules: an object with the rules of the game:
 * 		- maxHeight: the maximum height of the game
 * 		- maxWidth: the maximum width of the game
 * 		- maxPoints: the maximum number of points
 * 		- paddleSpeed: the speed of the paddles
 * 		- ballSpeed: the speed of the ball
 * 		- ballMaxSpeed: the maximum speed of the ball
 * 		- pointTimeout: the time in milliseconds between points
 * 		- effect3D: a boolean to enable the 3D effect
 * 	- canvas: a HTMLCanvasElement object
 * 	- scoreL: the score of the left player
 * 	- scoreR: the score of the right player
 */
async function createGame() {
	return (new Promise((resolve) => {
		const canvas = document.querySelector('#canvas');
		const renderer = new THREE.WebGLRenderer({ canvas });
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

		const scene = new THREE.Scene();

		let cameraMixer;
		let lookatMixer;
		new GLTFLoader().load('static/models/arcade_room.gltf', (gltf) => {
			const model = gltf.scene;
			const camera = model.getObjectByName('GameIsoCam');
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();
			const lookat = model.getObjectByName('CameraLookat');
			const screen = model.getObjectByName('Screen');
			const screenSize = screen.geometry.boundingBox.getSize(new THREE.Vector3());
			const aspect = screenSize.z / screenSize.y;


			if (gltf.animations.length == 2) {
				cameraMixer = new THREE.AnimationMixer(camera);
				lookatMixer = new THREE.AnimationMixer(lookat);
				const cameraAnimation = gltf.animations[0];
				cameraAnimation.tracks.forEach((track) => {
					track.name = track.name.replace('GameIsoCam', camera.uuid);
				});
				let action = cameraMixer.clipAction(cameraAnimation);
				action.play();
				action.repetitions = 1;
				action.clampWhenFinished = true;
				action = lookatMixer.clipAction(gltf.animations[1]);
				action.play();
				action.repetitions = 1;
				action.clampWhenFinished = true;
			}
			scene.add(model);
		
			const gameCamera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
			gameCamera.position.z = 7;
		
			const effect3D = true;
			if (effect3D) {
				gameCamera.position.z = 7;
				gameCamera.position.y = -1.5;
				gameCamera.rotateX(THREE.MathUtils.degToRad(10));
			}
		
			const gameScene = new THREE.Scene();
			gameScene.background = new THREE.Color(0xFFFFFF);
		
			const distance = Math.sqrt(gameCamera.position.x**2 + gameCamera.position.y**2 + gameCamera.position.z**2);
			const visibleHeight = 2 * Math.tan(THREE.MathUtils.degToRad(gameCamera.fov) / 2) * distance;
			const visibleWidth = visibleHeight * aspect;
			const rules = {
				maxHeight: visibleHeight / 2,
				maxWidth: visibleWidth / 2 / 1.2,
				maxPoints: 5,
				paddleSpeed: 10,
				ballSpeed: 5,
				ballMaxSpeed: 20,
				pointTimeout: 100,
				effect3D: effect3D,
			}
		
			const meshes = createMeshes(gameScene, visibleWidth, visibleHeight, rules, model);
		
			const animations = [new THREE.AnimationClip('bump', .2, [
				new THREE.VectorKeyframeTrack('.scale', [0, 0.1, 0.2], [
					1, 1, 1,
					1.5, 1.5, 1,
					1, 1, 1
				])
			])];
		
			const renderTarget = new THREE.WebGLRenderTarget(screenSize.x, screenSize.y);
			const composer = new EffectComposer(renderer, renderTarget);
			const material = new THREE.MeshBasicMaterial({ map: renderTarget.texture });
			screen.material = material;


			composer.setPixelRatio(window.devicePixelRatio);
			composer.setSize(canvas.clientWidth, canvas.clientHeight);
			const piexelsPass = new RenderPixelatedPass(1, gameScene, gameCamera, {normalEdgeStrength: 10000});
			composer.addPass(piexelsPass);
			const invertShader = new ShaderPass(InvertShader);
			composer.addPass(invertShader);
			const antiAliasingPass = new ShaderPass(FXAAShader);
			antiAliasingPass.material.uniforms['resolution'].value.y = 1 / canvas.clientHeight;
			composer.addPass(antiAliasingPass);
			const renderPass = new RenderPass(gameScene, gameCamera);
			renderPass.renderToScreen = true;
			composer.addPass(renderPass);
		
			let properties = {
				clock: new THREE.Clock(),
				animations: animations,
				meshes: meshes,
				renderer: renderer,
				composer: composer,
				scene: scene,
				camera: camera,
				rules: rules,
				canvas: canvas,
				scoreL: 0,
				scoreR: 0,
				cameraMixer: cameraMixer,
				lookatMixer: lookatMixer,
				room: model,
			};
			properties.clock.stop();
		
			createEventListeners(properties);
			renderOnce(properties);
			resolve(properties);
			displayTutorial();
		});
	}));
}

/**
 * @summary Launch a game of pong
 * @param {string} player1: name of the first player
 * @param {string} player2: name of the second player
 * @param {*} properties: the properties of the game generated by createGame
 * @returns {Promise<Object>} a promise that resolves when the game is over with
 * an object with the following properties:
 * {player1: string, player2: string, score1: number, score2: number}
 */
async function launchGame(player1 = "Left player", player2 = "Right player", properties = undefined) {
	if (!properties)
		properties = await createGame();
	await properties.clock.start();
	return new Promise(async(resolve) => {
		properties.meshes.paddleL.name = player1;
		properties.meshes.paddleR.name = player2;
		properties.promise = resolve;
		
		requestAnimationFrame(() => render(properties));
		document.querySelector('#endScreen').style.opacity = '0';
	});

}

async function displayTutorial()
{
    await loadContent('static/html/game/tutorial.html', '#endScreen');
	document.querySelector('#endScreen').style.opacity = '1';
}


export { launchGame, createGame, displayTutorial };
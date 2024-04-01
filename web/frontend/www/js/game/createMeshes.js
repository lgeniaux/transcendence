import * as THREE from 'three';
import { Paddle } from './classes/Paddle.js';
import { Ball } from './classes/Ball.js';
import { Explosion } from './classes/Explosion.js';

/**
 * Creates the meshes of the game
 * @param {*} scene The scene to add the meshes to
 * @param {Number} visibleWidth The width of the visible area
 * @param {Number} visibleHeight The height of the visible area
 * @param {*} rules The rules of the game
 * @returns {Object} An object containing the meshes
 */
function createMeshes(scene, visibleWidth, visibleHeight, rules) {

	const meshes = {};

	const texture = new THREE.TextureLoader().load("/static/textures/reverse_center_line.png");
	texture.repeat.set(1, visibleHeight);
	texture.wrapT = THREE.RepeatWrapping;
	texture.minFilter = THREE.NearestFilter;
	texture.magFilter = THREE.NearestFilter;
	const centerLine = new THREE.Mesh(
		new THREE.PlaneGeometry(.1, visibleHeight * 1.15),
		new THREE.MeshBasicMaterial({ map: texture })
	);
	centerLine.position.x = 0;
	centerLine.position.z = -1;
	if (rules.effect3D)
		centerLine.position.y = .25;
	scene.add(centerLine);

	const ball = new Ball({ x: 0, y: 0, z: 0 }, new THREE.Vector2(-1, -1.3), rules.ballSpeed, rules.effect3D);
	meshes.ball = ball;
	scene.add(ball.mesh);

	const paddleL = new Paddle({ x: -(visibleWidth / 2) / 1.3, y: 0, z: 0 }, { 'up': 'KeyW', 'down': 'KeyS' }, rules.effect3D);
	meshes.paddleL = paddleL;
	scene.add(paddleL.mesh);
	const paddleR = new Paddle({ x: (visibleWidth / 2) / 1.3, y: 0, z: 0 }, { 'up': 'ArrowUp', 'down': 'ArrowDown' }, rules.effect3D);
	meshes.paddleR = paddleR;
	scene.add(paddleR.mesh);

	const explosion = new Explosion({ x: 0, y: 0, z: 0 }, .1, 0xFEFEFE, 10, rules.effect3D);
	meshes.explosion = explosion;
	for (const cube of explosion.cubes) {
		scene.add(cube.mesh);
	}

	return (meshes);
}

export { createMeshes };
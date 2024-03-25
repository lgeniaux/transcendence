import * as THREE from 'three';
import { Cube } from './Cube.js';
import { Ball } from './Ball.js';

/**
 * @typedef {Object} Point
 * @property {number} x - The x coordinate.
 * @property {number} y - The y coordinate.
 * @property {number} z - The z coordinate.
 */


class Explosion {
	constructor(position = {x: 0, y:0, z:0}, size = .1, color = 0xFEFEFE, amount = 10, is_3D = false) {
		this.x = position.x;
		this.y = position.y;
		this.z = position.z;
		this.size = size;
		this.color = color;
		this.amount = amount;
		this.is_3D = is_3D;
		this.ttd = 0;
		this.direction = new THREE.Vector2(0, 0);
		this.speed = 0;
		this.cubes = [];
		for (let i = 0; i < this.amount; i++) {
			this.cubes.push(new Cube(position, this.size, this.color, this.is_3D));
			this.cubes[i].mesh.material.opacity = 0;
			this.cubes[i].mesh.material.transparent = true;
			this.cubes[i].mesh.visible = false;
		}
	}

	/**
	 * Creates an explosion based on the ball that caused it
	 * @param {number} ttd: The time to die of the explosion
	 * @param {Ball} ball: The ball that caused the explosion
	 */
	explode(ttd = 1, ball) {
		this.cubes.forEach(cube => {
			cube.mesh.position.x = ball.mesh.position.x + (Math.random() - .5) * ball.size;
			cube.mesh.position.y = ball.mesh.position.y + (Math.random() - .5) * ball.size;
			cube.mesh.position.z = ball.mesh.position.z + (Math.random() - .5) * ball.size;
			cube.mesh.visible = true;
		});
		this.ttd = ttd;
		this.direction.x = -ball.direction.x;
		this.direction.y = ball.direction.y;
		this.speed = ball.speed;
	}

	/**
	 * updates every cube based on the delta time, and updates there opacity
	 * based on the time to die and the p.rules.PointTimeout
	 * @param {number} delta: The time in seconds since the last frame
	 * @param {any} p: Properties of the game
	 */
	update(delta, p) {
		if (this.ttd > 0) {
			this.ttd -= delta * 50;
			let progression = Math.max(0, Math.min(1, this.ttd / p.rules.pointTimeout - .2));
			this.cubes.forEach(cube => {
				cube.material.opacity = progression;
				cube.mesh.position.x += this.direction.x * this.speed * progression * delta * Math.random();
				cube.mesh.position.y += this.direction.y * this.speed * progression * delta * Math.random();
			});
		}
		else if (this.ttd != -1) {
			this.cubes.forEach(cube => {
				cube.mesh.visible = false;
			});
			this.ttd = -1;
		}
	}
}

export { Explosion };
import * as THREE from 'three';
import { Cube } from './Cube.js';
import { Paddle } from './Paddle.js';

/**
 * @typedef {Object} Point
 * @property {number} x - The x coordinate.
 * @property {number} y - The y coordinate.
 * @property {number} z - The z coordinate.
 */

class Ball extends Cube {
	constructor(position = { x: 0, y: 0, z: 0 }, direction = new THREE.Vector2(1, 1), speed = 10, is_3D = false, size = 0.25, color = 0xFEFEFE) {
		super(position, size, color, is_3D);
		this.speed = speed;
		this.timeout = 150;
		this.mesh.visible = false;
		this.setDirection(direction);
		this.mixer = new THREE.AnimationMixer(this.mesh);
	}

	/**
	 * Sets the direction of the ball and normalizes it
	 * @param {THREE.Vector2} direction The new direction of the ball
	 */
	setDirection(direction) {
		this.direction = {
			x: direction.x,
			y: direction.y
		};
		let magnitude = Math.sqrt(this.direction.x * this.direction.x + this.direction.y * this.direction.y);
		this.direction.x /= magnitude;
		this.direction.y /= magnitude;
	}

	/**
	 * Resets the ball after a point is scored & decreases its speed
	 * @param {Point} step The position of the ball after the next step
	 * @param {*} p Properties of the game
	 */
	reset(step, p) {
		this.direction.x *= -1;
		this.mesh.visible = false;
		this.timeout = p.rules.pointTimeout;
		step.x = 0;
		this.speed *= 0.8;
	}

	/**
	 * Checks if the ball will hit a paddle on the next step and returns the height at which it will hit the paddle
	 * @param {Paddle} paddle The paddle to check for collision
	 * @param {Point} step The position of the ball after the next step
	 * @param {Point} position The current position of the ball
	 * @returns {Number} The height at which the ball hit the paddle, or `-1` if it didn't hit the paddle
	 */
	paddleInteraction(paddle, step, position) {
		const halfSize = this.size / 2;
		const ballXChecks = [
			position.x - halfSize,
			step.x + halfSize,
			position.x + halfSize,
			step.x - halfSize,
		];
		const ballYChecks = [
			position.y - halfSize,
			step.y + halfSize,
			position.y + halfSize,
			step.y - halfSize,
		];

		if (Math.max(...ballXChecks) > paddle.mesh.position.x - paddle.width / 2 &&
			Math.min(...ballXChecks) < paddle.mesh.position.x + paddle.width / 2 &&
			Math.max(...ballYChecks) > paddle.mesh.position.y - paddle.height / 2 &&
			Math.min(...ballYChecks) < paddle.mesh.position.y + paddle.height / 2)
			return (Math.min(Math.max(position.y - paddle.mesh.position.y + paddle.height / 2, 0), paddle.height));
		return (-1);
	}

	/**
	 * Checks if the ball is in timeout and decreases the timeout if it is
	 * @param {Number} delta The time since the last frame
	 * @returns {Boolean} `true` if the ball is in timeout, `false` otherwise
	 */
	checkTimeout(delta) {
		if (this.timeout > 0) {
			if (this.timeout <= 1)
				this.mesh.visible = true;
			this.timeout -= delta * 50;
			return (true);
		}
		this.mesh.visible = true;
		return (false);
	}

	/**
	 * Checks if the ball is going too fast and decreases its speed if it is or increases it if it is too slow
	 * @param {Number} ballMaxSpeed The maximum speed of the ball
	 */
	checkSpeed(ballMaxSpeed) {
		if (this.speed > ballMaxSpeed)
			this.speed = ballMaxSpeed;
		else if (this.speed < 2)
			this.speed = 2;
	}

	/**
	 * Checks if the ball will be out of bounds on the next step and bounces it if it will
	 * @param {Point} step The position of the ball after the next step
	 * @param {*} rules Rules of the game
	 */
	checkBallOutOfBounds(step, rules) {
		if (step.y >= rules.maxHeight - this.size / 2) {
			step.y = rules.maxHeight - this.size / 2 - .01;
			if (this.direction.y > 0)
				this.direction.y *= -1;
		}
		else if (step.y <= -rules.maxHeight + this.size / 2) {
			step.y = -rules.maxHeight + this.size / 2 + .01;
			if (this.direction.y < 0)
				this.direction.y *= -1;
		}
	}

	/**
	 * Checks if the ball will bounce on a paddle on the next step and bounces it if it will
	 * @param {Point} step The position of the ball after the next step
	 * @param {*} p Properties of the game
	 * @param {Paddle} paddleL The left paddle
	 * @param {Paddle} paddleR The right paddle
	 * @returns {Boolean} `true` if the ball bounced on a paddle, `false` otherwise
	 */
	checkBallPaddlesBounce(step, p, paddleL, paddleR) {
		const paddleRIntersection = this.paddleInteraction(paddleR, step, this.mesh.position);
		if (paddleRIntersection != -1 && this.direction.x > 0) {
			if (step.x >= p.rules.maxWidth - this.size / 2)
				step.x = p.rules.maxWidth - this.size / 2;
			this.direction.x *= -1;
			this.setDirection(new THREE.Vector2(this.direction.x, paddleRIntersection / paddleR.height * 2 - 1));
			paddleR.bump(p);
			this.speed *= 1.1;
			return (true);
		}
		const paddleLIntersection = this.paddleInteraction(paddleL, step, this.mesh.position);
		if (paddleLIntersection != -1 && this.direction.x < 0) {
			if (step.x <= -p.rules.maxWidth + this.size / 2)
				step.x = -p.rules.maxWidth + this.size / 2;
			this.direction.x *= -1;
			this.setDirection(new THREE.Vector2(this.direction.x, paddleLIntersection / paddleL.height * 2 - 1));
			paddleL.bump(p);
			this.speed *= 1.1;
			return (true);
		}
		return (false);
	}

	/**
	 * Checks if the ball will score a point on the next step and scores it if it will
	 * @param {Point} step The position of the ball after the next step
	 * @param {*} p Properties of the game
	 */
	checkBallScored(step, p) {
		if (step.x >= p.rules.maxWidth - this.size / 2) {
			step.x = p.rules.maxWidth - this.size / 2;
			this.reset(step, p);
			if (document.getElementById('scoreL'))
				p.scoreL = ++document.getElementById('scoreL').innerHTML;
			p.meshes.explosion.explode(p.rules.pointTimeout, this);
		}
		else if (step.x <= -p.rules.maxWidth + this.size / 2) {
			step.x = -p.rules.maxWidth + this.size / 2;
			this.reset(step, p);
			if (document.getElementById('scoreR'))
				p.scoreR = ++document.getElementById('scoreR').innerHTML;
			p.meshes.explosion.explode(p.rules.pointTimeout, this);
		}
	}


	update(delta, p) {
		this.mixer.update(delta);
		if (this.checkTimeout(delta))
			return;
		this.checkSpeed(p.rules.ballMaxSpeed);

		const step = {
			x: this.mesh.position.x + this.direction.x * this.speed * delta,
			y: this.mesh.position.y + this.direction.y * this.speed * delta
		}

		this.checkBallOutOfBounds(step, p.rules);

		if (this.checkBallPaddlesBounce(step, p, p.meshes.paddleL, p.meshes.paddleR))
			return;

		this.checkBallScored(step, p);

		this.mesh.position.x = step.x;
		this.mesh.position.y = step.y;
	}
}

export { Ball };
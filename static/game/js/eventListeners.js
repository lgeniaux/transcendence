import { Ball } from "./classes/Ball.js";
import { Paddle } from "./classes/Paddle.js";

/**
 * Creates the event listeners for the game (resize, visibility change)
 * @param {*} p The properties of the game
 * @param {Ball} ball The ball of the game
 * @param {Paddle} paddleL The left paddle
 * @param {Paddle} paddleR The right paddle
 * @param {*} rules The rules of the game
 * @param {Number} visibleHeight The height of the visible area
 */
function createEventListeners(p, ball, paddleL, paddleR, rules, visibleHeight) {
	window.addEventListener('resize', () => {
		p.renderer.setPixelRatio(window.devicePixelRatio);
		p.renderer.setSize(p.canvas.clientWidth, p.canvas.clientHeight, false);
		p.composer.setSize(p.canvas.clientWidth, p.canvas.clientHeight);
		p.camera.aspect = p.canvas.clientWidth / p.canvas.clientHeight;
		p.camera.updateProjectionMatrix();
		// const visibleWidth = visibleHeight * p.camera.aspect;
		// rules.maxWidth = visibleWidth / 2 / 1.2;
		// paddleL.mesh.position.x = -(visibleWidth / 2) / 1.3;
		// paddleR.mesh.position.x = (visibleWidth / 2) / 1.3;
		// if (ball.mesh.position.x > rules.maxWidth - ball.size / 2) {
		// 	ball.mesh.position.x = rules.maxWidth - ball.size / 2;
		// 	if (ball.direction.x > 0)
		// 		ball.direction.x *= -1;
		// }
		// else if (ball.mesh.position.x < -rules.maxWidth + ball.size / 2) {
		// 	ball.mesh.position.x = -rules.maxWidth + ball.size / 2;
		// 	if (ball.direction.x < 0)
		// 		ball.direction.x *= -1;
		// }
	});

	document.addEventListener('visibilitychange', () => {
		if (document.visibilityState === 'visible')
			p.clock.start();
		else
			p.clock.stop();
	});
}

export { createEventListeners };
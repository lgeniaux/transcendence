import { Ball } from "./classes/Ball.js";
import { Paddle } from "./classes/Paddle.js";

/**
 * Creates the event listeners for the game (resize, visibility change)
 * @param {*} p The properties of the game
 */
function createEventListeners(p) {
	window.addEventListener('resize', () => {
		p.renderer.setPixelRatio(window.devicePixelRatio);
		p.renderer.setSize(p.canvas.clientWidth, p.canvas.clientHeight, false);
		p.composer.setSize(p.canvas.clientWidth, p.canvas.clientHeight);
		p.camera.aspect = p.canvas.clientWidth / p.canvas.clientHeight;
		p.camera.updateProjectionMatrix();
	});

	document.addEventListener('visibilitychange', () => {
		if (document.visibilityState === 'visible')
			p.clock.start();
		else
			p.clock.stop();
	});
}

export { createEventListeners };
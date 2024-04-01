import * as THREE from 'three';

class Paddle {
	constructor(position = {x: 0, y:0, z:0}, keys = {'up': 'ArrowUp', 'down': 'ArrowDown'}, is_3D = false, width = 0.25, height = 1, color = 0xFEFEFE) {
		this.x = position.x;
		this.y = position.y;
		this.z = position.z;
		this.width = width;
		this.height = height;
		this.color = -color;
		this.geometry = new THREE.BoxGeometry(this.width, this.height, is_3D ? 0.2 : 0);
		this.material = new THREE.MeshBasicMaterial({ color: this.color });
		this.mesh = new THREE.Mesh(this.geometry, this.material);
		this.mesh.position.set(this.x, this.y, this.z);
		this.mixer = new THREE.AnimationMixer(this.mesh);
		this.Up = false;
		this.Down = false;

		window.addEventListener('keydown', (event) => {
			if (event.code == keys.up) {
				this.Up = true;
			}
			else if (event.code == keys.down) {
				this.Down = true;
			}
		});
		window.addEventListener('keyup', (event) => {
			if (event.code == keys.up) {
				event.preventDefault();
				this.Up = false;
			}
			else if (event.code == keys.down) {
				event.preventDefault();
				this.Down = false;
			}
		});
	}

	setColor(color) {
		this.color = color;
		this.material = new THREE.MeshBasicMaterial({ color: this.color });
	}

	bump(p) {
		this.mixer = new THREE.AnimationMixer(this.mesh);
		this.clipAction = this.mixer.clipAction(p.animations[0]);
		this.clipAction.repetitions = 1;
		this.clipAction.play();
	}

	update(delta, p) {
		if (this.Up)
			this.mesh.position.y += p.rules.paddleSpeed * delta;
		if (this.Down)
			this.mesh.position.y -= p.rules.paddleSpeed * delta;
		if (this.mesh.position.y + this.height / 2 > p.rules.maxHeight)
			this.mesh.position.y = p.rules.maxHeight - this.height / 2;
		if (this.mesh.position.y - this.height / 2 < -p.rules.maxHeight)
			this.mesh.position.y = -p.rules.maxHeight + this.height / 2;
		this.mixer.update(delta);
	}
}

export { Paddle };
import * as THREE from 'three';

class Cube {
	constructor(position = {x: 0, y:0, z:0}, size, color, is_3D = false) {
		this.x = position.x;
		this.y = position.y;
		this.z = position.z;
		this.size = size;
		this.color = -color;
		this.geometry = new THREE.BoxGeometry(this.size, this.size, is_3D ? this.size : 0);
		this.material = new THREE.MeshBasicMaterial({ color: this.color });
		this.mesh = new THREE.Mesh(this.geometry, this.material);
		this.mesh.position.set(this.x, this.y, this.z);
	}

	setColor(color) {
		this.color = color;
		this.material = new THREE.MeshBasicMaterial({ color: this.color });
	}

	update(delta, p) {
		const time = p.clock.getElapsedTime();
		this.mesh.position.x = this.x + Math.cos(time);
		this.mesh.position.y = this.y + Math.sin(time);
	}
}

export { Cube };
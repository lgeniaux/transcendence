import * as THREE from 'three';

var InvertShader = new THREE.ShaderMaterial({
	uniforms: {
		tDiffuse: { type: "t", value: null }
	},
	vertexShader: `
		varying vec2 vUv;
		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
		}
	`,
	fragmentShader: `
		uniform sampler2D tDiffuse;
		varying vec2 vUv;
		void main() {
			vec4 color = texture2D(tDiffuse, vUv);
			gl_FragColor = vec4(vec3(1.0) - color.rgb, color.a);
		}
	`,
	depthWrite: false
});

export { InvertShader };
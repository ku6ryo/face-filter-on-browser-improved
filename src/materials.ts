import { ShaderMaterial, Vector3 } from "three"

export const uniforms = {
  iTime: { value: 0 },
  iResolution: { value: new Vector3() },
};

export const red = new ShaderMaterial({
  vertexShader: `
    void main() {
      vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
      vec4 mvPosition =  viewMatrix * worldPosition;
      gl_Position = projectionMatrix * mvPosition;
    }
	`,
	fragmentShader: `
    void main() {
      gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
	`
})

export const rainbow = new ShaderMaterial({
  uniforms,
	fragmentShader: `
    #include <common>

  uniform vec3 iResolution;
  uniform float iTime;

  // By iq: https://www.shadertoy.com/user/iq
  // license: Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
  void mainImage( out vec4 fragColor, in vec2 fragCoord )
  {
      // Normalized pixel coordinates (from 0 to 1)
      vec2 uv = fragCoord/iResolution.xy;

      // Time varying pixel color
      vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));

      // Output to screen
      fragColor = vec4(col,1.0);
  }

  void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
  }
	`
})

export const rainbowChecker = new ShaderMaterial({
  uniforms,
  fragmentShader: `
  #include <common>

  uniform vec3 iResolution;
  uniform float iTime;

  // By iq: https://www.shadertoy.com/user/iq  
  // license: Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
  void mainImage( out vec4 fragColor, in vec2 fragCoord )
  {
      // Normalized pixel coordinates (from 0 to 1)
      vec2 uv = fragCoord/iResolution.xy;

      // Time varying pixel color
      vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx*40.0+vec3(0,2,4));

      // Output to screen
      fragColor = vec4(col,1.0);
  }

  void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
  }
  `,
})
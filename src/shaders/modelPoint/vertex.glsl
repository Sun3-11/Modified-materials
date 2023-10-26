uniform float uTime;
uniform float uTwist;
uniform float uSlap;
uniform vec3 uCustomColor;


varying vec3 vColor;

mat2 get2dRotateMatrix(float _angle) {
  return mat2(cos(_angle), -sin(_angle), sin(_angle), cos(_angle));
}

void main() {
  float angleVertex = sin(position.y + uTime + uTwist) * uSlap;
  mat2 rotateMatrixVertex = get2dRotateMatrix(angleVertex);

  float redEffectR = smoothstep(0.0, 0.1, angleVertex - (position.x + 0.01) - (abs(position.z - 1.8)) - (abs(position.y - 0.9)));
  vColor.rgb += vec3(redEffectR, 0.0, 0.0);

  float redEffectL = smoothstep(0.0, 0.8, angleVertex - (-position.x + 0.01) - (abs(position.z - 1.7)) - (abs(position.y - 0.4)));
  vColor.rgb += vec3(redEffectL, 0.0, 0.0);

  objectNormal.xz = rotateMatrixVertex * objectNormal.xz;

  vec3 transformedVertex = vec3(position);

  float angle = sin(position.y + uTime + uTwist) * uSlap;
  mat2 rotateMatrix = get2dRotateMatrix(angle);

  transformedVertex.xz = rotateMatrix * transformedVertex.xz;

  // Apply the slapping effect to the material
  float slapEffect = sin(position.y + uTime + uTwist) * 0.4;
  transformedVertex.y += abs(slapEffect) / 10.0;
  transformedVertex.xz = rotateMatrix * transformedVertex.xz;

  vec4 mvPosition = modelViewMatrix * vec4(transformedVertex, 1.0);
  gl_Position = projectionMatrix * mvPosition;
}
#include <color_fragment>

vec4 heightMap = texture2D(uDisplacementMap, vUv);
vec4 densityMap = texture2D(uDensityMap, vUv);
vec4 perlinNoise = texture2D(uPerlinNoise, vUv * 2.0);
vec4 rockMap = texture2D(uGroundRockMap, vUv * uRockTiling);
float rockAO = texture2D(uGroundRockAO, vUv * uRockTiling).r;

float densityMask = smoothstep(0.01, 1.25, densityMap.g);
vec3 X = mix(perlinNoise.rgb, vec3(1.0), smoothstep(0.9, 1.0, densityMap.g));
float rockMask = smoothstep(0.0, 0.55, X.r);

vec3 groundColor = mix(uGroundColorLight, uGroundColorDark, heightMap.r);
groundColor = mix(groundColor, uGroundColorBelowGrass, densityMask);

vec3 rockColor = rockMap.rgb * uRockColor * mix(1.0, rockAO, 2.0 * rockMask);
groundColor = mix(rockColor, groundColor, rockMask);

float waterMask = densityMap.b;

vec2 waterGrad = vec2(dFdx(waterMask), dFdy(waterMask));
float edgeStrength = length(waterGrad) * 5.0;
float edgeSoftness = smoothstep(0.0, 1.0, edgeStrength);

waterMask = mix(waterMask, waterMask * (1.0 - edgeSoftness * 0.7), min(edgeStrength, 1.0));

vec2 waterCenter = vec2(0.53, 0.535);
float distFromCenter = length(vUv - waterCenter);

float depthGradient = 1.0 - smoothstep(0.0, 0.3, distFromCenter);
depthGradient = pow(depthGradient, uWaterDepthIntensity);

vec3 waterColor = mix(uWaterShallow, uWaterDeep, depthGradient);

// Animated underwater caustics and surface sun/moon specular shimmer
if (waterMask > 0.02) {
  vec2 causticUv1 = vUv * 18.0 + vec2(uTime * 0.14, -uTime * 0.11);
  vec2 causticUv2 = vUv * 23.0 + vec2(-uTime * 0.12, uTime * 0.16);
  float cNoise1 = texture2D(uPerlinNoise, causticUv1).r;
  float cNoise2 = texture2D(uPerlinNoise, causticUv2).g;
  float causticPattern = smoothstep(0.42, 0.78, (cNoise1 + cNoise2) * 0.55);
  float shallowFactor = (1.0 - depthGradient * 0.65) * smoothstep(0.05, 0.45, waterMask);
  waterColor += uSunColor * causticPattern * shallowFactor * 0.22 * uShimmerStrength;

  // Perturbed water surface normal for sun/moon sparkle
  vec2 waveUv1 = vUv * 32.0 + vec2(uTime * 0.25, uTime * 0.18);
  vec2 waveUv2 = vUv * 46.0 - vec2(uTime * 0.21, -uTime * 0.27);
  float w1 = texture2D(uPerlinNoise, waveUv1).r - 0.5;
  float w2 = texture2D(uPerlinNoise, waveUv2).g - 0.5;
  vec3 waterNormal = normalize(vec3((w1 + w2) * 0.38, 1.0, (w1 - w2) * 0.38));

  vec3 viewDir = normalize(cameraPosition - vWorldPosition);
  vec3 lightDir = normalize(uSunDirection);
  vec3 halfVec = normalize(lightDir + viewDir);
  float specBase = max(dot(waterNormal, halfVec), 0.0);
  float specularGlint = pow(specBase, 48.0) * 0.85 + pow(specBase, 180.0) * 1.65;
  float fresnel = pow(1.0 - max(dot(waterNormal, viewDir), 0.0), 3.0);

  vec3 skyTint = mix(uWaterShallow, uSunColor, 0.55);
  waterColor = mix(waterColor, skyTint, fresnel * 0.28 * uShimmerStrength);
  waterColor += uSunColor * specularGlint * waterMask * uShimmerStrength * 0.55;
}

groundColor = mix(groundColor, waterColor, waterMask);

diffuseColor.rgb = groundColor;


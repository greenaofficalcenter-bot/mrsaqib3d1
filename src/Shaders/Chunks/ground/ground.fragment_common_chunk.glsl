#include <common>
uniform sampler2D uDensityMap;
uniform sampler2D uDisplacementMap;
uniform sampler2D uPerlinNoise;
uniform sampler2D uGroundRockMap;
uniform sampler2D uGroundRockAO;
uniform vec3 uGroundSize;
uniform vec3 uGroundColorLight;
uniform vec3 uGroundColorDark;
uniform vec3 uGroundColorBelowGrass;
uniform vec3 uRockColor;
uniform float uRockTiling;
uniform vec3 uWaterShallow;
uniform vec3 uWaterDeep;
uniform float uWaterDepthIntensity;
uniform float uTime;
uniform vec3 uSunDirection;
uniform vec3 uSunColor;
uniform float uShimmerStrength;
varying vec2 vUv;
varying vec3 vWorldPosition;


#version 450

layout(location = 0) in vec3 fragColor;
layout(location = 1) in vec2 fragTexCoord;

layout(location = 0) out vec4 outColor;
layout(binding = 2) uniform sampler2D texSampler;

layout(binding = 1) uniform Uniforms {
    vec2 iResolution; // Screen resolution
    float iTime;      // Elapsed time
};

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

vec3 drawLight(vec2 uv, vec2 lightPos, vec3 lightColor, float time) {
    float distanceToLight = length(uv - lightPos); // Distance to the light
    float glow = exp(-distanceToLight * 25.0) * 0.5; // Outer glow
    glow += exp(-distanceToLight * 100.0) * 0.8;    // Inner core
    float flicker = 0.5 + 0.5 * sin(10.0 * time + distanceToLight * 20.0); // Flickering
    return glow * flicker * lightColor;
}

void main() 
{
    // Get UV coordinates and base texture color
    vec2 uv = (gl_FragCoord.xy / iResolution.xy) * 2.0 - 1.0;
    uv.x *= iResolution.x / iResolution.y; // Adjust for aspect ratio
    vec4 baseColor = texture(texSampler, fragTexCoord);

    // Initialize light effect color
    vec3 lightEffect = vec3(0.0);

    // Add multiple lights
    for (int i = 0; i < 3; i++) {
        vec2 lightPos = vec2(hash(vec2(i, iTime)) * 2.0 - 1.0, hash(vec2(i + 100.0, iTime)) * 2.0 - 1.0);
        vec3 lightColor = vec3(hash(vec2(i, 0.0)), hash(vec2(i, 1.0)), hash(vec2(i, 2.0)));
        lightEffect += drawLight(uv, lightPos, lightColor, iTime);
    }

    // Final output color: base texture + light effect
    vec3 finalColor = baseColor.rgb + lightEffect;
    finalColor = min(finalColor, vec3(1.0)); // Clamp to a maximum intensity of 1.0
    outColor = vec4(finalColor, baseColor.a);
    //outColor = vec4(baseColor.rgb + lightEffect, baseColor.a);
}
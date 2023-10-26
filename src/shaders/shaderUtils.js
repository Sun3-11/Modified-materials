import * as THREE from 'three'

export const customUniforms = {
    uTime : { value: 0 },
    uTwist: { value: 0 },
    uSlap : { value:0},
    uCustomColor: { value: new THREE.Color(0x000000) },
    uslapEffect: {value : 3.3},
}

export function shaderUtils(shader) {
    shader.uniforms.uTime = customUniforms.uTime;
    shader.uniforms.uTwist = customUniforms.uTwist;
    shader.uniforms.uSlap = customUniforms.uSlap;
    shader.uniforms.uCustomColor = customUniforms.uCustomColor;
    shader.uniforms.uslapEffect = customUniforms.uslapEffect;


    shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        `
        #include <common>

        uniform float uTime;
        uniform float uTwist;
        uniform float uSlap;
        uniform float uslapEffect;

        varying vec3 vColor;

        mat2 get2dRotateMatrix(float _angle) {
            return mat2(cos(_angle), -sin(_angle), sin(_angle), cos(_angle));
        }

        
        `
    );

    shader.vertexShader = shader.vertexShader.replace(
        '#include <beginnormal_vertex>',
        `
        #include <beginnormal_vertex>

        float angle = sin(position.y + uTime + uTwist) * uSlap; //(0.10);
        mat2 rotateMatrix = get2dRotateMatrix(angle);

        float redEffectR = smoothstep(0.0, 0.1, angle = (position.x + 0.01) - (abs(position.z - 1.8)) - (abs(position.y - 0.9))) / uslapEffect;
        vColor.rgb += vec3(redEffectR, 0.0, 0.0);

        float redEffectL = smoothstep(0.0, 0.8, angle = (-position.x + 0.01) - (abs(position.z - 1.7)) - (abs(position.y - 0.4))) / uslapEffect;
        vColor.rgb += vec3(redEffectL, 0.0, 0.0);        

        objectNormal.xz = rotateMatrix * objectNormal.xz;
    
            
        `
    );

    shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
        #include <begin_vertex>

        transformed.xz = rotateMatrix * transformed.xz;

        transformed.xz = rotateMatrix * transformed.xz;

        // Apply the slapping effect to the material
        float slapEffect = sin(position.y + uTime + uTwist) * 0.4;
        transformed.y += abs(slapEffect) / 10.0;
        transformed.xz = rotateMatrix * transformed.xz;
        `
    );
    shader.fragmentShader = shader.fragmentShader.replace(
        '#include <common>',
        `
        #include <common>

        uniform vec3 uCustomColor;

        varying vec3 vColor;

        `
    );

    shader.fragmentShader = shader.fragmentShader.replace(
        '#include <color_fragment>',
        `
        #include <color_fragment>

        diffuseColor.rgb += uCustomColor * vColor ;

        `
    );
    
}

export function depshaderUtils(shader) {
    shader.uniforms.uTime = customUniforms.uTime
    shader.uniforms.uTwist = customUniforms.uTwist;
    shader.uniforms.uSlap = customUniforms.uSlap;

    shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        `
            #include <common>

            uniform float uTime;
            uniform float uTwist;
            uniform float uSlap;

            mat2 get2dRotateMatrix(float _angle)
            {
                return mat2(cos(_angle), -sin(_angle), sin(_angle), cos(_angle));
            }
        `
    )
    
    shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
            #include <begin_vertex>

            float angle = sin(position.y + uTime + uTwist) * uSlap; //(0.10);
            mat2 rotateMatrix = get2dRotateMatrix(angle);

            
            transformed.xz = rotateMatrix * transformed.xz;

            transformed.xz = rotateMatrix * transformed.xz;
    
            // Apply the slapping effect to the material
            float slapEffect = sin(position.y + uTime + uTwist) * 0.4;
            transformed.y += abs(slapEffect) / 10.0;
            transformed.xz = rotateMatrix * transformed.xz;
        `
    )

}


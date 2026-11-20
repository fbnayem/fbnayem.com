import * as THREE from 'three';

// Morphing iridescent blob + particle halo. Reacts to pointer and scroll.
const noise = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

export function mountHero(canvas: HTMLCanvasElement, reduced: boolean): () => void {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.z = 6;

  const uniforms = {
    uTime: { value: 0 },
    uAmp: { value: 0.3 },
    uMouse: { value: new THREE.Vector2() },
  };

  const blobMat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */ `
      ${noise}
      uniform float uTime; uniform float uAmp; uniform vec2 uMouse;
      varying vec3 vNormal; varying vec3 vView; varying float vN;
      void main(){
        vec3 p = position;
        float n = snoise(p * 0.9 + vec3(uTime * 0.25, uTime * 0.18, uMouse.x * 0.6));
        float n2 = snoise(p * 2.2 - uTime * 0.3) * 0.25;
        float d = (n + n2) * uAmp;
        vN = d;
        p += normal * d;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vNormal = normalize(normalMatrix * normal);
        vView = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime; varying vec3 vNormal; varying vec3 vView; varying float vN;
      void main(){
        float fres = pow(1.0 - max(dot(normalize(vNormal), vView), 0.0), 2.2);
        vec3 blue = vec3(0.14, 0.34, 0.91);
        vec3 lime = vec3(0.78, 1.0, 0.24);
        vec3 violet = vec3(0.45, 0.32, 1.0);
        vec3 deep = vec3(0.02, 0.03, 0.08);
        float t = 0.5 + 0.5 * sin(vN * 6.0 + uTime * 0.6);
        vec3 col = mix(deep, mix(blue, violet, t), 0.55 + vN * 0.8);
        col += fres * mix(blue, lime, smoothstep(0.35, 1.0, t)) * 1.05;
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  const blob = new THREE.Mesh(new THREE.IcosahedronGeometry(1.15, 128), blobMat);
  scene.add(blob);

  // Wire shell
  const shell = new THREE.Mesh(
    new THREE.IcosahedronGeometry(2.25, 2),
    new THREE.MeshBasicMaterial({ color: 0x5b82ff, wireframe: true, transparent: true, opacity: 0.12 }),
  );
  scene.add(shell);

  // Particle halo
  const count = 1400;
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 2.6 + Math.random() * 2.2;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
    pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.6;
    pos[i * 3 + 2] = r * Math.cos(ph);
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0xc8ff3d, size: 0.022, transparent: true, opacity: 0.75, depthWrite: false }));
  scene.add(particles);

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = canvas.parentElement || canvas;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = w < 700 ? 7.5 : 6;
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement || canvas);

  const target = new THREE.Vector2();
  const onMove = (e: PointerEvent) => { target.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); };
  window.addEventListener('pointermove', onMove);

  let visible = true;
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
  io.observe(canvas);

  const clock = new THREE.Clock();
  let raf = 0;
  const loop = () => {
    raf = requestAnimationFrame(loop);
    if (!visible) return;
    const t = clock.getElapsedTime();
    uniforms.uTime.value = t;
    uniforms.uMouse.value.lerp(target, 0.05);
    const scroll = Math.min(window.scrollY / innerHeight, 1.5);
    uniforms.uAmp.value = 0.3 + scroll * 0.3;
    blob.rotation.y = t * 0.15 + uniforms.uMouse.value.x * 0.6;
    blob.rotation.x = uniforms.uMouse.value.y * 0.4;
    shell.rotation.y = -t * 0.08; shell.rotation.z = t * 0.05;
    particles.rotation.y = t * 0.04 + uniforms.uMouse.value.x * 0.2;
    scene.position.y = scroll * 0.9;
    renderer.render(scene, camera);
  };
  if (reduced) { uniforms.uTime.value = 2; renderer.render(scene, camera); } else loop();

  return () => {
    cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
    window.removeEventListener('pointermove', onMove);
    blob.geometry.dispose(); blobMat.dispose(); shell.geometry.dispose(); (shell.material as THREE.Material).dispose();
    pGeo.dispose(); (particles.material as THREE.Material).dispose(); renderer.dispose();
  };
}

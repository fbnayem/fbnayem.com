import * as THREE from 'three';

/*
  An engraved "contour sheet": rows of ink lines over a slowly shifting terrain,
  seen at an angle like a plate in an old atlas. The pointer lifts a soft ridge.
  Drawn in the page's ink colour, so it reads as print rather than a glowing effect.
*/
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

const ROWS = 64;
const COLS = 220;
const WIDTH = 12;
const DEPTH = 9;

export function mountHero(canvas: HTMLCanvasElement, reduced: boolean): () => void {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 5.2, 9.5);
  camera.lookAt(0, -0.2, 0);

  // One line strip per row, built as segments so the whole sheet is a single draw call.
  const positions: number[] = [];
  const rowIndex: number[] = [];
  for (let r = 0; r < ROWS; r++) {
    const z = (r / (ROWS - 1) - 0.5) * DEPTH;
    for (let c = 0; c < COLS - 1; c++) {
      const x0 = (c / (COLS - 1) - 0.5) * WIDTH;
      const x1 = ((c + 1) / (COLS - 1) - 0.5) * WIDTH;
      positions.push(x0, 0, z, x1, 0, z);
      rowIndex.push(r, r);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('aRow', new THREE.Float32BufferAttribute(rowIndex, 1));

  const uniforms = {
    uTime: { value: 0 },
    uPointer: { value: new THREE.Vector2(0, 0) },
    uLift: { value: 0 },
    uInk: { value: new THREE.Color('#161412') },
    uRed: { value: new THREE.Color('#e0401b') },
    uAccentRow: { value: 40 },
  };

  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    vertexShader: /* glsl */ `
      ${noise}
      uniform float uTime; uniform vec2 uPointer; uniform float uLift;
      attribute float aRow;
      varying float vRow; varying float vFade; varying float vH;
      void main(){
        vec3 p = position;
        float h = snoise(vec3(p.x * 0.22, p.z * 0.28, uTime * 0.07)) * 0.75
                + snoise(vec3(p.x * 0.6, p.z * 0.6, uTime * 0.12)) * 0.18;
        // a broad ridge that rises toward the right, so the sheet has a landform, not just ripples
        h += smoothstep(-4.0, 5.0, p.x) * 0.9 * (1.0 - abs(p.z) / ${(DEPTH / 2).toFixed(1)});
        float d = distance(p.xz, uPointer);
        h += uLift * exp(-d * d * 0.55) * 1.1;
        p.y = h;
        vRow = aRow; vH = h;
        vFade = smoothstep(${(WIDTH / 2).toFixed(1)}, ${(WIDTH / 2 - 2.5).toFixed(1)}, abs(p.x)) * smoothstep(${(DEPTH / 2).toFixed(1)}, ${(DEPTH / 2 - 1.5).toFixed(1)}, abs(p.z));
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk; uniform vec3 uRed; uniform float uAccentRow;
      varying float vRow; varying float vFade; varying float vH;
      void main(){
        bool accent = abs(vRow - uAccentRow) < 0.5;
        vec3 col = accent ? uRed : uInk;
        float a = (accent ? 0.95 : 0.55 + clamp(vH, 0.0, 1.0) * 0.35) * vFade;
        gl_FragColor = vec4(col, a);
      }`,
  });
  const sheet = new THREE.LineSegments(geo, mat);
  scene.add(sheet);

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = w < 700 ? 12.5 : 9.5;
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  // Pointer → a point on the sheet plane (y = 0)
  const ray = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const hit = new THREE.Vector3();
  const target = new THREE.Vector2(2, 0);
  let liftTarget = 0;
  const onMove = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    const ndc = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    if (ray.ray.intersectPlane(plane, hit)) { target.set(hit.x, hit.z); liftTarget = 1; }
  };
  const onLeave = () => { liftTarget = 0; };
  window.addEventListener('pointermove', onMove);
  document.addEventListener('pointerleave', onLeave);

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
    uniforms.uPointer.value.lerp(target, 0.06);
    uniforms.uLift.value += (liftTarget - uniforms.uLift.value) * 0.04;
    const scroll = Math.min(window.scrollY / window.innerHeight, 1.2);
    sheet.rotation.y = -0.18 + scroll * 0.25;
    camera.position.y = 5.2 - scroll * 1.6;
    camera.lookAt(0, -0.2, 0);
    renderer.render(scene, camera);
  };
  if (reduced) { uniforms.uTime.value = 8; renderer.render(scene, camera); } else loop();

  return () => {
    cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
    window.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerleave', onLeave);
    geo.dispose(); mat.dispose(); renderer.dispose();
  };
}

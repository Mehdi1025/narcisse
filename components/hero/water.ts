// Miroir d'eau — rendu WebGL de la flaque reflétant l'arche de lumière.
// WebGL2 : simulation physique des ondes (ping-pong RGBA16F). WebGL1 : ondes analytiques.
// Le canvas est purement décoratif ; toutes les ressources sont libérées par destroy().

const N = 12; // sources d'ondes en mode analytique
const SN = 256; // résolution de la simulation

const VS = "attribute vec2 a;varying vec2 v;void main(){v=a*.5+.5;gl_Position=vec4(a,0.,1.);}";

const SIM_FS = `precision highp float;uniform sampler2D S;uniform vec2 px;uniform vec4 D[4];uniform float dmp;varying vec2 v;
void main(){vec4 c=texture2D(S,v);
 float s=texture2D(S,v+vec2(px.x,0.)).r+texture2D(S,v-vec2(px.x,0.)).r+texture2D(S,v+vec2(0.,px.y)).r+texture2D(S,v-vec2(0.,px.y)).r;
 float h=(s*.5-c.g)*dmp;
 for(int i=0;i<4;i++){vec4 d=D[i];if(d.w!=0.){vec2 q=v-d.xy;h+=d.w*exp(-dot(q,q)/(d.z*d.z));}}
 gl_FragColor=vec4(h,c.r,0.,1.);}`;

const RENDER_FS = `precision highp float;
uniform vec2 R;uniform float T,PI,TH,AMP,AI,AG,SIM;uniform vec3 CP;uniform vec3 RP[${N}];uniform sampler2D H;
varying vec2 v;
const float EL=.2;const vec3 LC=vec3(1.,.95,.86);
float h1(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float nz(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h1(i),h1(i+vec2(1,0)),f.x),mix(h1(i+vec2(0,1)),h1(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float r=0.,a=.5;for(int i=0;i<4;i++){r+=a*nz(p);p*=2.02;a*=.5;}return r;}
float hgt(vec2 q){
 float h=0.;
 if(SIM>.5){vec2 u=vec2((q.x+3.)/6.,(q.y+5.)/6.);if(u.x>0.&&u.x<1.&&u.y>0.&&u.y<1.)h=texture2D(H,u).r;}
 else{for(int i=0;i<${N};i++){vec3 r=RP[i];float t=T-r.z;if(t<0.||t>7.)continue;float s=length(q-r.xy);float fr=t*.55;
  h+=sin(s*28.-t*7.)*smoothstep(fr,fr-.2,s)*smoothstep(fr-.9,fr-.2,s)*exp(-t*.6)*.3;}}
 return h;}
vec3 nrm(vec2 q){float e=.026;
 float hx=hgt(q+vec2(e,0.))-hgt(q-vec2(e,0.)),hz=hgt(q+vec2(0.,e))-hgt(q-vec2(0.,e));
 vec3 n=vec3(-hx*.75,1.,-hz*.75);
 n.xz+=vec2(sin(q.x*11.+T*1.2)+sin(q.y*13.-T*.9+q.x*3.),sin(q.y*10.+T)+sin(q.x*8.-T*1.1))*.007;
 n.xz*=AMP;return normalize(n);}
float sdB(vec2 p,vec2 a,vec2 b){vec2 c=(a+b)*.5,hs=(b-a)*.5,d=abs(p-c)-hs;return length(max(d,0.))+min(max(d.x,d.y),0.);}
vec3 sky(vec3 d){
 vec3 A=vec3(0.,sin(EL),-cos(EL)),U=vec3(0.,cos(EL),sin(EL));
 vec3 c=mix(vec3(.016,.026,.045),vec3(.07,.1,.15),smoothstep(-.2,.7,d.y))+vec3(.09,.12,.17)*exp(-abs(d.y-.02)*6.);
 float fa=dot(d,A);if(fa<=0.)return c;
 vec2 q=vec2(d.x,dot(d,U))/fa;
 vec2 px=vec2(q.x/.3*949.+350.5,(.15-q.y)/.3*949.);
 float sb=min(sdB(px,vec2(63.,291.5),vec2(638.,865.)),length(px-vec2(350.5,291.5))-287.5)*.3/949.;
 float ss=min(sdB(px,vec2(34.,865.),vec2(667.,897.)),sdB(px,vec2(4.,916.),vec2(697.,945.)))*.3/949.;
 float m=max(min(sb,ss),0.);
 c+=LC*(smoothstep(.009,-.009,sb)*mix(.9,1.06,smoothstep(.15,-.15,q.y))+smoothstep(.009,-.009,ss)*.5)*AI;
 c+=LC*(exp(-m*8.)*.16+exp(-m*45.)*.22)*AG;
 return c;}
void main(){
 vec2 uv=(gl_FragCoord.xy-.5*R)/R.y*2.;
 vec3 fw=vec3(0.,sin(PI),-cos(PI)),up=vec3(0.,cos(PI),sin(PI)),rt=vec3(1.,0.,0.);
 vec3 rd=normalize(fw+rt*uv.x*TH+up*uv.y*TH);
 vec3 ro=CP;
 vec3 col;
 if(rd.y<-1e-4){
  float t=-ro.y/rd.y;vec3 p=ro+rd*t;vec3 n=nrm(p.xz);
  float fr=.02+.98*pow(1.-max(dot(-rd,n),0.),5.);
  float pd=length((p.xz-vec2(0.,-1.6))*vec2(1.,1.15))+(fbm(p.xz*1.3)-.5)*.5;
  float inP=1.-smoothstep(5.6,6.,pd);
  vec3 wat=mix(vec3(.02,.04,.065),sky(reflect(rd,n)),clamp(fr*1.1+.14,0.,1.));
  vec2 gq=p.xz*7.;vec3 gn=normalize(vec3(fbm(gq)-.5,1.6,fbm(gq+5.)-.5));
  vec3 gr=vec3(.012,.014,.019)*(.5+fbm(p.xz*5.))+sky(reflect(rd,gn))*.06;
  col=mix(gr,wat,inP);
  col=mix(vec3(.05,.07,.1),col,exp(-t*.045));
 }else col=sky(rd);
 col=1.-exp(-col*1.75);
 col*=1.-.06*dot(uv,uv);
 col+=(h1(gl_FragCoord.xy+fract(T*7.))-.5)*.03;
 gl_FragColor=vec4(col,1.);}`;

type Drop = [x: number, z: number, strength: number, radius: number];

export type WaterApi = {
  /** 0 → 1 pendant que le hero quitte l'écran (parallaxe de caméra). */
  setProgress: (p: number) => void;
  /** Goutte à une position écran (coordonnées client). */
  dropAt: (clientX: number, clientY: number, strength?: number) => void;
  destroy: () => void;
  mode: "sim" | "analytic";
};

export function createWater(canvas: HTMLCanvasElement): WaterApi | null {
  const gl2 = canvas.getContext("webgl2", { antialias: false, alpha: false, powerPreference: "high-performance" });
  const gl: WebGLRenderingContext | WebGL2RenderingContext | null = gl2 ?? canvas.getContext("webgl", { antialias: false, alpha: false });
  if (!gl) return null;

  const compile = (type: number, src: string) => {
    const s = gl.createShader(type);
    if (!s) return null;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn(gl.getShaderInfoLog(s));
      gl.deleteShader(s);
      return null;
    }
    return s;
  };
  const program = (fs: string) => {
    const v = compile(gl.VERTEX_SHADER, VS);
    const f = compile(gl.FRAGMENT_SHADER, fs);
    if (!v || !f) return null;
    const p = gl.createProgram();
    if (!p) return null;
    gl.attachShader(p, v);
    gl.attachShader(p, f);
    gl.bindAttribLocation(p, 0, "a");
    gl.linkProgram(p);
    return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null;
  };

  const render = program(RENDER_FS);
  if (!render) return null;

  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const makeTex = () => {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  };

  // Simulation physique (WebGL2 + rendu flottant)
  type Sim = { prog: WebGLProgram; tex: WebGLTexture[]; fbo: WebGLFramebuffer[]; cur: number; u: Record<string, WebGLUniformLocation | null> };
  let sim: Sim | null = null;
  if (gl2 && (gl2.getExtension("EXT_color_buffer_float") || gl2.getExtension("EXT_color_buffer_half_float"))) {
    const prog = program(SIM_FS);
    if (prog) {
      const tex: WebGLTexture[] = [];
      const fbo: WebGLFramebuffer[] = [];
      let ok = true;
      for (let i = 0; i < 2 && ok; i++) {
        gl2.activeTexture(gl2.TEXTURE1);
        const t = makeTex();
        gl2.texImage2D(gl2.TEXTURE_2D, 0, gl2.RGBA16F, SN, SN, 0, gl2.RGBA, gl2.HALF_FLOAT, null);
        const f = gl2.createFramebuffer();
        gl2.bindFramebuffer(gl2.FRAMEBUFFER, f);
        gl2.framebufferTexture2D(gl2.FRAMEBUFFER, gl2.COLOR_ATTACHMENT0, gl2.TEXTURE_2D, t, 0);
        ok = gl2.checkFramebufferStatus(gl2.FRAMEBUFFER) === gl2.FRAMEBUFFER_COMPLETE;
        gl2.clearColor(0, 0, 0, 1);
        gl2.clear(gl2.COLOR_BUFFER_BIT);
        if (t && f) {
          tex.push(t);
          fbo.push(f);
        }
      }
      gl2.bindFramebuffer(gl2.FRAMEBUFFER, null);
      if (ok && tex.length === 2) {
        sim = {
          prog,
          tex,
          fbo,
          cur: 0,
          u: { S: gl2.getUniformLocation(prog, "S"), px: gl2.getUniformLocation(prog, "px"), D: gl2.getUniformLocation(prog, "D"), dmp: gl2.getUniformLocation(prog, "dmp") },
        };
      }
    }
  }

  const U: Record<string, WebGLUniformLocation | null> = {};
  for (const k of ["R", "T", "PI", "TH", "AMP", "AI", "AG", "SIM", "CP", "RP", "H"]) U[k] = gl.getUniformLocation(render, k);

  // État de caméra (le hero ne fait qu'une légère parallaxe : pas de longue chorégraphie)
  const cam = { y: 0.42, z: 0.9, pitch: 0.0, th: 0.47 };
  let progress = 0;
  const drops: Drop[] = [];
  const rp = new Float32Array(N * 3).fill(-99);
  let ri = 0;
  const dd = new Float32Array(16);
  const t0 = performance.now();
  const now = () => (performance.now() - t0) / 1000;

  const resize = () => {
    const d = Math.min(window.devicePixelRatio || 1, window.innerWidth < 700 ? 1.25 : 1.5);
    canvas.width = Math.max(1, Math.round(canvas.clientWidth * d));
    canvas.height = Math.max(1, Math.round(canvas.clientHeight * d));
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  const addDrop = (x: number, z: number, s: number, r = 1) => {
    if (Math.abs(x) > 2.9 || z < -4.9 || z > 0.9) return;
    drops.push([x, z, s, r]);
    if (drops.length > 24) drops.shift();
  };

  const toPlane = (clientX: number, clientY: number): [number, number] | null => {
    const r = canvas.getBoundingClientRect();
    const sx = (clientX - (r.left + r.width / 2)) / (r.height / 2);
    const sy = (r.top + r.height / 2 - clientY) / (r.height / 2);
    const sp = Math.sin(cam.pitch);
    const cp = Math.cos(cam.pitch);
    const dy = sp + cp * sy * cam.th;
    const dz = -cp + sp * sy * cam.th;
    if (dy >= -1e-4) return null;
    const t = -cam.y / dy;
    return [sx * cam.th * t, cam.z + dz * t];
  };

  const step = (list: Drop[]) => {
    if (!sim || !gl2) return;
    gl2.useProgram(sim.prog);
    gl2.viewport(0, 0, SN, SN);
    dd.fill(0);
    list.forEach((d, i) => {
      dd[i * 4] = (d[0] + 3) / 6;
      dd[i * 4 + 1] = (d[1] + 5) / 6;
      dd[i * 4 + 2] = 0.0085 * d[3];
      dd[i * 4 + 3] = d[2] * 0.42;
    });
    gl2.uniform4fv(sim.u.D, dd);
    gl2.uniform2f(sim.u.px, 1 / SN, 1 / SN);
    gl2.uniform1f(sim.u.dmp, 0.992);
    gl2.uniform1i(sim.u.S, 1);
    gl2.activeTexture(gl2.TEXTURE1);
    gl2.bindTexture(gl2.TEXTURE_2D, sim.tex[sim.cur]);
    gl2.bindFramebuffer(gl2.FRAMEBUFFER, sim.fbo[1 - sim.cur]);
    gl2.drawArrays(gl2.TRIANGLES, 0, 3);
    sim.cur = 1 - sim.cur;
    gl2.bindFramebuffer(gl2.FRAMEBUFFER, null);
  };

  const draw = () => {
    const t = now();
    const list = drops.splice(0, 4);
    if (sim) {
      step(list);
      step([]);
    } else
      list.forEach((d) => {
        rp[ri * 3] = d[0];
        rp[ri * 3 + 1] = d[1];
        rp[ri * 3 + 2] = t;
        ri = (ri + 1) % N;
      });
    // caméra : descend et plonge légèrement quand le hero quitte l'écran
    cam.y = 0.42 - progress * 0.14;
    cam.pitch = -progress * 0.16;
    const open = 1 - Math.pow(1 - Math.min(1, Math.max(0, (t - 0.4) / 2.2)), 3);
    gl.useProgram(render);
    gl.viewport(0, 0, canvas.width, canvas.height);
    if (sim) {
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, sim.tex[sim.cur]);
    }
    gl.uniform1i(U.H, 1);
    gl.uniform2f(U.R, canvas.width, canvas.height);
    gl.uniform1f(U.T, t);
    gl.uniform1f(U.PI, cam.pitch);
    gl.uniform1f(U.TH, cam.th);
    gl.uniform1f(U.AMP, 1);
    gl.uniform1f(U.AI, open * 1.45);
    gl.uniform1f(U.AG, open * 0.95);
    gl.uniform1f(U.SIM, sim ? 1 : 0);
    gl.uniform3f(U.CP, 0, cam.y, cam.z);
    gl.uniform3fv(U.RP, rp);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  // Boucle : en pause hors écran et onglet caché
  let visible = true;
  let raf = 0;
  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
  io.observe(canvas);
  const loop = () => {
    if (visible && !document.hidden) draw();
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);

  // Gouttes : première goutte sur le reflet, puis pluie fine aléatoire
  const timers = [
    window.setTimeout(() => addDrop(0, -1.2, 1.6, 1.8), 1100),
    window.setInterval(() => {
      if (visible && !document.hidden) addDrop((Math.random() - 0.5) * 1.4, -2.6 + Math.random() * 2.2, 0.9, 1.1);
    }, 2600),
  ];

  return {
    mode: sim ? "sim" : "analytic",
    setProgress: (p) => (progress = Math.min(1, Math.max(0, p))),
    dropAt: (x, y, s = 0.45) => {
      const q = toPlane(x, y);
      if (q) addDrop(q[0], q[1], s, s > 1 ? 1.5 : 1);
    },
    destroy: () => {
      cancelAnimationFrame(raf);
      timers.forEach((id) => window.clearTimeout(id));
      timers.forEach((id) => window.clearInterval(id));
      io.disconnect();
      ro.disconnect();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}

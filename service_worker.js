// Copyright (c) the JPEG XL Project Authors. All rights reserved.
//
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

/*
 * ServiceWorker script.
 *
 * Multi-threading in WASM is currently implemented by the means of
 * SharedArrayBuffer. Due to infamous vulnerabilities this feature is disabled
 * unless site is running in "cross-origin isolated" mode.
 * If there is not enough control over the server (e.g. when pages are hosted as
 * "github pages") ServiceWorker is used to upgrade responses with corresponding
 * headers.
 *
 * This script could be executed in 2 environments: HTML page or ServiceWorker.
 * The environment is detected by the type of "window" reference.
 *
 * When this script is executed from HTML page then ServiceWorker is registered.
 * Page reload might be necessary in some situations. By default it is done via
 * `window.location.reload()`. However this can be altered by setting a
 * configuration object `window.serviceWorkerConfig`. It's `doReload` property
 * should be a replacement callable.
 *
 * When this script is executed from ServiceWorker then standard lifecycle
 * event dispatchers are setup along with `fetch` interceptor.
 */

(() => {
  // Set COOP/COEP headers for document/script responses; use when this can not
  // be done on server side (e.g. GitHub Pages).
  const FORCE_COP = true;
  // Interpret 'content-type: application/octet-stream' as JXL; use when server
  // does not set appropriate content type (e.g. GitHub Pages).
  const FORCE_DECODING = true;
  // Embedded (baked-in) responses for faster turn-around.
  const EMBEDDED = {
    'client_worker.js': 'let decoder=null,jobs=[];const processJobs=()=>{if(decoder)for(;;){let o=null;for(let e=0;e<jobs.length;++e)if(jobs[e].inputComplete){o=jobs[e],jobs[e]=jobs[jobs.length-1],jobs.pop();break}if(!o)return;console.log("CW job: "+o.uid);var r=o.input;let l=0;for(let e=0;e<r.length;e++)l+=r[e].length;var t=decoder._malloc(l);let d=0;for(let e=0;e<r.length;++e)decoder.HEAP8.set(r[e],t+d),d+=r[e].length;var e=Date.now(),s=decoder._jxlDecompress(t,l),n=Date.now(),n="Decoded "+o.url+" in "+(n-e)+"ms",e=(decoder._free(t),decoder.HEAP32[s>>2]),c=decoder.HEAP32[s+4>>2],i=new Uint8Array(e),u=new Uint8Array(decoder.HEAP8.buffer),u=(i.set(u.slice(c,c+e)),decoder._jxlCleanup(s),{uid:o.uid,data:i,msg:n});postMessage(u,[i.buffer])}},onLoadJxlModule=(onmessage=function(e){var l=e.data;if(console.log("CW received: "+l.op),"decodeJxl"===l.op){let o=null;for(let e=0;e<jobs.length;++e)if(jobs[e].uid===l.uid){o=jobs[e];break}o||(o={uid:l.uid,input:[],inputComplete:!1,url:l.url},jobs.push(o)),l.data?o.input.push(l.data):o.inputComplete=!0,processJobs()}},e=>{decoder=e,processJobs()}),config=(importScripts("jxl_decoder.js"),{mainScriptUrlOrBlob:"https://jxl-demo.netlify.app/jxl_decoder.js",INITIAL_MEMORY:16777216});JxlDecoderModule(config).then(onLoadJxlModule);',
    'jxl_decoder.js': 'var JxlDecoderModule=(()=>{var qe="undefined"!=typeof document&&document.currentScript?document.currentScript.src:void 0;return"undefined"!=typeof __filename&&(qe=qe||__filename),function(O={}){function B(){return w.buffer!=g.buffer&&x(),G}function t(){return w.buffer!=g.buffer&&x(),K}function l(){return w.buffer!=g.buffer&&x(),X}function H(){return w.buffer!=g.buffer&&x(),Y}var r,a,o=O,U=(o.ready=new Promise((e,n)=>{r=e,a=n}),Object.assign({},o)),n=(e,n)=>{throw n},i="object"==typeof window,s="function"==typeof importScripts,u="object"==typeof process&&"object"==typeof process.versions&&"string"==typeof process.versions.node,c=o.ENVIRONMENT_IS_PTHREAD||!1,f="";function F(e){return o.locateFile?o.locateFile(e,f):f+e}if(u){var p=require("fs"),m=require("path"),f=s?m.dirname(f)+"/":__dirname+"/",L=(e,n)=>(e=e.startsWith("file://")?new URL(e):m.normalize(e),p.readFileSync(e,n?void 0:"utf8")),d=e=>e=(e=L(e,!0)).buffer?e:new Uint8Array(e),h=(e,t,r,i=!0)=>{e=e.startsWith("file://")?new URL(e):m.normalize(e),p.readFile(e,i?void 0:"utf8",(e,n)=>{e?r(e):t(i?n.buffer:n)})};process.argv.slice(2),n=(e,n)=>{throw process.exitCode=e,n},o.inspect=()=>"[Emscripten Module object]";let e;try{e=require("worker_threads")}catch(e){throw console.error(\'The "worker_threads" module is not supported in this node.js build - perhaps a newer version is needed?\'),e}global.Worker=e.Worker}else(i||s)&&(s?f=self.location.href:"undefined"!=typeof document&&document.currentScript&&(f=document.currentScript.src),f=0!==(f=qe?qe:f).indexOf("blob:")?f.substr(0,f.replace(/[?#].*/,"").lastIndexOf("/")+1):"",u||(L=e=>{var n=new XMLHttpRequest;return n.open("GET",e,!1),n.send(null),n.responseText},s&&(d=e=>{var n=new XMLHttpRequest;return n.open("GET",e,!1),n.responseType="arraybuffer",n.send(null),new Uint8Array(n.response)}),h=(e,n,t)=>{var r=new XMLHttpRequest;r.open("GET",e,!0),r.responseType="arraybuffer",r.onload=()=>{200==r.status||0==r.status&&r.response?n(r.response):t()},r.onerror=t,r.send(null)}));u&&"undefined"==typeof performance&&(global.performance=require("perf_hooks").performance);var _,e=console.log.bind(console),q=console.error.bind(console),N=(u&&(e=(...e)=>p.writeSync(1,e.join(" ")+"\\n"),q=(...e)=>p.writeSync(2,e.join(" ")+"\\n")),o.print||e),y=o.printErr||q,J=(Object.assign(o,U),o.quit&&(n=o.quit),o.wasmBinary&&(_=o.wasmBinary),o.noExitRuntime||!1);"object"!=typeof WebAssembly&&I("no native wasm support detected");var w,z,b,g,G,K,X,Y,v=!1;function x(){var e=w.buffer;o.HEAP8=g=new Int8Array(e),o.HEAP16=new Int16Array(e),o.HEAP32=K=new Int32Array(e),o.HEAPU8=G=new Uint8Array(e),o.HEAPU16=new Uint16Array(e),o.HEAPU32=X=new Uint32Array(e),o.HEAPF32=new Float32Array(e),o.HEAPF64=Y=new Float64Array(e)}if(65536<=(e=o.INITIAL_MEMORY||16777216)||I("INITIAL_MEMORY should be larger than STACK_SIZE, was "+e+"! (STACK_SIZE=65536)"),c)w=o.wasmMemory;else if(o.wasmMemory)w=o.wasmMemory;else if(!((w=new WebAssembly.Memory({initial:e/65536,maximum:32768,shared:!0})).buffer instanceof SharedArrayBuffer))throw y("requested a shared WebAssembly.Memory but the returned buffer is not a SharedArrayBuffer, indicating that while the browser has SharedArrayBuffer it does not have WebAssembly threads support - you may need to set a flag"),u&&y("(on node you may need: --experimental-wasm-threads --experimental-wasm-bulk-memory and/or recent version)"),Error("bad memory");x();w.buffer.byteLength;var Z,$=[],V=[],Q=[],ee=[],ne=!1,te=0;function j(){return J||0<te}var A,M=0,re=null,S=null;function ie(){M++,o.monitorRunDependencies&&o.monitorRunDependencies(M)}function ae(){var e;M--,o.monitorRunDependencies&&o.monitorRunDependencies(M),0==M&&(null!==re&&(clearInterval(re),re=null),S)&&(e=S,S=null,e())}function I(e){throw o.onAbort&&o.onAbort(e),y(e="Aborted("+e+")"),v=!0,b=1,e=new WebAssembly.RuntimeError(e+". Build with -sASSERTIONS for more info."),a(e),e}function oe(e){return e.startsWith("data:application/octet-stream;base64,")}function se(e){try{if(e==A&&_)return new Uint8Array(_);if(d)return d(e);throw"both async and sync fetching of the wasm failed"}catch(e){I(e)}}function ue(e,n,t){return function(t){if(!_&&(i||s)){if("function"==typeof fetch&&!t.startsWith("file://"))return fetch(t,{credentials:"same-origin"}).then(e=>{if(e.ok)return e.arrayBuffer();throw"failed to load wasm binary file at \'"+t+"\'"}).catch(()=>se(t));if(h)return new Promise((n,e)=>{h(t,e=>n(new Uint8Array(e)),e)})}return Promise.resolve().then(()=>se(t))}(e).then(e=>WebAssembly.instantiate(e,n)).then(e=>e).then(t,e=>{y("failed to asynchronously prepare wasm: "+e),I(e)})}function k(e){this.name="ExitStatus",this.message=`Program terminated with exit(${e})`,this.status=e}function le(e){e.terminate(),e.onmessage=()=>{}}function ce(e){(e=R.h[e])||I(),R.N(e)}function fe(e){var n=R.F();if(!n)return 6;R.j.push(n),(R.h[e.g]=n).g=e.g;var t={cmd:"run",start_routine:e.O,arg:e.C,pthread_ptr:e.g};return u&&n.unref(),n.postMessage(t,e.P),0}oe(A="jxl_decoder.wasm")||(A=F(A));var pe="undefined"!=typeof TextDecoder?new TextDecoder("utf8"):void 0;function me(e){if(c)return P(1,1,e);b=e,j()||(R.v(),o.onExit&&o.onExit(e),v=!0),n(e,new k(e))}var de=e=>{if(b=e,c)throw he(e),"unwind";j()||c||(Ee(),T(Q),Te(0),Me[1].length&&Se(1,10),Me[2].length&&Se(2,10),R.v(),ne=!0),me(e)},R={i:[],j:[],B:[],h:{},m:function(){c?R.J():R.I()},I:function(){for(var e=4;e--;)R.o();$.unshift(()=>{ie(),R.L(()=>ae())})},J:function(){R.receiveObjectTransfer=R.M,R.threadInitTLS=R.A,R.setExitStatus=R.u,J=!1},u:function(e){b=e},U:["$terminateWorker"],v:function(){for(var e of R.j)le(e);for(e of R.i)le(e);R.i=[],R.j=[],R.h=[]},N:function(e){var n=e.g;delete R.h[n],R.i.push(e),R.j.splice(R.j.indexOf(e),1),e.g=0,We(n)},M:function(){},A:function(){R.B.forEach(e=>e())},s:i=>new Promise(r=>{i.onmessage=e=>{var n,t=(e=e.data).cmd;i.g&&(R.D=i.g),e.targetThread&&e.targetThread!=W()?(n=R.h[e.T])?n.postMessage(e,e.transferList):y(\'Internal error! Worker sent a message "\'+t+\'" to target pthread \'+e.targetThread+", but that thread no longer exists!"):"checkMailbox"===t?C():"spawnThread"===t?fe(e):"cleanupThread"===t?ce(e.thread):"killThread"===t?(e=e.thread,t=R.h[e],delete R.h[e],le(t),We(e),R.j.splice(R.j.indexOf(t),1),t.g=0):"cancelThread"===t?R.h[e.thread].postMessage({cmd:"cancel"}):"loaded"===t?(i.loaded=!0,u&&!i.g&&i.unref(),r(i)):"alert"===t?alert("Thread "+e.threadId+": "+e.text):"setimmediate"===e.target?i.postMessage(e):"callHandler"===t?o[e.handler](...e.args):t&&y("worker sent an unknown command "+t),R.D=void 0},i.onerror=e=>{throw y("worker sent an error! "+e.filename+":"+e.lineno+": "+e.message),e},u&&(i.on("message",function(e){i.onmessage({data:e})}),i.on("error",function(e){i.onerror(e)}));var e,n=[];for(e of["onExit","onAbort","print","printErr"])o.hasOwnProperty(e)&&n.push(e);i.postMessage({cmd:"load",handlers:n,urlOrBlob:o.mainScriptUrlOrBlob||qe,wasmMemory:w,wasmModule:z})}),L:function(e){if(c)return e();Promise.all(R.i.map(R.s)).then(e)},o:function(){var e=F("jxl_decoder.worker.js"),e=new Worker(e);R.i.push(e)},F:function(){return 0==R.i.length&&(R.o(),R.s(R.i[0])),R.i.pop()}},T=(o.PThread=R,e=>{for(;0<e.length;)e.shift()(o)});function he(e){if(c)return P(2,0,e);de(e)}o.establishStackSpace=function(){var e=W(),n=t()[e+52>>2];Be(n,n-t()[e+56>>2]),Ue(n)};var E=[];function _e(e){this.l=e-24,this.K=function(e){l()[this.l+4>>2]=e},this.H=function(e){l()[this.l+8>>2]=e},this.m=function(e,n){this.G(),this.K(e),this.H(n)},this.G=function(){l()[this.l+16>>2]=0}}o.invokeEntryPoint=function(e,n){te=0;var t=E[e];t||(e>=E.length&&(E.length=e+1),E[e]=t=Z.get(e)),e=t(n),j()?R.u(e):De(e)};function ye(e,n,t,r){return c?P(3,1,e,n,t,r):we(e,n,t,r)}function we(e,n,t,r){var i;return"undefined"==typeof SharedArrayBuffer?(y("Current environment does not support SharedArrayBuffer, pthreads are not available!"),6):(i=[],c&&0===i.length?ye(e,n,t,r):(e={O:t,g:e,C:r,P:i},c?(e.S="spawnThread",postMessage(e,i),0):fe(e)))}var be=e=>{if(!ne&&!v)try{if(e(),!ne&&!j())try{(c?De:de)(b)}catch(e){e instanceof k||"unwind"==e||n(1,e)}}catch(e){e instanceof k||"unwind"==e||n(1,e)}};function ge(e){"function"==typeof Atomics.R&&(Atomics.R(t(),e>>2,e).value.then(C),e+=128,Atomics.store(t(),e>>2,1))}function C(){var e=W();e&&(ge(e),be(()=>Oe()))}o.__emscripten_thread_mailbox_await=ge,o.checkMailbox=C;var ve=e=>{var n=He();return e=e(),Ue(n),e};function P(i,a){var o=arguments.length-2,s=arguments;return ve(()=>{for(var e=Fe(8*o),n=e>>3,t=0;t<o;t++){var r=s[2+t];H()[n+t]=r}return Pe(i,o,e,a)})}var xe=[];function je(e){return c?P(4,1,e):52}function Ae(e,n,t,r,i){return c?P(5,1,e,n,t,r,i):70}var Me=[null,[],[]],Se=(e,n)=>{var t=Me[e];if(0===n||10===n){for(var r=(n=0)+NaN,i=n;t[i]&&!(r<=i);)++i;if(16<i-n&&t.buffer&&pe)n=pe.decode(t.buffer instanceof SharedArrayBuffer?t.slice(n,i):t.subarray(n,i));else{for(r="";n<i;){var a,o,s=t[n++];128&s?(a=63&t[n++],192==(224&s)?r+=String.fromCharCode((31&s)<<6|a):(o=63&t[n++],(s=224==(240&s)?(15&s)<<12|a<<6|o:(7&s)<<18|a<<12|o<<6|63&t[n++])<65536?r+=String.fromCharCode(s):(s-=65536,r+=String.fromCharCode(55296|s>>10,56320|1023&s)))):r+=String.fromCharCode(s)}n=r}(1===e?N:y)(n),t.length=0}else t.push(n)};function Ie(e,n,t,r){if(c)return P(6,1,e,n,t,r);for(var i=0,a=0;a<t;a++){var o=l()[n>>2],s=l()[n+4>>2];n+=8;for(var u=0;u<s;u++)Se(e,B()[o+u]);i+=s}return l()[r>>2]=i,0}R.m();var ke=[null,me,he,ye,je,Ae,Ie],Re={__cxa_throw:function(e,n,t){throw new _e(e).m(n,t),e},__emscripten_init_main_thread_js:function(e){Ce(e,!s,1,!i,65536),R.A()},__emscripten_thread_cleanup:function(e){c?postMessage({cmd:"cleanupThread",thread:e}):ce(e)},__pthread_create_js:we,_emscripten_get_now_is_monotonic:()=>!0,_emscripten_notify_mailbox_postmessage:function(e,n){e==n?setTimeout(()=>C()):c?postMessage({targetThread:e,cmd:"checkMailbox"}):(e=R.h[e])&&e.postMessage({cmd:"checkMailbox"})},_emscripten_set_offscreencanvas_size:function(){return-1},_emscripten_thread_mailbox_await:ge,_emscripten_thread_set_strongref:function(e){u&&R.h[e].ref()},abort:()=>{I("")},emscripten_check_blocking_allowed:function(){},emscripten_date_now:function(){return Date.now()},emscripten_exit_with_live_runtime:()=>{throw te+=1,"unwind"},emscripten_get_now:()=>performance.timeOrigin+performance.now(),emscripten_receive_on_main_thread_js:function(e,n,t){xe.length=n,t>>=3;for(var r=0;r<n;r++)xe[r]=H()[t+r];return ke[e].apply(null,xe)},emscripten_resize_heap:e=>{var n=B().length;if(!((e>>>=0)<=n||2147483648<e))for(var t=1;t<=4;t*=2){var r=n*(1+.2/t),r=Math.min(r,e+100663296),i=Math;r=Math.max(e,r);e:{i=i.min.call(i,2147483648,r+(65536-r%65536)%65536)-w.buffer.byteLength+65535>>>16;try{w.grow(i),x();var a=1;break e}catch(e){}a=void 0}if(a)return!0}return!1},exit:de,fd_close:je,fd_seek:Ae,fd_write:Ie,memory:w||o.wasmMemory},Te=(!function(){function n(e,n){return e=e.exports,o.asm=e,R.B.push(o.asm._emscripten_tls_init),Z=o.asm.__indirect_function_table,V.unshift(o.asm.__wasm_call_ctors),z=n,ae(),e}var t,r,i,e={env:Re,wasi_snapshot_preview1:Re};if(ie(),o.instantiateWasm)try{return o.instantiateWasm(e,n)}catch(e){y("Module.instantiateWasm callback failed with error: "+e),a(e)}t=e,r=function(e){n(e.instance,e.module)},i=A,(_||"function"!=typeof WebAssembly.instantiateStreaming||oe(i)||i.startsWith("file://")||u||"function"!=typeof fetch?ue(i,t,r):fetch(i,{credentials:"same-origin"}).then(e=>WebAssembly.instantiateStreaming(e,t).then(r,function(e){return y("wasm streaming compile failed: "+e),y("falling back to ArrayBuffer instantiation"),ue(i,t,r)}))).catch(a)}(),o._jxlCreateInstance=function(){return(o._jxlCreateInstance=o.asm.jxlCreateInstance).apply(null,arguments)},o._jxlDestroyInstance=function(){return(o._jxlDestroyInstance=o.asm.jxlDestroyInstance).apply(null,arguments)},o._free=function(){return(o._free=o.asm.free).apply(null,arguments)},o._jxlProcessInput=function(){return(o._jxlProcessInput=o.asm.jxlProcessInput).apply(null,arguments)},o._malloc=function(){return(o._malloc=o.asm.malloc).apply(null,arguments)},o._jxlFlush=function(){return(o._jxlFlush=o.asm.jxlFlush).apply(null,arguments)},o._jxlDecompress=function(){return(o._jxlDecompress=o.asm.jxlDecompress).apply(null,arguments)},o._jxlCleanup=function(){return(o._jxlCleanup=o.asm.jxlCleanup).apply(null,arguments)},o._fflush=function(){return(Te=o._fflush=o.asm.fflush).apply(null,arguments)}),W=(o.__emscripten_tls_init=function(){return(o.__emscripten_tls_init=o.asm._emscripten_tls_init).apply(null,arguments)},o._pthread_self=function(){return(W=o._pthread_self=o.asm.pthread_self).apply(null,arguments)});function Ee(){return(Ee=o.asm.__funcs_on_exit).apply(null,arguments)}var Ce=o.__emscripten_thread_init=function(){return(Ce=o.__emscripten_thread_init=o.asm._emscripten_thread_init).apply(null,arguments)};function Pe(){return(Pe=o.asm._emscripten_run_in_main_runtime_thread_js).apply(null,arguments)}function We(){return(We=o.asm._emscripten_thread_free_data).apply(null,arguments)}o.__emscripten_thread_crashed=function(){return(o.__emscripten_thread_crashed=o.asm._emscripten_thread_crashed).apply(null,arguments)};var D,De=o.__emscripten_thread_exit=function(){return(De=o.__emscripten_thread_exit=o.asm._emscripten_thread_exit).apply(null,arguments)},Oe=o.__emscripten_check_mailbox=function(){return(Oe=o.__emscripten_check_mailbox=o.asm._emscripten_check_mailbox).apply(null,arguments)};function Be(){return(Be=o.asm.emscripten_stack_set_limits).apply(null,arguments)}function He(){return(He=o.asm.stackSave).apply(null,arguments)}function Ue(){return(Ue=o.asm.stackRestore).apply(null,arguments)}function Fe(){return(Fe=o.asm.stackAlloc).apply(null,arguments)}function Le(){function e(){if(!D&&(D=!0,o.calledRun=!0,!v)&&(c||T(V),r(o),o.onRuntimeInitialized&&o.onRuntimeInitialized(),!c)){if(o.postRun)for("function"==typeof o.postRun&&(o.postRun=[o.postRun]);o.postRun.length;){var e=o.postRun.shift();ee.unshift(e)}T(ee)}}if(!(0<M))if(c)r(o),c||T(V),startWorker(o);else{if(o.preRun)for("function"==typeof o.preRun&&(o.preRun=[o.preRun]);o.preRun.length;)$.unshift(o.preRun.shift());T($),0<M||(o.setStatus?(o.setStatus("Running..."),setTimeout(function(){setTimeout(function(){o.setStatus("")},1),e()},1)):e())}}if(o.dynCall_iiji=function(){return(o.dynCall_iiji=o.asm.dynCall_iiji).apply(null,arguments)},o.dynCall_jiji=function(){return(o.dynCall_jiji=o.asm.dynCall_jiji).apply(null,arguments)},o.keepRuntimeAlive=j,o.wasmMemory=w,o.ExitStatus=k,o.PThread=R,S=function e(){D||Le(),D||(S=e)},o.preInit)for("function"==typeof o.preInit&&(o.preInit=[o.preInit]);0<o.preInit.length;)o.preInit.pop()();return Le(),O.ready}})();"object"==typeof exports&&"object"==typeof module?module.exports=JxlDecoderModule:"function"==typeof define&&define.amd?define([],function(){return JxlDecoderModule}):"object"==typeof exports&&(exports.JxlDecoderModule=JxlDecoderModule);',
    'jxl_decoder.worker.js': '"use strict";var Module={},ENVIRONMENT_IS_NODE="object"==typeof process&&"object"==typeof process.versions&&"string"==typeof process.versions.node,nodeWorkerThreads,parentPort,fs,initializedJS=(ENVIRONMENT_IS_NODE&&(nodeWorkerThreads=require("worker_threads"),parentPort=nodeWorkerThreads.parentPort,parentPort.on("message",e=>onmessage({data:e})),fs=require("fs"),Object.assign(global,{self:global,require:require,Module:Module,location:{href:__filename},Worker:nodeWorkerThreads.Worker,importScripts:e=>(0,eval)(fs.readFileSync(e,"utf8")+"//# sourceURL="+e),postMessage:e=>parentPort.postMessage(e),performance:global.performance||{now:Date.now}})),!1);function threadPrintErr(){var e=Array.prototype.slice.call(arguments).join(" ");ENVIRONMENT_IS_NODE?fs.writeSync(2,e+"\\n"):console.error(e)}function threadAlert(){var e=Array.prototype.slice.call(arguments).join(" ");postMessage({cmd:"alert",text:e,threadId:Module._pthread_self()})}var err=threadPrintErr;function handleMessage(e){try{if("load"===e.data.cmd){let a=[];self.onmessage=e=>a.push(e),self.startWorker=e=>{Module=e,postMessage({cmd:"loaded"});for(var r of a)handleMessage(r);self.onmessage=handleMessage},Module.wasmModule=e.data.wasmModule;for(const t of e.data.handlers)Module[t]=(...e)=>{postMessage({cmd:"callHandler",handler:t,args:e})};var r;Module.wasmMemory=e.data.wasmMemory,Module.buffer=Module.wasmMemory.buffer,Module.ENVIRONMENT_IS_PTHREAD=!0,"string"==typeof e.data.urlOrBlob?importScripts(e.data.urlOrBlob):(r=URL.createObjectURL(e.data.urlOrBlob),importScripts(r),URL.revokeObjectURL(r)),JxlDecoderModule(Module)}else if("run"===e.data.cmd){Module.__emscripten_thread_init(e.data.pthread_ptr,0,0,1),Module.__emscripten_thread_mailbox_await(e.data.pthread_ptr),Module.establishStackSpace(),Module.PThread.receiveObjectTransfer(e.data),Module.PThread.threadInitTLS(),initializedJS=initializedJS||!0;try{Module.invokeEntryPoint(e.data.start_routine,e.data.arg)}catch(e){if("unwind"!=e)throw e}}else"cancel"===e.data.cmd?Module._pthread_self()&&Module.__emscripten_thread_exit(-1):"setimmediate"!==e.data.target&&("checkMailbox"===e.data.cmd?initializedJS&&Module.checkMailbox():e.data.cmd&&(err("worker.js received unknown command "+e.data.cmd),err(e.data)))}catch(e){throw Module.__emscripten_thread_crashed&&Module.__emscripten_thread_crashed(),e}}self.alert=threadAlert,Module.instantiateWasm=(e,r)=>{var a=Module.wasmModule;return Module.wasmModule=null,r(new WebAssembly.Instance(a,e))},self.onunhandledrejection=e=>{throw e.reason??e},self.onmessage=handleMessage;',
  };

  // Enable SharedArrayBuffer.
  const setCopHeaders = (headers) => {
    headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
    headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  };

  // Inflight object: {clientId, uid, timestamp, controller}
  const inflight = [];

  // Generate (very likely) unique string.
  const makeUid = () => {
    return Math.random().toString(36).substring(2) +
        Math.random().toString(36).substring(2);
  };

  // Make list (non-recursively) of transferable entities.
  const gatherTransferrables = (...args) => {
    const result = [];
    for (let i = 0; i < args.length; ++i) {
      if (args[i] && args[i].buffer) {
        result.push(args[i].buffer);
      }
    }
    return result;
  };

  // Serve items that are embedded in this service worker.
  const maybeProcessEmbeddedResources = (event) => {
    const url = event.request.url;
    // Shortcut for baked-in scripts.
    for (const [key, value] of Object.entries(EMBEDDED)) {
      if (url.endsWith(key)) {
        const headers = new Headers();
        headers.set('Content-Type', 'application/javascript');
        setCopHeaders(headers);

        event.respondWith(new Response(value, {
          status: 200,
          statusText: 'OK',
          headers: headers,
        }));
        return true;
      }
    }
    return false;
  };

  // Decode JXL image response and serve it as a PNG image.
  const wrapImageResponse = async (clientId, originalResponse) => {
    // TODO: cache?
    const client = await clients.get(clientId);
    // Client is gone? Not our problem then.
    if (!client) {
      return originalResponse;
    }

    const inputStream = await originalResponse.body;
    // Can't use "BYOB" for regular responses.
    const reader = inputStream.getReader();

    const inflightEntry = {
      clientId: clientId,
      uid: makeUid(),
      timestamp: Date.now(),
      inputStreamReader: reader,
      outputStreamController: null
    };
    inflight.push(inflightEntry);

    const outputStream = new ReadableStream({
      start: (controller) => {
        inflightEntry.outputStreamController = controller;
      }
    });

    const onRead = (chunk) => {
      const msg = {
        op: 'decodeJxl',
        uid: inflightEntry.uid,
        url: originalResponse.url,
        data: chunk.value || null
      };
      client.postMessage(msg, gatherTransferrables(msg.data));
      if (!chunk.done) {
        reader.read().then(onRead);
      }
    };
    // const view = new SharedArrayBuffer(65536);
    const view = new Uint8Array(65536);
    reader.read(view).then(onRead);

    let modifiedResponseHeaders = new Headers(originalResponse.headers);
    modifiedResponseHeaders.delete('Content-Length');
    modifiedResponseHeaders.set('Content-Type', 'image/png');
    modifiedResponseHeaders.set('Server', 'ServiceWorker');
    return new Response(outputStream, {headers: modifiedResponseHeaders});
  };

  // Check if response needs decoding; if so - do it.
  const wrapImageRequest = async (clientId, request) => {
    let modifiedRequestHeaders = new Headers(request.headers);
    modifiedRequestHeaders.append('Accept', 'image/jxl');
    let modifiedRequest =
        new Request(request, {headers: modifiedRequestHeaders});
    let originalResponse = await fetch(modifiedRequest);
    let contentType = originalResponse.headers.get('Content-Type');

    let isJxlResponse = (contentType === 'image/jxl');
    if (FORCE_DECODING && contentType === 'application/octet-stream') {
      isJxlResponse = true;
    }
    if (isJxlResponse) {
      return wrapImageResponse(clientId, originalResponse);
    }

    return originalResponse;
  };

  const reportError = (err) => {
    // console.error(err);
  };

  const upgradeResponse = (response) => {
    if (response.status === 0) {
      return response;
    }

    const newHeaders = new Headers(response.headers);
    setCopHeaders(newHeaders);

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  };

  // Process fetch request; either bypass, or serve embedded resource,
  // or upgrade.
  const onFetch = async (event) => {
    const clientId = event.clientId;
    const request = event.request;

    // Pass direct cached resource requests.
    if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') {
      return;
    }

    // Serve backed resources.
    if (maybeProcessEmbeddedResources(event)) {
      return;
    }

    // Notify server we are JXL-capable.
    if (request.destination === 'image') {
      let accept = request.headers.get('Accept');
      // Only if browser does not support JXL.
      if (accept.indexOf('image/jxl') === -1) {
        event.respondWith(wrapImageRequest(clientId, request));
      }
      return;
    }

    if (FORCE_COP) {
      event.respondWith(
          fetch(event.request).then(upgradeResponse).catch(reportError));
    }
  };

  // Serve decoded bytes.
  const onMessage = (event) => {
    const data = event.data;
    const uid = data.uid;
    let inflightEntry = null;
    for (let i = 0; i < inflight.length; ++i) {
      if (inflight[i].uid === uid) {
        inflightEntry = inflight[i];
        break;
      }
    }
    if (!inflightEntry) {
      console.log('Ooops, not found: ' + uid);
      return;
    }
    inflightEntry.outputStreamController.enqueue(data.data);
    inflightEntry.outputStreamController.close();
  };

  // This method is "main" for service worker.
  const serviceWorkerMain = () => {
    // https://v8.dev/blog/wasm-code-caching
    // > Every web site must perform at least one full compilation of a
    // > WebAssembly module — use workers to hide that from your users.
    // TODO(eustas): not 100% reliable, investigate why
    self['JxlDecoderLeak'] =
        WebAssembly.compileStreaming(fetch('jxl_decoder.wasm'));

    // ServiceWorker lifecycle.
    self.addEventListener('install', () => {
      return self.skipWaiting();
    });
    self.addEventListener(
        'activate', (event) => event.waitUntil(self.clients.claim()));
    self.addEventListener('message', onMessage);
    // Intercept some requests.
    self.addEventListener('fetch', onFetch);
  };

  // Service workers does not support multi-threading; that is why decoding is
  // relayed back to "client" (document / window).
  const prepareClient = () => {
    const clientWorker = new Worker('client_worker.js');
    clientWorker.onmessage = (event) => {
      const data = event.data;
      if (typeof addMessage !== 'undefined') {
        if (data.msg) {
          addMessage(data.msg, 'blue');
        }
      }
      navigator.serviceWorker.controller.postMessage(
          data, gatherTransferrables(data.data));
    };

    // Forward ServiceWorker requests to "Client" worker.
    navigator.serviceWorker.addEventListener('message', (event) => {
      clientWorker.postMessage(
          event.data, gatherTransferrables(event.data.data));
    });
  };

  // Executed in HTML page environment.
  const maybeRegisterServiceWorker = () => {
    const config = {
      log: console.log,
      error: console.error,
      requestReload: (msg) => window.location.reload(),
      ...window.serviceWorkerConfig  // add overrides
    }

    if (!window.isSecureContext) {
      config.log('Secure context is required for this ServiceWorker.');
      return;
    }

    const nav = navigator;  // Explicitly capture navigator object.
    const onServiceWorkerRegistrationSuccess = (registration) => {
      config.log('Service Worker registered', registration.scope);
      if (!registration.active || !nav.serviceWorker.controller) {
        config.requestReload(
            'Reload to allow Service Worker process all requests');
      }
    };

    const onServiceWorkerRegistrationFailure = (err) => {
      config.error('Service Worker failed to register:', err);
    };

    navigator.serviceWorker.register(window.document.currentScript.src)
        .then(
            onServiceWorkerRegistrationSuccess,
            onServiceWorkerRegistrationFailure);
  };

  const pageMain = () => {
    maybeRegisterServiceWorker();
    prepareClient();
  };

  // Detect environment and run corresponding "main" method.
  if (typeof window === 'undefined') {
    serviceWorkerMain();
  } else {
    pageMain();
  }
})();
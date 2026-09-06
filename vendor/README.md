# Vendored Three.js

`three.module.js`, `three.core.js`, `loaders/GLTFLoader.js` and `utils/BufferGeometryUtils.js` use Three.js r179 (0.179.0). The examples modules' bare `three` imports are changed to local `../three.module.js`; the runtime does not fetch a CDN.

Original source and license: https://github.com/mrdoob/three.js/tree/r179. The upstream MIT notice is included in `THREE-LICENSE.txt`.

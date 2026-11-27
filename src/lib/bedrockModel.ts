import * as THREE from 'three';

export interface BedrockFaceUv {
  uv: [number, number];
  uv_size: [number, number];
}

export interface BedrockCube {
  origin: [number, number, number];
  size: [number, number, number];
  inflate?: number;
  pivot?: [number, number, number];
  rotation?: [number, number, number];
  uv?: Record<'north' | 'east' | 'south' | 'west' | 'up' | 'down', BedrockFaceUv>;
}

export interface BedrockBone {
  name: string;
  parent?: string;
  pivot?: [number, number, number];
  rotation?: [number, number, number];
  cubes?: BedrockCube[];
}

export interface BedrockModelJson {
  'minecraft:geometry': Array<{
    description: {
      texture_width: number;
      texture_height: number;
    };
    bones: BedrockBone[];
  }>;
}

const SKIP_BONES = new Set(['righthand_pos', 'lefthand_pos', 'u12g']);

function applyBedrockFaceUv(
  geometry: THREE.BoxGeometry,
  uvMap: BedrockCube['uv'],
  texWidth: number,
  texHeight: number
) {
  if (!uvMap) return;

  // Mirroring X across YZ maps Bedrock -X (west) to Three +X and Bedrock +X (east) to Three -X
  const faceOrder: Array<'east' | 'west' | 'up' | 'down' | 'south' | 'north'> = [
    'west',
    'east',
    'up',
    'down',
    'south',
    'north',
  ];

  const uvAttr = geometry.attributes.uv as THREE.BufferAttribute;
  for (let faceIdx = 0; faceIdx < 6; faceIdx++) {
    const faceKey = faceOrder[faceIdx];
    const spec = uvMap[faceKey];
    if (!spec) continue;

    const [u, v] = spec.uv;
    const [us, vs] = spec.uv_size;

    const u0 = u / texWidth;
    const u1 = (u + us) / texWidth;
    const vTop = 1 - v / texHeight;
    const vBottom = 1 - (v + vs) / texHeight;

    const offset = faceIdx * 4;
    uvAttr.setXY(offset + 0, u0, vTop);
    uvAttr.setXY(offset + 1, u1, vTop);
    uvAttr.setXY(offset + 2, u0, vBottom);
    uvAttr.setXY(offset + 3, u1, vBottom);
  }
  uvAttr.needsUpdate = true;
}

export function buildBedrockGroup(
  model: BedrockModelJson,
  material: THREE.Material,
  targetExtent = 3.2
): THREE.Group {
  const geo = model['minecraft:geometry'][0];
  const texW = geo.description.texture_width || 128;
  const texH = geo.description.texture_height || 128;

  const root = new THREE.Group();
  const groups = new Map<string, THREE.Group>();
  const boneMap = new Map<string, BedrockBone>();

  for (const bone of geo.bones) {
    boneMap.set(bone.name, bone);
    const group = new THREE.Group();
    group.name = bone.name;
    groups.set(bone.name, group);
  }

  for (const bone of geo.bones) {
    const group = groups.get(bone.name)!;
    const [px, py, pz] = bone.pivot || [0, 0, 0];
    const worldPivot = new THREE.Vector3(-px, py, pz);

    const parentBone = bone.parent ? boneMap.get(bone.parent) : undefined;
    const parentGroup = bone.parent ? groups.get(bone.parent) : undefined;

    if (parentBone && parentGroup) {
      const [ppx, ppy, ppz] = parentBone.pivot || [0, 0, 0];
      group.position.set(worldPivot.x - -ppx, worldPivot.y - ppy, worldPivot.z - ppz);
      parentGroup.add(group);
    } else {
      group.position.copy(worldPivot);
      root.add(group);
    }

    if (bone.rotation) {
      const [rx, ry, rz] = bone.rotation;
      group.rotation.order = 'ZYX';
      group.rotation.set(
        THREE.MathUtils.degToRad(-rx),
        THREE.MathUtils.degToRad(-ry),
        THREE.MathUtils.degToRad(rz)
      );
    }

    if (SKIP_BONES.has(bone.name) || !bone.cubes?.length) continue;

    for (const cube of bone.cubes) {
      const inf = cube.inflate ?? 0;
      const sx = Math.max(0.01, cube.size[0] + inf * 2);
      const sy = Math.max(0.01, cube.size[1] + inf * 2);
      const sz = Math.max(0.01, cube.size[2] + inf * 2);

      const boxGeo = new THREE.BoxGeometry(sx, sy, sz);
      applyBedrockFaceUv(boxGeo, cube.uv, texW, texH);

      const mesh = new THREE.Mesh(boxGeo, material);
      const cx = -(cube.origin[0] + cube.size[0] / 2);
      const cy = cube.origin[1] + cube.size[1] / 2;
      const cz = cube.origin[2] + cube.size[2] / 2;

      if (cube.rotation) {
        const [cpx, cpy, cpz] = cube.pivot || [0, 0, 0];
        const cubePivotWorld = new THREE.Vector3(-cpx, cpy, cpz);
        const cubePivotGroup = new THREE.Group();
        cubePivotGroup.position.set(
          cubePivotWorld.x - worldPivot.x,
          cubePivotWorld.y - worldPivot.y,
          cubePivotWorld.z - worldPivot.z
        );
        cubePivotGroup.rotation.order = 'ZYX';
        cubePivotGroup.rotation.set(
          THREE.MathUtils.degToRad(-cube.rotation[0]),
          THREE.MathUtils.degToRad(-cube.rotation[1]),
          THREE.MathUtils.degToRad(cube.rotation[2])
        );
        mesh.position.set(
          cx - cubePivotWorld.x,
          cy - cubePivotWorld.y,
          cz - cubePivotWorld.z
        );
        cubePivotGroup.add(mesh);
        group.add(cubePivotGroup);
      } else {
        mesh.position.set(cx - worldPivot.x, cy - worldPivot.y, cz - worldPivot.z);
        group.add(mesh);
      }
    }
  }

  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const center = new THREE.Vector3();
  const size = new THREE.Vector3();
  box.getCenter(center);
  box.getSize(size);

  const wrapper = new THREE.Group();
  root.position.sub(center);
  wrapper.add(root);

  const maxDim = Math.max(size.x, size.y, size.z, 1);
  const scale = targetExtent / maxDim;
  wrapper.scale.setScalar(scale);

  return wrapper;
}

export const NOTGUNGUN_AUDIO = [
  { id: 'shot', vi: 'Bắn', en: 'Shot', src: '/audio/notgungun/shot.ogg', impulse: 1.0 },
  { id: 'inspect', vi: 'Kiểm tra', en: 'Inspect', src: '/audio/notgungun/inspect.ogg', impulse: 0.52 },
  { id: 'reload', vi: 'Nạp đạn', en: 'Reload', src: '/audio/notgungun/reload.ogg', impulse: 0.7 },
] as const;

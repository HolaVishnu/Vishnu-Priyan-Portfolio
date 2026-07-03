import * as THREE from "three";

/**
 * Space stations orbit, so their world positions change every frame.
 * The Stations component writes positions here; the CameraRig reads them
 * when a project is focused, keeping the cinematic zoom locked on target.
 */
const registry = new Map<string, THREE.Vector3>();

export function setStationPosition(id: string, position: THREE.Vector3): void {
  const existing = registry.get(id);
  if (existing) existing.copy(position);
  else registry.set(id, position.clone());
}

export function getStationPosition(id: string): THREE.Vector3 | undefined {
  return registry.get(id);
}

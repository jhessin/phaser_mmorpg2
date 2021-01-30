// setup Keys
export enum SpawnerType {
  MONSTER = 'MONSTER',
  CHEST = 'CHEST',
}

export function getTiledProperty(obj: any, propertyName: string) {
  for (let i = 0; i < obj.properties.length; i += 1) {
    const property = obj.properties[i];
    if (property.name === propertyName) {
      return property.value;
    }
  }
  return null;
}

export function randomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min)) + min;
}

export function randomPick(arr: Array<any>) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default {
  getTiledProperty,
  randomNumber,
  randomPick,
  SpawnerType,
};

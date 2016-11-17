import { IDiscoveryResult, IGameStored } from '../extensions/gamemode_management/types/IStateEx';
import { IProfile } from '../extensions/profile_management/types/IProfile';

/**
 * return an item from state or the fallback if the path doesn't lead
 * to an item.
 * 
 * @export
 * @template T
 * @param {*} state
 * @param {string[]} path
 * @param {T} fallback
 * @returns {T}
 */
export function getSafe<T>(state: any, path: string[], fallback: T): T {
  let current = state;
  for (let segment of path) {
    if ((current === undefined) || !current.hasOwnProperty(segment)) {
      return fallback;
    } else {
      current = current[segment];
    }
  }
  return current;
}

/**
 * set an item in state, creating all intermediate nodes as necessary
 * 
 * @export
 * @template T
 * @param {T} state
 * @param {string[]} path
 * @param {*} value
 * @returns {T}
 */
export function setSafe<T>(state: T, path: string[], value: any): T {
  let firstElement: string = path[0];
  let copy = Object.assign({}, state);
  if (path.length === 1) {
    copy[firstElement] = value;
  } else {
    if (!copy.hasOwnProperty(firstElement)) {
      copy[firstElement] = {};
    }
    copy[firstElement] = setSafe(copy[firstElement], path.slice(1), value);
  }
  return copy;
}

/**
 * sets a value or do nothing if the path doesn't exist
 * 
 * @export
 * @template T
 * @param {T} state
 * @param {string[]} path
 * @param {*} value
 * @returns {T}
 */
export function setOrNop<T>(state: T, path: string[], value: any): T {
  let firstElement: string = path[0];
  let copy = Object.assign({}, state);
  if (path.length === 1) {
    copy[firstElement] = value;
  } else {
    if (copy.hasOwnProperty(firstElement)) {
      copy[firstElement] = setOrNop(copy[firstElement], path.slice(1), value);
    }
  }
  return copy;
}

/**
 * delete a value or do nothing if the path doesn't exist
 * 
 * @export
 * @template T
 * @param {T} state
 * @param {string[]} path
 * @returns {T}
 */
export function deleteOrNop<T>(state: T, path: string[]): T {
  let firstElement: string = path[0];
  let copy = Object.assign({}, state);
  if (path.length === 1) {
    delete copy[firstElement];
  } else {
    if (copy.hasOwnProperty(firstElement)) {
      copy[firstElement] = deleteOrNop(copy[firstElement], path.slice(1));
    }
  }

  return copy;
}

function setDefaultArray<T>(state: T, path: string[], fallback: any[]): T {
  let firstElement: string = path[0];
  let copy = Object.assign({}, state);
  if (path.length === 1) {
    if (!copy.hasOwnProperty(firstElement) || (copy[firstElement] === undefined)) {
      copy[firstElement] = fallback;
    } else {
      copy[firstElement] = copy[firstElement].slice();
    }
  } else {
    if (!copy.hasOwnProperty(firstElement)) {
      copy[firstElement] = {};
    }
    copy[firstElement] = setDefaultArray(copy[firstElement], path.slice(1), fallback);
  }
  return copy;
}

/**
 * push an item to an array inside state. This creates all intermediate
 * nodes and the array itself as necessary
 * 
 * @export
 * @template T
 * @param {T} state
 * @param {string[]} path
 * @param {*} value
 * @returns {T}
 */
export function pushSafe<T>(state: T, path: string[], value: any): T {
  let copy = setDefaultArray(state, path, []);
  getSafe(copy, path, undefined).push(value);
  return copy;
}

/**
 * remove a value from an array by value
 * 
 * @export
 * @template T
 * @param {T} state
 * @param {string[]} path
 * @param {*} value
 * @returns {T}
 */
export function removeValue<T>(state: T, path: string[], value: any): T {
  let copy = setDefaultArray(state, path, []);
  let list = getSafe(copy, path, undefined);
  const idx = list.indexOf(value);
  if (idx !== -1) {
    list.splice(idx, 1);
  }
  return copy;
}

/**
 * remove all vales for which the predicate applies
 * 
 * @export
 * @template T
 * @param {T} state
 * @param {string[]} path
 * @param {(element: any) => boolean} predicate
 * @returns {T}
 */
export function removeValueIf<T>(state: T, path: string[],
                                 predicate: (element: any) => boolean): T {
  return setSafe(state, path, getSafe(state, path, []).filter((ele) => !predicate(ele)));
}

/**
 * shallow merge a value into the store at the  specified location
 * 
 * @export
 * @template T
 * @param {T} state
 * @param {string[]} path
 * @param {Object} value
 * @returns {T}
 */
export function merge<T>(state: T, path: string[], value: Object): T {
  const newVal = Object.assign({}, getSafe(state, path, {}), value);
  return setSafe(state, path, newVal);
}

/**
 * return the stored static details about the currently selected game mode
 * or a fallback with the id '__placeholder'
 * 
 * @export
 * @param {*} state
 * @returns {IGameStored}
 */
export function currentGame(state: any): IGameStored {
  const fallback = { id: '__placeholder', name: '<No game>', requiredFiles: [] };
  const gameMode = getSafe(state, [ 'settings', 'gameMode', 'current' ], undefined);
  let res = getSafe(state, ['session', 'gameMode', 'known'], []).find(
    (ele: IGameStored) => ele.id === gameMode);
  return res || fallback;
}

/**
 * return the discovery information about a game
 * 
 * @export
 * @param {*} state
 * @returns {IDiscoveryResult}
 */
export function currentGameDiscovery(state: any): IDiscoveryResult {
  const gameMode = getSafe(state, [ 'settings', 'gameMode', 'current' ], undefined);
  return getSafe(state, ['settings', 'gameMode', 'discovered', gameMode], undefined);
}

/**
 * return the currently active profile
 * 
 * @export
 * @param {*} state
 * @returns {IProfile}
 */
export function currentProfile(state: any): IProfile {
  const profileId = getSafe(state, [ 'gameSettings', 'profiles', 'currentProfile' ], undefined);
  return getSafe(state, [ 'gameSettings', 'profiles', 'profiles', profileId ], undefined);
}

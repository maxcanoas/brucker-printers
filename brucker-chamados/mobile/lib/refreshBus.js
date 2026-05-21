import { DeviceEventEmitter } from 'react-native';

const EVENT = 'chamados:refresh';

export function emitRefresh() {
  DeviceEventEmitter.emit(EVENT);
}

export function onRefresh(callback) {
  const sub = DeviceEventEmitter.addListener(EVENT, callback);
  return () => sub.remove();
}

import { PermissionsAndroid, Platform } from 'react-native';
import { setPermisions } from '../actions/permisionActions';
import { AppThunk } from '../store/store';

export const fetchPermisions = (): AppThunk => async dispatch => {
  try {
    const isAndroid13OrHigher =
      Platform.OS === 'android' && Platform.Version >= 33;

    if (isAndroid13OrHigher) {
      let micPermission: string = 'granted';
      try {
        micPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        );
      } catch (e) {}

      const getPermisions = {
        filesWrite: 'granted',
        filesRead: 'granted',
        microphone: micPermission,
      };

      dispatch(setPermisions({ ...getPermisions }));
      return getPermisions;
    }

    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    ]);

    const getPermisions = {
      filesWrite: granted['android.permission.WRITE_EXTERNAL_STORAGE'] ?? 'granted',
      filesRead: granted['android.permission.READ_EXTERNAL_STORAGE'] ?? 'granted',
      microphone: granted['android.permission.RECORD_AUDIO'] ?? 'granted',
    };

    dispatch(setPermisions({ ...getPermisions }));
    return getPermisions;
  } catch (err) {}

  return {
    filesWrite: 'denied',
    filesRead: 'denied',
    microphone: 'denied',
  };
};

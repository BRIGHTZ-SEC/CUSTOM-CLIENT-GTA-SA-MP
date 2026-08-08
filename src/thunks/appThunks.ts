import RNGpuInfo from 'react-native-gpu-info';
import { setGPU, setInitial } from '../actions/appActions';
import { AppThunk } from '../store/store';
import { fetchArticles } from './articleThunks';
import { fetchDistribution } from './distributionThunks';
import { fetchDonates } from './donateThunks';
import { appRegisterDeviceForRemoteMessages } from './notificationThunks';
import { fetchPermisions } from './permisionThunks';
import { fetchInitialSettings } from './settingsThunks';

export const fetchInitialApp = (): AppThunk => async dispatch => {
  try {
    let glRenderer = '';
    try {
      glRenderer = RNGpuInfo.getGlRenderer();
    } catch (e) {
      console.log('GPU Info Error:', e);
    }
    dispatch(setGPU(glRenderer));

    await dispatch(fetchPermisions()).catch(e => console.log('Permissions error:', e));
    await dispatch(fetchInitialSettings()).catch(e => console.log('Settings error:', e));
    await dispatch(fetchDistribution()).catch(e => console.log('Distribution error:', e));
    await dispatch(fetchArticles()).catch(e => console.log('Articles error:', e));
    await dispatch(fetchDonates()).catch(e => console.log('Donates error:', e));
    await dispatch(appRegisterDeviceForRemoteMessages()).catch(e => console.log('Remote messages error:', e));
  } catch (err) {
    console.log('Initial App Fetch Error:', err);
  } finally {
    dispatch(setInitial({ initial: true }));
  }
};


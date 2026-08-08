import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import { setModeType, setSettings } from '../actions/settingsActions';
import { FilePath } from '../features/fileManager';
import { parseINIString, stringifyIni } from '../helpers';
import { AppThunk } from '../store/store';

type SettingType = {
  client: {
    name: string;
  };
  gui: {
    fps: number;
    ChatMaxMessages: number;
    fpscounter: number;
    androidKeyboard: number;
    graphic: number;
  };
  server: {
    serverid: number;
  };
  launcher: {
    localhost: number;
    skip: number;
  };
};

const toPatch = FilePath.getPathDirSetting();

export const fetchInitialSettings = (): AppThunk => async dispatch => {
  try {
    const res = await RNFS.readFile(toPatch, 'utf8');
    let resParse = parseINIString(res) as SettingType;

    const name = resParse.client?.name ?? '';
    const fps = resParse.gui?.fps ?? 40;
    const chat = resParse.gui?.ChatMaxMessages ?? 6;
    const fpscounter = resParse.gui?.fpscounter ?? 0;
    const androidKeyboard = resParse.gui?.androidKeyboard ?? 0;

    const serverid = resParse.server?.serverid ?? -1;
    const graphic = resParse.gui?.graphic ?? 0;

    const localhost = resParse.launcher?.localhost ?? 0;
    const skip = resParse.launcher?.skip ?? 0;

    dispatch(
      setSettings({
        userName: name,
        fpsLimit: fps,
        serverid: serverid,
        pageSize: chat,
        graphic: graphic,
        fpscounter: fpscounter,
        androidKeyboard: androidKeyboard,
        localhost,
        skip,
      }),
    );
  } catch (errors) {}
};

export const fetchUserNameSetting =
  (userName: string): AppThunk =>
  async () => {
    try {
      const res = await RNFS.readFile(toPatch, 'utf8');
      let resParse = parseINIString(res) as { client: { name: string } };

      resParse = {
        ...resParse,
        client: { ...resParse.client, name: userName },
      };

      await RNFS.writeFile(toPatch, stringifyIni(resParse), 'utf8');
    } catch (error) {}
  };

export const fetchFpsSetting =
  (value: number): AppThunk =>
  async () => {
    try {
      const res = await RNFS.readFile(toPatch, 'utf8');
      let resParse = parseINIString(res) as { gui: { fps: number } };

      resParse = { ...resParse, gui: { ...resParse.gui, fps: value } };

      await RNFS.writeFile(toPatch, stringifyIni(resParse), 'utf8');
    } catch (error) {}
  };

export const fetchPageSizeSetting =
  (value: number): AppThunk =>
  async () => {
    try {
      const res = await RNFS.readFile(toPatch, 'utf8');
      let resParse = parseINIString(res) as {
        gui: { ChatMaxMessages: number };
      };

      resParse = {
        ...resParse,
        gui: { ...resParse.gui, ChatMaxMessages: value },
      };

      await RNFS.writeFile(toPatch, stringifyIni(resParse), 'utf8');
    } catch (error) {}
  };

export const fetchGraphicSetting =
  (value: number): AppThunk =>
  async () => {
    try {
      const res = await RNFS.readFile(toPatch, 'utf8');
      let resParse = parseINIString(res) as { gui: { graphic: number } };

      resParse = {
        ...resParse,
        gui: { ...resParse.gui, graphic: value ? 1 : 0 },
      };

      await RNFS.writeFile(toPatch, stringifyIni(resParse), 'utf8');
    } catch (error) {}
  };

export const fetchFPSSetting =
  (value: boolean): AppThunk =>
  async () => {
    try {
      const res = await RNFS.readFile(toPatch, 'utf8');
      let resParse = parseINIString(res) as { gui: { fpscounter: number } };

      resParse = {
        ...resParse,
        gui: { ...resParse.gui, fpscounter: value ? 1 : 0 },
      };

      await RNFS.writeFile(toPatch, stringifyIni(resParse), 'utf8');
    } catch (error) {}
  };

export const fetchKeyboardSetting =
  (value: boolean): AppThunk =>
  async () => {
    try {
      const res = await RNFS.readFile(toPatch, 'utf8');
      let resParse = parseINIString(res) as {
        gui: { androidKeyboard: number };
      };

      resParse = {
        ...resParse,
        gui: { ...resParse.gui, androidKeyboard: value ? 1 : 0 },
      };

      await RNFS.writeFile(toPatch, stringifyIni(resParse), 'utf8');
    } catch (error) {}
  };

export const fetchServerIdSetting =
  (value: number): AppThunk =>
  async () => {
    try {
      const res = await RNFS.readFile(toPatch, 'utf8');
      let resParse = parseINIString(res) as { server: { serverid: number } };

      resParse = {
        ...resParse,
        server: { ...resParse.server, serverid: value },
      };

      await RNFS.writeFile(toPatch, stringifyIni(resParse), 'utf8');
    } catch (error) {}
  };

export const fetchModeSetting =
  (value: number): AppThunk =>
  async dispatch => {
    try {
      await AsyncStorage.setItem('modeType', `${value}`);
      dispatch(setModeType(value));
    } catch (error) {
      dispatch(setModeType(0));
    }
  };

export const fetchModeInverseSetting =
  (): AppThunk => async (dispatch, state) => {
    const value = state().settings.modeType ? 0 : 1;

    try {
      await AsyncStorage.setItem('modeType', `${value}`);
      dispatch(setModeType(value));
    } catch (error) {
      dispatch(setModeType(0));
    }
  };

export const saveGameSettingsAndLaunch =
  (serverAddress?: string): AppThunk =>
  async (_, state) => {
    try {
      const userName = state().settings.userName || 'Player';
      const fpsLimit = state().settings.fpsLimit ?? 60;
      const pageSize = state().settings.pageSize ?? 6;
      const graphic = state().settings.graphic ?? 0;
      const fpscounter = state().settings.fpscounter ?? 0;
      const androidKeyboard = state().settings.androidKeyboard ?? 0;

      const addr = serverAddress || '45.146.6.6:7816';
      const parts = addr.split(':');
      const host = parts[0] || '45.146.6.6';
      const port = parts[1] ? parseInt(parts[1], 10) : 7816;

      const baseDir = FilePath.getPathDirCache();
      const sampDir = `${baseDir}/SAMP`;
      const iniPath = `${sampDir}/settings.ini`;

      if (!(await RNFS.exists(baseDir))) {
        await RNFS.mkdir(baseDir);
      }
      if (!(await RNFS.exists(sampDir))) {
        await RNFS.mkdir(sampDir);
      }

      let existing: any = {};
      try {
        if (await RNFS.exists(iniPath)) {
          const content = await RNFS.readFile(iniPath, 'utf8');
          existing = parseINIString(content) || {};
        }
      } catch (e) {}

      const newSettings = {
        ...existing,
        client: {
          ...(existing.client || {}),
          name: userName,
          host: host,
          port: port,
          password: '',
        },
        gui: {
          ...(existing.gui || {}),
          fps: fpsLimit,
          ChatMaxMessages: pageSize,
          graphic: graphic,
          fpscounter: fpscounter,
          androidKeyboard: androidKeyboard,
        },
        server: {
          ...(existing.server || {}),
          host: host,
          port: port,
        },
      };

      await RNFS.writeFile(iniPath, stringifyIni(newSettings), 'utf8');
    } catch (err) {
      console.warn('Error saving settings.ini:', err);
    }
  };


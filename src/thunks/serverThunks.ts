import { setServers } from '../actions/serverActions';
import { ServerService } from '../services/server.service';
import { AppThunk } from '../store/store';

export const fetchServers = (): AppThunk => async (dispatch, state) => {
  const servers = state().distribution.servers;

  if (servers.length > 0) {
    await Promise.all(
      servers.map(async server => {
        const parts = server.address.split(':');
        const ip = parts[0];
        const port = parts[1] ? parseInt(parts[1], 10) : 7777;

        try {
          const { players, maxplayers } = await ServerService.getOnline(
            ip,
            port,
          );
          dispatch(
            setServers({
              ...server,
              online: players,
              slot: maxplayers,
              status: true,
              loading: false,
            }),
          );
        } catch (e) {
          dispatch(
            setServers({
              ...server,
              online: 0,
              slot: 1000,
              status: false,
              loading: false,
            }),
          );
        }
      }),
    );
  }
};

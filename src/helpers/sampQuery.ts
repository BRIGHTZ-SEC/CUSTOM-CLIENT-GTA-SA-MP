import { Buffer } from 'buffer';
import dgram from 'react-native-udp';

type QueryType = {
  host: string;
  port?: number;
  timeout?: number;
  opcode?: 'i' | 'r' | 'd';
};

export type QueryTypeResponse = {
  passworded: string;
  players: number;
  maxplayers: number;
  hostname: string;
  gamemode: string;
  mapname: string;
};

export const getServerQuery = async (
  options: QueryType,
): Promise<QueryTypeResponse> => {
  const { host, port = 7777, opcode = 'i', timeout = 3000 } = options;

  return new Promise((resolve, reject) => {
    let socket: any = null;
    let isSettled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const cleanup = () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      if (socket) {
        try {
          socket.close();
        } catch (e) {}
        socket = null;
      }
    };

    const fail = (err?: any) => {
      if (!isSettled) {
        isSettled = true;
        cleanup();
        reject(err ?? new Error('Query failed'));
      }
    };

    const succeed = (res: QueryTypeResponse) => {
      if (!isSettled) {
        isSettled = true;
        cleanup();
        resolve(res);
      }
    };

    timer = setTimeout(() => {
      fail(new Error('Timeout'));
    }, timeout);

    try {
      socket = dgram.createSocket({ type: 'udp4' });

      socket.on('error', (err: any) => {
        fail(err);
      });

      let packet = Buffer.alloc(11);
      packet.write('SAMP');
      const parts = host.split('.').map(p => parseInt(p, 10));
      packet[4] = isNaN(parts[0]) ? 0 : parts[0] & 0xff;
      packet[5] = isNaN(parts[1]) ? 0 : parts[1] & 0xff;
      packet[6] = isNaN(parts[2]) ? 0 : parts[2] & 0xff;
      packet[7] = isNaN(parts[3]) ? 0 : parts[3] & 0xff;
      packet[8] = port & 0xff;
      packet[9] = (port >> 8) & 0xff;
      packet[10] = opcode.charCodeAt(0);

      socket.bind(() => {
        if (isSettled || !socket) return;

        socket.send(packet, 0, packet.length, port, host, (error: any) => {
          if (error) {
            fail(error);
          }
        });
      });

      socket.on('message', (message: Buffer) => {
        if (isSettled) return;

        try {
          if (message.length < 11) {
            return fail(new Error('Packet too short'));
          }

          const payload = message.slice(11);
          let object: QueryTypeResponse = {
            passworded: '0',
            players: 0,
            maxplayers: 0,
            hostname: '',
            gamemode: '',
            mapname: '',
          };

          let offset = 0;

          if (opcode === 'i') {
            if (payload.length < 11) {
              return fail(new Error('Payload too short'));
            }

            object.passworded = String(payload.readUInt8(offset));
            offset += 1;

            object.players = payload.readUInt16LE(offset);
            offset += 2;

            object.maxplayers = payload.readUInt16LE(offset);
            offset += 2;

            // Hostname
            if (offset + 4 > payload.length) return fail(new Error('Invalid hostname len'));
            let strlen = payload.readUInt32LE(offset);
            offset += 4;
            if (offset + strlen > payload.length) return fail(new Error('Invalid hostname bytes'));
            object.hostname = decode(payload.slice(offset, offset + strlen));
            offset += strlen;

            // Gamemode
            if (offset + 4 > payload.length) return fail(new Error('Invalid gamemode len'));
            strlen = payload.readUInt32LE(offset);
            offset += 4;
            if (offset + strlen > payload.length) return fail(new Error('Invalid gamemode bytes'));
            object.gamemode = decode(payload.slice(offset, offset + strlen));
            offset += strlen;

            // Mapname
            if (offset + 4 > payload.length) return fail(new Error('Invalid mapname len'));
            strlen = payload.readUInt32LE(offset);
            offset += 4;
            if (offset + strlen > payload.length) return fail(new Error('Invalid mapname bytes'));
            object.mapname = decode(payload.slice(offset, offset + strlen));
          }

          succeed(object);
        } catch (e) {
          fail(e);
        }
      });
    } catch (error) {
      fail(error);
    }
  });
};

const decode = (buffer: Buffer) => {
  if (!buffer || buffer.length === 0) return '';
  try {
    let charset = '';
    for (let i = 0; i < 128; i++) {
      charset += String.fromCharCode(i);
    }
    charset +=
      '€‚ƒ„…†‡‰‹‘’“”•–—™› ΅Ά£¤¥¦§¨©«¬­®―°±²³΄µ¶·ΈΉΊ»Ό½ΎΏΐΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩΪΫάέήίΰαβγδεζηθικλμνξοπρςστυφχψωϊϋόύώ';

    const charsetBuffer = Buffer.from(charset, 'ucs2');
    const decodeBuffer = Buffer.alloc(buffer.length * 2);

    for (let i = 0; i < buffer.length; i++) {
      const idx = buffer[i] * 2;
      if (idx + 1 < charsetBuffer.length) {
        decodeBuffer[i * 2] = charsetBuffer[idx];
        decodeBuffer[i * 2 + 1] = charsetBuffer[idx + 1];
      }
    }
    return decodeBuffer.toString('ucs2');
  } catch (e) {
    return buffer.toString('utf8');
  }
};

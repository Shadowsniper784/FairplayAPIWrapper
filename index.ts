import axios, { AxiosInstance } from "axios";

import { authenticate } from "@xboxreplay/xboxlive-auth";

interface EconomyPlusStats {
  kicks: number;
  windows: number;
  andriod: number;
  other: number;
  alting: number;
  gamerscore: number;
  followers: number;
  friends: number;
  crasherattacks: number;
  messagesrelayed: number;
  authentications: number;
  globaldb: number;
}

interface AuthOptions {
  minGames: number;
  bannedTime: number;
  minFollowers: number;
  minFriends: number;
  minGamerscore: number;
}

class EconomyPlus {
  private axios: AxiosInstance;
  private xboxLiveToken: string = "";
  private xboxLiveExpireDate: number = 0;

  constructor(private apiKey: string) {
    this.axios = axios.create({
      baseURL: "https://apiv2.economyplus.solutions/api",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        fairplay: apiKey,
      },
    });
  }

  /**
   * @description Fetch the stats of the EconomyPlus bot and api
   */
  getStats(): Promise<EconomyPlusStats> {
    return this.axios.get("/resources").then((res) => res.data);
  }
  async getUser(xuid: string): Promise<any> {
    let res = await this.axios.get(`/flag/${xuid}`).then((res) => res.data);
    console.log(res);

    if (res.Flagged == false)
      return {
        error: false,
        flagged: false,
        message: null,
      };
    else if (res.Flagged == true)
      return {
        error: false,
        flagged: true,
        message: res.Reason + " - " + res.Data,
        username: res.Username,
      };
  }
  async getSkin(xuid: string): Promise<any> {
    let res = await this.axios
      .get(`/skin/${xuid}`)
      .then((res) => {
        Buffer.from(res.data, "base64");
      });
    if (typeof res == "object")
      return {
        found: false,
        data: null,
      };
    return {
      found: true,
      data: res,
    };
  }

  authenticate(email: string, password: string) {
    if (this.xboxLiveToken || this.xboxLiveExpireDate > Date.now()) return;
    return authenticate(email, password).then((r) => {
      //@ts-ignore
      this.xboxLiveToken = `XBL3.0 x=${r.user_hash};${r.xsts_token}`;
      //@ts-ignore
      this.xboxLiveExpireDate = new Date(r.expiresOn).getTime();
    });
  }

  async auth(xuid: string, options: AuthOptions) {
    if (!this.xboxLiveToken || this.xboxLiveExpireDate < Date.now())
      throw new Error(
        "No Xbox Live Token Provided or it has expired, please use await this.authenticate(email, password)"
      );
    let res = await this.axios
      .get(
        `/auth/${xuid}/${options.minGames}/${options.bannedTime}/${options.minFollowers}/${options.minFollowers}/${options.minGamerscore}`,
        {
          headers: {
            Authorization: this.xboxLiveToken,
          },
        }
      )
      .then((res) => res.data);
    if (res.error) {
      return res;
    }
    console.log(res);
    return {
      error: false,
      code: res.code,
      kick: res.kick,
      reason: res.reason,
      android: {
        hasPlayed: res.android,
        playedTime: res.time1,
      },
      launcher: {
        hasPlayed: res.launcher,
        playedTime: res.time2,
      },
      windows: {
        hasPlayed: res.windows,
        playedTime: res.time3,
      },
      kindle: {
        hasPlayed: res.kindle,
        playedTime: res.time4,
      },
      games: [
        {
          name: res.game1,
          playedTime: res.game1time,
        },
        {
          name: res.game2,
          playedTime: res.game2time,
        },
        {
          name: res.game3,
          playedTime: res.game3time,
        },
        {
          name: res.game4,
          playedTime: res.game4time,
        },
        {
          name: res.game5,
          playedTime: res.game5time,
        },
        {
          name: res.game6,
          playedTime: res.game6time,
        },
        {
          name: res.game7,
          playedTime: res.game7time,
        },
        {
          name: res.game8,
          playedTime: res.game8time,
        },
        {
          name: res.game9,
          playedTime: res.game9time,
        },
        {
          name: res.game10,
          playedTime: res.game10time,
        },
      ],
      gamesOwned: res.gamesowned,
      gamertag: res.ign,
      pfp: res.pfp,
      privateHistory: res.private,
    };
  }
}

testNoOne();

async function testNoOne() {
  let instance = new EconomyPlus("a3fb854e64b235a563e2e42f939d387e");

  await instance.authenticate("****@outlook.com", "****");

  instance
    .auth("2533274801587734", {
      bannedTime: 200,
      minFollowers: 0,
      minFriends: 0,
      minGamerscore: 0,
      minGames: 0,
    })
    .then((r) => {
      console.log(r);
    });
}

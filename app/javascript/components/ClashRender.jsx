import React from "react";
import _ from "lodash";
import Tiles from "./Tiles";
import Ammos from "./Ammos";
import PlayersRender from "./PlayersRender";
import Stats from "./Stats";
import Shoots from "./Shoots";
import Notifications from "./Notifications";

import ClashJS from "../clashjs/ClashCore";
import {
  AUDIO_DOMINATING,
  AUDIO_FIRST_BLOOD,
  AUDIO_GOD_LIKE,
  AUDIO_KILLING_SPREE,
  AUDIO_OWNAGE,
  audioExplosions,
  audioLasers,
  audioStreak,
  audioStreakMore,
} from "../lib/sound-effects";

const DEBUG = document.location.search.includes("debug");
const NOBOTS = document.location.search.includes("nobots");

const TIME_WAIT = 500;
const DEFAULT_SPEED = 500;

const EXPIRE_NOTIF_TIME = 7 * 1000;

class Clash extends React.Component {
  constructor(props) {
    super(props);
    const { players, subscription } = props;

    this.state = {
      clashState: null,
      shoots: [],
      notifications: [],
      finished: false,
      speed: DEFAULT_SPEED,
    };
    const playerDefinitionArray = _.shuffle([
      // Merge built-in AI players with Rails suppiled players
      ...(NOBOTS
        ? []
        : [
            require("../players/manuelmhtr"),
            require("../players/ericku"),
            require("../players/siegfried"),
            require("../players/horror"),
            require("../players/elperron"),
            require("../players/yuno"),
            require("../players/xmontoya"),
            require("../players/margeux"),
          ].map((p) => ({
            ...p,
          }))),
      ...players.map((playerObject) => ({
        info: {
          name: playerObject.name,
          style: playerObject.style,
        },
        ai: async (player, enemies, map) => {
          subscription.send({
            type: "player_wait_for_command",
            player_id: playerObject.id,
            state: {
              player,
              enemies,
              map,
            },
          });
          await new Promise((resolve) => {
            setTimeout(resolve, TIME_WAIT);
          });
          subscription.send({
            type: "player_wait_for_command_finish",
            player_id: playerObject.id,
          });
          while (!playerObject.command) {
            await new Promise((resolve) => requestAnimationFrame(resolve));
            console.log("Waiting for command", playerObject.command);
          }
          return playerObject.command;
        },
      })),
    ]);
    this.ClashInstance = new ClashJS(playerDefinitionArray);
    this.ClashInstance.newGame();
  }

  componentWillMount() {
    this.ClashInstance.addListener(({ name, payload }) => {
      if (name === "SHOOT") {
        const audio =
          audioLasers[Math.floor(Math.random() * audioLasers.length)];
        audio.play();
        this.setState((state) => {
          return {
            shoots: [
              ...state.shoots,
              {
                direction: payload.direction,
                origin: payload.origin.slice(),
                time: new Date().getTime(),
              },
            ],
          };
        });
        return;
      }

      if (name === "KILL") return this.handleKill(payload);
      if (name === "WIN") {
        const winner = _.get(payload, ["winner", "info", "name"]);
        if (winner) {
          this.pushNotification({
            text: (
              <div style={{ color: "#2ecc71" }}>
                <strong>{winner}</strong> won this one!
              </div>
            ),
          });
        }
        this.newGame();
        return;
      }
      if (name === "DRAW") {
        this.pushNotification({
          text: <strong style={{ color: "#f39c12" }}>We got a draw!</strong>,
        });
        this.newGame();
        return;
      }
      if (name === "PRE_DRAW") {
        this.pushNotification({
          text: `They are too strong!`,
        });
      }
      if (name === "GAME_OVER") return this.endGame();
    });

    this.nextTurn();
  }

  newGame() {
    if (
      this.ClashInstance.getState().rounds >=
      this.ClashInstance.getState().totalRounds
    ) {
      return;
    }

    this.pushNotification({
      text: `Starting a new game!`,
    });

    this.setState(
      {
        speed: DEFAULT_SPEED,
      },
      () => {
        this.ClashInstance.newGame();
      }
    );
  }

  async nextTurn() {
    const { speed, finished } = this.state;

    if (finished) {
      return;
    }

    const now = Date.now();
    const newClashState = await this.ClashInstance.nextPly();
    const timeSpent = Date.now() - now;
    this.setState(
      {
        clashState: newClashState,
      },
      () => {
        const alivePlayerCount = this.ClashInstance.getAlivePlayerCount();

        if (alivePlayerCount >= 2) {
          window.setTimeout(() => {
            this.nextTurn();
          }, Math.max(speed - timeSpent, 1));
        }
      }
    );
  }

  handleKill({ killer, killed }) {
    this.pushNotification({
      text: `${killer.name} eliminated ${_.map(
        killed,
        (player) => player.name
      ).join(",")}`,
    });

    setTimeout(() => {
      console.log("Killing streak", this.killingStreak);
      let audio = null;
      if (this.killingStreak <= 3) {
        audio = audioStreak[this.killingStreak - 1];
      } else {
        audio = audioStreakMore[this.killingStreak % audioStreakMore.length];
      }
      audio.play();
    }, 200);
    this.killingStreak ||= 0;
    this.killingStreak += 1;
  }

  endGame() {
    const clashState = this.ClashInstance.getState();

    const winner = _.sortBy(
      clashState.gameStats,
      (playerStats) => playerStats.score * -1 + playerStats.wins * -0.1
    )[0];

    this.pushNotification({
      expire: Infinity,
      text: (
        <b style={{ color: "#2ecc71", fontWeight: 600 }}>
          Congratulations {winner.name}!
        </b>
      ),
    });

    this.pushNotification({
      expire: Infinity,
      text: (
        <div>
          <button
            style={{
              border: "none",
              height: "2rem",
              padding: "0 1rem",
              fontSize: "14px",
              borderRadius: "4",
            }}
            onClick={() => {
              window.location.reload();
            }}
          >
            Start Again
          </button>
        </div>
      ),
    });

    this.setState({
      shoots: [],
      finished: true,
    });
  }

  pushNotification({ text, expire }) {
    this.setState((state) => {
      return {
        notifications: [
          ...state.notifications,
          {
            expire: expire || new Date().getTime() + EXPIRE_NOTIF_TIME,
            date: new Date().getTime(),
            text: text,
            id: state.notifications.length,
          },
        ],
      };
    });
  }

  render() {
    if (!this.state) return null;

    const { shoots, speed, notifications } = this.state;
    const {
      gameStats,
      playerStates,
      playerInstances,
      rounds,
      totalRounds,
      gameEnvironment,
    } = this.ClashInstance.getState();

    return (
      <div className="clash">
        <Tiles gridSize={gameEnvironment.gridSize} />
        <Shoots shoots={shoots.slice()} gridSize={gameEnvironment.gridSize} />
        <Ammos
          gridSize={gameEnvironment.gridSize}
          ammoPosition={gameEnvironment.ammoPosition}
        />
        <PlayersRender
          speed={speed}
          gridSize={gameEnvironment.gridSize}
          playerInstances={playerInstances}
          playerStates={playerStates}
        />
        <Notifications notifications={notifications} />
        <Stats rounds={rounds} total={totalRounds} gameStats={gameStats} />
        {DEBUG && (
          <pre className="debugger">
            <b>playerInstances</b>
            {JSON.stringify(playerInstances, 0, 2)}
            <hr />
            <b>playerStates</b>
            {JSON.stringify(playerStates, 0, 2)}
          </pre>
        )}
      </div>
    );
  }
}

export default Clash;

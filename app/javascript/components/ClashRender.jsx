import React from "react";
import _ from "lodash";
import Tiles from "./Tiles";
import Ammos from "./Ammos";
import PlayersRender from "./PlayersRender";
import Stats from "./Stats";
import Shoots from "./Shoots";
import Notifications from "./Notifications";

import ClashJS from "../clashjs/ClashCore";

const DEBUG = document.location.search.includes("debug");

const DEFAULT_SPEED = DEBUG ? 32 : 200;
const MAX_SPEED = DEBUG ? 32 : 100;

const EXPIRE_NOTIF_TIME = 7 * 1000;

class Clash extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      clashState: null,
      shoots: [],
      speed: DEFAULT_SPEED,
      notifications: [],
      finished: false,
    };
    const playerDefinitionArray = _.shuffle([
      // Merge built-in AI players with Rails suppiled players
      require("../players/manuelmhtr"),
      require("../players/ericku"),
      require("../players/siegfried"),
      require("../players/horror"),
      require("../players/elperron"),
      require("../players/yuno"),
      require("../players/xmontoya"),
      require("../players/margeux"),
      // ...this.props.players.map(({ id, name, style }) => ({
      //   info: {
      //     name,
      //     style,
      //   },
      //   ai: async (player, enemies, map) => {
      //     const url = `/players/${id}.json`;
      //     await fetch(url, {
      //       method: "PUT",
      //       headers: {
      //         Accept: "application/json",
      //         "Content-Type": "application/json",
      //       },
      //       body: JSON.stringify({
      //         player: {
      //           waiting_for_command: true,
      //           state_json: JSON.stringify({
      //             player,
      //             enemies,
      //             map,
      //           }),
      //         },
      //       }),
      //     });
      //     await new Promise((resolve) => {
      //       setTimeout(resolve, 200);
      //     });
      //     const data = await fetch(url, {
      //       method: "PUT",
      //       headers: {
      //         Accept: "application/json",
      //         "Content-Type": "application/json",
      //       },
      //       body: JSON.stringify({
      //         player: {
      //           waiting_for_command: false,
      //         },
      //       }),
      //     }).then((res) => res.json());
      //     const command = data.command;
      //     return command;
      //   },
      // })),
    ]);
    this.ClashInstance = new ClashJS(playerDefinitionArray);
    this.ClashInstance.newGame();
  }

  componentWillMount() {
    this.ClashInstance.addListener(({ name, payload }) => {
      if (name === "SHOOT") {
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

    this.setState(
      {
        clashState: await this.ClashInstance.nextPly(),
        speed:
          this.state.speed > MAX_SPEED
            ? parseInt(this.state.speed * 0.98, 10)
            : MAX_SPEED,
      },
      () => {
        const alivePlayerCount = this.ClashInstance.getAlivePlayerCount();

        if (alivePlayerCount >= 2) {
          window.setTimeout(() => {
            this.nextTurn();
          }, speed);
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

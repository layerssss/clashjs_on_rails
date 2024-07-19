import "../styles.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { createConsumer } from "@rails/actioncable";

import ClashRender from "../components/ClashRender";

document.addEventListener("DOMContentLoaded", () => {
  console.log("Hello World from Webpacker");
  const battleElement = document.getElementById("battle");
  if (battleElement) {
    const root = ReactDOM.createRoot(battleElement);
    let players = [];
    root.render(<div id="container">Connecting...</div>);

    const consumer = createConsumer();
    const subscription = consumer.subscriptions.create("BattleChannel", {
      received: ({ type, ...others }) => {
        console.log("ActionCable", type, others);
        if (type === "connected") {
          players = others.players;
          root.render(
            <React.StrictMode>
              <ClashRender players={players} subscription={subscription} />
            </React.StrictMode>
          );
        }
        if (type === "player_command") {
          const { command, player_id } = others;
          const player = players.find((p) => p.id === player_id);
          player.command = command || "null";
        }
        if (type === "conflict") {
          root.render(
            <div id="container">
              Another Clash.js client running. Please make sure only one tab is
              open.
            </div>
          );
        }
      },
    });
  }
});

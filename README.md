# Clash.js on Rails (not JavaScript)

Hacknight for writing an AI in a battle game.

I went to a Hacknight running on [Clash.js](https://github.com/javierbyte/clashjs) at a JavaScript meetup. It was pretty cool. Everyone wrote their AI to practice fight against the bots. Near the end of the meetup, all code got merged into a single repo and a final tourament was ran on a big screen on the host's laptop.

Now I want to run this on a Ruby meetup. The problem is you can't write JavaScript on a Ruby meetup (well you kinda can). So here is the hack. I pulled Clash.js onto a Rails app, then modified the AI to: instead of running the logic inside the browser, it posts states back onto server via ActionCable, wait for the 200ms, then pull "commmand" back from the server. So the client implementing your real AI logic can be written by Ruby, or in fact any language as long as it can GET and PUT from the server API.

It's quite funny now the browser has become the "server". It runs the main game logic with mostly unmodified Clash.js code in the browser tab. Then the Rails application becomes the database. Finally the client can be writter in Ruby (or event Python o_O).

# Development (for your AI battleship)

Nothing to setup for Rails, sqlite as database.

```
bundle install
# run Rails server
rails s
# run webpack
bin/shakapacker-dev-server
```

Open http://localhost:3000/ to setup your players info and getting a URL to issue GET and PUT from the client
Open http://localhost:3000/players/battle/ on a browser tab to run the game. Make sure you only have 1 open tab of this.
Pick an example from [./example_clients](./example_clients/) to start writing and running your AI battle ship. Make sure you change the API URL to the player you created.
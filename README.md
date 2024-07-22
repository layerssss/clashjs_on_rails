# Clash.js on Rails (not JavaScript)

Hacknight for writing an AI in a battle game.

I went to a Hacknight running on [Clash.js](https://github.com/javierbyte/clashjs) at a JavaScript meetup. It was pretty cool. Everyone wrote their AI to practice fighting against the bots. Near the end of the meetup, all code got merged into a single repo and a final tourament was held on a big screen on the host's laptop.

Now I want to run this in a Ruby meetup. The problem is you can't write JavaScript on a Ruby meetup (well you kinda can). So here is the hack. I pulled Clash.js onto a Rails app, then modified the AI to: instead of running the logic inside the browser, it posts states back onto server via ActionCable, wait for the 200ms, then pull "commmand" back from the server. So your own AI logic can be written in Ruby, or in fact any languages as long as it can GET and PUT from the server API.

It's quite funny now the browser has become the "server". It runs the main game logic with mostly unmodified Clash.js code in the browser tab. Then the Rails application becomes the database. Finally the "client" can be writter in Ruby (or event Python o_O).

# Development (with shared Battle ground)

Head over to the link provided by Meetup host to setup your player info.

Follow example in [example_clients/random.rb](example_clients/random.rb) to write your own AI in your own programming language of choice.

The basic idea is to keep checking a GET endpoint to wait for your turn to issue a command (indicated by `waiting_for_command` field). Then within 200ms of that moment. You have to issue a PUT request to specify the command you want to execute, which will be picked up at the end of the 200ms wait.

If you send the command too late, say if you are debugging and put a breakpoint (aka `binding.pry`), the command will be picked up next round.

Invalid commands will be ignored (handled by Clash.js).

Please always call API endpoint associated with your own Player if you are using a shared Battle ground :)

# Development (with your own Battle ground)

Clone the repo. It's a very simple Rails application, with sqlite as database. You do need these do be available:

* ruby
* bundler
* nodejs

```
bundle install

# run Rails server
rails s

# run Webpack DevServer
bin/shakapacker-dev-server
```

Open http://localhost:3000/ to setup your players info and getting a URL to issue GET and PUT from the client.

Open http://localhost:3000/players/battle/ in a browser tab to run the battle ground logic / Clash.js. Make sure you have one and only one open tab of this as the whole battle ground logic will run inside that browser tab.
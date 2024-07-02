# frozen_string_literal: true

url = 'http://localhost:3000/players/1.json'

loop do
  sleep 0.1
  data = HTTParty.get(url).parsed_response
  waiting_for_command = data.fetch('waiting_for_command')
  next unless waiting_for_command

  state = data.fetch('state')
  puts "state: #{state.inspect}"
  command = %w[north south east west shoot move].sample
  puts "command: #{command}"
  HTTParty.put(
    url,
    headers: { 'Content-Type' => 'application/json' },
    body: {  player: { command:, waiting_for_command: false } }.to_json
  )
end

# frozen_string_literal: true

API_URL = 'http://localhost:3000/players/1.json'

loop do
  sleep 0.1
  data = HTTParty.get(API_URL).parsed_response
  waiting_for_command = data.fetch('waiting_for_command')
  next unless waiting_for_command

  state = data.fetch('state')
  puts "state: #{state.inspect}"
  command = %w[north south east west shoot shoot move move move move move move].sample
  puts "command: #{command}"
  HTTParty.put(
    API_URL,
    headers: { 'Content-Type' => 'application/json' },
    body: {  player: { command:, waiting_for_command: false } }.to_json
  )
end

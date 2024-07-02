# Created by Roberto Alvarez on 7/29/2015
# Translated to Ruby with help of ChatGPT

require_relative './utils'

API_URL = 'http://localhost:3000/players/2.json'

def ai(player_state, enemies_states, game_environment)
  turns_complete = 0
  current_direction = 0
  old_best_ammo = nil
  directions = {
    1 => 'north',
    2 => 'east',
    3 => 'south',
    4 => 'west'
  }

  direction_to_target = nil

  # Hasta la vista baby !!!
  if Utils.can_kill(player_state, enemies_states) && player_state[:ammo] > 0
    return 'shoot'
  end

  if player_state[:ammo].zero? || turns_complete == 1
    to_position = get_best_ammo(player_state[:position], game_environment)

    # If I have enough shots to eliminate all enemies, I head towards them
    # if player_state[:ammo] >= get_count_enemies_alive(enemies_states)
    #   to_position = enemies_states[0][:position]
    # end

    direction_to_target = Utils.get_direction(player_state[:position], to_position)

    if is_on_ammo(player_state[:position], old_best_ammo)
      turns_complete = 0
    end

    # Save reference of the position I previously headed to
    old_best_ammo = to_position

    # If it has already moved, change my direction
    return direction_to_target if direction_to_target != player_state[:direction]

    return 'move'
  else
    # If it has weapons, make it turn
    current_direction += 1
    if current_direction > 4
      current_direction = 1
      turns_complete += 1
    end

    return directions[current_direction]
  end

  Utils.random_move
end

# Returns the direction of the closest ammo based on the current position of the ship
def get_best_ammo(player_position, game_environment)
  my_position = player_position
  distance_min = 22
  ammo_min = nil
  game_environment[:ammoPosition].each do |ammo|
    dif_x_by_me = (my_position[1] - ammo[1]).abs
    dif_y_by_me = (my_position[0] - ammo[0]).abs
    distance_by_me = dif_x_by_me + dif_y_by_me

    if distance_by_me < distance_min
      distance_min = distance_by_me
      ammo_min = ammo
    end
  end

  ammo_min
end

# Returns the number of living enemies
def get_count_enemies_alive(enemies_states)
  count_enemies = 0

  enemies_states.each do |enemy|
    count_enemies += 1 if enemy[:isAlive]
  end

  count_enemies
end

# Returns whether the ship is positioned in the same place as the ammo
def is_on_ammo(player_position, ammo)
  return false if ammo.nil?

  ammo[0] == player_position[0] && ammo[1] == player_position[1]
end

loop do
  sleep 0.1
  data = HTTParty.get(API_URL).parsed_response
  waiting_for_command = data.fetch('waiting_for_command')
  next unless waiting_for_command

  state = data.fetch('state')
  command = ai(
    HashWithIndifferentAccess.new(state.fetch('player')),
    HashWithIndifferentAccess.new(state.fetch('enemies')),
    HashWithIndifferentAccess.new(state.fetch('map'))
  )
  puts "command: #{command}"
  HTTParty.put(
    API_URL,
    headers: { 'Content-Type' => 'application/json' },
    body: {  player: { command:, waiting_for_command: false } }.to_json
  )
end
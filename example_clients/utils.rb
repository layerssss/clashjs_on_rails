# frozen_string_literal: true

# Translated from: https://github.com/javierbyte/clashjs/blob/master/src/lib/utils.js
# ... with the help of ChatGPT

DIRECTIONS = %w[north east south west].freeze
MOVEMENTS = %w[north east south west shoot].freeze

class Utils
  def self.random_move
    rand > 0.33 ? 'move' : MOVEMENTS.sample
  end

  def self.safe_random_move
    rand > 0.33 ? 'move' : DIRECTIONS.sample
  end

  def self.turn(current_position = '', how_much_turn)
    current_position_index = DIRECTIONS.index(current_position)
    DIRECTIONS[(current_position_index + how_much_turn) % 4]
  end

  def self.get_direction(start = [], finish = [])
    start ||= []
    finish ||= []

    diff_vertical = (start[0] - finish[0]).abs
    diff_horizontal = (start[1] - finish[1]).abs

    if diff_vertical > diff_horizontal
      (start[0] - finish[0]).positive? ? 'north' : 'south'
    else
      (start[1] - finish[1]).positive? ? 'west' : 'east'
    end
  end

  def self.get_distance(start = [], finish = [])
    diff_vertical = (start[0] - finish[0]).abs
    diff_horizontal = (start[1] - finish[1]).abs

    diff_horizontal + diff_vertical
  end

  def self.fast_get_direction(start = [], finish = [])
    diff_vertical = (start[0] - finish[0]).abs

    if diff_vertical.positive?
      (start[0] - finish[0]).positive? ? 'north' : 'south'
    else
      (start[1] - finish[1]).positive? ? 'west' : 'east'
    end
  end

  def self.is_visible(original_position = [], final_position = [], direction = '')
    case direction
    when 'north'
      original_position[1] == final_position[1] && original_position[0] > final_position[0]
    when 'east'
      original_position[0] == final_position[0] && original_position[1] < final_position[1]
    when 'south'
      original_position[1] == final_position[1] && original_position[0] < final_position[0]
    when 'west'
      original_position[0] == final_position[0] && original_position[1] > final_position[1]
    else
      false
    end
  end

  def self.can_kill(current_player_state = {}, enemies_states = [])
    enemies_states.any? do |enemy_object|
      enemy_object[:is_alive] &&
        is_visible(current_player_state[:position], enemy_object[:position], current_player_state[:direction])
    end
  end
end

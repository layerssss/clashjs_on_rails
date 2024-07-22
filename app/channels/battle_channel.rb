# frozen_string_literal: true

class BattleChannel < ApplicationCable::Channel
  def subscribed
    if Battle.instance.connected
      transmit({ type: 'conflict' })
      return
    end

    Battle.instance.connected = true
    transmit({ type: 'connected', players: Player.all.as_json })
    stream_from 'battle'
  end

  def receive(data) # rubocop:disable Metrics/MethodLength
    puts data.inspect
    type = data.fetch('type')
    case type
    when 'player_wait_for_command'
      player_id = data.fetch('player_id')
      state = data.fetch('state')
      player = Player.find(player_id)
      player.update!(state:, waiting_for_command: true)
    when 'player_wait_for_command_finish'
      player_id = data.fetch('player_id')
      player = Player.find(player_id)
      command = player.command
      player.update!(command: nil, waiting_for_command: false)
      transmit(
        {
          type: 'player_command',
          player_id:,
          command:
        }
      )
    end
  end

  def unsubscribed
    Battle.instance.connected = false
  end
end

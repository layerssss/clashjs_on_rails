# frozen_string_literal: true

json.extract! player, :id, :state, :waiting_for_command, :command
json.url player_url(player, format: :json)

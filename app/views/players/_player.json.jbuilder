# frozen_string_literal: true

json.extract! player, :id, :state, :waiting_for_command
json.url player_url(player, format: :json)

# frozen_string_literal: true

json.extract! player, :id, :state, :command, :waiting_for_command, :style, :name, :created_at, :updated_at
json.url player_url(player, format: :json)

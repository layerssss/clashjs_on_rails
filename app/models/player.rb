# frozen_string_literal: true

# == Schema Information
#
# Table name: players
#
#  id                  :integer          not null, primary key
#  command             :string
#  name                :string
#  state_json          :string           default("null")
#  style               :integer
#  waiting_for_command :boolean          default(FALSE)
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#
class Player < ApplicationRecord
  def state
    JSON.parse(state_json)
  rescue JSON::ParserError => e
    Rails.logger.error(e)
    nil
  end

  def state=(value)
    self.state_json = value.to_json
  end

  before_save do
    self.style ||= Random.rand(11)
  end

  after_save do
    ActionCable.server.broadcast('battle', { type: 'players_updated' }) if saved_change_to_attribute?(:name)
  end

  after_destroy do
    ActionCable.server.broadcast('battle', { type: 'players_updated' })
  end
end

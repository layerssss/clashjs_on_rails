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
  end

  def state=(value)
    self.state_json = value.to_json
  end
end

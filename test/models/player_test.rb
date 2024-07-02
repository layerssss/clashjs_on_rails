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
require 'test_helper'

class PlayerTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end

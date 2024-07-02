# frozen_string_literal: true

class AddStateJsonToPlayers < ActiveRecord::Migration[7.1]
  def change
    add_column :players, :state_json, :string, default: 'null'
    add_column :players, :style, :integer
  end
end

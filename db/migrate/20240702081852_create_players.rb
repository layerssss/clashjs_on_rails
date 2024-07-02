# frozen_string_literal: true

class CreatePlayers < ActiveRecord::Migration[7.1]
  def change
    create_table :players do |t|
      t.string :name
      t.string :command
      t.boolean :waiting_for_command, default: false

      t.timestamps
    end
  end
end

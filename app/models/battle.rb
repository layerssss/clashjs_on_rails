# frozen_string_literal: true

class Battle
  def self.instance
    @instance ||= new
  end

  attr_accessor :connected
end

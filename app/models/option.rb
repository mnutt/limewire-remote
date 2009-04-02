class Option < ActiveRecord::Base
  def self.get(key)
    option = self.find_by_key(key.to_s)
    option.value if option
  end

  def self.set(key, value)
    option = self.find_or_create_by_key(key.to_s)
    option.update_attributes(:value => value)
  end
end

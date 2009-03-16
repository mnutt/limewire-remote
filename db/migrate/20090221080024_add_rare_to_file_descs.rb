class AddRareToFileDescs < ActiveRecord::Migration
  def self.up
    add_column :file_descs, :is_rare, :boolean
  end

  def self.down
    remove_column :file_descs, :rare
  end
end

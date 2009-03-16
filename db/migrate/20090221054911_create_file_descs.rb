class CreateFileDescs < ActiveRecord::Migration
  def self.up
    create_table :file_descs do |t|
      t.string :sha1urn
      t.string :file_name
      t.string :title
      t.string :album
      t.string :genre
      t.string :artist
      t.integer :size
      t.string :path
      t.boolean :is_store
      t.boolean :shared_with_gnutella
      t.integer :share_list_count
      t.integer :completed_upload_count
      t.integer :attempted_upload_count
      t.datetime :attempted_upload_time
      t.integer :hit_count
      t.string :license
      t.string :year
      t.string :comment
      t.string :track
      t.integer :bitrate
      t.integer :length
      t.integer :sample_rate
      t.integer :width
      t.integer :height
      t.string :language
      t.string :mime_type

      t.timestamps
    end
  end

  def self.down
    drop_table :file_descs
  end
end

class Playlist < ActiveRecord::Base
  validates_presence_of :name

  before_create :generate_hash
  
  def to_playlist
    { :name => self.name,
      :collaborative => self.collaborative == 1,
      :smart_filter => {
        :genres => self.genres,
        :user_favorites => self.user_favorites,
        :tags => self.tags,
        :uploaded_from => self.uploaded_from,
        :uploaded_to => self.uploaded_to,
        :bpm_to => self.bpm_to,
        :bpm_from => self.bpm_from,
        :duration_to => self.duration_to,
        :duration_from => self.duration_from,
        :search_term => self.search_term,
        :artist => self.artist,
        :order => self.list_order,  # different because of sqlite
      },
      :smart => self.smart == 1,
      :tracks => self.tracks,
      :version => self.version,
      :owner => { :nickname => "Owner" },
      :date_created => self.created_at.to_s,
      :id => self.id,
      :hash => self.share_hash
    }
  end

  def all_tracks
    if self.smart?
      FileDesc.find(:all,
                    :limit => 1000,
                    :offset => 0,
                    :conditions => {
                      :artist => self.artist.blank? ? nil : self.artist,
                      :genre => self.genres.blank? ? nil : self.genres })
    else
      Limewire::Library.find_by_sha1s(self.tracks)
    end
  end

  def self.smart?
    self.smart == 1
  end

  def generate_hash
    self.share_hash = Digest::MD5.new.to_s
  end

  def position
    self.list_position
  end

  def position=(position)
    self.list_position = position
  end

  def order
    self.list_order
  end

  def order=(order)
    self.list_order = order
  end
end

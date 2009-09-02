class FileDesc < ActiveRecord::Base
  def to_param
    self.sha1
  end

  def self.add_by_sha1(sha1)
    self.create_from_file(Limewire::Library.find(sha1))
  end

  def self.create_from_file(file)
    lwfile = Limewire::File.new(file)
    return if file.respond_to?(:getSHA1Urn) && self.find_by_sha1urn(file.getSHA1Urn)
    record = self.new
    record.sha1urn = file.getSHA1Urn.to_s
    record.is_rare = file.rare_file?
    record.file_name = file.file_name
    record.title = lwfile.metadata.title
    record.album = lwfile.metadata.album
    record.genre = lwfile.metadata.genre
    record.artist = lwfile.metadata.artist
    record.size = file.file_size
    record.path = file.path
    record.is_store = file.store_file?
    #    record.shared_with_gnutella = file.shared_with_gnutella?
    #    record.share_list_count = file.share_list_count
    record.completed_upload_count = file.completed_uploads
    record.attempted_upload_count = file.attempted_uploads
    record.hit_count = file.hit_count
    record.license = lwfile.metadata.license.to_s
    record.year = lwfile.metadata.year
    record.comment = lwfile.metadata.comment
    record.track = lwfile.metadata.track
    record.bitrate = lwfile.metadata.bitrate
    record.length = lwfile.metadata.length
    record.sample_rate = lwfile.metadata.sample_rate
    record.width = lwfile.metadata.width
    record.height = lwfile.metadata.height
    record.language = lwfile.metadata.language
    record.save!
    record
  end

  def sha1
    self.sha1urn.split(':').last
  end
end

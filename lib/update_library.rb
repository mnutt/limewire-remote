# Updates the database with limewire's library
if $injector
  Limewire::Library.all_files.each do |file|
    record = FileDesc.find_by_sha1urn(file.getSHA1Urn.to_s) || FileDesc.new
    record.sha1urn = file.getSHA1Urn.to_s
    record.is_rare = file.rare_file?
    record.file_name = file.file_name
    record.title = file.metadata.title
    record.album = file.metadata.album
    record.genre = file.metadata.genre
    record.artist = file.metadata.artist
    record.size = file.file_size
    record.path = file.path
    record.is_store = file.store_file?
    record.shared_with_gnutella = file.shared_with_gnutella?
    record.share_list_count = file.share_list_count
    record.completed_upload_count = file.completed_uploads
    record.attempted_upload_count = file.attempted_uploads
    record.hit_count = file.hit_count
    record.license = file.metadata.license.to_s
    record.year = file.metadata.year
    record.comment = file.metadata.comment
    record.track = file.metadata.track
    record.bitrate = file.metadata.bitrate
    record.length = file.metadata.length
    record.sample_rate = file.metadata.sample_rate
    record.width = file.metadata.width
    record.height = file.metadata.height
    record.language = file.metadata.language
    record.save!
    puts "got record #{record.file_name}"
  end
end

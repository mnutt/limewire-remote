# Updates the database with limewire's library
if Core.injector
  Limewire::Library.all_files.each do |file|
    FileDesc.create_from_file(file)
  end
end

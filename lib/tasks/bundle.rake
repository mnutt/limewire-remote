desc "Add the current rails into the LimeWire.app located in bin/"
task :bundle do
  working_directory = "bin/LimeWire.app/Contents/Resources/Java"
  if File.exist?(working_directory)
    puts `rm -Rf #{working_directory}/rails`
    puts `mkdir #{working_directory}/rails`
    puts `find . -maxdepth 1 ! -name 'bin' ! -name '.' | xargs -I {} echo cp -R {} #{working_directory}/rails/`
  else
    puts "There is no LimeWire.app in bin/, or it is corrupted."
  end
end
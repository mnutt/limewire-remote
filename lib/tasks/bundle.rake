desc "Add the current rails into the LimeWire.app located in bin/"
task :bundle do
  release_dir = create_release_dir
  install_rails(File.join(release_dir, 'LimeWire.app', 
                         'Contents', 'Resources', 'Java'))
end

namespace :bundle do
  desc "Generate a dmg containing LimeWire.app"
  task :dmg do
    release_dir = create_release_dir
    install_rails(File.join(release_dir, 'LimeWire.app', 
                            'Contents', 'Resources', 'Java'))
    dmg_location = make_dmg(release_dir)
    puts "Generated dmg at #{dmg_location}"
  end

  desc "Generate a zip containing LimeWire.app"
  task :zip do
    release_dir = create_release_dir
    install_rails(File.join(release_dir, 'LimeWire.app', 
                            'Contents', 'Resources', 'Java'))
    zip_location = make_zip(release_dir)
    puts "Generated zip at #{zip_location}"
  end

  desc "Generate a gzip containing LimeWire.app"
  task :gzip do
    release_dir = create_release_dir
    install_rails(File.join(release_dir, 'LimeWire.app', 
                            'Contents', 'Resources', 'Java'))
    gzip_location = make_gzip(release_dir)
    puts "Generated gzip at #{gzip_location}"
  end

  desc "Generate dmg, zip, and gzip"
  task :all do
    release_dir = create_release_dir
    install_rails(File.join(release_dir, 'LimeWire.app', 
                            'Contents', 'Resources', 'Java'))
    dmg_location = make_dmg(release_dir)
    puts "Generated dmg at #{dmg_location}"
    zip_location = make_zip(release_dir)
    puts "Generated zip at #{zip_location}"			    
    gzip_location = make_gzip(release_dir)
    puts "Generated gzip at #{gzip_location}"
  end
end

def generate_unique_dirname(base="releases")
  dir = File.join(base, Time.now.strftime("%Y-%m-%d"))
  i = 1
  while File.exist?(dir) do
    return dir + "_#{i.to_s}" unless File.exist?(dir + "_#{i.to_s}")
    i += 1
  end
  return dir
end

def create_release_dir
  `mkdir releases` unless File.exist?('releases')
  release_dir = generate_unique_dirname("releases")
  puts "Making release dir: #{release_dir}"
  `mkdir #{release_dir}`
  `cp -R bin/LimeWire.* #{release_dir}/`

  return release_dir
end

def install_rails(dir)
  puts "Installing rails into #{dir}"
  if File.exist?(dir)
    `rm -Rf #{dir}/rails`
    `mkdir #{dir}/rails`
    `find . -maxdepth 1 ! -name 'bin' ! -name '.' ! -name 'releases' | xargs -I {} cp -R {} #{dir}/rails/`
    clean_junk_from_rails("#{dir}/rails")
    dir
  else
    puts "There is no LimeWire.app in #{File.expand_path("#{dir}/../../../..")}, or it is corrupted."
    false
  end
end

def clean_junk_from_rails(dir)
  puts "Removing non-essential directories from rails (#{dir})"
  raise "Uh oh! Trying to delete ourselves!" if File.expand_path(dir) == Dir.pwd
  `rm -Rf #{dir}/.git`
  `find #{dir}/vendor/rails |grep '/test/' | xargs rm -Rf`
  `rm -Rf #{dir}/vendor/rails/.git`
  `rm #{dir}/db/*.db.*`
end

def make_dmg(dir)
  puts "Making dmg in #{dir}"
  date = #{dir}.chop.split("/").last
  `hdiutil create -srcfolder #{dir} -volname LimeWire-#{date} #{dir}/rel-LimeWire.dmg`
  "#{dir}/rel-LimeWire.dmg"
end

def make_zip(dir)
  puts "Making zip in #{dir}"
  `zip -r #{dir}/rel-LimeWire.zip #{dir}/LimeWire.*`
  "#{dir}/rel-LimeWire.zip"
end

def make_gzip(dir)
  puts "Making gzip in #{dir}"
  `tar -czf #{dir}/rel-LimeWire.tar.bz #{dir}/LimeWire.*`
  "#{dir}/rel-LimeWire.tar.gz"
end
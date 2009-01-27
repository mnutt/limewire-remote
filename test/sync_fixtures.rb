require 'open-uri'

to_sync = [
           'http://www.archive.org/download/TestForMp3VoiceMsgs/HiImHome..._64kb.mp3',
           'http://www.archive.org/download/TestForMp3VoiceMsgs/ImHomemAreYouThere_64kb.mp3',
           'http://www.archive.org/download/TestForMp3VoiceMsgs/TestForMp3VoiceMsgs_meta.xml',
           'http://www.archive.org/download/aesop_fables_volume_three_librivox/fables_03_09_aesop_64kb.mp3',
           'http://www.archive.org/download/aesop_fables_volume_three_librivox/fables_03_15_aesop_64kb.mp3',
           'http://www.archive.org/download/aesop_fables_volume_three_librivox/aesop_fables_volume_three_librivox_meta.xml',
           'http://openphoto.net/volumes/stg/20050516/openphotonet_0025_72.JPG', #photo &copy; Daniel Steger for <A HREF=http://8120.openphoto.net>openphoto.net</A> CC:Attribution-ShareAlike
           'http://openphoto.net/volumes/amanzi/20041119/openphotonet_chtfrm03.jpg', #photo &copy; Stuart Maxwell for <A HREF=http://6678.openphoto.net>openphoto.net</A> CC:Attribution-ShareAlike
           'http://openphoto.net/volumes/dkeats/20050705/openphotonet_white_rhino_head.jpg', #photo &copy; Derek W. Keats for <A HREF=http://8488.openphoto.net>openphoto.net</A> CC:Attribution-ShareAlike
           'http://openphoto.net/volumes/scott/20040220/opl_dscf0050.jpg', #photo &copy; Scott Roberts for <A HREF=http://6047.openphoto.net>openphoto.net</A> CC:Attribution
           'http://openphoto.net/volumes/spinotti/20061103/openphotonet_bank.jpg', #photo &copy; Gerhard Spinotti for <A HREF=http://15441.openphoto.net>openphoto.net</A> CC:Attribution-ShareAlike
           'http://openphoto.net/volumes/stg/20080112/openphotonet_PICT2754.JPG', #photo &copy; Daniel Steger for <A HREF=http://19005.openphoto.net>openphoto.net</A> CC:Attribution-ShareAlike
           'http://openphoto.net/volumes/mike/20051231/opl_2005_12_30_Paris_Before_After%20151.jpg', #photo &copy; Michael Jastremski for <A HREF=http://9306.openphoto.net>openphoto.net</A> CC:Attribution-ShareAlike
           'http://openphoto.net/volumes/rainnight/20060101/openphotonet_IMG_4594.JPG', #photo &copy; Li Sun for <A HREF=http://9330.openphoto.net>openphoto.net</A> CC:Attribution-NonCommercial
           'http://www.archive.org/download/FLIP_FROG-FIDDLESTICKS/FLIP_FROG-FIDDLESTICKS_64k.mp4', #FIDDLESTICKS
           'http://www.archive.org/download/ttk_test_0707a/DIA19_512kb.mp4',
]
if RAILS_ROOT.nil?
  puts "You must run this from rails"
  return
end


base_dir = File.join RAILS_ROOT, "test","fixtures","library"

library_directories = { 
  'images' => /\.(jpg)$/i,
  'audio' => /\.(mp3)$/i, 
  'videos' => /\.(mp4)$/i,
  'other' => /\.(xml)$/i,
}

if(ARGV.length > 0 && ARGV[0] == 'kill')
  puts "Removing pre-existing test fixtures"
  FileUtils.rm_rf(base_dir)
end

base_dir_exists = Dir.new(base_dir) rescue nil

unless base_dir_exists
  FileUtils.mkdir_p(base_dir)
  categorized_files = to_sync.inject({}) do |memo, file|
    dir = library_directories.find{ |dir_name, dir_regex| file =~ dir_regex }.first
    (memo[dir] ||= []) << file
    memo
  end

  categorized_files.each { |dir_name, files|
    path = FileUtils.mkdir_p(File.join(base_dir, dir_name))
    files.each_with_index do |file, i|
      puts "Downloading #{file} to #{path}"
      f = open(file).read
      ext = (file =~ /.*(\..*)$/) ? $1 : ''
      open(File.join(path, i.to_s + ext), 'w') do |out|
        out << f
      end
    end
  }
end




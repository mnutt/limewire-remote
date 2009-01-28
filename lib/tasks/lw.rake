namespace :lw do
  namespace :test do
    desc "Execute unit tests within a local instance of limewire remote"
    task :live do
      require 'open-uri'
      puts open('http://localhost:4422/stats/tests/txt').read
    end
    
   namespace :fixtures do # is there such a thing as too many namespaces?
      desc "Sync library fixtures for unit testing"
      task :sync do
        puts "Syncing..."
        `jruby test/sync_fixtures.rb`
      end
      task :force_sync do
        puts "Force Syncing..."
        `jruby test/sync_fixtures.rb kill`
      end
    end
  end
end

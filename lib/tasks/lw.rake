namespace :lw do
  namespace :test do
   namespace :fixtures do # is there such a thing as too many namespaces?
      desc "Sync library fixtures for unit testing"
      task :sync do
        puts "Syncing..."
        `script/runner test/sync_fixtures.rb`
      end
      task :force_sync do
        puts "Force Syncing..."
        `script/runner test/sync_fixtures.rb kill`
      end
    end
  end
end

PLUGIN_ROOT = "#{RAILS_ROOT}/plugins"

class PluginReloader
  def self.reload
    # Bring config/routes.rb's modification date up to the same time as the
    # external route files
    main_update_time = File::Stat.new("#{RAILS_ROOT}/config/routes.rb").mtime
    Dir.glob("#{PLUGIN_ROOT}/*/routes.rb").each do |plugin|
      plugin_update_time = File::Stat.new(plugin).mtime
      FileUtils.touch("#{RAILS_ROOT}/config/routes.rb") if plugin_update_time > main_update_time
    end
      
    # Also find any new plugins
    Dir.glob("#{PLUGIN_ROOT}/*").each do |plugin|
      ActiveSupport::Dependencies.load_paths << "#{plugin}/controllers" if File.exist?("#{plugin}/controllers") and (!ActiveSupport::Dependencies.load_paths.include?("#{plugin}/controllers"))
      ActiveSupport::Dependencies.load_paths << "#{plugin}/models" if File.exist?("#{plugin}/models") and (!ActiveSupport::Dependencies.load_paths.include?("#{plugin}/models"))
    end
  end
end

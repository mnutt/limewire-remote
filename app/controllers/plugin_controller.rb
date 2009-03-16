class PluginController < ApplicationController
  def self.view_paths
    path = File.expand_path("#{PLUGIN_ROOT}/#{self.plugin_name}/views")
    ActionView::Base.process_view_paths(path)
  end

  def self.plugin_name
    self.to_s.split("Controller").first.underscore
  end

  def _plugin_name
    self.class.plugin_name
  end
  helper_method :_plugin_name
end

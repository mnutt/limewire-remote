# This is the file containing the mapping of the plugin's routes.  This file is evaluated in the
# app's top-level routes.rb after all other routes.  #plugin_map is yielded by
# map.with_options(:path_prefix => 'toolbar')

# Map a controller and action to respond to /toolbar
plugin_map.root :controller => 'toolbar', :action => 'index'

# Like mapping ':controller/:action', this catches most things
plugin_map.toolbar ':action/:id', :controller => 'toolbar'

# Add this route to point to your widget action if you want to display a widget on the homepage
# plugin_map.widget "/widget", :controller => 'toolbar', :action => 'widget'

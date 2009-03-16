# This is the file containing the mapping of the plugin's routes.  This file is evaluated in the
# app's top-level routes.rb after all other routes.  #plugin_map is yielded by
# map.with_options(:path_prefix => 'search')

# Map a controller and action to respond to /search
plugin_map.root :controller => 'live_search', :action => 'index'
plugin_map.get_query 'get_query', :controller => 'live_search', :action => 'get_query'
plugin_map.set_query 'set_query', :controller => 'live_search', :action => 'set_query'
# Like mapping ':controller/:action', this catches most things
plugin_map.search ':action/:id', :controller => 'search'

# Add this route to point to your widget action if you want to display a widget on the homepage
# plugin_map.widget "/widget", :controller => 'search', :action => 'widget'

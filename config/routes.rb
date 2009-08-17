ActionController::Routing::Routes.draw do |map|

  map.setup '/setup', :controller => 'home', :action => 'setup'
  map.login '/login', :controller => 'home', :action => 'login'

  map.resources :library, :member => {:thumbnail => :get}
  map.thumb "/library/:id/thumbnail/:s", :controller => 'library', :action => 'thumbnail'
 
  map.resources :collections, :member => {:add_items => :post, :remove_items => :post}
  map.resources :searches
  map.resources :downloads
  map.resources :search

  map.assets '/assets/:plugin/*path', :controller => 'assets', :action => 'show'

  map.plugins '/plugins', :controller => 'home', :action => 'index', :format => 'json'

  map.root :controller => 'cloud', :action => 'index'

  Dir.glob("#{RAILS_ROOT}/plugins/*/routes.rb").each do |routes_file|
    plugin_name = routes_file.split("/").reverse[1]
    map.with_options(:path_prefix => plugin_name) do |plugin_map|
      eval(File.open(routes_file).read)
    end
  end
end

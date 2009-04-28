class WorldViewController < PluginController
  skip_before_filter :check_logged_in

  def hosts
    @hosts = Core::HostCatcher.get_permanent_hosts.to_a.map{|h| h.address }
    render :json => @hosts.to_json
  end

  def index
  end
end

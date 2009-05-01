class WorldViewController < PluginController
  skip_before_filter :check_logged_in

  def hosts
    @hosts = Core::HostCatcher.get_permanent_hosts.to_a.map{|h| h.address }
    render :json => @hosts.to_json
  end

  def downloading
    # @hosts = Core::DownloadListManager.downloads.map{|d| d.sources.map{|s| s.address.to_s} }.flatten.compact
    @hosts = ["216.178.38.116", "129.59.1.10"]
    render :json => @hosts.to_json
  end

  def myself
    address = Core::NetworkManager.getExternalAddress
    addr_string = java.net.InetAddress.getByAddress(address).to_s.gsub(/[^0-9.]/, '')
    render :json => addr_string
  end

  def index
  end
end

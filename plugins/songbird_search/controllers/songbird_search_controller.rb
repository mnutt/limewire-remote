class SongbirdSearchController < PluginController
  def index
    respond_to do |format|
      format.html
      format.xul
    end
  end

  def downloads
    respond_to do |format|
      format.xul
    end
  end
end

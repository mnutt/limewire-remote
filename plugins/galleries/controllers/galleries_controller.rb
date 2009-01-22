class GalleriesController < PluginController
  self.allow_forgery_protection = false

  def index
    @playlists = Playlist.find(:all, :order => "list_position ASC")
    @playlist = @playlists.first
    render :action => :all
  end

  def show
    @playlist = Playlist.find(params[:id])
  end

  def all
    @photos = Limewire::Library.all_files.filter_by_extension '(png|gif|bmp|jpg|jpeg)'
  end

  def widget
  end

end

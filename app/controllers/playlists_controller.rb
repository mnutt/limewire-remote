class PlaylistsController < ApplicationController
  self.allow_forgery_protection = false

  def index
    @playlists = Playlist.find(:all)
    @ordered_playlists = []
    @playlists.each_with_index do |p, i| 
      @ordered_playlists << { :playlist => p.to_playlist, :position => i, :is_owner => true } 
    end

    render :json => @ordered_playlists.to_json()
  end

  def create
    @playlist = Playlist.new(:name => params[:name])
    @playlist.save
    render :text => { :playlist => @playlist.to_playlist, :position => Playlist.count }.to_json
  end

  def destroy
    @playlist = Playlist.find(params[:id])
    @playlist.destroy
    render :json => {:response => 200}
  end

  def update
    @playlist = Playlist.find(params[:id])
    @playlist.name = params[:name]
    @playlist.save
    render :json => {:response => 200}
  end
end

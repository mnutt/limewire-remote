require 'json'

class CollectionsController < ApplicationController
  self.allow_forgery_protection = false

  def index
    @collections = Limewire::Collection.all
    render :json => JSON::pretty_generate({:collections => @collections})
  end

  def create
    @collection = Limewire::Collection.create(params[:name])
    render :json => JSON::pretty_generate(@collection)
  end

  def destroy
    @collection = Limewire::Collection.find(params[:id])
    @collection.destroy
    render :json => {:response => 200}
  end

  def update
    @collection = Limewire::Collection.find(params[:id])
    @collection.reorder(params[:sha1s]) if params[:sha1s]
    @collection.name = params[:name] if params[:name]
    @collection.save
    render :json => {:response => 200}
  end

  def add_items
    @collection = Limewire::Collection.find(params[:id])
    params[:sha1s].each do |sha1|
      @collection.add sha1
    end
    render :json => {:response => 200}
  end

  def remove_items
    @collection = Limewire::Collection.find(params[:id])
    params[:sha1s].each do |sha1|
      @collection.remove sha1
    end

    render :json => {:response => 200}
  end
end

class SearchController < ApplicationController
  self.allow_forgery_protection = false

  def index
  end

  def create
    search = Limewire::Search.query(params[:query])
    search.start
    render :json => {:guid => search.guid.to_s}
  end

  def show
    guid = params[:id]
    search = Limewire::Search.find(guid)
    render :json => JSON.pretty_generate({:results => search.results, :query_string => search.query_string})
  end
end

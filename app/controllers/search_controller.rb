class SearchController < ApplicationController
  self.allow_forgery_protection = false

  def create
    search = Limewire::Search.query(params[:query])
    search.start
    render :json => {:guid => search.guid.to_s}
  end

  def index
    render :json => JSON.pretty_generate({ :searches => Limewire::Search.all })
  end

  def show
    results = Limewire::Search.find(params[:id]).results
    render :json => JSON.pretty_generate({ :results => results, 
                                           :query_string => results.query_string})
  end

  def update
    search = Limewire::Search.find(params[:id])
    if params[:state] == "stop"
      search.stop
    elsif params[:state] == "start"
      search.start
    end

    render :json => "Ok"
  end
end

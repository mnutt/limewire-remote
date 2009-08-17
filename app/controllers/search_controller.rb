class SearchController < ApplicationController
  self.allow_forgery_protection = false

  def create
    if(params[:query])
      search = Limewire::Search.query(params[:query])
      search.start
      render :json => {:guid => search.guid.to_s}
    else
      render :json => {:error => "No search term specified"}
    end
  end

  def index
    render :json => JSON.pretty_generate({ :searches => Limewire::Search.all.map{|s| { :query_string => s.query_string,
		                                                                                   :result_count => s.search_results.size.to_s,
		                                                                                   :guid => s.query_guid.to_s } } })
  end

  def show
    guid = params[:id]
    search = Limewire::Search.find(guid)
    render :json => JSON.pretty_generate({:results => search.results, :query_string => search.query_string})
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

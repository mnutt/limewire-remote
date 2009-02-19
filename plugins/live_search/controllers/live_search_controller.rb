class LiveSearchController < PluginController
  def index
  end

  def set_query
    PersistentStore[:query] = params[:query] if params[:query]
    PersistentStore[:guid] = params[:guid] if params[:guid]
    render :nothing => true
  end

  def get_query
    render :text => {:query => PersistentStore[:query] || "",
                     :guid  => PersistentStore[:guid] }.to_json
  end
end

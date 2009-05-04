class BoxeeFeedController < PluginController
  skip_before_filter :check_logged_in

  def index
    @media = FileDesc.all
    render :layout => false
  end
end

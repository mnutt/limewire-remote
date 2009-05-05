class BoxeeFeedController < PluginController
  skip_before_filter :check_logged_in

  def index
    respond_to do |format|
      format.xml {
        @media = FileDesc.all
        render :layout => false
      }
      format.html
    end
  end
end

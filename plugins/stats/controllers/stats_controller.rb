require 'plugins/stats/models/unit_test'
class StatsController < PluginController
  def index
    @uptime = Limewire.uptime
  end
  
  def tests
    if RAILS_ENV == 'development'
      case params[:id]
      when 'txt'
        render :text => UnitTests.run.to_s
      else
        render :text => UnitTests.run.to_html
      end
    else
      render :text => "Run rails in the development environment to access unit tests"
    end
  end

  def widget
    index
    render :layout => 'widget'
  end

end

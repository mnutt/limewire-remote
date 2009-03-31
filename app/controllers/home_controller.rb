require 'digest/sha1'

class HomeController < ApplicationController
  skip_before_filter :check_logged_in, :only => [:login, :setup]

  def login
    if logged_in?
      redirect_to '/cloud'
      return
    end

    if params[:password]
      password = params[:password]
      salt = Option.get(:salt)
      pwhash = Digest::SHA1.hexdigest("--#{salt}--#{password}--")
      if pwhash == Option.get(:password)
        session[:logged_in] = true
        redirect_to '/cloud'
      else
        redirect_to login_url
      end
    else
      render
    end
  end

  def setup
    raise Unauthorized unless local_request?
    
    if params[:password]
      password = params[:password]
      salt = Digest::SHA1.hexdigest("--#{Time.now.to_s}--")
      Option.set :salt, salt
      Option.set :password, Digest::SHA1.hexdigest("--#{salt}--#{password}--")
      redirect_to '/cloud'
    else
      render
    end
  end

  def index
    @plugins = Plugin.all
    @positions = DashboardPosition.find(:all, :order => 'list_position ASC')

    @columns = @positions.group_by {|p| p.column}.map{ |key, column| 
      column.map {|p|
         plugin = @plugins.select{|plugin| p.name == plugin.name}[0]
         @plugins.delete(plugin)
         plugin
      }
    }
    # @positions.each do |p|
    #  @columns[p.column] ||= []
    #  plugin = @plugins.select{|plugin| p.name == plugin.name}
    #  @columns[p.column] << plugin
    #  @plugins.delete(plugin)
    # end

    @columns[0] = [] unless @columns[0]
    @columns[1] = [] unless @columns[1]

    @plugins.each_with_index do |plugin, i|
      @columns[(i % 2 == 0) ? 0 : 1] << plugin
    end
  end
end

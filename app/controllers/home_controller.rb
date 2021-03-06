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

    respond_to do |format|
      format.html
      format.json { render :json => @plugins.select{|p| p.has_widget? }.map{|p| p.name } }
    end
  end
end

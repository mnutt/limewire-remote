# Filters added to this controller apply to all controllers in the application.
# Likewise, all the methods added will be available for all controllers.

class ApplicationController < ActionController::Base
  helper :all # include all helpers, all the time

  before_filter :check_logged_in

  def check_logged_in
    if local_request?
      if !is_setup?
        redirect_to setup_url
      end
    else
      if !logged_in?
        redirect_to login_url
      end
    end
  end

  def is_setup?
    Option.get('pwhash').nil?
  end

  def logged_in?
    session[:logged_in] == true
  end

  # See ActionController::RequestForgeryProtection for details
  # Uncomment the :secret if you're not using the cookie session store
  protect_from_forgery # :secret => '9644041f885c116f54db0da11d85902f'
  
  # See ActionController::Base for details 
  # Uncomment this to filter the contents of submitted sensitive data parameters
  # from your application log (in this case, all fields with names like "password"). 
  # filter_parameter_logging :password
end

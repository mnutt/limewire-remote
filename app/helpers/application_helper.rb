# Methods added to this helper will be available to all templates in the application.
module ApplicationHelper
  def javascript_include(*scripts)
    @javascript_includes ||= []
    @javascript_includes << scripts
  end

  def plugin_javascript_include(*javascripts)
    javascripts = javascripts.map{|js| "/assets/#{_plugin_name}/javascripts/#{js}"}
    javascript_include_tag(*javascripts)
  end

  def print_dollars(cents)
    if cents.to_s.include?("-")
      decimals = cents.to_s.split("-").last.to_i + 1
    elsif cents % 0.01 > 0.0
      decimals = 3
    elsif cents % 0.001 > 0.0
      decimals = 4
    else
      decimals = 2
    end

    sprintf("%6.#{decimals}f", cents).lstrip
  end
      
end

include Java

if File.exist?(File.join(RAILS_ROOT, "vendor", "limewire", "LimeWire.jar"))
  require 'vendor/limewire/LimeWire.jar'
else
  puts "Place the LimeWire.jar file in the vendor/limewire directory and restart."
end

Guice = com.google.inject.Guice
GuiceUtils = org.limewire.inject.GuiceUtils
Stage = com.google.inject.Stage
OSUtils = org.limewire.util.OSUtils
AbstractModule = com.google.inject.AbstractModule
LimeCoreGlue = com.limegroup.gnutella.LimeCoreGlue
CommonUtils = org.limewire.util.CommonUtils
LimeWireUtils = com.limegroup.gnutella.util.LimeWireUtils
SystemUtils = org.limewire.util.SystemUtils
LimeWireModule = org.limewire.ui.swing.LimeWireModule
LimeWireCoreModule = com.limegroup.gnutella.LimeWireCoreModule
CoreGlueModule = org.limewire.core.impl.CoreGlueModule
System = java.lang.System

CommonUtils.setUserSettingsDir LimeWireUtils.getRequestedUserSettingsLocation

class RailsModule < AbstractModule
  include com.google.inject.Module

  def configure
    install LimeWireCoreModule.new
    install CoreGlueModule.new
  end
end 

if org.limewire.util.OSUtils.isMacOSX
  SystemUtils.set_open_file_limit(1024)
  System.setProperty("apple.awt.UIElement", "true")
end
# raise RailsModule.new.methods.to_yaml
rails_module = RailsModule.new
$injector = Guice.createInjector(Stage::DEVELOPMENT, [rails_module])
GuiceUtils.loadEagerSingletons($injector)

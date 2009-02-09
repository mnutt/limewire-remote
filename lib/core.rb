module Core
  def self.get_singleton(klass)
    $injector.get_instance(klass.java_class)
  end
  
  if($injector)
    # Running from Limewire
    include Java
    
    Geocoder               = org.limewire.geocode.Geocoder
    OldURN                 = com.limegroup.gnutella.URN
    MetaDataFactoryImpl    = com.limegroup.gnutella.metadata.MetaDataFactoryImpl
    MetaDataFactoryRef     = com.limegroup.gnutella.metadata.MetaDataFactory
    GUID                   = org.limewire.io.GUID
    URN                    = org.limewire.core.api.URN
    URNImpl                = org.limewire.core.impl.URNImpl
    MojitoManagerRef       = org.limewire.core.api.mojito.MojitoManager
    LibraryManagerRef      = org.limewire.core.api.library.LibraryManager
    SearchManagerRef       = org.limewire.core.api.search.SearchManager
    DownloadListManagerRef = org.limewire.core.api.download.DownloadListManager
    MongrelManagerRef      = org.limewire.http.mongrel.MongrelManager # meta
    
    MojitoManager       = self.get_singleton(MojitoManagerRef)
    SearchManager       = self.get_singleton(SearchManagerRef)
    LibraryManager      = self.get_singleton(LibraryManagerRef)
    MetaDataFactory     = self.get_singleton(MetaDataFactoryRef)
    DownloadListManager = self.get_singleton(DownloadListManagerRef)
    MongrelManager      = self.get_singleton(MongrelManagerRef)
  else
    # Not running from limewire, no $core available
  end
end


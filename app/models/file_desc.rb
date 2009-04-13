class FileDesc < ActiveRecord::Base
  def to_param
    self.sha1
  end

  def sha1
    self.sha1urn.split(':').last
  end
end

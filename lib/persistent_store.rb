# FIXME: This is unsafe.  Do not use for things that matter.
class PersistentStore
  @@store = {}
  def self.[]=(key, value)
    @@store[key] = value
  end

  def self.[](key)
    @@store[key]
  end

  def self.to_yaml
    @@store.to_yaml
  end
end


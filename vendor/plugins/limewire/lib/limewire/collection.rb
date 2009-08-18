module Limewire
  class Collection
    attr_accessor :name

    def self.create(name)
      self.new Core::FileCollectionManager.create_new_collection(name)
    end

    def self.all
      Core::FileCollectionManager.shared_file_collections.map{|p| self.new(p) }
    end

    def self.find(id)
      self.new Core::FileCollectionManager.collection_by_id(id.to_i)
    end

    def self.find_by_name(name)
      self.all.select{|p| p.name == name}.first
    end

    def initialize(raw_collection)
      @raw_collection = raw_collection
      @name = raw_collection.name
    end

    def add(sha1, position=nil)
      item = Library.find_by_sha1(sha1)
      if position
        @raw_collection.add(item, position.to_i)
      else
        @raw_collection.add(item)
      end
    end

    def id
      @raw_collection.get_id
    end

    def public?
      @raw_collection.public?
    end

    def remove(sha1)
      item = Library.find_by_sha1(sha1)
      @raw_collection.remove(item)
    end

    def addable?(sha1)
      item = Library.find_by_sha1(sha1)
      @raw_collection.file_addable?(item.file)
    end

    def clear
      @raw_collection.clear
    end

    def save
      @raw_collection.set_name(@name)
    end

    def destroy
      Core::FileCollectionManager.remove_collection_by_id self.id
    end

    def items
      @raw_collection.to_a.map{|i| i.getSHA1Urn.to_s }
    end

    def to_json(*a)
      { :name => self.name,
        :items => self.items,
        :id => self.id }.to_json(*a)
    end
  end
end

require 'image_voodoo'

class LibraryController < ApplicationController
  self.allow_forgery_protection = false
  def index
    @files = Limewire::Library.all_files
  end
  
  def download
    start = params.delete(:magnet)
    params.delete(:controller)
    params.delete(:action)
    urn = start + "?&" + params.map{|k,v| "#{k}=#{v}"}.join("&")

    Limewire.download(urn)
    render :json => "ok"
  end

  def thumbnail
    sha1urn = params[:id] =~ /urn:/ ? params[:id] : "urn:sha1:#{params[:id]}"
    file = FileDesc.find_by_sha1urn(sha1urn)

    not_found = "#{RAILS_ROOT}/public/images/notfound.png"
    not_found_mp3 = "#{RAILS_ROOT}/public/images/notfound_music.png"

    if File.exist?(file.path)
      if file.path =~ /\.mp3$/
        begin
          f = org.jaudiotagger.audio.AudioFileIO.read(java.io.File.new(file.path))
          image_field = f.get_tag.get(org.jaudiotagger.tag.TagFieldKey::COVER_ART).get(0)
          if(org.jaudiotagger.tag.id3.AbstractID3v2Frame === image_field)
            image_frame_body = image_field.get_body
            if(!image_frame_body.image_url?)
              data_key = org.jaudiotagger.tag.datatype.DataTypes::OBJ_PICTURE_DATA
              picture_data = image_frame_body.get_object_value(data_key)
              @raw_data = String.from_java_bytes(picture_data)
            end
          else
            @raw_data = File.read(not_found_mp3)
          end
        rescue
          @raw_data = File.read(not_found_mp3)
        end
      else
        @raw_data = File.read(file.path)
      end

      begin
        ImageVoodoo.with_bytes(@raw_data) do |img|
          img.thumbnail((params[:s] || 100).to_i) do |resized|
            send_data(resized.bytes("png"), :type => "image/png", :disposition => 'inline', :filename => 'test.png')
          end
        end
      rescue
        ImageVoodoo.with_image(not_found) do |img|
          img.thumbnail((params[:s] || 100).to_i) do |resized|
            send_data(resized.bytes("png"), :type => "image/png", :disposition => 'inline', :filename => 'test.png')
          end
        end
      end
    else
      render :status => 404, :text => "file not found: #{params[:sha1]}"
    end
  end

  def show
    sha1urn = params[:id] =~ /urn:/ ? params[:id] : "urn:sha1:#{params[:id]}"
    file = FileDesc.find_by_sha1urn(sha1urn)
    if file
      # Find the content-type using the file extension and mongrel's MIME_TYPES file
      dot_at = file.path.rindex('.')
      content_type = Mongrel::DirHandler::MIME_TYPES[file.path[dot_at .. -1]] if dot_at
      
      if File.exist?(file.path)
        # Send file in chunks if iPhone is asking for it that way
        if request.env["HTTP_RANGE"]
          range = request.env["HTTP_RANGE"].split("=").last
          start, finish = request.env["HTTP_RANGE"].split("-").map{|num| num.to_i}
          size = finish - start + 1

          File.open(file.path) do |f|
            f.seek(start)
            @data = f.read(size)
          end

          response.headers["Accept-Ranges"]  = "bytes"
          response.headers["Content-Range"]  = "bytes #{start}-#{finish}/#{file.get_file_size}"
          response.headers["Content-Length"] = "#{size}"

          send_data(@data, :status => 206)
        else
          if content_type
            send_file(file.path, :type => content_type)
          else
            send_file(filepath)
          end
        end
      else
        render :text => "record exists, but file not found: #{file.path}", :status => 404
      end
    else
      render :status => 404, :text => "file not found: #{params[:sha1]}"
    end
  end
end

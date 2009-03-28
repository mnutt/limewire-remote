# -*- encoding: utf-8 -*-

Gem::Specification.new do |s|
  s.name = %q{image_voodoo}
  s.version = "0.4"

  s.required_rubygems_version = Gem::Requirement.new(">= 0") if s.respond_to? :required_rubygems_version=
  s.authors = ["Thomas Enebo, Charles Nutter and JRuby contributors"]
  s.date = %q{2008-07-28}
  s.default_executable = %q{image_voodoo}
  s.description = %q{Install this gem and require 'image_voodoo' to load the library.}
  s.email = %q{enebo@acm.org, headius@headius.com}
  s.executables = ["image_voodoo"]
  s.extra_rdoc_files = ["Manifest.txt", "README.txt", "LICENSE.txt"]
  s.files = ["bin/image_voodoo", "Manifest.txt", "Rakefile", "README.txt", "LICENSE.txt", "lib/image_science.rb", "lib/image_voodoo", "lib/image_voodoo/version.rb", "lib/image_voodoo.rb", "samples/bench.rb", "samples/checkerboard.jpg", "samples/file_greyscale.rb", "samples/file_thumbnail.rb", "samples/file_view.rb", "samples/in-memory.rb", "test/pix.png", "test/test_image_science.rb"]
  s.has_rdoc = true
  s.homepage = %q{http://jruby-extras.rubyforge.org/image_voodoo}
  s.rdoc_options = ["--main", "README.txt"]
  s.require_paths = ["lib"]
  s.rubyforge_project = %q{jruby-extras}
  s.rubygems_version = %q{1.3.1}
  s.summary = %q{Image manipulation in JRuby with ImageScience compatible API}
  s.test_files = ["test/test_image_science.rb"]

  if s.respond_to? :specification_version then
    current_version = Gem::Specification::CURRENT_SPECIFICATION_VERSION
    s.specification_version = 2

    if Gem::Version.new(Gem::RubyGemsVersion) >= Gem::Version.new('1.2.0') then
    else
    end
  else
  end
end

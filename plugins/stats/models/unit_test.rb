require 'test/unit/ui/console/testrunner'

#This model will auto(re)load all tests under test/unit/**/*.rb and execute
#only those tests which inherit from LimeWireTest(not Test::Unit::TestCase)

class UnitTests
  def initialize(results)
    @_results = results
  end
  def failures
    @_results.instance_variable_get("@failures")
  end

  def to_s
    fails = failures

    return "All tests passed!" if fails.length == 0
    
    fails.collect{|f|
      f.short_display
    }.join("\n")
  end

  def to_html
    fails = failures
    return "<font color='green'>Passed!</font>" if fails.length == 0
    
    fails.collect{|f|
      "<font color='red'> #{f.long_display}</font>"
    }.join("<br>")
  end

  class << self
    def load_tests
      begin
        to_unlink = find_limewire_tests
        #loop through and unlink any tests
        to_unlink.each {|c|
          c.instance_methods.find_all{|m| m =~ /^test_/}.each {|test_method| 
            c.send :undef_method, test_method
          }
        }
      rescue
      end
      
      Dir.glob(File.join(RAILS_ROOT, "test","unit","**","*.rb")).each { |test|
        load test rescue nil
      }
    end
    
    def find_limewire_tests
      ret = []
      ObjectSpace.each_object(Class) do |klass|
        ret << klass if klass < LimeWireTest
      end
      Set.new(ret).to_a # sometimes doubles show up...knock it off
    end
    
    def run
      load_tests
      tests = find_limewire_tests
      suite = Test::Unit::TestSuite.new("Limewire tests")
      tests.each { |t| suite << t.suite }
      
      #how awkward
      s = Class.new(Test::Unit::TestSuite)
      def s.suite
        @@_suite
      end
      s.class_eval {@@_suite = suite }
      
      new(Test::Unit::UI::Console::TestRunner.run(s))
    end
  end
end

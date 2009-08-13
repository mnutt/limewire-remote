TagCloud = function() {
  this.stopWords = [ "a", "about", "above", "accordingly", "after",
    "again", "against", "ah", "all", "also", "although", "always", "am", "among", "amongst", "an",
    "and", "any", "anymore", "anyone", "are", "as", "at", "away", "be", "been",
    "begin", "beginning", "beginnings", "begins", "begone", "begun", "being",
    "below", "between", "but", "by", "ca", "can", "cannot", "come", "could",
    "did", "do", "doing", "during", "each", "either", "else", "end", "et",
    "etc", "even", "ever", "far", "ff", "following", "for", "from", "further", "furthermore",
    "get", "go", "goes", "going", "got", "had", "has", "have", "he", "her",
    "hers", "herself", "him", "himself", "his", "how", "i", "if", "in", "into",
    "is", "it", "its", "itself", "last", "lastly", "less", "many", "may", "me",
    "might", "more", "must", "my", "myself", "near", "nearly", "never", "new",
    "next", "no", "not", "now", "o", "of", "off", "often", "oh", "on", "only",
    "or", "other", "otherwise", "our", "ourselves", "out", "over", "perhaps",
    "put", "puts", "quite", "s", "said", "saw", "say", "see", "seen", "shall",
    "she", "should", "since", "so", "some", "such", "t", "than", "that", "the",
    "their", "them", "themselves", "then", "there", "therefore", "these", "they",
    "this", "those", "though", "throughout", "thus", "to", "too",
    "toward", "unless", "until", "up", "upon", "us", "ve", "very", "was", "we",
    "were", "what", "whatever", "when", "where", "which", "while", "who",
    "whom", "whomever", "whose", "why", "with", "within", "without", "would",
    "yes", "your", "yours", "yourself", "yourselves" ];

  this.stopReg = new RegExp("\\s((" + this.stopWords.join("|") + ")\\s)+", "gi");

  this.tags = {};
  this.max = 1;

  this.refreshTagCloud = function() {
    var cloudList = $('#tag-list');
    cloudList.html('');

    if(this.tags != {}) {
      $('#tag-expand').show();
    } else {
      $('#tag-expand').hide();
    }

    for(var tag in this.tags) {
      var size = parseInt(this.tags[tag] / this.max * 3);
      cloudList.append("<li class='size"+size+"'><a href='#'>"+tag+"</a> </li>");
    }
  };

  this.filterByTag = function() {
    var tag = $(this).text();
    $('#search-info').html("Tag: <strong></strong>").find('strong').text(tag);
    tagCloud.removeResultsNotContaining(tag);
    startComet(tag);
    return false;
  };

  this.removeResultsNotContaining = function(tag) {
    $.each($('#results > div.result'), function() {
      var tags = $(this).data('tags');
      if(typeof(tags) == "undefined" || !tagCloud.arrayContains(tags, tag)) {
	$(this).remove();
      }
    });
  };

  this.arrayContains = function(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) {
	return true;
      }
    }
    return false;
  };
};

var tagCloud = new TagCloud();

$(document).ready(function() {
  $('.tags a, #tag-list a').live('click', tagCloud.filterByTag);
  $('#tag-expand').click(function() {
    $('#tag-cloud').toggle();
    return false;
  });
});
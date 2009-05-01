$(function() {
  $('ul.widgets').sortable({
    handle: 'div.handle',
    opacity: 0.8,
    connectWith: ['.widgets'],
    stop: function() {
      console.log("reordered");
    }
  });
});
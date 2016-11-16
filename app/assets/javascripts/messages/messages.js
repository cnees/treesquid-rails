$(document).ready(ready);

// Turbolinks skips document.ready(), so execute ready on load
$(document).on('page:load', ready);

function ready() {
  $("#add-root-form").dialog({minHeight: 'auto', display:'none'});
  $("#add-root-form").parent().hide();

  var messages = []
  var conversation = $('#conversation').data('conversation');
  var root = $('#conversation').data('root');
  var container = $('#cy');
  var cy = Graph.build(container, root, messages, conversation);
  var dispatcher = new WebSocketRails('localhost:3000/websocket');

  dispatcher.bind('add_reply', function(data) {
    Graph.addReply(data, cy);
  });

  // Submit reply
  $("body").on('keypress', '.reply-box', function(e) {
    if (e.keyCode == 13 && !e.shiftKey) { // Return/enter
      Graph.replyToMessage(e, root, cy, dispatcher);
      return false; // Cancel event
    }
  });

  // Submit reply
  $("body").on('click', '.reply-button', function(e) {
    Graph.replyToMessage(e, root, cy, dispatcher);
    return false; // Cancel event
  });

  // Highlight user's messages on hover
  $("#users li").hover(function(){
    $(this).toggleClass('hover-border');
    cy.nodes("[user = " + $(this).attr('data-id') +"]").forEach(function(n){
      n.toggleClass('hover-border');
    });
  });

  // Highlight user's messages on click
  $("#users li").click(function(){
    $(this).toggleClass('click-border');
    cy.nodes("[user = " + $(this).attr('data-id') +"]").forEach(function(n){
      n.toggleClass('click-border');
    });
  });

  // Show modal to create new conversation
  $("#add-root").click(function(e) {
    $("#add-root-form").parent().toggle();
    $("#add-root-text").focus();
  });

};

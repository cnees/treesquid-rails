$(function() {
  var messages = []
  var conversation = $('#conversation').data('conversation');
  for(var i = 0; i < conversation.length; i++) {
    reply = conversation[i]
    messages.push(
      { // Node
        data: {
          id: reply.id,
          label: reply.text,
          user: reply.user_id,
          text: reply.text,
        }
      }
    );
    messages.push(
      { // edge
        data: { id: reply.parent_id + '_' + reply.id, source: reply.parent_id, target: reply.id }
      }
    );
  }
  console.log(messages)

  var cy = cytoscape({
    container: $('#cy'),
    elements: messages

  });
});

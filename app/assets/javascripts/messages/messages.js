$(document).ready(ready);

// Turbolinks skips document.ready(), so execute ready on load
$(document).on('page:load', ready);

function ready() {
  $("#add-root-form").dialog({minHeight: 'auto', display:'none'});
  $("#add-root-form").parent().hide();
  var messages = []
  var conversation = $('#conversation').data('conversation');
  var root = $('#conversation').data('root');
  var cy = buildGraph(root, messages, conversation);

  var dispatcher = new WebSocketRails('localhost:3000/websocket');

  dispatcher.on_open = function(data) {
    console.log('Connection has been established: ', data);
  };

  dispatcher.bind('event_name', function(data) {
    console.log(data.message); // would output 'this is a message'
  });

  $("body").on('keypress', '.reply-box', function(e) {
    if (e.keyCode == 13 && !e.shiftKey) { // Return/enter
      replyToMessage(e, root, cy, dispatcher);
      return false; // Cancel event
    }
  });

  $("body").on('click', '.reply-button', function(e) {
    replyToMessage(e, root, cy, dispatcher);
    return false; // Cancel event
  });

  $("#add-root").click(function(e) {
    $("#add-root-form").parent().toggle();
    $("#add-root-text").focus();
  });

  $("#users li").hover(function(){
    $(this).toggleClass('hover-border');
    cy.nodes("[user = " + $(this).attr('data-id') +"]").forEach(function(n){
      n.toggleClass('hover-border');
    });
  });

  $("#users li").click(function(){
    $(this).toggleClass('click-border');
    cy.nodes("[user = " + $(this).attr('data-id') +"]").forEach(function(n){
      n.toggleClass('click-border');
    });
  });
};

function buildGraph(root, messages, conversation) {
  
  // Add all nodes
  addNode(root, messages)
  for(var i = 0; i < conversation.length; i++) {
    reply = conversation[i]
    addNode(reply, messages)
    addEdge(reply, messages) 
  }

  // Display graph
  var cy = cytoscape({
    container: $('#cy'),
    elements: messages,
    style: [{
      selector: 'node',
      style: {
        'border-opacity': 1,
        'border-style': 'solid',
        'border-width': 3,
        'border-color': '#5E1C1D',
        'width': 'label',
        'height': 'label',
        'shape': 'roundrectangle',
        'padding-left': '10px',
        'padding-right': '10px',
        'padding-top': '10px',
        'padding-bottom': '10px',
        'background-color': '#FFF',
        'label': 'data(label)',
        'font-size': '12px',
        'text-halign': 'center',
        'text-valign': 'center',
        'text-wrap': 'wrap',
        'text-max-width': '120px',
        'color': '#000',
      },
    },
    {
      selector: 'edge',
      style: {
        'width': 2,
        'line-color': '#B25D04',
        'target-arrow-color': '#B25D04',
        'target-arrow-shape': 'triangle-backcurve',
      }
    },
    {
      selector: '.hover-border',
      style: {
        'color': '#A1D028',
        'border-color': '#A1D028',
      }
    },
    {
      selector: '.click-border',
      style: {
        'border-color': '#B25D04',
      }
    }],
    layout: {
      name: 'breadthfirst',
      directed: true,
      padding: 30,
      'padding-left': 250,
      spacingFactor: 1.1,
      animate: false,
    },
    headless: false,
    styleEnabled: true,
    hideEdgesOnViewport: false,
    hideLabelsOnViewport: false,
    textureOnViewport: false,
    motionBlur: false,
    motionBlurOpacity: 0.2,
    wheelSensitivity: 1,
    pixelRatio: 1
  });

  // Pan/Zoom controls
  var defaults = {
    zoomFactor: 0.05,
    zoomDelay: 45,
    minZoom: 0.1,
    maxZoom: 10,
    fitPadding: 50,
    panSpeed: 10,
    panDistance: 10,
    panDragAreaSize: 75,
    panMinPercentSpeed: 0.25,
    panInactiveArea: 8,
    panIndicatorMinOpacity: 0.5,
    zoomOnly: false,
    sliderHandleIcon: 'fa fa-minus',
    zoomInIcon: 'fa fa-plus',
    zoomOutIcon: 'fa fa-minus',
    resetIcon: 'fa fa-expand'
  };
  cy.panzoom( defaults );

  // Add reply boxes
  cy.nodes().forEach(function(n){
    setQTip(n);
  });

  return cy;
}

function addNode(data, graph) {
  graph.push({
    data: {
      id: data.id,
      label: data.username + ': ' + data.text,
      text: data.username + ': ' + data.text,
      user: data.user_id
    }
  });
}

function addEdge(data, graph) {
  graph.push({
    data: {
      id: data.parent_id + '_' + data.id,
      source: data.parent_id,
      target: data.id
    }
  });
}

function setQTip(n) {
  n.qtip({
    content: [
    n.data('user'),
    "<br>",
      n.data('text').replace(/\r?\n/g, '<br />'),
      "<br><textarea class='reply-box' data-id='" + n.data("id") + "' placeholder='Reply'></textarea><br><button class='reply-button' id='reply_" + n.data("id") + "'>Reply</button>"
    ],
    position: {
      my: 'top center',
      at: 'bottom center'
    },
    style: {
      classes: 'qtip-bootstrap',
      tip: {
        width: 16,
        height: 8
      }
    },
  });
}

function eraseText(id) {
  console.log("eraseText(id) not implemented")
}

function color(id) {
  return "#00ff00";
}

function addReply(e, data, cy){
  var layoutParams = cy._private.options.layout
  var n = cy.add({
    style: {
      'border-color': '#5E1C1D',
    },
    group: "nodes",
    data: {
      id: data.id,
      text: data.username + ': ' + data.text,
      label: data.username + ': ' + data.text,
    }
  });
  cy.add({ // edge
    data: {
      id: data.parent_id + "_" + data.id,
      source: data.parent_id,
      target: data.id
    }
  });
  setQTip(n);
  var view = {
    zoom: cy.zoom(),
    pan: cy.pan()
  };
  cy.layout(layoutParams);
  cy.viewport(view);
}

function replyToMessage(e, root, cy, dispatcher) {
  var textBox = $(e.target).parent().find("textarea:first");
  if($.trim( textBox.val() ) == '') {
    return; // No  message
  }
  $('body').css('cursor', 'progress');
  $("div").qtip("hide");
  data = {
    'message': {
      'text': textBox.val(),
      'parent_id': textBox.attr("data-id"),
      'root_id': root.id      
    }
  };

  var pass = function(response) {
    $('body').css('cursor', 'default');
    addReply(e, response, cy);
    textBox.val('');
  };

  var fail = function(data) {console.log("FAILURE");console.log(data)};
  dispatcher.trigger("create_message", data, pass, fail);
  /*$.post("/messages", data, function(response){

  }, 'json');*/
}

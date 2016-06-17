$(document).ready(ready);

// Turbolinks skips document.ready(), so execute ready on load
$(document).on('page:load', ready);

function ready() {
  var messages = []
  var conversation = $('#conversation').data('conversation');
  console.log(conversation)
  var root = $('#conversation').data('root');
  console.log(root)

  var cy = buildGraph(root, messages, conversation);

  $("body").on('keypress', '.reply-box', function(e) {
    if (e.keyCode == 13 && !e.shiftKey) { // Return/enter
      replyToMessage(e, root, cy);
      return false; // Cancel event
    }
  });

  $("body").on('click', '.reply-button', function(e) {
    replyToMessage(e, root, cy);
    return false; // Cancel event
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
        'border-width': 6,
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
      }
    },
    {
      selector: 'edge',
      style: {
        'width': 2,
        'line-color': '#660022',
        'target-arrow-color': '#660022',
        'target-arrow-shape': 'triangle-backcurve',
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
  console.log(data)
  graph.push({
    data: {
      id: data.id,
      label: data.user + ': ' + data.text,
      text: data.user + ': ' + data.text,
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
      'border-color': color(data.user_id),
    },
    group: "nodes",
    data: {
      id: data.id,
      text: data.user + ': ' + data.text,
      label: data.user + ': ' + data.text,
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

function replyToMessage(e, root, cy) {
  var textBox = $(e.target).parent().find("textarea:first");
  if($.trim( textBox.val() ) == '') {
    return; // No  message
  }
  $("div").qtip("hide");
  data = {
    'message': {
      'text': textBox.val(),
      'parent_id': textBox.attr("data-id"),
      'root_id': root.id      
    }
  };
  $.post("/messages", data, function(response){
    console.log(response);
    addReply(e, response, cy);
    textBox.val('');
  }, 'json');
}
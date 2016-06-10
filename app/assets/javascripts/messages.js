
function addNode(data, graph) {
  graph.push({
    data: {
      id: data.id,
      label: data.text,
      user: data.user_id,
      text: data.text,
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
      "<br><textarea class='reply-box' data-id='" + n.data("id") + "' placeholder='Reply'></textarea><br><button onclick='eraseText(" + n.data("id") + ")' class='reply-button' id='reply_" + n.data("id") + "'>Reply</button>"
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

var ready = function() {
  var messages = []
  var conversation = $('#conversation').data('conversation');
  console.log(conversation)
  var root = $('#conversation').data('root');
  console.log(root)

  addNode(root, messages)
  for(var i = 0; i < conversation.length; i++) {
    reply = conversation[i]
    addNode(reply, messages)
    addEdge(reply, messages) 
  }

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
        'line-color': '#996633',
        'target-arrow-color': '#996633',
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
  cy.nodes().forEach(function(n){
    setQTip(n);
  });

};

//$(document).ready(ready);

// Turbolinks skips document.ready(), so execute ready on load
$(document).on('page:load', ready);

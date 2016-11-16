var Graph = (function() {
  
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

  // message needs id, username, text, and parent_id attributes
  function addReply(message, cy){
    $('body').css('cursor', 'default');
    var layoutParams = cy._private.options.layout
    var n = cy.add({
      style: {
        'border-color': '#5E1C1D',
      },
      group: "nodes",
      data: {
        id: message.id,
        text: message.user.username + ': ' + message.text,
        label: message.user.username + ': ' + message.text,
      }
    });
    cy.add({ // edge
      data: {
        id: message.parent_id + "_" + message.id,
        source: message.parent_id,
        target: message.id
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

    dispatcher.trigger("create_message", data);
    textBox.val('');
  }

  return {

    addReply: addReply,

    replyToMessage: replyToMessage,

    addNode: function(data, graph) {
      graph.push({
        data: {
          id: data.id,
          label: data.user.username + ': ' + data.text,
          text: data.user.username + ': ' + data.text,
          user: data.user_id
        }
      });
    },

    addEdge: function(data, graph) {
      graph.push({
        data: {
          id: data.parent_id + '_' + data.id,
          source: data.parent_id,
          target: data.id
        }
      });
    },

    eraseText: function(id) {
      console.log("eraseText(id) not implemented")
    },

    build: function(container, root, messages, conversation) {
      
      // Add all nodes
      this.addNode(root, messages);
      for(var i = 0; i < conversation.length; i++) {
        reply = conversation[i];
        this.addNode(reply, messages);
        this.addEdge(reply, messages) ;
      }

      // Display graph
      var cy = cytoscape({
        container: container,
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
    },
  }
})();
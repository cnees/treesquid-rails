class ChatController < WebsocketRails::BaseController

  def create_message
    m = Message.new(message['message'])
    
    if m.save!
      trigger_success(m)
      new_message = {:message => 'this is a message!!!!'}
      broadcast_message :event_name, new_message
    else
      trigger_failure(m)
    end

  end

end
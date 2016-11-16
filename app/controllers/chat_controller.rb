class ChatController < WebsocketRails::BaseController

  def create_message
    m = Message.new(message['message'])
    m.user = current_user
    if m.save!
      new_message = {
        id: m.id,
        user: {username: m.user.username},
        text: m.text,
        parent_id: m.parent_id,
      }
      broadcast_message :add_reply, new_message
    end
  end

end 
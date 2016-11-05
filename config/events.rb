WebsocketRails::EventMap.describe do

  subscribe :create_message, 'chat#create_message'

end

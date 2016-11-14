class MessagesController < ApplicationController
  
  def index
    @roots = Message.where(parent: nil)
  end

  def show
    @roots = current_user.messages.includes(:user).where(parent: nil)
    @message = current_user.messages.includes(:user).find(params[:id])
    fields = 'messages.*, users.username'
    @message.root ||= @message
    @root = Message.joins(:user).select(fields).find(@message.root.id)
    @conversation = Message.includes(:user).where(root: @root)
    @users = Message.select('messages.user_id, users.username').
                     joins(:user).
                     where(root: @root).
                     group('messages.user_id, users.username')
    @root = @root.as_json(include: :user)
    @conversation = @conversation.as_json(include: :user)
  end

  def create
    puts "CREATING MESSAGE!!!!!"
    params[:message][:user_id] = current_user.id
    @message = Message.includes(:user).create!(message_params)
    
    if @message.root
      render json: @message.attributes.merge({username: current_user.username})
    else
      redirect_to @message
    end
  end

  def new
    @message = Message.new
  end

  def message_params
    params.require(:message).permit(:text,:user_id,:parent_id,:root_id)
  end

end
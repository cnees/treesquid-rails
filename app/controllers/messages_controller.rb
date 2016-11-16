class MessagesController < ApplicationController
  
  def index
    @roots = roots
  end

  def show
    created_roots = roots
    joined_roots = current_user.conversations.includes(:user)
    @roots = created_roots.concat(joined_roots)

    @message = current_user.messages.includes(:user).find(params[:id])
    @message.root ||= @message

    @root = Message.joins(:user).find(@message.root.id)
    @conversation = Message.includes(:user).where(root: @root)
    @users = Message.select('messages.user_id, users.username').
                     joins(:user).
                     where(root: @root).
                     group('messages.user_id, users.username')
    @root = @root.as_json(include: :user)
    @conversation = @conversation.as_json(include: :user)
  end

  def create
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

  def roots
    current_user.messages.includes(:user).where(parent: nil)
  end
end
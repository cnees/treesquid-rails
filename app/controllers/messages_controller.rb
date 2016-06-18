class MessagesController < ApplicationController
  def index
    @roots = Message.where(parent: nil)
  end
  def show
    @roots = Message.where(parent: nil)
    @message = Message.find(params[:id])
    @root = @message
    fields = 'messages.*, users.username'
    if @message.root
      @root = Message.joins(:user).find(@message.root.id).select(fields)
    end
    @conversation = Message.joins(:user).where(root: @root).select(fields)
  end
  def create
    params[:message][:user_id] = current_user.id
    @message = Message.create(params.require(:message).permit(:text,:user_id,:parent_id,:root_id))
    render json: @message
  end
  def new
    @message = Message.new
  end
end
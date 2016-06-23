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
      @root = Message.joins(:user).select(fields).find(@message.root.id)
    end
    @conversation = Message.joins(:user).where(root: @root).select(fields)
    @users = @conversation.to_a.uniq{|x| x.user_id}
  end
  def create
    params[:message][:user_id] = current_user.id
    @message = Message.includes(:user).create(params.require(:message).permit(:text,:user_id,:parent_id,:root_id))
    render json: @message.attributes.merge({username: current_user.username})
  end
  def new
    @message = Message.new
  end
end
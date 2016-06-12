class MessagesController < ApplicationController
  def index
    @roots = Message.where(parent: nil)
  end
  def show
    @roots = Message.where(parent: nil)
    @message = Message.find(params[:id])
    @root = @message
    if @message.root
      @root = Message.find(@message.root.id)
    end
    @conversation = Message.where(root: @root)
  end
  def create
    @message = Message.create(params.require(:message).permit(:text,:parent_id,:root_id))
    render json: @message
  end
  def new
    @message = Message.new
  end
end
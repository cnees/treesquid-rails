class Message < ActiveRecord::Base
  belongs_to :user
  has_many :messages
  has_many :conversation_memberships
  has_many :users, through: :conversation_memberships
  belongs_to :parent, class_name: 'Message'
  belongs_to :root, class_name: 'Message'
end

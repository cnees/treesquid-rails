class Message < ActiveRecord::Base
  belongs_to :user
  has_many :messages
  belongs_to :parent, class_name: 'Message'
  belongs_to :root, class_name: 'Message'
end

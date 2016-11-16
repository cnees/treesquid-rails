class CreateConversationMemberships < ActiveRecord::Migration
  def change
    create_table :conversation_memberships do |t|
      t.column :user_id, :integer
      t.column :message_id, :integer
      t.timestamps null: false
    end
  end
end

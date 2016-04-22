class CreateMessages < ActiveRecord::Migration
  def change
    create_table :messages do |t|
      t.string :text
      t.references :user, index: true, foreign_key: true
      t.references :parent
      t.references :root, index: true

      t.timestamps null: false
    end
  end
end

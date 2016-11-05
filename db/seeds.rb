# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)

demo_root = Message.create()


# id: integer, text: string, user_id: integer, parent_id: integer, root_id: integer, created_at: datetime, updated_at: datetime
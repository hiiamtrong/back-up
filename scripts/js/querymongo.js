conn = new Mongo()
db = conn.getDB('4handy-work-dev')
users = db.usertagentries.find().sort({ created: -1 }).llim
while (users.hasNext()) {
  printjson(users.next())
}

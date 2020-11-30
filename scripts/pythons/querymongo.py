import pymongo
import pyperclip
import sys
myclient = pymongo.MongoClient("mongodb://localhost:27017/")
mydb = myclient["4handy-work-dev"]
mycol = mydb["usertagentries"]
mydocs = mycol.find().sort("created").limit(int(sys.argv[1]))
result = []
for doc in mydocs:
    need = {"status": doc['status'], "taggedUsers": [{'user': taggedUser['user']} for taggedUser in doc['taggedUsers']],
            "notiId": doc['notiId'], "description": doc['description']}
    result.append(need)

print((result))

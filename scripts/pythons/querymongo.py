import pymongo
import sys
import os
env = sys.argv[2]
mongo_url = os.getenv('MONGO_URL')
myclient = pymongo.MongoClient(mongo_url)
mydb = myclient["4handy-work"]
if env == 'dev':
    myclient = pymongo.MongoClient("mongodb://localhost:27017/")
    mydb = myclient["4handy-work-dev"]
    print('dev')
else:
    print('prod')
mycol = mydb["usertagentries"]
limit = int(sys.argv[1])
mydocs = mycol.find({}).sort("created", pymongo.DESCENDING).limit(limit)
result = []
for doc in mydocs:
    need = {"status": doc['status'], "taggedUsers": [{'user': taggedUser['user']} for taggedUser in doc['taggedUsers']],
            "notiId": doc['notiId'], "description": doc['description']}
    result.append(need)

print((result))

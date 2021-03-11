import callapi
import json
import pydash as _
import requests
import asyncio
import aiohttp
import os.path
from DateTime import DateTime

current_path = os.path.dirname(os.path.abspath(__file__))

# initial
callapi.init()
path_cards = open(f"{current_path}/cards-trello.json")
path_custom_fields = open(f"{current_path}/customFields-trello.json")
path_custom_members = open(f"{current_path}/members-trello.json")
path_lists = open(f"{current_path}/lists-trello.json")
path_labels = open(f"{current_path}/labels-trello.json")
cards = json.loads(path_cards.read())
custom_fields = json.loads(path_custom_fields.read())
members = json.loads(path_custom_members.read())
lists = json.loads(path_lists.read())
labels = json.loads(path_labels.read())
members_map = {}
custom_fields_map = {}
lists_map = {}
labels_map = {}
summary_cards = []
for member in members:
    members_map[member["id"]] = member["fullName"]
for field in custom_fields:
    custom_fields_map[field["id"]] = field["name"]
need_lists = [
    "5e5e1391e3c0053b8a4ecadd",
    "5958d058ce48d6ee6e437912",
    "5f8926abf5f741310a8c695d",
    "5958d05c1f34b876e4fc00a9",
    "5958d06a118336d803b09183",
]
for list in lists:
    if list["id"] in need_lists:
        lists_map[list["id"]] = list["name"]
for label in labels:
    labels_map[label["id"]] = label["name"]


def calc_point_trello(trello_credential, label):
    existsLabel = _.find(labels_map, lambda _label: _label == label)
    cards_with_points = _.filter_(
        asyncio.get_event_loop().run_until_complete(
            get_all_point(cards, trello_credential)
        )
    )
    if existsLabel:
        cards_with_points = _.filter_(
            cards_with_points, lambda card: label in _.map_(card["labels"], "name")
        )

    for card in cards_with_points:
        dueDate = DateTime(card["due"]).Date() if card["due"] else ""
        useful_info = {
            "name": card["name"],
            "id": card["id"],
            "label": _.map_(card["labels"], "name"),
            "point": card["point"],
            "list": lists_map[card["idList"]],
            "listId": card["idList"],
            "link": "https://trello.com/c/" + card["shortLink"],
            "dueDate": dueDate,
        }
        if not len(card["idMembers"]):
            summary_cards.append(useful_info)
        else:
            for member in card["idMembers"]:
                useful_info["username"] = members_map[member]
                useful_info["userId"] = member
                summary_cards.append(useful_info)

    return {
        "cards": summary_cards,
        "users": get_uniq_users(summary_cards),
        "lists": get_uniq_lists(summary_cards),
    }


async def get_all_point(cards, trello_credential):
    async with aiohttp.ClientSession() as session:
        points = []
        for card in cards:
            point = asyncio.create_task(get_point(card, session, trello_credential))
            points.append(point)
        cards_with_points = await asyncio.gather(*points, return_exceptions=True)
        return cards_with_points


async def get_point(card, session, trello_credential):
    if card["idList"] not in lists_map.keys():
        return
    url_trello = f'https://api.trello.com/1/cards/{card["id"]}/customFieldItems'
    headers = {"Accept": "application/json"}
    query = {
        "token": f'{trello_credential["ACCESS_TOKEN_TRELLO"]}',
        "key": f'{trello_credential["KEY"]}',
    }
    async with session.get(url_trello, headers=headers, params=query,) as response:
        if response.status != 200:
            return
        response = await response.json()
        custom_field = _.find(response, {"idCustomField": "5f8e5b92e141341c11fe1b1d"})
        point = 0
        if custom_field:
            point = custom_field["value"]["number"]
        card["point"] = point
        return card


def get_uniq_users(summary_cards):
    users = {}
    for card in summary_cards:
        if not card.get("userId"):
            continue
        users[card.get("userId")] = card["username"]
    return users


def get_uniq_lists(summary_cards):
    _lists = {}
    for card in summary_cards:
        _lists[card["listId"]] = card["list"]
    return _lists

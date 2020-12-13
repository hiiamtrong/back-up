import callapi
import json
import pydash as _
import requests
import asyncio
import aiohttp
# initial
callapi.init()
path_cards = open('./cards-trello.json')
path_custom_fields = open('./custom-field-trello.json')
path_custom_members = open('./members-trello.json')
path_lists = open('./lists-trello.json')
path_labels = open('./labels-trello.json')
cards = json.loads(path_cards.read())
custom_fields = json.loads(path_custom_fields.read())
members = json.loads(path_custom_members.read())
lists = json.loads(path_lists.read())
labels = json.loads(path_labels.read())
members_map = {}
custom_fields_map = {}
lists_map = {}
labels_map = {}
summary_cards = {}
for member in members:
    members_map[member['id']] = member['fullName']
for field in custom_fields:
    custom_fields_map[field['id']] = field['name']
need_lists = [
    "5e5e1391e3c0053b8a4ecadd",
    "5958d058ce48d6ee6e437912",
    "5f8926abf5f741310a8c695d",
    "5958d05c1f34b876e4fc00a9",
    "5958d06a118336d803b09183",
]
for list in lists:
    if(list['id'] in need_lists):
        lists_map[list['id']] = list['name']
for label in labels:
    labels_map[label['id']] = label['name']


async def get_point(card, trello_credential):
    url_trello = f'https://api.trello.com/1/cards/{card["id"]}customFieldItems'
    headers = {
        "Accept": "application/json"
    }
    query = {
        'token': f'{trello_credential["ACCESS_TOKEN_TRELLO"]}',
        'key': f'{trello_credential["KEY"]}',
    }
    response_customFields = requests.request(
        "GET",
        f'{url_trello}',
        params=query,
        headers=headers,
    )
    return response_customFields


def calc_point_trello(trello_credential, label):
    existsLabel = _.find(labels_map, lambda _label: _label == label)
    if not existsLabel:
        raise Exception(f"Label {label} không tồn tại")
    cards_with_points = _.filter_(asyncio.get_event_loop().run_until_complete(
        get_all_point(cards, trello_credential)))
    cards_with_points = _.filter_(
        cards_with_points, lambda card: label in _.map_(card['labels'], 'name'))
    for card in cards_with_points:
        for member in card['idMembers']:
            if(not summary_cards.get(member)):
                summary_cards[member] = []
            summary_cards[member].append(
                {"name": card["name"], "id": card["id"], "label": _.map_(card['labels'], 'name'), "point": card["point"], "list": lists_map[card["idList"]], "listId": card["idList"]}, )
    return {
        "users": summary_by_users(summary_cards),
        "lists": summary_by_lists(cards_with_points)
    }


async def get_all_point(cards, trello_credential):
    async with aiohttp.ClientSession() as session:
        points = []
        for card in cards:
            point = asyncio.create_task(
                get_point(card, session, trello_credential))
            points.append(point)
        cards_with_points = await asyncio.gather(*points, return_exceptions=True)
        return cards_with_points


async def get_point(card, session, trello_credential):
    if(card['idList'] not in lists_map.keys()):
        return
    url_trello = f'https://api.trello.com/1/cards/{card["id"]}/customFieldItems'
    headers = {
        "Accept": "application/json"
    }
    query = {
        'token': f'{trello_credential["ACCESS_TOKEN_TRELLO"]}',
        'key': f'{trello_credential["KEY"]}',
    }
    async with session.get(url_trello, headers=headers, params=query,) as response:
        if(response.status != 200):
            return
        response = await response.json()
        custom_field = _.find(
            response, {'idCustomField': '5f8e5b92e141341c11fe1b1d'})
        point = 0
        if(custom_field):
            point = custom_field['value']['number']
        card['point'] = point
        return card


def summary_by_users(summary_cards):
    users = {}
    for user in summary_cards:
        user_name = members_map[user]
        total_point = sum(int(card["point"]) for card in summary_cards[user])
        lists_map_clones = {}
        for list in lists:
            if(list['id'] in need_lists):
                lists_map_clones[list['name']] = {
                    "cards": [],
                    "list-points": 0
                }
        if(not users.get(user_name)):
            users[user_name] = {"lists": lists_map_clones,
                                "total_point": total_point}
        for card in summary_cards[user]:
            users[user_name]["lists"][card["list"]]["cards"].append(card)
            users[user_name]["lists"][card["list"]
                                      ]["list-points"] += int(card.get('point', 0))
    return users


def summary_by_lists(cards):
    _lists = {}
    for list in lists:
        if(list['id'] in need_lists):
            _lists[list['name']] = {
                "cards": [],
                "total_points": 0
            }
    cards_group_by_lists = _.group_by(cards, 'idList')
    for list in cards_group_by_lists:
        list_name = lists_map[list]
        total_points = sum(int(card["point"])
                           for card in cards_group_by_lists[list])
        _lists[list_name]['total_points'] = total_points
        for card in cards_group_by_lists[list]:
            _lists[list_name]["cards"].append({"name": card["name"], "id": card["id"], "label": _.map_(
                card['labels'], 'name'), "point": card["point"], "list": lists_map[card["idList"]], "listId": card["idList"]},)
    return _lists
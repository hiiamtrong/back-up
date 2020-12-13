import requests
from trelloAgent import trello


def init():

    url_trello = f"https://api.trello.com/1/boards/5958d029f55bf11523061e25"
    headers = {
        "Accept": "application/json"
    }
    query = {
        'token': f'{trello["ACCESS_TOKEN_TRELLO"]}',
        'key': f'{trello["KEY"]}',
    }
    response_members = requests.request(
        "GET",
        f'{url_trello}/members',
        params=query,
        headers=headers,
    )
    response_custom_fields = requests.request(
        "GET",
        f'{url_trello}/customFields',
        params=query,
        headers=headers,
    )
    response_lists = requests.request(
        "GET",
        f'{url_trello}/lists',
        params=query,
        headers=headers,
    )
    response_cards = requests.request(
        "GET",
        f'{url_trello}/cards',
        params=query,
        headers=headers,
    )
    response_labels = requests.request(
        "GET",
        f'{url_trello}/labels',
        params=query,
        headers=headers,
    )
    path_cards = open('./cards-trello.json', 'w')
    path_custom_fields = open('./custom-field-trello.json', 'w')
    path_custom_members = open('./members-trello.json', 'w')
    path_custom_lists = open('./lists-trello.json', 'w')
    path_labels = open('./labels-trello.json', 'w')
    path_cards.write(response_cards.text)
    path_custom_fields.write(response_custom_fields.text)
    path_custom_members.write(response_members.text)
    path_custom_lists.write(response_lists.text)
    path_labels.write(response_labels.text)

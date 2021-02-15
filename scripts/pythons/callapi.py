import requests
import json
from trelloAgent import trello
import pydash as _
import os.path
import asyncio
import aiohttp

current_path = os.path.dirname(os.path.abspath(__file__))

paths = ["members", "customFields", "lists", "cards", "labels"]


def init():
    headers = {"Accept": "application/json"}
    query = {
        "token": f'{trello["ACCESS_TOKEN_TRELLO"]}',
        "key": f'{trello["KEY"]}',
    }
    response_boards = requests.request(
        "GET",
        f'https://api.trello.com/1/members/{trello["USER_ID"]}/boards',
        params=query,
        headers=headers,
    )
    TECH_BOARD_ID = _.find(response_boards.json(), {"name": "Team Tech"})["id"]
    save = asyncio.get_event_loop().run_until_complete(
        get_all_data(paths, TECH_BOARD_ID)
    )
    for path in save:
        path_open = open(f"{current_path}/{path}-trello.json", "w")
        path_open.write(json.dumps(save[path]))
    path_boards = open(f"{current_path}/boards-trello.json", "w")
    path_boards.write(response_boards.text)


async def get_all_data(paths, TECH_BOARD_ID):
    async with aiohttp.ClientSession() as session:
        save = {}
        all_data = []
        for path in paths:
            data = asyncio.create_task(get_data(path, session, save, TECH_BOARD_ID))
            all_data.append(data)
        await asyncio.gather(*all_data, return_exceptions=True)
        return save


async def get_data(path, session, save, TECH_BOARD_ID):
    url_trello = f"https://api.trello.com/1/boards/{TECH_BOARD_ID}/{path}"
    headers = {"Accept": "application/json"}
    query = {
        "token": f'{trello["ACCESS_TOKEN_TRELLO"]}',
        "key": f'{trello["KEY"]}',
    }
    async with session.get(
        url_trello,
        headers=headers,
        params=query,
    ) as response:
        if response.status != 200:
            return
        response = await response.json()
        save[path] = response
        return save

import requests
import moment
import pyperclip

gitlab = {
    "ACCESS_TOKEN_GITLAB": 'Fa-pj1Z3KGXDYAErR-5-',
    "PROJECT_ID": '9395059',
    "USER_GITLAB": 'hiiamtrong',
    "STATE": 'opened',
}
trello = {
    "USER_ID": "5ea7a2cf1fd8450d3c7bdfe8",
    'ACCESS_TOKEN_TRELLO': "243a673d31dee1be1412a5b80c86652402ef98f1c9dac02c7a3844c3c060baf8",
    'KEY': 'b03babd66783d968892a66a186e8e680'
}


def get_task_gitlab():
    url_gitlab = f'https://gitlab.com/api/v4/projects/{gitlab["PROJECT_ID"]}/merge_requests?author_username={gitlab["USER_GITLAB"]}&private_token={gitlab["ACCESS_TOKEN_GITLAB"]}&state={gitlab["STATE"]}'
    tasks = requests.get(url_gitlab).json()
    tasks_text = ''
    for task in tasks:
        approve_status = 'approved' if task['merge_status'] != 'unchecked' else 'unapproved'
        if 'Draft' not in task['title']:
            tasks_text += f'- [*{approve_status}*] [{task.get("title")}]({task.get("web_url")}) update gần nhất: **{moment.date(task.get("updated_at")).format("YYYY-M-D h:m A")}**\n'
    return tasks_text


lists = {
    "5e5e1391e3c0053b8a4ecadd": "Todo",
    "5958d058ce48d6ee6e437912": "Doing",
    "5f8926abf5f741310a8c695d": "Draft"
}


def get_task_trello():
    url_trello = f"https://api.trello.com/1/boards/5958d029f55bf11523061e25/cards"
    headers = {
        "Accept": "application/json"
    }
    query = {
        'token': f'{trello["ACCESS_TOKEN_TRELLO"]}',
        'key': f'{trello["KEY"]}',
    }
    path = open('./cards-trello.json', 'w')
    response = requests.request(
        "GET",
        url_trello,
        params=query,
        headers=headers,
    )
    path.write(response.text)
    cards = response.json()
    cards_text = ''
    for card in cards:
        if trello['USER_ID'] in card.get('idMembers', []) and card.get('idList') in ['5e5e1391e3c0053b8a4ecadd', '5958d058ce48d6ee6e437912', '5f8926abf5f741310a8c695d']:
            due = 'Chưa có'
            status = lists.get(card['idList'])
            if card.get('due', ''):
                due = moment.date(card.get('due')).format(
                    'YYYY-M-D h: m A')
            cards_text += f"- [*{status}*] [{card['name']}]({card['shortUrl']}) due: **{due}**\n"
    return cards_text


def main():
    result = f'=======Doing=======\n{get_task_trello()}\n========QC========\n{get_task_gitlab()}'
    print(result)
    pyperclip.copy(result)


if __name__ == "__main__":
    main()

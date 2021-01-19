import json
import calcpoint
import requests
from trelloAgent import trello
from gitlabAgent import gitlab
import moment
import pyperclip
import sheet
import os.path

current_path = os.path.dirname(os.path.abspath(__file__))


lists = {
    "5e5e1391e3c0053b8a4ecadd": ":pencil: *Todo*",
    "5958d058ce48d6ee6e437912": ":bulb: *Doing*",
    "5f8926abf5f741310a8c695d": ":wrench: *Draft*",
}


def get_task_gitlab():
    url_gitlab = f'https://gitlab.com/api/v4/projects/{gitlab["PROJECT_ID"]}/merge_requests?author_username={gitlab["USER_GITLAB"]}&private_token={gitlab["ACCESS_TOKEN_GITLAB"]}&state={gitlab["STATE"]}'
    tasks = requests.get(url_gitlab).json()
    tasks_text = ""
    for task in tasks:
        approve_status = (
            f' :white_check_mark: *{task["merge_status"]}*'
            if task["merge_status"] != "unchecked"
            else f' :warning: *{task["merge_status"]}*'
        )
        if not task["work_in_progress"]:
            tasks_text += f'- [{approve_status}] [{task.get("title")}]({task.get("web_url")}) update gần nhất: **{moment.date(task.get("updated_at")).format("YYYY-M-D h:m A")}** - {task["user_notes_count"]} comments\n'
    return tasks_text


def get_task_trello():
    path_cards = open(f"{current_path}/cards-trello.json")
    cards = json.loads(path_cards.read())
    cards_text = ""
    for card in cards:
        if trello["USER_ID"] in card.get("idMembers", []) and card.get("idList") in [
            "5e5e1391e3c0053b8a4ecadd",
            "5958d058ce48d6ee6e437912",
            "5f8926abf5f741310a8c695d",
        ]:
            due = "Chưa có"
            status = lists.get(card["idList"])
            if card.get("due", ""):
                due = moment.date(card.get("due")).format("YYYY-M-D h: m A")
            cards_text += (
                f"- [{status}] [{card['name']}]({card['shortUrl']}) due: **{due}**\n"
            )
    return cards_text


def option_summary_point():
    path_labels = open(f"{current_path}/labels-trello.json")
    labels = json.loads(path_labels.read())
    labels_map = {}
    for index, label in enumerate(labels):
        print(f"{index}. {label['name']}\n")
    for index, label in enumerate(labels):
        labels_map[f"{index}"] = label["name"]
    label = input("Nhập label: ")
    result = calcpoint.calc_point_trello(trello, labels_map[label])
    path_test = open(f"{current_path}/output.json", "w")
    path_test.write(json.dumps(result))
    sheet.init(result)
    return False


def checkin():
    return f'=======Doing=======\n{get_task_trello()}\n========QC========\n{get_task_gitlab() if get_task_gitlab() else "Không có"}'


def options(option):
    switcher = {
        "1": checkin,
        "2": option_summary_point,
    }
    return switcher.get(
        option,
        f'=======Doing=======\n{get_task_trello()}\n========QC========\n{get_task_gitlab() if get_task_gitlab() else "Không có"}',
    )()


def main():
    print("1. Checkin")
    print("2. Summary Point")
    option = input("Chọn option: ")
    result = options(option)
    if result:
        print(result)
        pyperclip.copy(result)


if __name__ == "__main__":
    main()

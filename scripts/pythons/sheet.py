from __future__ import print_function
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
import os.path
from datetime import date
import json
import pydash as _
from json import loads, dumps
import pickle
current_path = os.path.dirname(os.path.abspath(__file__))
credentials_path = f'{current_path}/credentials.json'

# path = open('./output.json')
# data = loads(path.read())
# If modifying these scopes, delete the file token.pickle.
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

# The ID and range of a sample spreadsheet.
row = 20


def init(data):
    """Shows basic usage of the Sheets API.
    Prints values from a sample spreadsheet.
    """
    creds = None
    # The file token.pickle stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    if os.path.exists(f'{current_path}/token.pickle'):
        with open(f'{current_path}/token.pickle', 'rb') as token:
            creds = pickle.load(token)
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                credentials_path, SCOPES)
            creds = flow.run_local_server(port=0)
        # Save the credentials for the next run
        with open(f'{current_path}/token.pickle', 'wb') as token:
            pickle.dump(creds, token)

    service = build('sheets', 'v4', credentials=creds)

    # Call the Sheets API
    # sheet = service.spreadsheets()
    title = f"Summary Point {date.today()}"
    spreadsheet = {
        'properties': {
            'title': title
        },
    }
    spreadsheet = service.spreadsheets().create(body=spreadsheet,
                                                fields='spreadsheetId').execute()
    spreadsheetId = spreadsheet.get('spreadsheetId')
    # spreadsheetId = '1fGf-tVu-7D9xNEjn5349-Oidylet1evE_92jVI2ATAc'
    print(
        'https://docs.google.com/spreadsheets/d/{0}'.format(spreadsheetId))

    cols = list('ABCDEFGHIJKLMNOPQRSTUVWXYZ')
    data_with_range = []
    current_col, max_row = insert_lists(data_with_range, cols, data)
    format(0, max_row, 0, current_col, service, spreadsheetId)
    current_row = insert_users(data_with_range, cols, data)
    format(row-1, current_row-1, 0, current_col, service, spreadsheetId)
    body = {
        'valueInputOption': "USER_ENTERED",
        'data': data_with_range
    }
    result = service.spreadsheets().values().batchUpdate(
        spreadsheetId=spreadsheetId, body=body).execute()


def insert_lists(data_with_range, cols, data):
    curren_col = 1
    lists = data.get('lists')
    lists_title = [
        list(lists.keys())
    ]
    max_row = 0
    data_with_range.extend([
        {
            'range': f'{cols[curren_col]}1:{cols[len(lists_title[0])]}1',
            'values': lists_title
        },
        {
            'range': f'{cols[len(lists_title[0])+1]}1:Z1',
            'values': [['Total']]
        }])

    info_lists = list(lists.values())
    for _list in info_lists:
        list_cards = _.chunk(
            _.map_(_list['cards'], lambda card: f'{card["name"]} ({card["point"]})'))
        if len(list_cards) > max_row:
            max_row = len(list_cards) + 2
        list_cards.append([_list['total_points']])
        data_with_range.append({
            'range': f'{cols[curren_col]}2:{cols[curren_col]}{row}',
            'values': list_cards
        })
        curren_col += 1
    data_with_range.append({
        'range': f'{cols[len(lists_title[0])+1]}2:Z2',
        'values': [[sum((int(info_list['total_points']) for info_list in info_lists))]]
    })
    return (curren_col+1, max_row)


def insert_users(data_with_range, cols, data):
    current_row = row+1
    users = data.get('users')
    user_names = list(users.keys())

    lists = data.get('lists')
    lists_title = [
        list(lists.keys())
    ]
    data_with_range.extend([
        {
            'range': f'A{current_row}:A{len(user_names[0])+current_row}',
            'values': _.chunk(user_names)
        },
        {
            'range': f'B{row}:{cols[len(lists_title[0])]}{row}',
            'values': lists_title
        },
        {
            'range': f'{cols[len(lists_title[0])+1]}{row}:Z{row}',
            'values': [['Total Done']]
        }])
    users_cards = list(users.values())
    for user_cards in users_cards:
        current_col = 1

        for _list in user_cards['lists']:
            str_cards = '\n'.join(_.map_(user_cards['lists'][_list]
                                         ['cards'], lambda card: f'- {card["name"]} ({card["point"]})'))
            data_with_range.append({
                'range': f'{cols[current_col]}{current_row}:{cols[current_col]}{current_row}',
                'values': [[str_cards]]
            },
            )
            data_with_range.append({
                'range': f'{cols[len(lists_title[0])+1]}{current_row}:Z{current_row}',
                'values': [[user_cards['lists']['6. Done']
                            ['list-points']]]
            })
            current_col += 1
        current_row += 1
    return current_row


def format(startRow, endRow, startCol, endCol, service, spreadsheetId):
    my_range = {
        'startRowIndex': startRow,
        'endRowIndex': endRow,
        'startColumnIndex': startCol,
        'endColumnIndex': endCol,
    }

    requests = [
        {
            "updateBorders": {
                "range": my_range,
                "top": {
                    "style": "SOLID",
                    "width": 1,
                },
                "bottom": {
                    "style": "SOLID",
                    "width": 1,
                },
                "left": {
                    "style": "SOLID",
                    "width": 1,
                },
                "right": {
                    "style": "SOLID",
                    "width": 1,
                },
                "innerHorizontal": {
                    "style": "SOLID",
                    "width": 1,
                },
                "innerVertical": {
                    "style": "SOLID",
                    "width": 1,
                }
            }
        }
    ]

    body = {
        'requests': requests
    }
    response = service.spreadsheets().batchUpdate(
        spreadsheetId=spreadsheetId, body=body).execute()


if __name__ == '__main__':
    path = open('./output.json')
    data = json.loads(path.read())
    init(data)

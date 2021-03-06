from __future__ import print_function
import pickle
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
import os.path
from datetime import date
import json
import pydash as _
import pandas as pd
import numpy as np
import gspread

current_path = os.path.dirname(os.path.abspath(__file__))
credentials_path = f"{current_path}/credentials.json"

# If modifying these scopes, delete the file token.pickle.
SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]

# The ID and range of a sample spreadsheet.
row = 100


def init(data):
    """Shows basic usage of the Sheets API.
    Prints values from a sample spreadsheet.
    """
    creds = None
    # The file token.pickle stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    if os.path.exists(f"{current_path}/token.pickle"):
        with open(f"{current_path}/token.pickle", "rb") as token:
            creds = pickle.load(token)
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(credentials_path, SCOPES)
            creds = flow.run_local_server(port=0)
        # Save the credentials for the next run
        with open(f"{current_path}/token.pickle", "wb") as token:
            pickle.dump(creds, token)
    gc = gspread.authorize(creds)

    service = build("sheets", "v4", credentials=creds)

    # Call the Sheets API
    # sheet = service.spreadsheets()
    title = f"Summary Point {date.today()}"
    spreadsheet = {
        "properties": {"title": title},
    }
    spreadsheet = (
        service.spreadsheets()
        .create(body=spreadsheet, fields="spreadsheetId")
        .execute()
    )
    spreadsheetId = spreadsheet.get("spreadsheetId")
    # spreadsheetId = "1Kv4CMmGVmyd3UTMjZaz2jML_rumw-VS2SUERZzqVJn8"
    print("https://docs.google.com/spreadsheets/d/{0}".format(spreadsheetId))
    sh = gc.open_by_key(spreadsheetId)
    sh.share(
        "giangnam10a2@gmail.com",
        perm_type="user",
        role="reader",
    )
    sh.share(
        "chuthang205@gmail.com",
        perm_type="user",
        role="writer",
    )

    sh.share(
        "truongmanh0912@gmail.com",
        perm_type="user",
        role="reader",
    )

    sh.share(
        "thanhquang2805@gmail.com",
        perm_type="user",
        role="reader",
    )

    try:

        worksheet_cards = sh.add_worksheet(
            title=f"{date.today()} Dữ liệu", rows="100", cols="20"
        )

    except Exception as e:
        if f"A sheet with the name {date.today()} already exists" in str(e):
            print(f"Đã tồn tại worksheet {date.today()}")
        pass

    try:

        worksheet_cards = sh.add_worksheet(
            title=f"{date.today()} Pivot", rows="100", cols="20"
        )

    except Exception as e:
        if f"A sheet with the name {date.today()} already exists" in str(e):
            print(f"Đã tồn tại worksheet {date.today()}")
        pass
    worksheet_cards = sh.worksheet(f"{date.today()} Dữ liệu")
    worksheet_pivot = sh.worksheet(f"{date.today()} Pivot")
    df_card = insert_cards(data)

    worksheet_cards.update(
        [df_card.columns.values.tolist()] + df_card.to_numpy().tolist()
    )
    pivot = summary_point(df_card)
    worksheet_pivot.update([pivot.columns.values.tolist()] + pivot.to_numpy().tolist())


def insert_cards(data):
    cards = data.get("cards")
    fields = [
        "STT",
        "Username",
        "Card Title",
        "Label",
        "Card Point",
        "Status",
        "Link",
        "Due Date",
    ]
    current_row = 2
    worksheet_data = []
    for card in cards:
        card["label"] = ", ".join(card["label"])
        useful_info = [
            current_row - 1,
            card.get("username", "Chưa có"),
            card["name"],
            card["label"],
            card["point"],
            card["list"],
            card["link"],
            card["dueDate"],
        ]
        current_row += 1
        worksheet_data.append(useful_info)
    df = pd.DataFrame(np.array(worksheet_data), columns=fields)
    df["Card Point"] = df["Card Point"].astype(int)
    return df


def summary_point(data):
    pivot_table = pd.pivot_table(
        data,
        values="Card Point",
        index="Username",
        columns="Status",
        aggfunc="sum",
        fill_value=0,
    ).reset_index()
    return pivot_table


if __name__ == "__main__":
    path = open("./output.json")
    data = json.loads(path.read())
    init(data)

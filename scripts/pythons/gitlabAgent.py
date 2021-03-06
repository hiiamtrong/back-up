import os
GIT_LAB_ACCESS_TOKEN = os.environ.get('GIT_LAB_ACCESS_TOKEN')
GITLAB_4HANDY_PROJECT_ID = os.environ.get('GITLAB_4HANDY_PROJECT_ID')
GITLAB_USER = os.environ.get('GITLAB_USER')

gitlab = {
    "ACCESS_TOKEN_GITLAB": GIT_LAB_ACCESS_TOKEN,
    "PROJECT_ID": GITLAB_4HANDY_PROJECT_ID,
    "USER_GITLAB": GITLAB_USER,
    "STATE": 'opened',
}

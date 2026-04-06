# -*- coding: utf-8 -*-
"""
Initial seed data for TracKorbit backend.
All data mirrors the JS state from trackorbit_v1.html exactly.
"""

USERS = [
    {"id": 1, "name": "Alex Johnson", "email": "alex@trackorbit.io", "role": "Admin", "group": "Engineering", "active": True},
    {"id": 2, "name": "Sara Lee", "email": "sara@trackorbit.io", "role": "Developer", "group": "Engineering", "active": True},
    {"id": 3, "name": "Mike Chen", "email": "mike@trackorbit.io", "role": "Developer", "group": "Design", "active": True},
    {"id": 4, "name": "Priya Patel", "email": "priya@trackorbit.io", "role": "Manager", "group": "Product", "active": False},
    {"id": 5, "name": "Tom Wilson", "email": "tom@trackorbit.io", "role": "Viewer", "group": "QA", "active": True},
]

GROUPS = ["Engineering", "Design", "Product", "QA", "Management"]

ROLES = ["Admin", "Manager", "Developer", "Viewer"]

PROJECTS = [
    {"id": 1, "key": "TRK", "name": "TracKorbit Platform", "description": "Core platform development", "color": "#1a56db", "lead": "Alex Johnson", "status": "Active", "created": "2024-01-10"},
    {"id": 2, "key": "MOB", "name": "Mobile App", "description": "iOS and Android apps", "color": "#7c3aed", "lead": "Sara Lee", "status": "Active", "created": "2024-02-05"},
    {"id": 3, "key": "API", "name": "API Gateway", "description": "Backend API services", "color": "#16a34a", "lead": "Mike Chen", "status": "On Hold", "created": "2024-03-01"},
]

TICKETS = [
    # TRK Features & Initiative
    {"id": "TRK-1", "project": 1, "type": "Feature", "title": "User Authentication System", "desc": "Implement OAuth2 login and JWT tokens.", "status": "Done", "priority": "Critical", "assignee": "Alex Johnson", "reporter": "Alex Johnson", "created": "2024-01-15", "updated": "2024-03-10", "labels": ["security"], "sprint": "Sprint 1", "parent": None, "startDate": "2024-01-10", "dueDate": "2024-03-15"},
    {"id": "TRK-2", "project": 1, "type": "Initiative", "title": "Platform Scalability Initiative", "desc": "Scale platform to 100k users.", "status": "In Progress", "priority": "High", "assignee": "Alex Johnson", "reporter": "Alex Johnson", "created": "2024-01-20", "updated": "2024-03-15", "labels": ["infrastructure"], "sprint": "Sprint 2", "parent": "TRK-1", "startDate": "2024-01-20", "dueDate": "2024-05-30"},
    # TRK Epics
    {"id": "TRK-3", "project": 1, "type": "Epic", "title": "Dashboard Analytics", "desc": "Full dashboard and reporting suite.", "status": "In Progress", "priority": "High", "assignee": "Sara Lee", "reporter": "Alex Johnson", "created": "2024-02-01", "updated": "2024-03-18", "labels": ["analytics"], "sprint": "Sprint 2", "parent": "TRK-2", "startDate": "2024-02-01", "dueDate": "2024-04-30"},
    {"id": "TRK-8", "project": 1, "type": "Epic", "title": "Performance Optimisation", "desc": "Reduce p95 latency below 200ms.", "status": "To Do", "priority": "High", "assignee": "Mike Chen", "reporter": "Alex Johnson", "created": "2024-03-01", "updated": "2024-03-18", "labels": ["perf"], "sprint": "Sprint 3", "parent": "TRK-2", "startDate": "2024-04-01", "dueDate": "2024-06-30"},
    # TRK Stories
    {"id": "TRK-4", "project": 1, "type": "Story", "title": "Create ticket form UX", "desc": "Design and build create ticket form.", "status": "In Review", "priority": "Medium", "assignee": "Mike Chen", "reporter": "Sara Lee", "created": "2024-02-10", "updated": "2024-03-20", "labels": ["UX"], "sprint": "Sprint 2", "parent": "TRK-3", "startDate": "2024-02-10", "dueDate": "2024-03-20"},
    {"id": "TRK-9", "project": 1, "type": "Story", "title": "Dashboard charts & widgets", "desc": "Build chart widgets for dashboards.", "status": "To Do", "priority": "Medium", "assignee": "Sara Lee", "reporter": "Alex Johnson", "created": "2024-03-10", "updated": "2024-03-18", "labels": ["analytics"], "sprint": "Sprint 3", "parent": "TRK-3", "startDate": "2024-03-20", "dueDate": "2024-04-25"},
    # TRK Tasks
    {"id": "TRK-5", "project": 1, "type": "Task", "title": "Implement ticket API endpoint", "desc": "POST /api/tickets with validation.", "status": "Done", "priority": "High", "assignee": "Sara Lee", "reporter": "Alex Johnson", "created": "2024-02-15", "updated": "2024-03-12", "labels": ["backend"], "sprint": "Sprint 1", "parent": "TRK-4", "startDate": "2024-02-15", "dueDate": "2024-03-05"},
    {"id": "TRK-7", "project": 1, "type": "Task", "title": "Set up CI/CD pipeline", "desc": "Configure GitHub Actions.", "status": "In Progress", "priority": "High", "assignee": "Alex Johnson", "reporter": "Alex Johnson", "created": "2024-03-01", "updated": "2024-03-22", "labels": ["devops"], "sprint": "Sprint 2", "parent": "TRK-3", "startDate": "2024-03-01", "dueDate": "2024-03-28"},
    # TRK Sub-tasks
    {"id": "TRK-6", "project": 1, "type": "Sub-task", "title": "Write unit tests for ticket API", "desc": "90%+ test coverage.", "status": "To Do", "priority": "Medium", "assignee": "Tom Wilson", "reporter": "Sara Lee", "created": "2024-02-18", "updated": "2024-03-05", "labels": ["testing"], "sprint": "Sprint 2", "parent": "TRK-5", "startDate": "2024-03-05", "dueDate": "2024-03-18"},
    # MOB
    {"id": "MOB-1", "project": 2, "type": "Feature", "title": "Push Notifications Feature", "desc": "Mobile push notifications.", "status": "To Do", "priority": "High", "assignee": "Priya Patel", "reporter": "Sara Lee", "created": "2024-02-05", "updated": "2024-03-15", "labels": ["mobile"], "sprint": "Sprint 1", "parent": None, "startDate": "2024-02-05", "dueDate": "2024-05-15"},
    {"id": "MOB-2", "project": 2, "type": "Epic", "title": "Mobile Onboarding", "desc": "User onboarding flow.", "status": "In Progress", "priority": "Medium", "assignee": "Mike Chen", "reporter": "Priya Patel", "created": "2024-02-10", "updated": "2024-03-18", "labels": ["UX", "mobile"], "sprint": "Sprint 1", "parent": "MOB-1", "startDate": "2024-02-10", "dueDate": "2024-04-10"},
    {"id": "MOB-3", "project": 2, "type": "Story", "title": "Welcome screen design", "desc": "Design the welcome screens.", "status": "In Progress", "priority": "Medium", "assignee": "Mike Chen", "reporter": "Priya Patel", "created": "2024-02-15", "updated": "2024-03-18", "labels": ["design"], "sprint": "Sprint 1", "parent": "MOB-2", "startDate": "2024-02-15", "dueDate": "2024-03-15"},
    # API
    {"id": "API-1", "project": 3, "type": "Feature", "title": "Rate Limiting Feature", "desc": "API rate limiting.", "status": "Blocked", "priority": "Critical", "assignee": "Alex Johnson", "reporter": "Mike Chen", "created": "2024-03-01", "updated": "2024-03-20", "labels": ["security", "api"], "sprint": "Sprint 1", "parent": None, "startDate": "2024-03-01", "dueDate": "2024-04-30"},
]

FILTERS = [
    {"id": 1, "name": "My Open Tickets", "conditions": {"assignee": "Alex Johnson", "status": ["To Do", "In Progress", "In Review"]}, "owner": "Alex Johnson", "shared": True, "created": "2024-01-20"},
    {"id": 2, "name": "Critical Issues", "conditions": {"priority": "Critical", "status": ["To Do", "In Progress", "Blocked"]}, "owner": "Alex Johnson", "shared": True, "created": "2024-02-05"},
    {"id": 3, "name": "Sprint 2 Tasks", "conditions": {"sprint": "Sprint 2", "type": ["Task", "Sub-task"]}, "owner": "Sara Lee", "shared": False, "created": "2024-03-01"},
    {"id": 4, "name": "Blocked Items", "conditions": {"status": ["Blocked"]}, "owner": "Alex Johnson", "shared": True, "created": "2024-03-10"},
]

CUSTOM_FIELDS = [
    {"id": 1, "name": "Story Points", "type": "Number", "applyTo": ["Story", "Task", "Sub-task"], "required": False},
    {"id": 2, "name": "Due Date", "type": "Date", "applyTo": ["Feature", "Epic", "Story", "Task"], "required": False},
    {"id": 3, "name": "Business Value", "type": "Select", "applyTo": ["Feature", "Initiative"], "options": ["Low", "Medium", "High"], "required": False},
]

WEB_CONNECTORS = [
    {"id": 1, "name": "Slack", "icon": "💬", "status": "Connected", "events": ["Ticket Created", "Status Changed"], "url": "https://hooks.slack.com/..."},
    {"id": 2, "name": "GitHub", "icon": "🐙", "status": "Connected", "events": ["PR Linked", "Commit Ref"], "url": ""},
    {"id": 3, "name": "Jenkins", "icon": "🔧", "status": "Disconnected", "events": ["Build Status"], "url": ""},
    {"id": 4, "name": "PagerDuty", "icon": "🚨", "status": "Disconnected", "events": ["Critical Alert"], "url": ""},
]

NOTIFICATIONS = [
    {"id": 1, "text": "TRK-6 assigned to you by Sara Lee", "time": "2m ago", "read": False},
    {"id": 2, "text": "TRK-7 status changed to In Progress", "time": "1h ago", "read": False},
    {"id": 3, "text": "New comment on TRK-4", "time": "3h ago", "read": True},
]

APP_SETTINGS = {
    "appName": "TracKorbit",
    "timezone": "UTC",
    "dateFormat": "MM/DD/YYYY",
    "allowSignup": False,
    "sessionTimeout": 30,
    "emailNotif": True,
    "slackNotif": True,
}

CUSTOM_DASHBOARDS = []

NEXT_TICKET_NUMS = {1: 10, 2: 4, 3: 2}

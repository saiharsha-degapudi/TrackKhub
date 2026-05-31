"""
Hub FastAPI Backend
"""
import copy
from datetime import date
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import data as seed

app = FastAPI(title="Hub API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── In-memory state ──────────────────────────────────────────────────────────
state = {
    "users": copy.deepcopy(seed.USERS),
    "groups": copy.deepcopy(seed.GROUPS),
    "roles": copy.deepcopy(seed.ROLES),
    "projects": copy.deepcopy(seed.PROJECTS),
    "tickets": copy.deepcopy(seed.TICKETS),
    "filters": copy.deepcopy(seed.FILTERS),
    "customFields": copy.deepcopy(seed.CUSTOM_FIELDS),
    "webConnectors": copy.deepcopy(seed.WEB_CONNECTORS),
    "notifications": copy.deepcopy(seed.NOTIFICATIONS),
    "appSettings": copy.deepcopy(seed.APP_SETTINGS),
    "customDashboards": copy.deepcopy(seed.CUSTOM_DASHBOARDS),
    "nextTicketNums": copy.deepcopy(seed.NEXT_TICKET_NUMS),
    "teams": copy.deepcopy(seed.TEAMS),
    "workflowDefs": copy.deepcopy(seed.WORKFLOW_DEFS),
    "boards": copy.deepcopy(seed.BOARDS),
    "nextBoardId": seed.NEXT_BOARD_ID,
    "sprints": copy.deepcopy(seed.SPRINTS),
    "nextSprintId": seed.NEXT_SPRINT_ID,
    "channels": copy.deepcopy(seed.CHANNELS),
    "nextChannelId": seed.NEXT_CHANNEL_ID,
    "messages": copy.deepcopy(seed.MESSAGES),
    "nextMessageId": seed.NEXT_MESSAGE_ID,
    "projectWorkflows": {},
}


# ── Helpers ──────────────────────────────────────────────────────────────────
def today_str():
    return date.today().isoformat()


def apply_ticket_filters(tickets, project=None, status=None, type_=None,
                          assignee=None, sprint=None, search=None):
    result = tickets
    if project:
        result = [t for t in result if t["project"] == int(project)]
    if status:
        result = [t for t in result if t["status"] == status]
    if type_:
        result = [t for t in result if t["type"] == type_]
    if assignee:
        result = [t for t in result if t["assignee"] == assignee]
    if sprint:
        result = [t for t in result if t.get("sprint") == sprint]
    if search:
        q = search.lower()
        result = [t for t in result if q in t["title"].lower() or q in t["id"].lower()]
    return result


# ── Auth ─────────────────────────────────────────────────────────────────────
class LoginBody(BaseModel):
    email: str
    password: str


@app.post("/api/auth/login")
def login(body: LoginBody):
    user = next((u for u in state["users"] if u["email"] == body.email), None)
    if not user:
        # Demo fallback: return first user
        user = state["users"][0]
    return user


# ── Projects ─────────────────────────────────────────────────────────────────
@app.get("/api/projects")
def get_projects():
    # Ensure all projects have a members list
    for p in state["projects"]:
        if "members" not in p:
            lead = p.get("lead", "")
            p["members"] = [{"name": lead, "role": "Lead"}] if lead else []
    return state["projects"]


@app.post("/api/projects")
def create_project(body: Dict[str, Any]):
    key = body.get("key", "").upper()
    name = body.get("name", "").strip()
    if not key or not name:
        raise HTTPException(400, "name and key required")
    if any(p["key"] == key for p in state["projects"]):
        raise HTTPException(400, "Key already exists")
    new_id = max((p["id"] for p in state["projects"]), default=0) + 1
    lead = body.get("lead", "")
    project = {
        "id": new_id,
        "key": key,
        "name": name,
        "description": body.get("description", "No description"),
        "color": body.get("color", "#1a56db"),
        "lead": lead,
        "status": "Active",
        "created": today_str(),
        "members": [{"name": lead, "role": "Lead"}] if lead else [],
    }
    state["projects"].append(project)
    state["nextTicketNums"][new_id] = 1
    return project


@app.put("/api/projects/{pid}")
def update_project(pid: int, body: Dict[str, Any]):
    project = next((p for p in state["projects"] if p["id"] == pid), None)
    if not project:
        raise HTTPException(404, "Project not found")
    project.update({k: v for k, v in body.items() if k != "id"})
    return project


@app.delete("/api/projects/{pid}")
def delete_project(pid: int):
    state["projects"] = [p for p in state["projects"] if p["id"] != pid]
    return {"ok": True}


# ── Tickets ──────────────────────────────────────────────────────────────────
@app.get("/api/tickets")
def get_tickets(project: Optional[str] = None, status: Optional[str] = None,
                type: Optional[str] = None, assignee: Optional[str] = None,
                sprint: Optional[str] = None, search: Optional[str] = None):
    return apply_ticket_filters(state["tickets"], project, status, type, assignee, sprint, search)


@app.post("/api/tickets")
def create_ticket(body: Dict[str, Any]):
    title = body.get("title", "").strip()
    if not title:
        raise HTTPException(400, "title required")
    pid = int(body.get("project", 1))
    project = next((p for p in state["projects"] if p["id"] == pid), None)
    if not project:
        raise HTTPException(404, "Project not found")
    num = state["nextTicketNums"].get(pid, 1)
    ticket_id = f"{project['key']}-{num}"
    state["nextTicketNums"][pid] = num + 1
    today = today_str()
    ticket = {
        "id": ticket_id,
        "project": pid,
        "type": body.get("type", "Task"),
        "title": title,
        "desc": body.get("desc", ""),
        "status": "To Do",
        "priority": body.get("priority", "Medium"),
        "assignee": body.get("assignee", ""),
        "reporter": body.get("reporter", ""),
        "created": today,
        "updated": today,
        "labels": body.get("labels", []),
        "sprint": body.get("sprint", ""),
        "parent": body.get("parent", None),
        "startDate": body.get("startDate", None),
        "dueDate": body.get("dueDate", None),
    }
    state["tickets"].append(ticket)
    return ticket


@app.get("/api/tickets/{tid}")
def get_ticket(tid: str):
    ticket = next((t for t in state["tickets"] if t["id"] == tid), None)
    if not ticket:
        raise HTTPException(404, "Ticket not found")
    return ticket


@app.put("/api/tickets/{tid}")
def update_ticket(tid: str, body: Dict[str, Any]):
    ticket = next((t for t in state["tickets"] if t["id"] == tid), None)
    if not ticket:
        raise HTTPException(404, "Ticket not found")
    ticket.update({k: v for k, v in body.items() if k != "id"})
    ticket["updated"] = today_str()
    return ticket


@app.delete("/api/tickets/{tid}")
def delete_ticket(tid: str):
    state["tickets"] = [t for t in state["tickets"] if t["id"] != tid]
    return {"ok": True}


# ── Filters ──────────────────────────────────────────────────────────────────
@app.get("/api/filters")
def get_filters():
    return state["filters"]


@app.post("/api/filters")
def create_filter(body: Dict[str, Any]):
    name = body.get("name", "").strip()
    if not name:
        raise HTTPException(400, "name required")
    new_id = max((f["id"] for f in state["filters"]), default=0) + 1
    f = {
        "id": new_id,
        "name": name,
        "conditions": body.get("conditions", {}),
        "owner": body.get("owner", ""),
        "shared": body.get("shared", False),
        "created": today_str(),
    }
    state["filters"].append(f)
    return f


@app.delete("/api/filters/{fid}")
def delete_filter(fid: int):
    state["filters"] = [f for f in state["filters"] if f["id"] != fid]
    return {"ok": True}


# ── Users ─────────────────────────────────────────────────────────────────────
@app.get("/api/users")
def get_users():
    return state["users"]


@app.post("/api/users")
def create_user(body: Dict[str, Any]):
    name = body.get("name", "").strip()
    email = body.get("email", "").strip()
    if not name or not email:
        raise HTTPException(400, "name and email required")
    new_id = max((u["id"] for u in state["users"]), default=0) + 1
    user = {
        "id": new_id,
        "name": name,
        "email": email,
        "role": body.get("role", "Viewer"),
        "group": body.get("group", "Engineering"),
        "active": True,
    }
    state["users"].append(user)
    return user


@app.put("/api/users/{uid}")
def update_user(uid: int, body: Dict[str, Any]):
    user = next((u for u in state["users"] if u["id"] == uid), None)
    if not user:
        raise HTTPException(404, "User not found")
    user.update({k: v for k, v in body.items() if k != "id"})
    return user


@app.delete("/api/users/{uid}")
def delete_user(uid: int):
    state["users"] = [u for u in state["users"] if u["id"] != uid]
    return {"ok": True}


# ── Connectors ────────────────────────────────────────────────────────────────
@app.get("/api/connectors")
def get_connectors():
    return state["webConnectors"]


@app.put("/api/connectors/{cid}")
def update_connector(cid: int, body: Dict[str, Any]):
    connector = next((c for c in state["webConnectors"] if c["id"] == cid), None)
    if not connector:
        raise HTTPException(404, "Connector not found")
    connector.update({k: v for k, v in body.items() if k != "id"})
    return connector


# ── Notifications ─────────────────────────────────────────────────────────────
@app.get("/api/notifications")
def get_notifications():
    return state["notifications"]


@app.put("/api/notifications/read-all")
def mark_all_read():
    for n in state["notifications"]:
        n["read"] = True
    return state["notifications"]


# ── Custom Dashboards ─────────────────────────────────────────────────────────
@app.get("/api/dashboards")
def get_dashboards():
    return state["customDashboards"]


@app.post("/api/dashboards")
def create_dashboard(body: Dict[str, Any]):
    name = body.get("name", "").strip()
    if not name:
        raise HTTPException(400, "name required")
    import time
    new_id = int(time.time() * 1000)
    d = {
        "id": new_id,
        "name": name,
        "filterId": body.get("filterId", None),
        "reportType": body.get("reportType", "issue-list"),
        "created": today_str(),
    }
    state["customDashboards"].append(d)
    return d


@app.put("/api/dashboards/{did}")
def update_dashboard(did: int, body: Dict[str, Any]):
    dash = next((d for d in state["customDashboards"] if d["id"] == did), None)
    if not dash:
        raise HTTPException(404, "Dashboard not found")
    dash.update({k: v for k, v in body.items() if k != "id"})
    return dash


@app.delete("/api/dashboards/{did}")
def delete_dashboard(did: int):
    state["customDashboards"] = [d for d in state["customDashboards"] if d["id"] != did]
    return {"ok": True}


# ── Settings ──────────────────────────────────────────────────────────────────
@app.get("/api/settings")
def get_settings():
    return state["appSettings"]


@app.put("/api/settings")
def update_settings(body: Dict[str, Any]):
    state["appSettings"].update(body)
    return state["appSettings"]


# ── Custom Fields ─────────────────────────────────────────────────────────────
@app.get("/api/custom-fields")
def get_custom_fields():
    return state["customFields"]


@app.post("/api/custom-fields")
def create_custom_field(body: Dict[str, Any]):
    name = body.get("name", "").strip()
    if not name:
        raise HTTPException(400, "name required")
    new_id = max((f["id"] for f in state["customFields"]), default=0) + 1
    field = {
        "id": new_id,
        "name": name,
        "type": body.get("type", "Text"),
        "applyTo": body.get("applyTo", []),
        "required": body.get("required", False),
    }
    state["customFields"].append(field)
    return field


# ── Groups ────────────────────────────────────────────────────────────────────
@app.get("/api/groups")
def get_groups():
    return state["groups"]


@app.post("/api/groups")
def add_group(body: Dict[str, Any]):
    val = body.get("name", "").strip()
    if not val:
        raise HTTPException(400, "name required")
    if val not in state["groups"]:
        state["groups"].append(val)
    return state["groups"]


# ── Roles ─────────────────────────────────────────────────────────────────────
@app.get("/api/roles")
def get_roles():
    return state["roles"]


@app.post("/api/roles")
def add_role(body: Dict[str, Any]):
    val = body.get("name", "").strip()
    if not val:
        raise HTTPException(400, "name required")
    if val not in state["roles"]:
        state["roles"].append(val)
    return state["roles"]


# ── Teams ─────────────────────────────────────────────────────────────────────
@app.get("/api/teams")
def get_teams():
    return state["teams"]


@app.post("/api/teams")
def create_team(body: Dict[str, Any]):
    name = body.get("name", "").strip()
    if not name:
        raise HTTPException(400, "name required")
    import time
    team = {
        "id": "tm" + str(int(time.time() * 1000)),
        "name": name,
        "description": body.get("description", ""),
        "color": body.get("color", "#1a56db"),
        "lead": body.get("lead", None),
        "members": body.get("members", []),
    }
    state["teams"].append(team)
    return team


@app.put("/api/teams/{tid}")
def update_team(tid: str, body: Dict[str, Any]):
    team = next((t for t in state["teams"] if t["id"] == tid), None)
    if not team:
        raise HTTPException(404, "Team not found")
    team.update({k: v for k, v in body.items() if k != "id"})
    return team


@app.delete("/api/teams/{tid}")
def delete_team(tid: str):
    state["teams"] = [t for t in state["teams"] if t["id"] != tid]
    return {"ok": True}


# ── Workflow Definitions ───────────────────────────────────────────────────────
@app.get("/api/workflows")
def get_workflows():
    return state["workflowDefs"]


@app.post("/api/workflows")
def create_workflow(body: Dict[str, Any]):
    name = body.get("name", "").strip()
    if not name:
        raise HTTPException(400, "name required")
    import time
    wf = {
        "id": "wf" + str(int(time.time() * 1000)),
        "name": name,
        "isDefault": False,
        "statuses": body.get("statuses", []),
        "transitions": body.get("transitions", []),
    }
    state["workflowDefs"].append(wf)
    return wf


@app.put("/api/workflows/{wid}")
def update_workflow(wid: str, body: Dict[str, Any]):
    wf = next((w for w in state["workflowDefs"] if w["id"] == wid), None)
    if not wf:
        raise HTTPException(404, "Workflow not found")
    if body.get("isDefault"):
        for w in state["workflowDefs"]:
            w["isDefault"] = False
    wf.update({k: v for k, v in body.items() if k != "id"})
    return wf


@app.delete("/api/workflows/{wid}")
def delete_workflow(wid: str):
    state["workflowDefs"] = [w for w in state["workflowDefs"] if w["id"] != wid]
    return {"ok": True}


# ── Boards ────────────────────────────────────────────────────────────────────
@app.get("/api/boards")
def get_boards(project: Optional[int] = None):
    boards = state["boards"]
    if project is not None:
        boards = [b for b in boards if b["project"] == project]
    return boards


@app.post("/api/boards")
def create_board(body: Dict[str, Any]):
    name = body.get("name", "").strip()
    board_type = body.get("type", "kanban")
    project = body.get("project")
    if not name or not project:
        raise HTTPException(400, "name and project required")
    default_cols = (
        ["To Do", "In Progress", "In Review", "Done"]
        if board_type == "scrum"
        else ["To Do", "In Progress", "In Review", "Done", "Blocked"]
    )
    bid = state["nextBoardId"]
    state["nextBoardId"] += 1
    board = {
        "id": bid,
        "project": int(project),
        "name": name,
        "type": board_type,
        "description": body.get("description", ""),
        "columns": body.get("columns", default_cols),
        "created": today_str(),
    }
    state["boards"].append(board)
    return board


@app.put("/api/boards/{bid}")
def update_board(bid: int, body: Dict[str, Any]):
    board = next((b for b in state["boards"] if b["id"] == bid), None)
    if not board:
        raise HTTPException(404, "Board not found")
    board.update({k: v for k, v in body.items() if k != "id"})
    return board


@app.delete("/api/boards/{bid}")
def delete_board(bid: int):
    state["boards"] = [b for b in state["boards"] if b["id"] != bid]
    return {"ok": True}


# ── Sprints ───────────────────────────────────────────────────────────────────
@app.get("/api/sprints")
def get_sprints(project: Optional[int] = None):
    sprints = state["sprints"]
    if project is not None:
        sprints = [s for s in sprints if s["project"] == project]
    return sorted(sprints, key=lambda s: s.get("order", 0))


@app.post("/api/sprints")
def create_sprint(body: Dict[str, Any]):
    project = body.get("project")
    name = body.get("name", "").strip()
    if not name or not project:
        raise HTTPException(400, "name and project required")
    proj_sprints = [s for s in state["sprints"] if s["project"] == int(project)]
    order = max((s.get("order", 0) for s in proj_sprints), default=0) + 1
    sid = state["nextSprintId"]
    state["nextSprintId"] += 1
    sprint = {
        "id": sid,
        "project": int(project),
        "name": name,
        "goal": body.get("goal", ""),
        "status": "planning",
        "startDate": None,
        "endDate": None,
        "order": order,
    }
    state["sprints"].append(sprint)
    return sprint


@app.put("/api/sprints/{sid}")
def update_sprint(sid: int, body: Dict[str, Any]):
    sprint = next((s for s in state["sprints"] if s["id"] == sid), None)
    if not sprint:
        raise HTTPException(404, "Sprint not found")
    for k, v in body.items():
        if k != "id":
            sprint[k] = v
    return sprint


@app.delete("/api/sprints/{sid}")
def delete_sprint(sid: int):
    sprint = next((s for s in state["sprints"] if s["id"] == sid), None)
    if not sprint:
        raise HTTPException(404, "Sprint not found")
    if sprint["status"] == "active":
        raise HTTPException(400, "Cannot delete an active sprint — complete it first")
    sprint_name = sprint["name"]
    for t in state["tickets"]:
        if t.get("sprint") == sprint_name:
            t["sprint"] = None
    state["sprints"] = [s for s in state["sprints"] if s["id"] != sid]
    return {"ok": True}


@app.post("/api/sprints/{sid}/start")
def start_sprint(sid: int, body: Dict[str, Any]):
    sprint = next((s for s in state["sprints"] if s["id"] == sid), None)
    if not sprint:
        raise HTTPException(404, "Sprint not found")
    active = next((s for s in state["sprints"] if s["project"] == sprint["project"] and s["status"] == "active"), None)
    if active:
        raise HTTPException(400, f"'{active['name']}' is already active — complete it first")
    sprint["status"] = "active"
    sprint["startDate"] = body.get("startDate") or today_str()
    sprint["endDate"] = body.get("endDate") or None
    return sprint


@app.post("/api/sprints/{sid}/complete")
def complete_sprint(sid: int):
    sprint = next((s for s in state["sprints"] if s["id"] == sid), None)
    if not sprint:
        raise HTTPException(404, "Sprint not found")
    if sprint["status"] != "active":
        raise HTTPException(400, "Sprint is not active")
    sprint["status"] = "completed"
    sprint_name = sprint["name"]
    moved = 0
    for t in state["tickets"]:
        if t.get("sprint") == sprint_name and t.get("status") != "Done":
            t["sprint"] = None
            moved += 1
    return {"sprint": sprint, "movedToBacklog": moved}


# ── Chat Channels ─────────────────────────────────────────────────────────────
@app.get("/api/channels")
def get_channels():
    return state["channels"]


@app.post("/api/channels")
def create_channel(body: Dict[str, Any]):
    name = body.get("name", "").strip().lower().replace(" ", "-")
    if not name:
        raise HTTPException(400, "name required")
    cid = state["nextChannelId"]
    state["nextChannelId"] += 1
    channel = {
        "id": cid,
        "name": name,
        "description": body.get("description", ""),
        "type": body.get("type", "public"),
    }
    state["channels"].append(channel)
    return channel


# ── Chat Messages ─────────────────────────────────────────────────────────────
@app.get("/api/messages")
def get_messages(channel: Optional[int] = None):
    msgs = state["messages"]
    if channel is not None:
        msgs = [m for m in msgs if m["channel"] == channel]
    return msgs


@app.post("/api/messages")
def send_message(body: Dict[str, Any]):
    from datetime import datetime
    text = body.get("text", "").strip()
    channel = body.get("channel")
    user = body.get("user", "")
    if not text or not channel:
        raise HTTPException(400, "text and channel required")
    mid = state["nextMessageId"]
    state["nextMessageId"] += 1
    msg = {
        "id": mid,
        "channel": int(channel),
        "user": user,
        "text": text,
        "ts": datetime.now().isoformat(timespec="seconds"),
    }
    state["messages"].append(msg)
    return msg


# ── Project Workflow ──────────────────────────────────────────────────────────
DEFAULT_WORKFLOW = {
    "statuses": [
        {"name": "To Do",       "color": "#64748b"},
        {"name": "In Progress", "color": "#3b82f6"},
        {"name": "In Review",   "color": "#8b5cf6"},
        {"name": "Done",        "color": "#10b981"},
        {"name": "Blocked",     "color": "#ef4444"},
    ],
    "transitions": [
        ["To Do",       "In Progress"],
        ["In Progress", "In Review"],
        ["In Progress", "Blocked"],
        ["In Review",   "In Progress"],
        ["In Review",   "Done"],
        ["Blocked",     "In Progress"],
        ["To Do",       "Blocked"],
    ],
}


@app.get("/api/workflows/project/{pid}")
def get_project_workflow(pid: int):
    return state["projectWorkflows"].get(pid, copy.deepcopy(DEFAULT_WORKFLOW))


@app.put("/api/workflows/project/{pid}")
def update_project_workflow(pid: int, body: Dict[str, Any]):
    state["projectWorkflows"][pid] = body
    return body

"""
TrackKub FastAPI Backend
"""
import copy
from datetime import date
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import data as seed

app = FastAPI(title="TrackKub API")

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
    project = {
        "id": new_id,
        "key": key,
        "name": name,
        "description": body.get("description", "No description"),
        "color": body.get("color", "#1a56db"),
        "lead": body.get("lead", ""),
        "status": "Active",
        "created": today_str(),
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

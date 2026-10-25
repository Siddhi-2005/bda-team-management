# Roles, data visibility and assignment flow

## Who sees what
| Area | Admin | Manager (Team Lead) | BDA |
|---|---|---|---|
| Tasks | All tasks | Tasks of their team (no team yet: only tasks they created/own) | Only tasks assigned to them, with "Assigned by" shown |
| Leads | All | Their team's leads | Only leads assigned to them |
| Teams | All teams | Teams they manage | Only their own team (API only, no sidebar link) |
| Members | All users | Own team members + unassigned BDAs (to recruit) | No access |
| Dashboard / targets | Company-wide | Their team's target vs achieved | Own tasks, leads, revenue |
| Create task | For anyone | Only for own team members (or self) | Only for self |
| Delete task/lead | Yes | Only inside own team | No |

## How people get assigned
1. **Public register** always creates a BDA with **no team** (`role: 'bda'`, never admin/manager).
2. The new BDA shows up in **Members** for admins and managers as *unassigned*.
3. A manager adds them to a team they manage (`PUT /api/teams/:id/members`), or admin does it for any team.
   - The user's `team` field and the team's `members` array are updated together.
   - A person can be in only one team: adding to a new team removes them from the old one.
4. **Tasks/leads inherit the team from the assignee** (`utils/scope.js -> resolveAssignee`). The client can no longer send an arbitrary `team`.
5. Team Lead = `Team.manager`. Promotion to manager/admin is admin-only.
6. Website contact-form leads are unassigned; admin assigns them (team is then derived from the assignee).

All visibility rules live in one file: `backend/utils/scope.js`.

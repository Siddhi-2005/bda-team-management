// Single source of truth for "who can see what".
// admin  -> everything
// manager-> own team; if no team yet, only records they created / own
// bda    -> only records assigned to them
const User = require('../models/User');

exports.taskScope = (user) => {
  if (user.role === 'admin') return {};
  if (user.role === 'manager') {
    return user.team
      ? { team: user.team }
      : { $or: [{ assignedBy: user._id }, { assignedTo: user._id }] };
  }
  return { assignedTo: user._id };
};

exports.leadScope = (user) => {
  if (user.role === 'admin') return {};
  if (user.role === 'manager') {
    return user.team ? { team: user.team } : { assignedTo: user._id };
  }
  return { assignedTo: user._id };
};

// Can this user touch this single doc (task or lead)?
exports.inScope = (doc, user) => {
  if (user.role === 'admin') return true;
  const id = (v) => (v && v._id ? v._id : v)?.toString();
  if (user.role === 'manager') {
    if (user.team) return id(doc.team) === user.team.toString();
    return id(doc.assignedTo) === user._id.toString() || id(doc.assignedBy) === user._id.toString();
  }
  return id(doc.assignedTo) === user._id.toString();
};

// Validate an assignee for the acting user and derive the team from the assignee,
// so team is never trusted from the request body.
exports.resolveAssignee = async (actor, assignedTo) => {
  if (actor.role === 'bda') return { assignedTo: actor._id, team: actor.team };
  if (!assignedTo) return { assignedTo: actor._id, team: actor.team };
  const assignee = await User.findById(assignedTo);
  if (!assignee || assignee.isActive === false) throw new Error('Assignee not found');
  if (actor.role === 'manager') {
    const inOwnTeam = actor.team && assignee.team && assignee.team.toString() === actor.team.toString();
    if (!inOwnTeam) throw new Error('Managers can only assign to members of their own team');
  }
  return { assignedTo: assignee._id, team: assignee.team };
};

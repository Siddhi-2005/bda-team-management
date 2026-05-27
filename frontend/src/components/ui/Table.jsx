import React from 'react';
import { RiEdit2Line, RiDeleteBin6Line, RiInboxLine } from 'react-icons/ri';

const Table = ({ columns, data, onEdit, onDelete, actions }) => {
  if (!data || data.length === 0) {
    return (
      <div className="glass-card empty-state">
        <RiInboxLine />
        <h3>No Records Found</h3>
        <p>There are no records to display at the moment.</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={col.style}>
                {col.label}
              </th>
            ))}
            {(onEdit || onDelete || actions) && <th style={{ textAlign: 'right' }}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={row._id || index}>
              {columns.map((col) => (
                <td key={col.key} style={col.style}>
                  {col.render ? col.render(row[col.key], row) : row[col.key] || '-'}
                </td>
              ))}
              {(onEdit || onDelete || actions) && (
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                    {actions && actions(row)}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(row)}
                        className="btn btn-sm btn-secondary"
                        style={{ padding: '6px 10px', borderRadius: '6px' }}
                        title="Edit"
                      >
                        <RiEdit2Line style={{ fontSize: '1rem' }} />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(row._id || row)}
                        className="btn btn-sm btn-danger"
                        style={{ padding: '6px 10px', borderRadius: '6px' }}
                        title="Delete"
                      >
                        <RiDeleteBin6Line style={{ fontSize: '1rem' }} />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;

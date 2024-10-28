import React, { useState, useMemo } from 'react';
import { Table, Button } from 'react-bootstrap';
import { CaretDownFill, CaretUpFill, PencilSquare, XSquare } from 'react-bootstrap-icons';

const SortableTable = ({ items, columns, onEditItem, onDeleteItem, onRowClick }) => {
  const [sortConfig, setSortConfig] = useState({ key: columns[0].key, direction: 'ascending' });

  const sortedItems = useMemo(() => {
    let sortableItems = [...items];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return -1;
        if (a[sortConfig.key] > b[sortConfig.key]) return 1;
        return 0;
      });

      if (sortConfig.direction === 'descending') {
        sortableItems.reverse();
      }
    }
    return sortableItems;
  }, [items, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getHeaderStyle = (columnName) => {
    if (sortConfig.key === columnName) {
      return 'sorted-header clickable-header';
    }
    return 'clickable-header';
  };

  const renderSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <CaretDownFill className='text-muted opacity-25' />;
    }
    return sortConfig.direction === 'ascending' ? <CaretUpFill className='text-primary'/> : <CaretDownFill className='text-primary'/>;
  };

  return (
    <Table hover responsive className='m-0'>
      <thead>
        <tr>
          {columns.map(column => (
            <th
              key={column.key}
              onClick={() => requestSort(column.key)}
              className={getHeaderStyle(column.key)}
              style={{ width: column.width || 'auto', cursor: 'pointer' }}
            >
              <div className='d-flex align-items-center justify-content-between'>
                {column.label}
                {renderSortIcon(column.key)}
              </div>
            </th>
          ))}
          {(onEditItem || onDeleteItem) && <th style={{ width: 'auto' }}></th>}
        </tr>
      </thead>
      <tbody>
        {sortedItems.map((item, index) => (
          <tr
            key={item._id}
            className={index === sortedItems.length - 1 ? 'last-row' : ''}
          >
            {columns.map(column => (
              <td
                key={column.key}
                className='align-middle'
                onClick={() => onRowClick && onRowClick(item._id)}
                style={{ cursor: onRowClick ? 'pointer' : 'default' }}
              >
                {column.render ? column.render(item) : item[column.key]}
              </td>
            ))}
            {(onEditItem || onDeleteItem) && (
              <td className="">
                {onEditItem && (
                  <Button variant="" className='align-middle border-0 p-1 me-md-2 ' onClick={(e) => { e.stopPropagation(); onEditItem(item); }}>
                    <PencilSquare size={18}  className='text-primary'/>
                  </Button>
                )}
                {onDeleteItem && (
                  <Button variant="" className='align-middle border-0 p-1' onClick={(e) => { e.stopPropagation(); onDeleteItem(item); }}>
                    <XSquare size={18} className='text-danger' />
                  </Button>
                )}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default SortableTable;

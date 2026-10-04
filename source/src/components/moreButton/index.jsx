import * as React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

export default function MoreButton({ options = [], click = [] }) {
  const id = React.useId();
  const buttonId = `${id}-button`;
  const menuId = `${id}-menu`;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <Button
        id={buttonId}
        aria-controls={open ? menuId : undefined}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={handleClick}
        color="black"
      >
        <span style={{fontWeight: "bold"}}>...</span>
      </Button>
      <Menu
        id={menuId}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          list: {
            'aria-labelledby': buttonId,
          },
        }}
      >
        {options.map((option, index) => (
          <MenuItem key={index} onClick={click[index]}>
            {option}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}
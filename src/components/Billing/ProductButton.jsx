import React from 'react';
import { Button } from '@mui/material';

const ProductButton = ({ label, onClick }) => {
  return (
    <Button
      variant="outlined"
      onClick={() => onClick(label)}
      sx={{
        fontSize: '1.5rem',
        width: '100%',
        height: '60px',
        margin: '5px',
      }}
    >
      {label}
    </Button>
  );
};

export default ProductButton;

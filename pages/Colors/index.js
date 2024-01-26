import React from 'react'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Box,
  Container,
  Button,
  Link,
  Typography
} from "@mui/material";

function Colors() {
  return (
    <Box>
      <Typography variant='h3'>Colors</Typography>
      <Button color='primary'>Button</Button>
    </Box>
  )
}

export default Colors
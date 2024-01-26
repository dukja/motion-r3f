import { useRef, useState } from "react";
import {
    List,
    ListItem,
    ListItemText,
    ListWrapper,
    Menu,
    MenuItem,
    Box,
    alpha,
    Stack,
    lighten,
    Divider,
    IconButton,
    Tooltip,
    styled,
    useTheme,
  } from "@mui/material";
  
  function HeaderMenu() {
    return (
        <Stack>
            <List>
            <ListItem href="/content/Motions">
                <ListItemText primary="Motions" />
            </ListItem>
            </List>
        </Stack>
    );
  }
  
  export default HeaderMenu;
  
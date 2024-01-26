import {
    Stack,
    Divider,
  } from "@mui/material";
  
  import HeaderMenu from "./Menu";
  
  function Header() {
    return (
      <Stack
        direction="row"
        divider={<Divider orientation="vertical" flexItem />}
        alignItems="center"
        spacing={2}
      >
        <HeaderMenu />
      </Stack>
    );
  }
  
  export default Header;
  
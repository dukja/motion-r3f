import { Box, Container, Button, Link } from "@mui/material";

import BaseLayout from "../src/layout/BaseLayout";
export default function Home() {
  return (
    <Container maxWidth="lg">
      <Box display="flex" alignItems="center">
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          flex={1}
        >
          <Box />
          <Box>
            <Button
              component={Link}
              href="/Colors"
              variant="contained"
              sx={{ ml: 2 }}
            >
              Colors
            </Button>
            <Button
              component={Link}
              href="/Motion"
              variant="contained"
              sx={{ ml: 2 }}
            >
              Motion
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}

Home.getLayout = function getLayout(page) {
  return <BaseLayout>{page}</BaseLayout>;
};

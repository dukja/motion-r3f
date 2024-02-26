import {LinearProgress,Box,Typography,Stack} from '@mui/material';

function LinearProgressWithLabel(props) {
    return (
      <Stack justifyContent='center' alignItems='center' 
      spacing={2}
      >
        <Box sx={{ minWidth: 35 }}>
          <Typography variant="h3" color="white">{`${Math.round(
            props.value,
          )}%`}</Typography>
        </Box>        
        <Box sx={{ width: '100%', mr: 1 }}>
          <LinearProgress variant="determinate" {...props} />
        </Box>
      </Stack>
    );
  }
  export default LinearProgressWithLabel
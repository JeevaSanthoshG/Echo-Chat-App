import React from 'react';
import { Link, Stack, Typography } from '@mui/material';
import { CaretLeft } from 'phosphor-react';
import { Link as RouterLink } from "react-router-dom";
import NewPasswordForm from '../../sections/auth/NewPasswordForm';


const NewPassword = () => {
  return (
    <>
        
      <Stack spacing={2} sx={{ mb: 5, position: "relative" }}>
      <Typography variant="h3">
            Reset Password
        </Typography>
        <Typography sx={{color: "text.secondary", mb: 5}}>
            Please set a new password
        </Typography>




      </Stack>
      {/*New password */}
      <NewPasswordForm />
      <Link
          component={RouterLink}
          to="/auth/login"
          color={"inherit"}
          variant="subtitle2"
          sx={{
            mt: 3,
            mh: "auto",
            alignItems: "center",
            display: "inline-flex",
          }}
        >
          <CaretLeft />
          Return to Sign-in
        </Link>
    </>
    )
}
export default NewPassword
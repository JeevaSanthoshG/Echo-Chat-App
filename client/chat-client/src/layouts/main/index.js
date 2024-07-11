import { Container, Stack, Box } from "@mui/material";
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import Logo from "../../assets/Images/logo.ico";

const isAuthenticated = true;

const MainLayout = () => {
  if (isAuthenticated) {
    return <Navigate to="/app" />;
  }

  return (
    <>
      <Box
        width="100%"
        height="100%"
        sx={{ alignItems: "center", justifyContent: "center", display: "flex" }}
      >
        <Container maxWidth="sm">
          <Stack spacing={5}>
            <Stack
              sx={{ width: "100%" }}
              direction={"column"}
              alignItems={"center"}
            >
              <img style={{ height: 120, width: 120 }} src={Logo} alt="Logo" />
            </Stack>
          </Stack>
          <Outlet />
        </Container>
      </Box>
    </>
  );
};

export default MainLayout;

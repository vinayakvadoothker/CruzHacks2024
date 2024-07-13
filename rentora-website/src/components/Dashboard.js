import React from 'react';
import { Container, Grid, Paper, Typography, Button, Card, CardContent, Avatar } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './Dashboard.css'; // Ensure you import your CSS file

const RenterCard = () => {
  return (
    <Card>
      <CardContent>
        <Avatar style={{ margin: '0 auto 10px', width: 50, height: 50 }}>R#1</Avatar>
        <Typography variant="h6" gutterBottom>
          Renter #1
        </Typography>
        <Typography variant="body2">
          Room 1: $2000 per month
        </Typography>
      </CardContent>
    </Card>
  );
};

const Map = () => {
  return (
    <MapContainer center={[36.97431887113733, -122.05742178820233]} zoom={13} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[36.9741, -122.0308]}>
        <Popup>Example Location</Popup>
      </Marker>
      <Marker position={[36.97431887113733, -122.05742178820233]}>
        <Popup>Another Location</Popup>
      </Marker>
    </MapContainer>
  );
};

const MainDashboard = () => {
  return (
    <Container className="main-dashboard-container">
      <Typography variant="h5" gutterBottom>
        435 Meder St.
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Santa Cruz, CA
      </Typography>
      <Grid container spacing={10}>
        <Grid item xs={12} md={6}>
          <Grid container spacing={3}>
            {[...Array(3)].map((_, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <RenterCard />
              </Grid>
            ))}
          </Grid>
          <Paper elevation={3} className="sublease-paper">
            <Typography variant="h5">Sublease $1000 / month</Typography>
            <Typography variant="body1">- 4 bed</Typography>
            <Typography variant="body1">- 5 bath</Typography>
            <Typography variant="body1">- No backyard</Typography>
            <Typography variant="body1">- Utilities included</Typography>
            <Typography variant="body1">- 3 tenants currently housing</Typography>
            <Button variant="contained" color="primary" style={{ marginTop: '10px' }}>
              Sublease
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Map />
        </Grid>
      </Grid>
    </Container>
  );
};

export default MainDashboard;

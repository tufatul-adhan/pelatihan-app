import React from 'react';
import { Spinner, Container } from 'react-bootstrap';

const LoadingSpinner: React.FC = () => {
  return (
    <Container className="d-flex justify-content-center align-items-center py-5">
      <div className="text-center">
        <Spinner
          animation="border"
          role="status"
          className="mb-3"
          style={{ width: '3rem', height: '3rem' }}
        >
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="text-muted mt-3">Loading...</p>
      </div>
    </Container>
  );
};

export default LoadingSpinner;

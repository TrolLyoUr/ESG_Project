import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

const Topbar = ({ profile, showProfileModal, setShowProfileModal, handleProfileChange, saveProfile }) => {
  return (
    <div className="top-bar">
      <Button variant="outline-primary" onClick={() => setShowProfileModal(true)}>
        Profile
      </Button>

    
      <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formCompanyName">
              <Form.Label>Company</Form.Label>
              <Form.Control
                type="text"
                name="company"
                value={profile.company}
                onChange={handleProfileChange}
              />
            </Form.Group>
            <Form.Group controlId="formYear">
              <Form.Label>Year</Form.Label>
              <Form.Control
                type="text"
                name="year"
                value={profile.year}
                onChange={handleProfileChange}
              />
            </Form.Group>
            <Form.Group controlId="formFramework">
              <Form.Label>Framework</Form.Label>
              <Form.Control
                type="text"
                name="framework"
                value={profile.framework}
                onChange={handleProfileChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowProfileModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={saveProfile}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Topbar;
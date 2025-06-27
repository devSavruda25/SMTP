import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Form,
  Button,
  Card,
  Spinner,
  ListGroup,
  Alert,
  Row,
  Col,
  Badge,
  Modal,
  Tab,
  Tabs,
  Table,
  Image,
  ProgressBar,
  OverlayTrigger,
  Tooltip,
  Nav,
  Stack,
} from "react-bootstrap";
import {
  Envelope,
  Paperclip,
  ClockHistory,
  Download,
  ChevronRight,
  ChevronLeft,
  Check,
  XCircle,
  FileEarmarkImage,
  FileEarmarkPdf,
  FileEarmarkText,
  EyeFill,
  PeopleFill,
  InfoCircle,
  ArrowLeft,
  ArrowRight,
  Grid,
  BoxArrowRight,
  PersonCircle,
  People
} from "react-bootstrap-icons";

function EmailApp() {
  // Form state
  const [subject, setSubject] = useState("");
  const [text, setText] = useState("");
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [emailGroups, setEmailGroups] = useState({});
  const [attachments, setAttachments] = useState([]);
  const [sending, setSending] = useState(false);
  const [sendStatus, setSendStatus] = useState({ message: "", variant: "" });
  const [activeFormPart, setActiveFormPart] = useState(1);
  const [totalRecipients, setTotalRecipients] = useState(0);

  // History state
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Attachment Preview Modal State
  const [previewAttachment, setPreviewAttachment] = useState(null);
  const [showAttachmentPreviewModal, setShowAttachmentPreviewModal] =
    useState(false);

  // Sidebar navigation helper
  const navigate = useNavigate();
  const isActive = (path) => {
    return window.location.pathname === path;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/';
  };

  // Calculate total recipients whenever selectedGroups changes
  useEffect(() => {
    let total = 0;
    selectedGroups.forEach((group) => {
      total += emailGroups[group] || 0;
    });
    setTotalRecipients(total);
  }, [selectedGroups, emailGroups]);

  // Load email groups on component mount
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/email/groups");
        setEmailGroups(res.data.groups);
      } catch (err) {
        setSendStatus({
          message: "Failed to load email groups. Please try again later.",
          variant: "danger",
        });
      }
    };
    fetchGroups();
  }, []);

  // Load email history when the history tab is entered
  const fetchHistory = async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/email/history", {
        headers: { Authorization: token },
      });
      
      // Ensure we're working with an array
      const historyData = Array.isArray(res.data) ? res.data : 
                         Array.isArray(res.data.history) ? res.data.history : 
                         [];
      
      setHistory(historyData);
    } catch (err) {
      console.error("Failed to fetch history", err);
      setHistoryError(
        err.response?.data?.message || "Failed to load email history."
      );
      setHistory([]); // Set to empty array on error
    } finally {
      setHistoryLoading(false);
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = history.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(history.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getFileIcon = (filename) => {
    const extension = filename.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "bmp":
      case "webp":
        return <FileEarmarkImage className="me-2 text-info" size={20} />;
      case "pdf":
        return <FileEarmarkPdf className="me-2 text-danger" size={20} />;
      default:
        return <FileEarmarkText className="me-2 text-secondary" size={20} />;
    }
  };

  const handleGroupToggle = (group) => {
    setSelectedGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
    );
  };

  const handleFileChange = (e) => {
    setAttachments([...e.target.files]);
  };

  const removeAttachment = (index) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setSending(true);
    setSendStatus({ message: "", variant: "" });

    try {
      const formData = new FormData();
      formData.append("subject", subject);
      formData.append("text", text);
      
      // Append each group individually
      selectedGroups.forEach(group => {
        formData.append("selectedGroups[]", group);
      });

      attachments.forEach((file) => {
        formData.append("attachments", file);
      });

      const res = await axios.post(
        "http://localhost:5000/api/email/send",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: localStorage.getItem("token"),
          },
        }
      );

      setSendStatus({
        message: `Email sent successfully to ${res.data.receiversCount} recipients!`,
        variant: "success",
      });
      resetForm();
    } catch (err) {
      console.error("Email send failed:", err.response?.data || err);
      setSendStatus({
        message:
          err.response?.data?.message ||
          "Failed to send email. Please try again.",
        variant: "danger",
      });
    } finally {
      setSending(false);
    }
  };

  const resetForm = () => {
    setSubject("");
    setText("");
    setSelectedGroups([]);
    setAttachments([]);
    setActiveFormPart(1);
  };

  const handleViewDetails = (email) => {
    setSelectedEmail(email);
    setShowDetailsModal(true);
  };

  const handleDownloadAttachment = (emailId, filename) => {
    window.open(
      `http://localhost:5000/uploads/${emailId}/${filename}`,
      "_blank"
    );
  };

  const handlePreviewAttachment = (emailId, filename) => {
    setPreviewAttachment({ emailId, filename });
    setShowAttachmentPreviewModal(true);
  };

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div className="sidebar d-flex flex-column bg-white shadow-sm" style={{ minHeight: '100vh', width: '270px', position: 'fixed' }}>
        {/* Brand Logo/Name */}
        <div className="d-flex align-items-center p-4 mb-2">
          <span className="fs-5 fw-bold text-primary">SAVINEX EMS</span>
        </div>

        {/* Navigation Links */}
        <Nav className="flex-column px-3 flex-grow-1">
          <Nav.Item className="mb-2">
            <Nav.Link 
              onClick={() => navigate('/dashboard')} 
              className={`d-flex align-items-center py-2 px-3 rounded-3 ${isActive('/dashboard') ? 'bg-primary text-white' : 'text-dark hover-bg-light'}`}
            >
              <Grid className="me-3" size={18} />
              <span className="fs-6">Dashboard</span>
            </Nav.Link>
          </Nav.Item>
          
          <Nav.Item className="mb-2">
            <Nav.Link 
              onClick={() => navigate('/send')} 
              className={`d-flex align-items-center py-2 px-3 rounded-3 ${isActive('/send') ? 'bg-primary text-white' : 'text-dark hover-bg-light'}`}
            >
              <Envelope className="me-3" size={18} />
              <span className="fs-6">Send Mail</span>
            </Nav.Link>
          </Nav.Item>
          
          <Nav.Item className="mb-2">
            <Nav.Link 
              onClick={() => navigate('/empAdd')} 
              className={`d-flex align-items-center py-2 px-3 rounded-3 ${isActive('/empAdd') ? 'bg-primary text-white' : 'text-dark hover-bg-light'}`}
            >
              <People className="me-3" size={18} />
              <span className="fs-6">Employee Management</span>
            </Nav.Link>
          </Nav.Item>
        </Nav>

        {/* User Profile & Logout */}
        <div className="p-3 mt-auto border-top">
          <Stack direction="horizontal" gap={3} className="mb-3 align-items-center">
            <PersonCircle size={28} className="text-muted" />
            <div>
              <div className="fw-semibold text-dark">Admin User</div>
              <small className="text-muted">admin@example.com</small>
            </div>
          </Stack>
          <Button 
            variant="outline-primary" 
            size="sm" 
            className="w-100 d-flex align-items-center justify-content-center"
            onClick={handleLogout}
          >
            <BoxArrowRight className="me-2" size={16} />
            <span>Logout</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1" style={{ marginLeft: '270px', padding: '20px' }}>
        <Container fluid className="py-4">
          <div className="d-flex align-items-center mb-4">
            <h1 className="mb-0 fw-bold text-primary">Email Campaign Manager</h1>
            <OverlayTrigger
              placement="right"
              overlay={
                <Tooltip id="info-tooltip">
                  Send bulk emails to different groups with attachments
                </Tooltip>
              }
            >
              <InfoCircle className="ms-2 text-muted" size={20} />
            </OverlayTrigger>
          </div>

          <Tabs
            defaultActiveKey="send"
            id="email-tabs"
            className="mb-4 custom-tabs"
            onSelect={(k) => {
              if (k === "history") {
                fetchHistory();
              }
            }}
          >
            {/* Send Email Tab */}
            <Tab
              eventKey="send"
              title={
                <>
                  <Envelope className="me-2" />
                  Send Email
                </>
              }
            >
              <Card className="shadow-sm border-0 rounded-3">
                <Card.Header className="bg-white border-bottom-0 pb-0 pt-3 px-4">
                  <h4 className="d-flex align-items-center mb-3 fw-bold">
                    Compose New Email
                  </h4>
                  <div className="d-flex align-items-center mb-3">
                    <div
                      className={`d-flex align-items-center me-4 ${
                        activeFormPart === 1 ? "text-primary fw-bold" : "text-muted"
                      }`}
                    >
                      <div
                        className={`step-circle me-2 ${
                          activeFormPart === 1
                            ? "bg-primary text-white"
                            : "bg-light text-secondary"
                        }`}
                      >
                        {activeFormPart === 1 ? "1" : <Check size={16} />}
                      </div>
                      <span className="step-text">Compose Message</span>
                    </div>
                    <ChevronRight className="text-muted mx-2" />
                    <div
                      className={`d-flex align-items-center ${
                        activeFormPart === 2 ? "text-primary fw-bold" : "text-muted"
                      }`}
                    >
                      <div
                        className={`step-circle me-2 ${
                          activeFormPart === 2
                            ? "bg-primary text-white"
                            : "bg-light text-secondary"
                        }`}
                      >
                        2
                      </div>
                      <span className="step-text">Recipients & Attachments</span>
                    </div>
                  </div>

                  {activeFormPart === 2 && totalRecipients > 0 && (
                    <div className="mb-3">
                      <div className="d-flex justify-content-between mb-1">
                        <small className="text-muted">Recipients selected</small>
                        <small className="fw-bold">
                          {totalRecipients}{" "}
                          {totalRecipients === 1 ? "person" : "people"}
                        </small>
                      </div>
                      <ProgressBar
                        now={100}
                        variant="primary"
                        className="rounded-pill"
                        style={{ height: "6px" }}
                      />
                    </div>
                  )}
                </Card.Header>
                <Card.Body className="p-4">
                  <Form onSubmit={handleSendEmail}>
                    {/* Part 1: Compose Email */}
                    {activeFormPart === 1 && (
                      <div className="animate__animated animate__fadeIn">
                        <Form.Group className="mb-4">
                          <Form.Label className="fw-bold text-secondary d-flex align-items-center">
                            Email Subject
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip id="subject-tooltip">
                                  Keep it short and descriptive
                                </Tooltip>
                              }
                            >
                              <InfoCircle className="ms-2 text-muted" size={16} />
                            </OverlayTrigger>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            required
                            size="lg"
                            className="border-2 border-primary border-opacity-10 py-3 focus-primary"
                            placeholder="Enter your email subject"
                          />
                        </Form.Group>

                        <Form.Group className="mb-4">
                          <Form.Label className="fw-bold text-secondary">
                            Message Content
                          </Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={10}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            required
                            className="border-2 border-primary border-opacity-10 focus-primary"
                            style={{ fontSize: "1rem" }}
                            placeholder="Write your message here..."
                          />
                        </Form.Group>

                        <div className="d-flex justify-content-end">
                          <Button
                            variant="primary"
                            onClick={() => setActiveFormPart(2)}
                            disabled={!subject || !text}
                            className="px-4 py-2 d-flex align-items-center rounded-pill"
                          >
                            Next Step <ChevronRight className="ms-2" size={20} />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Part 2: Recipients & Attachments */}
                    {activeFormPart === 2 && (
                      <div className="animate__animated animate__fadeIn">
                        <Form.Group className="mb-4">
                          <Form.Label className="fw-bold text-secondary d-flex align-items-center mb-3">
                            Select Recipient Groups
                            <Badge bg="light" text="primary" className="ms-2">
                              {selectedGroups.length} selected
                            </Badge>
                          </Form.Label>
                          <Row className="g-3">
                            {Object.keys(emailGroups).length === 0 ? (
                              <Col>
                                <Alert variant="info" className="text-center">
                                  No email groups available. Please add groups on
                                  your backend.
                                </Alert>
                              </Col>
                            ) : (
                              Object.keys(emailGroups).map((group) => (
                                <Col key={group} md={7} lg={5}>
                                  <Card
                                    className={`group-card p-3 cursor-pointer transition-all border-2 ${
                                      selectedGroups.includes(group)
                                        ? "border-primary bg-primary bg-opacity-10 shadow-sm"
                                        : "border-light bg-white text-dark"
                                    }`}
                                    onClick={() => handleGroupToggle(group)}
                                  >
                                    <div className="d-flex align-items-center justify-content-between">
                                      <div className="d-flex align-items-center">
                                        <div
                                          className={`me-3 border rounded-circle d-flex align-items-center justify-content-center ${
                                            selectedGroups.includes(group)
                                              ? "border-primary bg-primary"
                                              : "border-secondary"
                                          }`}
                                          style={{ width: "24px", height: "24px" }}
                                        >
                                          {selectedGroups.includes(group) && (
                                            <Check
                                              size={16}
                                              className="text-white"
                                            />
                                          )}
                                        </div>
                                        <span className="fw-semibold">{group}</span>
                                      </div>
                                      <Badge
                                        bg={
                                          selectedGroups.includes(group)
                                            ? "primary"
                                            : "light"
                                        }
                                        text={
                                          selectedGroups.includes(group)
                                            ? "white"
                                            : "dark"
                                        }
                                        className="fs-7 fw-normal"
                                      >
                                        {emailGroups[group]}{" "}
                                        {emailGroups[group] === 1
                                          ? "email"
                                          : "emails"}
                                      </Badge>
                                    </div>
                                  </Card>
                                </Col>
                              ))
                            )}
                          </Row>
                          {selectedGroups.length === 0 && (
                            <Alert variant="warning" className="mt-2">
                              Please select at least one recipient group.
                            </Alert>
                          )}
                        </Form.Group>

                        <Form.Group className="mb-4">
                          <Form.Label className="fw-bold text-secondary d-flex align-items-center mb-3">
                            Attachments
                            <Badge bg="light" text="secondary" className="ms-2">
                              {attachments.length} files
                            </Badge>
                          </Form.Label>
                          <div className="d-flex align-items-center mb-3">
                            <Form.Label
                              htmlFor="file-upload"
                              className="btn btn-outline-primary me-3 px-4 py-2 d-flex align-items-center rounded-pill"
                              style={{ cursor: "pointer" }}
                            >
                              <Paperclip className="me-2" />
                              Add Files
                            </Form.Label>
                            <Form.Control
                              id="file-upload"
                              type="file"
                              multiple
                              onChange={handleFileChange}
                              style={{ display: "none" }}
                            />
                            <small className="text-muted">
                              {attachments.length > 0
                                ? `${attachments.length} file${
                                    attachments.length === 1 ? "" : "s"
                                  } selected`
                                : "No files selected"}
                            </small>
                          </div>

                          {attachments.length > 0 && (
                            <ListGroup className="mb-4 border-0">
                              {attachments.map((file, index) => (
                                <ListGroup.Item
                                  key={index}
                                  className="d-flex justify-content-between align-items-center py-2 px-3 border rounded mb-2 shadow-sm-sm"
                                >
                                  <div className="d-flex align-items-center">
                                    {getFileIcon(file.name)}
                                    <span
                                      className="fw-medium text-truncate me-2"
                                      style={{ maxWidth: "250px" }}
                                    >
                                      {file.name}
                                    </span>
                                    <span className="text-muted small">
                                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                    </span>
                                  </div>
                                  <Button
                                    variant="link"
                                    size="sm"
                                    onClick={() => removeAttachment(index)}
                                    className="text-danger p-0"
                                  >
                                    <XCircle size={18} />
                                  </Button>
                                </ListGroup.Item>
                              ))}
                            </ListGroup>
                          )}
                        </Form.Group>

                        <div className="d-flex justify-content-between pt-2">
                          <Button
                            variant="outline-secondary"
                            onClick={() => setActiveFormPart(1)}
                            className="px-4 py-2 d-flex align-items-center rounded-pill"
                          >
                            <ChevronLeft className="me-2" />
                            Back
                          </Button>
                          <div className="d-flex">
                            <Button
                              variant="outline-danger"
                              onClick={resetForm}
                              className="me-3 px-4 py-2 rounded-pill"
                            >
                              Reset Form
                            </Button>
                            <Button
                              variant="primary"
                              type="submit"
                              disabled={sending || selectedGroups.length === 0}
                              className="px-4 py-2 d-flex align-items-center rounded-pill shadow-sm"
                            >
                              {sending ? (
                                <>
                                  <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                    className="me-2"
                                  />
                                  Sending...
                                </>
                              ) : (
                                <>
                                  <Envelope className="me-2" />
                                  Send Email
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {sendStatus.message && (
                      <Alert
                        variant={sendStatus.variant}
                        className="mt-4 animated-alert"
                      >
                        {sendStatus.message}
                      </Alert>
                    )}
                  </Form>
                </Card.Body>
              </Card>
            </Tab>

            {/* History Tab */}
            <Tab
              eventKey="history"
              title={
                <>
                  <ClockHistory className="me-2" />
                  History
                </>
              }
            >
              {historyLoading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3 text-muted">Loading email history...</p>
                </div>
              ) : historyError ? (
                <Alert variant="danger" className="text-center py-4">
                  <XCircle size={30} className="mb-2" />
                  <p className="mb-0">{historyError}</p>
                </Alert>
              ) : history.length === 0 ? (
                <Card className="text-center py-5 border-0 shadow-sm rounded-3">
                  <ClockHistory size={48} className="text-muted mb-3" />
                  <h5 className="mb-2 fw-bold">No email history available</h5>
                  <p className="text-muted">Emails you send will appear here</p>
                </Card>
              ) : (
                <>
                  <Card className="border-0 shadow-sm rounded-3 mb-3">
                    <Card.Body className="p-0">
                      <div className="table-responsive">
                        <Table hover className="mb-0 align-middle">
                          <thead className="table-light">
                            <tr>
                              <th className="ps-4 py-3">Date Sent</th>
                              <th>Subject</th>
                              <th>Groups</th>
                              <th>Recipients</th>
                              <th>Attachments</th>
                              <th className="pe-4">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentItems.map((email) => (
                              <tr key={email._id}>
                                <td className="ps-4 py-3">
                                  <small className="text-muted">
                                    {formatDate(email.sentAt)}
                                  </small>
                                </td>
                                <td
                                  className="fw-medium text-truncate"
                                  style={{ maxWidth: "250px" }}
                                >
                                  {email.subject}
                                </td>
                                <td>
                                  <div className="d-flex flex-wrap gap-1">
                                    {email.sentToGroups?.length > 0 ? (
                                      email.sentToGroups.map((group) => (
                                        <Badge
                                          key={group}
                                          bg="light"
                                          text="primary"
                                          className="fw-normal border border-primary border-opacity-25"
                                        >
                                          {group}
                                        </Badge>
                                      ))
                                    ) : (
                                      <small className="text-muted">N/A</small>
                                    )}
                                  </div>
                                </td>
                                <td>
                                  <Badge
                                    bg="light"
                                    text="dark"
                                    className="fw-normal"
                                  >
                                    <PeopleFill className="me-1" size={12} />
                                    {email.to.length}
                                  </Badge>
                                </td>
                                <td>
                                  {email.attachments?.length > 0 ? (
                                    <Badge
                                      bg="light"
                                      text="dark"
                                      className="d-inline-flex align-items-center fw-normal"
                                    >
                                      <Paperclip size={12} className="me-1" />
                                      {email.attachments.length}
                                    </Badge>
                                  ) : (
                                    <small className="text-muted">None</small>
                                  )}
                                </td>
                                <td className="pe-4">
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => handleViewDetails(email)}
                                    className="px-3 py-1 rounded-pill"
                                  >
                                    View Details
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    </Card.Body>
                  </Card>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        Showing {indexOfFirstItem + 1}-
                        {Math.min(indexOfLastItem, history.length)} of{" "}
                        {history.length} items
                      </small>
                      <div>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="me-2 rounded-pill"
                          disabled={currentPage === 1}
                          onClick={() => paginate(currentPage - 1)}
                        >
                          <ArrowLeft size={14} />
                        </Button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                          (number) => (
                            <Button
                              key={number}
                              variant={
                                number === currentPage
                                  ? "primary"
                                  : "outline-secondary"
                              }
                              size="sm"
                              className="me-2 rounded-circle"
                              style={{ minWidth: "32px" }}
                              onClick={() => paginate(number)}
                            >
                              {number}
                            </Button>
                          )
                        )}
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="rounded-pill"
                          disabled={currentPage === totalPages}
                          onClick={() => paginate(currentPage + 1)}
                        >
                          <ArrowRight size={14} />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </Tab>
          </Tabs>

          {/* Email Details Modal */}
          <Modal
            show={showDetailsModal}
            onHide={() => setShowDetailsModal(false)}
            size="lg"
            centered
          >
            <Modal.Header closeButton className="border-0 pb-0">
              <Modal.Title className="fw-bold text-primary">
                Email Details
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-0">
              {selectedEmail && (
                <>
                  <Row className="mb-4 g-3">
                    <Col md={6}>
                      <h6 className="fw-bold text-muted text-uppercase small mb-1">
                        Subject
                      </h6>
                      <p className="fs-5 mb-0">{selectedEmail.subject}</p>
                    </Col>
                    <Col md={6}>
                      <h6 className="fw-bold text-muted text-uppercase small mb-1">
                        Sent At
                      </h6>
                      <p className="fs-5 mb-0">
                        {formatDate(selectedEmail.sentAt)}
                      </p>
                    </Col>
                  </Row>
                  <Row className="mb-4 g-3">
                    <Col md={6}>
                      <h6 className="fw-bold text-muted text-uppercase small mb-2">
                        Recipient Groups
                      </h6>
                      <div className="d-flex flex-wrap gap-2">
                        {selectedEmail.sentToGroups?.length > 0 ? (
                          selectedEmail.sentToGroups.map((group) => (
                            <Badge
                              key={group}
                              bg="light"
                              text="primary"
                              className="fw-normal fs-7 border border-primary border-opacity-25 py-2 px-3 rounded-pill"
                            >
                              {group}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-muted small">No groups specified</p>
                        )}
                      </div>
                    </Col>
                    <Col md={6}>
                      <h6 className="fw-bold text-muted text-uppercase small mb-2">
                        Attachments
                      </h6>
                      {selectedEmail.attachments?.length > 0 ? (
                        <ListGroup variant="flush">
                          {selectedEmail.attachments.map((file, index) => (
                            <ListGroup.Item
                              key={index}
                              className="d-flex justify-content-between align-items-center px-0 py-2"
                            >
                              <div className="d-flex align-items-center">
                                {getFileIcon(file)}
                                <span
                                  className="fw-medium text-truncate"
                                  style={{ maxWidth: "200px" }}
                                >
                                  {file}
                                </span>
                              </div>
                              <div>
                                {file.match(/\.(jpeg|jpg|gif|png|pdf)$/) && (
                                  <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    className="me-2 px-2 py-1 rounded-pill"
                                    onClick={() =>
                                      handlePreviewAttachment(
                                        selectedEmail._id,
                                        file
                                      )
                                    }
                                  >
                                    <EyeFill size={14} className="me-1" /> Preview
                                  </Button>
                                )}
                                <Button
                                  variant="primary"
                                  size="sm"
                                  className="px-2 py-1 rounded-pill"
                                  onClick={() =>
                                    handleDownloadAttachment(
                                      selectedEmail._id,
                                      file
                                    )
                                  }
                                >
                                  <Download size={14} className="me-1" /> Download
                                </Button>
                              </div>
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      ) : (
                        <p className="text-muted small">
                          No attachments were included
                        </p>
                      )}
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <h6 className="fw-bold text-muted text-uppercase small mb-2">
                        Message Content
                      </h6>
                      <Card className="bg-light border-0 shadow-sm-sm p-3">
                        <Card.Body>
                          <pre
                            className="mb-0 text-break"
                            style={{
                              whiteSpace: "pre-wrap",
                              fontFamily: "inherit",
                              fontSize: "0.95rem",
                            }}
                          >
                            {selectedEmail.text}
                          </pre>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </>
              )}
            </Modal.Body>
            <Modal.Footer className="border-0 pt-0">
              <Button
                variant="outline-secondary"
                onClick={() => setShowDetailsModal(false)}
                className="rounded-pill px-4"
              >
                Close
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Attachment Preview Modal */}
          <Modal
            show={showAttachmentPreviewModal}
            onHide={() => setShowAttachmentPreviewModal(false)}
            size="lg"
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title className="fw-bold">Attachment Preview</Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-center py-4">
              {previewAttachment && (
                <>
                  {previewAttachment.filename.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                    <Image
                      src={`http://localhost:5000/uploads/${previewAttachment.emailId}/${previewAttachment.filename}`}
                      fluid
                      className="rounded shadow-sm"
                      style={{ maxHeight: "60vh", objectFit: "contain" }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://via.placeholder.com/600x400?text=Image+Preview+Not+Available";
                        e.target.alt = "Image preview not available";
                      }}
                    />
                  ) : previewAttachment.filename.match(/\.pdf$/i) ? (
                    <div className="py-5">
                      <FileEarmarkPdf size={60} className="text-danger mb-3" />
                      <h5 className="fw-bold">
                        PDF Preview Not Directly Available
                      </h5>
                      <p className="text-muted">
                        PDFs cannot be directly embedded for preview in this demo.
                        Please download to view.
                      </p>
                    </div>
                  ) : (
                    <div className="py-5">
                      <FileEarmarkText size={60} className="text-muted mb-3" />
                      <h5 className="fw-bold">File Preview Not Available</h5>
                      <p className="text-muted">
                        This file type cannot be previewed in the browser. Please
                        download to view.
                      </p>
                    </div>
                  )}
                  <div className="mt-3">
                    <p className="fw-bold mb-1">{previewAttachment.filename}</p>
                  </div>
                </>
              )}
            </Modal.Body>
            <Modal.Footer className="border-0">
              <Button
                variant="primary"
                onClick={() =>
                  previewAttachment &&
                  handleDownloadAttachment(
                    previewAttachment.emailId,
                    previewAttachment.filename
                  )
                }
                className="rounded-pill px-4 d-flex align-items-center"
              >
                <Download className="me-2" />
                Download
              </Button>
              <Button
                variant="outline-secondary"
                onClick={() => setShowAttachmentPreviewModal(false)}
                className="rounded-pill px-4"
              >
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        </Container>
      </div>
    </div>
  );
}

export default EmailApp;
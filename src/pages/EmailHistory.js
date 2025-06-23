// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import {
//   Container,
//   Table,
//   Spinner,
//   Alert,
//   Card,
//   Badge,
//   ListGroup,
//   Row,
//   Col,
//   Button,
//   Modal,
//   Image
// } from 'react-bootstrap';
// import { 
//   ClockHistory, 
//   Envelope, 
//   Paperclip,
//   Download,
//   X,
//   FileEarmarkText,
//   FileEarmarkImage,
//   FileEarmarkPdf
// } from 'react-bootstrap-icons';

// export default function EmailHistory() {
//   const [history, setHistory] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedEmail, setSelectedEmail] = useState(null);
//   const [previewAttachment, setPreviewAttachment] = useState(null);
//   const [showPreview, setShowPreview] = useState(false);

//   useEffect(() => {
//     const fetchHistory = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         const res = await axios.get('http://localhost:5000/api/email/history', {
//           headers: { Authorization: token },
//         });
//         setHistory(res.data);
//         console.log('Email history fetched:', res.data);
//       } catch (err) {
//         console.error('Failed to fetch history', err);
//         setError(err.response?.data?.message || 'Failed to load email history');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchHistory();
//   }, []);

//   const formatDate = (dateString) => {
//     const options = { 
//       year: 'numeric', 
//       month: 'short', 
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     };
//     return new Date(dateString).toLocaleDateString(undefined, options);
//   };

//   const getFileIcon = (filename) => {
//     const extension = filename.split('.').pop().toLowerCase();
//     switch(extension) {
//       case 'jpg':
//       case 'jpeg':
//       case 'png':
//       case 'gif':
//         return <FileEarmarkImage className="me-2" />;
//       case 'pdf':
//         return <FileEarmarkPdf className="me-2" />;
//       default:
//         return <FileEarmarkText className="me-2" />;
//     }
//   };

//   const handlePreview = (attachment) => {
//     // In a real app, you would fetch the actual file from your server
//     // For demo purposes, we'll just show the filename
//     setPreviewAttachment(attachment);
//     setShowPreview(true);
//   };

//   const handleDownload = (attachment) => {
//     // Implement actual download logic here
//     console.log('Downloading:', attachment);
//     alert(`Would download: ${attachment}`);
//   };

//   return (
//     <Container className="py-4">
//       <Row className="mb-4">
//         <Col>
//           <h2 className="d-flex align-items-center">
//             <ClockHistory className="me-2" />
//             Sent Email History
//           </h2>
//           <p className="text-muted">View all your sent email campaigns</p>
//         </Col>
//       </Row>

//       {loading ? (
//         <div className="text-center py-5">
//           <Spinner animation="border" variant="primary" />
//           <p className="mt-2">Loading email history...</p>
//         </div>
//       ) : error ? (
//         <Alert variant="danger">
//           {error}
//         </Alert>
//       ) : history.length === 0 ? (
//         <Card className="text-center py-5">
//           <Envelope size={48} className="text-muted mb-3" />
//           <h5>No email history available</h5>
//           <p className="text-muted">Your sent emails will appear here</p>
//         </Card>
//       ) : (
//         <>
//           <Card className="shadow-sm mb-4">
//             <Card.Body className="p-0">
//               <Table hover responsive className="mb-0">
//                 <thead className="table-light">
//                   <tr>
//                     <th>Date & Time</th>
//                     <th>Subject</th>
//                     <th>Recipients</th>
//                     <th>Attachments</th>
//                     <th>Status</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {history.map((item, index) => (
//                     <tr 
//                       key={index} 
//                       onClick={() => setSelectedEmail(selectedEmail?.id === item.id ? null : item)}
//                       style={{ cursor: 'pointer' }}
//                     >
//                       <td>
//                         <div className="fw-semibold">{formatDate(item.sentAt)}</div>
//                         <small className="text-muted">{item.status || 'Delivered'}</small>
//                       </td>
//                       <td className="text-truncate" style={{ maxWidth: '200px' }}>
//                         {item.subject}
//                       </td>
//                       <td>
//                         <Badge bg="light" text="dark">
//                           {item.to?.length || 0} recipients
//                         </Badge>
//                       </td>
//                       <td>
//                         {item.attachments?.length > 0 ? (
//                           <Badge bg="light" text="dark" className="d-flex align-items-center">
//                             <Paperclip size={12} className="me-1" />
//                             {item.attachments.length}
//                           </Badge>
//                         ) : (
//                           <small className="text-muted">None</small>
//                         )}
//                       </td>
//                       <td>
//                         <Badge bg={item.status === 'Failed' ? 'danger' : 'success'}>
//                           {item.status || 'Delivered'}
//                         </Badge>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </Table>
//             </Card.Body>
//           </Card>

//           {/* Email Details Panel */}
//           {selectedEmail && (
//             <Card className="shadow-sm mb-4">
//               <Card.Header className="d-flex justify-content-between align-items-center">
//                 <h5 className="mb-0">Email Details</h5>
//                 <Button 
//                   variant="link" 
//                   size="sm" 
//                   onClick={() => setSelectedEmail(null)}
//                 >
//                   <X size={20} />
//                 </Button>
//               </Card.Header>
//               <Card.Body>
//                 <Row className="mb-3">
//                   <Col md={6}>
//                     <h6>Subject</h6>
//                     <p>{selectedEmail.subject}</p>
//                   </Col>
//                   <Col md={6}>
//                     <h6>Sent At</h6>
//                     <p>{formatDate(selectedEmail.sentAt)}</p>
//                   </Col>
//                 </Row>
//                 <Row className="mb-3">
//                   <Col md={6}>
//                     <h6>Recipients</h6>
//                     <ListGroup>
//                       {selectedEmail.to?.map((recipient, i) => (
//                         <ListGroup.Item key={i}>{recipient}</ListGroup.Item>
//                       ))}
//                     </ListGroup>
//                   </Col>
//                   <Col md={6}>
//                     <h6>Attachments</h6>
//                     {selectedEmail.attachments?.length > 0 ? (
//                       <ListGroup>
//                         {selectedEmail.attachments.map((file, i) => (
//                           <ListGroup.Item 
//                             key={i}
//                             className="d-flex justify-content-between align-items-center"
//                           >
//                             <div 
//                               className="d-flex align-items-center text-primary"
//                               style={{ cursor: 'pointer' }}
//                               onClick={() => handlePreview(file)}
//                             >
//                               {getFileIcon(file)}
//                               <span className="text-truncate" style={{ maxWidth: '150px' }}>
//                                 {file}
//                               </span>
//                             </div>
//                             <Button 
//                               variant="link" 
//                               size="sm"
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 handleDownload(file);
//                               }}
//                             >
//                               <Download size={16} />
//                             </Button>
//                           </ListGroup.Item>
//                         ))}
//                       </ListGroup>
//                     ) : (
//                       <p className="text-muted">No attachments</p>
//                     )}
//                   </Col>
//                 </Row>
//                 <Row>
//                   <Col>
//                     <h6>Content Preview</h6>
//                     <div className="border p-3 bg-light rounded">
//                       {selectedEmail.text || 'No content available'}
//                     </div>
//                   </Col>
//                 </Row>
//               </Card.Body>
//             </Card>
//           )}

//           {/* Attachment Preview Modal */}
//           <Modal show={showPreview} onHide={() => setShowPreview(false)} size="lg">
//             <Modal.Header closeButton>
//               <Modal.Title>Attachment Preview</Modal.Title>
//             </Modal.Header>
//             <Modal.Body className="text-center">
//               {previewAttachment && (
//                 <>
//                   {previewAttachment.match(/\.(jpeg|jpg|gif|png)$/) ? (
//                     <Image 
//                       src={`/uploads/${previewAttachment}`} 
//                       fluid 
//                       onError={(e) => {
//                         e.target.onerror = null; 
//                         e.target.src = '';
//                       }}
//                     />
//                   ) : (
//                     <div className="py-5">
//                       <FileEarmarkText size={48} className="text-muted mb-3" />
//                       <h5>File Preview Not Available</h5>
//                       <p className="text-muted">This file type cannot be previewed in the browser</p>
//                     </div>
//                   )}
//                   <div className="mt-3">
//                     <p className="fw-bold">{previewAttachment}</p>
//                   </div>
//                 </>
//               )}
//             </Modal.Body>
//             <Modal.Footer>
//               <Button 
//                 variant="primary"
//                 onClick={() => previewAttachment && handleDownload(previewAttachment)}
//               >
//                 <Download className="me-2" />
//                 Download
//               </Button>
//               <Button variant="secondary" onClick={() => setShowPreview(false)}>
//                 Close
//               </Button>
//             </Modal.Footer>
//           </Modal>
//         </>
//       )}
//     </Container>
//   );
// }